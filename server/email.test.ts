import { describe, it, expect } from "vitest";
import { testEmailConnection, sendEmail } from "./email";

describe("Email Service", () => {
  it("should verify email connection with provided credentials", async () => {
    const isConnected = await testEmailConnection();
    expect(isConnected).toBe(true);
  }, 30000); // 30 second timeout for SMTP connection

  it("should send test email successfully", async () => {
    const result = await sendEmail({
      to: process.env.EMAIL_USER || "test@example.com",
      subject: "Quintapoo Email Test",
      text: "This is a test email from Quintapoo Memory Repository to verify email credentials are working correctly.",
      html: "<p>This is a test email from <strong>Quintapoo Memory Repository</strong> to verify email credentials are working correctly.</p>",
    });
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for email sending
});
