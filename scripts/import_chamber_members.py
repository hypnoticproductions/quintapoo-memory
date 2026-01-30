#!/usr/bin/env python3
"""
Import Saint Lucia Chamber members to leads database
"""

import csv
import mysql.connector
from urllib.parse import urlparse
import os
from datetime import datetime, timedelta

# Parse DATABASE_URL
database_url = os.getenv('DATABASE_URL')
if not database_url:
    raise ValueError("DATABASE_URL not set")

parsed = urlparse(database_url)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 3306,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path[1:],  # Remove leading slash
    'ssl_ca': '/etc/ssl/certs/ca-certificates.crt',
    'ssl_verify_cert': True,
    'ssl_verify_identity': True
}

# Connect to database
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# Read Chamber members CSV
with open('/home/ubuntu/quintapoo-memory/chamber_member_contacts.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    imported = 0
    skipped = 0
    
    for row in reader:
        business_name = row.get('Business Name', '').strip()
        email = row.get('Email', '').strip()
        phone = row.get('Phone', '').strip()
        website = row.get('Website', '').strip()
        industry = row.get('Industry', '').strip()
        
        # Skip if no email
        if not email or email == 'Not found' or '@' not in email:
            skipped += 1
            continue
        
        # Check if already exists
        cursor.execute("SELECT id FROM leads WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"Skipping duplicate: {business_name} ({email})")
            skipped += 1
            continue
        
        # Set last_contact to 10 days ago to trigger aging
        last_contact = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S')
        
        # Insert lead (note: website stored in notes field since no website column)
        notes_text = f"Website: {website}" if website != 'Not found' else None
        
        cursor.execute("""
            INSERT INTO leads (
                name, email, phone, company, source, industry, status, 
                last_contact, notes, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            business_name,
            email,
            phone if phone != 'Not found' else None,
            business_name,  # company = business name
            'Saint Lucia Chamber of Commerce',
            industry if industry != 'Not found' else 'General Business',
            'new',
            last_contact,
            notes_text
        ))
        
        imported += 1
        print(f"Imported: {business_name} ({email})")

conn.commit()
cursor.close()
conn.close()

print(f"\n=== Import Complete ===")
print(f"Imported: {imported}")
print(f"Skipped: {skipped}")
print(f"Total processed: {imported + skipped}")
