import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateSixDigitsToken } from "../utils/token";
import { generateJWT } from "../utils/jwt";
import { AuthEmailResend } from "../emails/AuthEmailsResend";
export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      // ? Evitar duplicados
      const userExist = await User.findOne({ email });
      if (userExist) {
        const error = new Error("El email ya esta registrado!");
        res.status(409).json({ error: error.message });
        return;
      }

      // ? crear usuario nuevo
      const user = new User(req.body);

      //? Hash paswword
      user.password = await hashPassword(password);

      //? Generar token
      const token = new Token();
      token.token = generateSixDigitsToken();
      token.user = user.id;

      // ? Send email
      AuthEmailResend.sendConfirmationMailResend({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Hemos enviado un correo para confirmar tu cuenta");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al crear cuenta" });
      return;
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExist.user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.send("Cuenta confirmada correctamente!");
    } catch (error) {
      res
        .status(500)
        .json({ error: "Hubo un error al crear cuenta, token invalido" });
      return;
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      // ? usuario existe?
      const { email, password } = req.body;
      const userExist = await User.findOne({ email });
      if (!userExist) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (!userExist.confirmed) {
        const token = new Token();
        token.user = userExist.id;
        token.token = generateSixDigitsToken();
        await token.save();

        // ? Send email con nuevo token
        AuthEmailResend.sendConfirmationMailResend({
          email: userExist.email,
          name: userExist.name,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado otro token a tu correo"
        );
        res.status(404).json({ error: error.message });
        return;
      }

      // ? Revisar password
      const isPasswordCorrect = await checkPassword(
        password,
        userExist.password
      );

      if (!isPasswordCorrect) {
        const error = new Error("Password incorrecto");
        res.status(404).json({ error: error.message });
        return;
      }

      const token = generateJWT({ id: userExist.id });
      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Login no valido" });
      return;
    }
  };

  static confirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // ? Exista el usuario
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El email no está registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (user.confirmed) {
        const error = new Error("El usuario ya se encuentra confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      //? Generar nuevo token
      const token = new Token();
      token.token = generateSixDigitsToken();
      token.user = user.id;

      // ? Send email
      AuthEmailResend.sendConfirmationMailResend({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send("Hemos enviado un nuevo token a tu email");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al crear cuenta" });
      return;
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // ? Exista el usuario
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El email no está registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      //? Generar nuevo token
      const token = new Token();
      token.token = generateSixDigitsToken();
      token.user = user.id;
      await token.save();

      // ? Send email
      // AuthEmailResend.sendPasswordResetTokenResend({
      //   email: user.email,
      //   name: user.name,
      //   token: token.token,
      // });

      res.send("Revisa tu email para instrucciones");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al crear cuenta" });
      return;
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }
      res.send("Token valido, define tu nuevo password");
    } catch (error) {
      res
        .status(500)
        .json({ error: "Hubo un error al crear cuenta, token invalido" });
      return;
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExist.user);

      const { password } = req.body;
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send("Password cambiado exitosamente!");
    } catch (error) {
      res
        .status(500)
        .json({ error: "Hubo un error al crear cuenta, token invalido" });
      return;
    }
  };
  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  //? Profile
  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    req.user.name = name;
    req.user.email = email;

    const userExist = await User.findOne({ email });

    if (userExist && userExist.id.toString() !== req.user.id.toString()) {
      const error = new Error("El email ya esta registrado!");
      res.status(409).json({ error: error.message });
      return;
    }

    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al editar los datos" });
      return;
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { currentPassword, password } = req.body;
    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("El Password actual es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("Password cambiado exitosamente!");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al cambiar el password" });
      return;
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("El Password es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }
    res.send("Password correcto");
  };
}
