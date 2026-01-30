import { describe, it, expect } from 'vitest';
import { Resend } from 'resend';
import { ENV } from './_core/env';

describe('Resend API Credentials', () => {
  it('should validate RESEND_API_KEY by fetching API status', async () => {
    const resend = new Resend(ENV.RESEND_API_KEY);
    
    // Test API key by fetching domains (lightweight endpoint)
    try {
      const { data, error } = await resend.domains.list();
      
      // If error exists, API key is invalid
      if (error) {
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }
      
      // API key is valid (data can be empty array if no domains configured)
      expect(error).toBeNull();
      console.log('✅ Resend API key validated successfully');
      console.log(`Domains configured: ${data?.data?.length || 0}`);
      
    } catch (err) {
      throw new Error(`Failed to validate Resend API key: ${err}`);
    }
  }, 10000); // 10 second timeout for API call
});
