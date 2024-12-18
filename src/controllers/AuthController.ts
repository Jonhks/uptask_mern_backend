import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateSixDigitsToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
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
      AuthEmail.sendConfirmationMail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Hemos enviado un correo para confirmar tu cuenta");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error al crear cuenta" });
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
      }
      if (!userExist.confirmed) {
        const token = new Token();
        token.user = userExist.id;
        token.token = generateSixDigitsToken();
        await token.save();

        // ? Send email con nuevo token
        AuthEmail.sendConfirmationMail({
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
    } catch (error) {
      res.status(500).json({ error: "Login no valido" });
    }
  };
}
