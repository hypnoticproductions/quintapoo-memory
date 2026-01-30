#!/usr/bin/env node
/**
 * Import Barbados leads and send emails (combined for speed)
 */

import { Resend } from 'resend';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

const resend = new Resend(process.env.RESEND_API_KEY);

const dbUrl = new URL(process.env.DATABASE_URL);
const dbConfig = {
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
};

function generateEmailHTML(businessName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #1a1a1a; }
    .highlight { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
    .cta { background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <p>Hi ${businessName} Team,</p>
  
  <p>I'm Richard Fortune, founder of DOPA-TECH—a Saint Lucian tech company built by someone who actually worked in the hospitality industry. I know the challenges you face when guests speak Mandarin, French, German, or Spanish, and your staff are scrambling to communicate.</p>
  
  <h2>What if your front desk could speak 20+ languages instantly?</h2>
  
  <p>We've built <strong>Sally WUKR</strong>, a multi-language voice agent designed specifically for Caribbean tourism. It's not a chatbot—it's a real-time voice assistant that can:</p>
  
  <div class="highlight">
    <ul>
      <li><strong>Handle guest inquiries</strong> in 20+ languages (Mandarin, French, Spanish, German, Italian, Portuguese, Japanese, Korean, Russian, Arabic, and more)</li>
      <li><strong>Answer questions</strong> about Barbados attractions, culture, safety, dining</li>
      <li><strong>Process booking inquiries</strong> 24/7 (even when your front desk is closed)</li>
      <li><strong>Provide personalized recommendations</strong> based on guest preferences</li>
      <li><strong>Work offline</strong> (no internet required for core features)</li>
    </ul>
  </div>
  
  <h3>Why This Matters for Barbados Tourism</h3>
  <ul>
    <li><strong>Chinese tourists</strong> are the fastest-growing segment in Caribbean tourism—but language barriers kill bookings</li>
    <li><strong>European guests</strong> (French, German, Italian) expect multilingual service</li>
    <li><strong>Cruise ship passengers</strong> need instant answers in their native language</li>
    <li><strong>Your competitors</strong> are still using Google Translate (and losing customers)</li>
  </ul>
  
  <h3>Test It Yourself (Right Now)</h3>
  <p>Visit <strong>www.dopa.buzz</strong> and try Sally WUKR. Ask her about Barbados attractions in any language. See how she responds. Then imagine this voice agent supporting your front desk staff.</p>
  
  <a href="https://www.dopa.buzz" class="cta">Try Sally WUKR Demo →</a>
  
  <h3>Built in Saint Lucia, For the Caribbean</h3>
  <p>I'm not some Silicon Valley tech bro. I worked in hospitality here in the Caribbean. I saw the language barriers. I built this solution specifically for us—for Caribbean hotels who want to compete globally without losing our local authenticity.</p>
  
  <h3>DOPA-TECH Services (Beyond Voice Agents)</h3>
  <ol>
    <li><strong>Sally WUKR</strong> - Multi-language voice agent for front desk and customer service</li>
    <li><strong>Harvester</strong> - Legal tech for contract management and compliance (tourism licensing, vendor agreements)</li>
    <li><strong>SafeTravel</strong> - Risk management and safety monitoring for guest excursions</li>
    <li><strong>WUKR Wire</strong> - Caribbean market intelligence and content syndication</li>
  </ol>
  
  <h3>Let's Talk</h3>
  <p>I'm offering <strong>5 free pilot programs</strong> to Barbados hotels this month. No credit card. No commitment. Just test Sally WUKR with your team for 30 days and see if it increases bookings.</p>
  
  <p><strong>Email</strong>: richard.fproductions@gmail.com<br>
  <strong>Website</strong>: www.dopa.buzz</p>
  
  <p>We're building the future of Caribbean tourism—right here in The Trenches.</p>
  
  <div class="footer">
    <p><strong>Richard Fortune</strong><br>
    Founder, DOPA-TECH<br>
    St. Lucia 🇱🇨</p>
    
    <p><em>P.S. If you're skeptical, I get it. That's why I'm giving you the demo link first. Go to www.dopa.buzz, test Sally WUKR yourself, and then decide if this is worth 15 minutes of your time.</em></p>
  </div>
</body>
</html>
  `;
}

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  
  // Read CSV
  const csvPath = `${__dirname}/../data/barbados_tourism_contacts.csv`;
  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1);
  
  let imported = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  
  console.log(`Processing ${lines.length} Barbados leads...`);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [subject, businessName, email, phone, website, businessType] = line.split(',');
    
    if (!email || email === 'NA' || !email.includes('@')) {
      skipped++;
      continue;
    }
    
    // Check if exists
    const [existing] = await connection.execute(
      'SELECT id, status FROM leads WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0 && existing[0].status === 'contacted') {
      console.log(`⏭️  Already contacted: ${businessName}`);
      skipped++;
      continue;
    }
    
    // Insert or get ID
    let leadId;
    if (existing.length === 0) {
      const [result] = await connection.execute(
        `INSERT INTO leads (name, email, phone, company, industry, source, status, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [businessName, email, phone === 'NA' ? null : phone, businessName, businessType, 'barbados_tourism', 'new', website === 'NA' ? null : `Website: ${website}`]
      );
      leadId = result.insertId;
      imported++;
      console.log(`✅ Imported: ${businessName}`);
    } else {
      leadId = existing[0].id;
    }
    
    // Send email
    try {
      const { data, error } = await resend.emails.send({
        from: 'Richard Fortune, DOPA-TECH <richard@dopa.buzz>',
        to: [email],
        reply_to: 'richard.fproductions@gmail.com',
        subject: 'Saint Lucian-Built AI Voice Agent for Your Hotel 🇱🇨',
        html: generateEmailHTML(businessName),
      });
      
      if (error) throw new Error(JSON.stringify(error));
      
      await connection.execute(
        `UPDATE leads SET status = 'contacted', last_contact = NOW(), updated_at = NOW() WHERE id = ?`,
        [leadId]
      );
      
      sent++;
      console.log(`📧 Sent: ${businessName} (${email}) - ID: ${data.id}`);
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      failed++;
      console.error(`❌ Failed: ${businessName} - ${err.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Barbados campaign complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Imported: ${imported}`);
  console.log(`Emails sent: ${sent}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nCheck Resend dashboard: https://resend.com/emails`);
  
  await connection.end();
}

main().catch(console.error);
