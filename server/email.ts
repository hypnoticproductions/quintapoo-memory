import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

/**
 * Email service for sending automated emails
 * Uses SMTP credentials from environment variables
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Create nodemailer transporter with environment credentials
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: ENV.emailHost,
    port: parseInt(ENV.emailPort || "587"),
    secure: ENV.emailPort === "465", // true for 465, false for other ports
    auth: {
      user: ENV.emailUser,
      pass: ENV.emailPassword,
    },
  });
}

/**
 * Send email using configured SMTP server
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"${ENV.emailFromName}" <${ENV.emailUser}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email connection verified");
    return true;
  } catch (error) {
    console.error("Email connection failed:", error);
    return false;
  }
}
