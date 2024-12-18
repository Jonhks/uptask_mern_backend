import { transporter } from "../config/nodemeailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationMail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "UpTask <admin@uptask.com>",
      to: user.email,
      subject: "UpTask - Confirma tu cuenta",
      text: "UpTask - Confirma tu cuenta",
      html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask: Solo debes confirmar tu correo<p/>
      
      <p>Visita el siguiente enlace:</p>
      <a href=''>Confirmar cuenta</a>
      <p>Ingresa el código:  <b>${user.token}</b></p>
      <p>Este token expira en 10 minutos</p>
      `,
    });
    console.log("Mensaje enviado");
  };
}
