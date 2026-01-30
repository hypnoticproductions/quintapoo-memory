#!/usr/bin/env python3
"""
Import Saint Lucia tour operators to leads table
Source: saint_lucia_tour_operator_contacts.csv (132 businesses, 102 with emails)
"""

import csv
import os
import mysql.connector
from urllib.parse import urlparse
from datetime import datetime, timedelta

# Parse DATABASE_URL
database_url = os.getenv('DATABASE_URL')
if not database_url:
    raise ValueError("DATABASE_URL environment variable not set")

# Parse connection string
# Format: mysql://user:password@host:port/database
parsed = urlparse(database_url)
username = parsed.username
password = parsed.password
hostname = parsed.hostname
port = parsed.port or 3306
database = parsed.path.lstrip('/')

# Connect to database
conn = mysql.connector.connect(
    host=hostname,
    port=port,
    user=username,
    password=password,
    database=database,
    ssl_disabled=False
)

cursor = conn.cursor()

# Read CSV
csv_file = "/home/ubuntu/quintapoo-memory/saint_lucia_tour_operator_contacts.csv"

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    imported = 0
    skipped = 0
    
    for row in reader:
        business_name = row['Business Name'].strip()
        email = row['Email'].strip()
        phone = row['Phone'].strip()
        website = row['Website'].strip()
        address = row['Address'].strip()
        
        # Skip if no email
        if email == "Not found" or not email or "@" not in email:
            print(f"⏭️  Skipping {business_name} (no email)")
            skipped += 1
            continue
        
        # Clean up "Not found" values
        if phone == "Not found":
            phone = ""
        if website == "Not found":
            website = ""
        if address == "Not found":
            address = ""
        
        # Set last_contact to 10 days ago to trigger aging
        last_contact = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S')
        created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Insert into leads table
        try:
            cursor.execute("""
                INSERT INTO leads 
                (name, email, phone, company, industry, source, status, notes, last_contact, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                business_name,  # name
                email,  # email
                phone,  # phone
                business_name,  # company (same as name)
                "Tourism & Hospitality",  # industry
                "saint_lucia_tourism",  # source
                "new",  # status
                f"Website: {website}\nAddress: {address}\nTarget: Multi-language voice agent for tour guides",  # notes
                last_contact,  # last_contact (10 days ago)
                created_at,  # created_at
                created_at  # updated_at
            ))
            
            imported += 1
            print(f"✅ Imported: {business_name} ({email})")
            
        except mysql.connector.IntegrityError as e:
            if "Duplicate entry" in str(e):
                print(f"⏭️  Skipping {business_name} (duplicate email)")
                skipped += 1
            else:
                print(f"❌ Error importing {business_name}: {e}")
                skipped += 1

# Commit changes
conn.commit()

print(f"\n{'='*60}")
print(f"✅ Import complete!")
print(f"{'='*60}")
print(f"Total contacts processed: {imported + skipped}")
print(f"Successfully imported: {imported}")
print(f"Skipped (no email or duplicate): {skipped}")
print(f"Source: saint_lucia_tourism")
print(f"Industry: Tourism & Hospitality")
print(f"Status: new")
print(f"Last contact: 10 days ago (triggers aging for follow-up)")

# Close connection
cursor.close()
conn.close()
