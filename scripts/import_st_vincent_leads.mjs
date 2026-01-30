#!/usr/bin/env node
/**
 * Import St. Vincent tourism businesses to leads database
 */

import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

// Parse DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const dbConfig = {
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
};

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  
  // Read CSV file
  const csvPath = `${__dirname}/../data/st_vincent_combined_contacts.csv`;
  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  let imported = 0;
  let skipped = 0;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [subject, businessName, email, phone, website, businessType] = line.split(',');
    
    // Skip if no email
    if (!email || email === 'NA' || !email.includes('@')) {
      skipped++;
      continue;
    }
    
    // Check if lead already exists
    const [existing] = await connection.execute(
      'SELECT id FROM leads WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log(`⏭️  Skipped (duplicate): ${businessName} (${email})`);
      skipped++;
      continue;
    }
    
    // Insert lead
    await connection.execute(
      `INSERT INTO leads (name, email, phone, company, industry, source, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        businessName,
        email,
        phone === 'NA' ? null : phone,
        businessName, // Use business name as company
        businessType,
        'st_vincent_tourism',
        'new',
        website === 'NA' ? null : `Website: ${website}` // Store website in notes
      ]
    );
    
    imported++;
    console.log(`✅ Imported: ${businessName} (${email})`);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Import complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total processed: ${imported + skipped}`);
  
  await connection.end();
}

main().catch(console.error);
