import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAutomationEmail(to: string, subject: string, message: string) {
  try {
    await resend.emails.send({
      from: 'Plataforma <contato@francescomclara.com>',
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