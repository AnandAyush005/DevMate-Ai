import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";


//@ts-ignore
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!env.smtp.host) {
    throw new ApiError(
      500,
      "MAIL_NOT_CONFIGURED",
      "Email delivery is not configured.",
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user
        ? {
            user: env.smtp.user,
            pass: env.smtp.pass,
          }
        : undefined,
    });
  }

  return transporter;
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  try {
    await getTransporter().sendMail({
      from: env.smtp.from,
      to: email,
      subject: "Reset your DevMate password",
      text: `Reset your password using this link (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Reset your password using this link (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "MAIL_DELIVERY_FAILED", "Unable to send the reset email.");
  }
};
