import { Resend } from "resend";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmailResend {
  static sendConfirmationMailResend = async (user: IEmail) => {
    const resend = new Resend(process.env.API_KEY_RESEND);
    resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: user.email,
      subject: "UpTask - Confirma tu cuenta",
      html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask: Solo debes confirmar tu correo<p/>
      
      <p>Visita el siguiente enlace:</p>
      <a href='${process.env.FRONTEND_URL}/auth/confirm-account'>Confirmar cuenta</a>
      <p>Ingresa el código:  <b>${user.token}</b></p>
      <p>Este token expira en 10 minutos</p>
      `,
    });
    console.log("Mensaje enviado desde resend");
  };

  static sendPasswordResetTokenResend = async (user: IEmail) => {
    const resend = new Resend(process.env.API_KEY_RESEND);
    resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: user.email,
      subject: "UpTask - Reestablece tu password",
      html: `<p>Hola ${user.name}, has solicitado restablecer tu password<p/>

      <p>Visita el siguiente enlace:</p>
      <a href='${process.env.FRONTEND_URL}/auth/new-password'>Reestablecer tu password</a>
      <p>Ingresa el código:  <b>${user.token}</b></p>
      <p>Este token expira en 10 minutos</p>
      `,
    });
    console.log("Mensaje enviado desde resend");
  };
}
