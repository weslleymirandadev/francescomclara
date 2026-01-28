import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD);

export async function sendAutomationEmail(to: string, subject: string, message: string) {
  try {
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM}`,
      to,
      subject,
      html: `<div style="font-family: sans-serif;">${message}</div>`,
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}