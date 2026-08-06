import "server-only";

import nodemailer from "nodemailer";

import { env } from "./env";
import { resend, resendSender } from "./resend";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
};

const gmailTransporter =
  env.GMAIL_USER && env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: env.GMAIL_USER,
          pass: env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
        },
      })
    : null;

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendEmailOptions) {
  if (gmailTransporter && env.GMAIL_USER) {
    return gmailTransporter.sendMail({
      from: `CourseHUB <${env.GMAIL_USER}>`,
      to,
      replyTo,
      subject,
      text,
      html,
    });
  }

  const { data, error } = await resend.emails.send({
    from: resendSender,
    to: Array.isArray(to) ? to : [to],
    replyTo,
    subject,
    ...(html ? { html } : { text: text ?? "" }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
