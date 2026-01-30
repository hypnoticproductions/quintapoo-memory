import { describe, it, expect } from 'vitest';
import { testEmailConnection, sendEmail } from './email';

describe('Email Credentials Validation', () => {
  it('should connect to SMTP server with Gmail App Password', async () => {
    const result = await testEmailConnection();
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for SMTP connection

  it('should send test email successfully', async () => {
    const result = await sendEmail(
      'richard.fproductions@gmail.com',
      'Quintapoo Email Test - Gmail App Password',
      'This is a test email from Quintapoo lead pipeline automation. If you receive this, Gmail App Password is configured correctly.'
    );
    expect(result).toBe(true);
  }, 30000);
});
