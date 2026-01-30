#!/usr/bin/env python3
"""
Bulk Lead Import Script
Imports 108 contacts from WUKR_WIRE_MASTER_NETWORK.csv to leads table
Sets last_contact dates to 10 days ago to trigger aging follow-up
"""
import os
import csv
import mysql.connector
from datetime import datetime, timedelta
from urllib.parse import urlparse

# Parse DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL environment variable not set")
    exit(1)

parsed = urlparse(DATABASE_URL)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 3306,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path.lstrip('/'),
    'ssl_disabled': False
}

CSV_FILE = '/home/ubuntu/quintapoo-memory/WUKR_WIRE_MASTER_NETWORK.csv'

def import_leads():
    """Import contacts from CSV to leads table"""
    print("=" * 80)
    print("BULK LEAD IMPORT")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} AST")
    print("=" * 80)
    
    # Read CSV file
    print(f"[1/3] Reading contacts from {CSV_FILE}...")
    contacts = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            contacts.append(row)
    
    print(f"Found {len(contacts)} contacts")
    
    # Connect to database
    print("[2/3] Connecting to database...")
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    # Import leads
    print("[3/3] Importing leads...")
    
    # Set last_contact to 10 days ago to trigger aging
    last_contact = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S')
    
    inserted = 0
    skipped = 0
    
    for contact in contacts:
        company = contact.get('Company', 'Unknown')
        email = contact.get('Email', '')
        phone = contact.get('Phone', '')
        location = contact.get('Location', '')
        industry = contact.get('Industry', 'General')
        
        # Skip if no email
        if not email or email == 'N/A':
            skipped += 1
            continue
        
        try:
            # Check if lead already exists
            cursor.execute("SELECT id FROM leads WHERE email = %s", (email,))
            existing = cursor.fetchone()
            
            if existing:
                print(f"  ⏭️  Skipped: {company} (already exists)")
                skipped += 1
                continue
            
            # Insert lead
            cursor.execute("""
                INSERT INTO leads (
                    name, email, phone, company, industry, 
                    source, status, last_contact, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                company,  # name = company name
                email,
                phone,
                company,
                industry,
                'wukr_wire_network',  # source
                'new',  # status
                last_contact,  # 10 days ago
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ))
            
            inserted += 1
            print(f"  ✅ Imported: {company} ({email})")
            
        except Exception as e:
            print(f"  ❌ Error importing {company}: {e}")
            skipped += 1
    
    # Commit changes
    conn.commit()
    cursor.close()
    conn.close()
    
    print("=" * 80)
    print("BULK IMPORT COMPLETE")
    print("=" * 80)
    print(f"Imported: {inserted} leads")
    print(f"Skipped: {skipped} leads")
    print(f"Total: {len(contacts)} contacts processed")
    print(f"\nAll leads have last_contact set to 10 days ago to trigger aging follow-up.")

if __name__ == '__main__':
    import_leads()
