#!/usr/bin/env python3
"""
Lead Pipeline Automation for 6 PM Follow-Up
Calculates aging for leads, generates personalized follow-up emails
Sends automated follow-up sequences based on lead source/industry
"""
import os
import sys
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Database connection (using Drizzle ORM via Node.js)
# For Python, we'll use direct MySQL connection
import mysql.connector
from mysql.connector import Error

# Email sending
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
EMAIL_FROM_NAME = os.getenv('EMAIL_FROM_NAME', 'DOPA-TECH')

def get_db_connection():
    """Create MySQL database connection from DATABASE_URL"""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Parse DATABASE_URL (format: mysql://user:password@host:port/database?ssl=...)
    import re
    from urllib.parse import urlparse, parse_qs
    
    parsed = urlparse(DATABASE_URL)
    user = parsed.username
    password = parsed.password
    host = parsed.hostname
    port = parsed.port or 3306
    database = parsed.path.lstrip('/')
    
    # Remove query parameters from database name
    if '?' in database:
        database = database.split('?')[0]
    
    try:
        connection = mysql.connector.connect(
            host=host,
            port=int(port),
            user=user,
            password=password,
            database=database,
            ssl_disabled=False
        )
        return connection
    except Error as e:
        print(f"❌ Database connection error: {e}")
        raise

def get_aging_leads(days_threshold=7):
    """
    Get leads that haven't been contacted in X days
    Returns list of leads with aging calculation
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    query = """
    SELECT 
        id, name, email, phone, company, industry, source, status, notes,
        last_contact, created_at,
        DATEDIFF(NOW(), COALESCE(last_contact, created_at)) AS days_since_contact
    FROM leads
    WHERE status IN ('new', 'contacted')
    AND DATEDIFF(NOW(), COALESCE(last_contact, created_at)) >= %s
    ORDER BY days_since_contact DESC
    """
    
    cursor.execute(query, (days_threshold,))
    leads = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return leads

def generate_follow_up_email(lead):
    """
    Generate personalized follow-up email based on lead source and industry
    """
    name = lead['name'].split()[0] if lead['name'] else 'there'
    company = lead['company'] or 'your organization'
    industry = lead['industry'] or 'your industry'
    source = lead['source']
    days_since = lead['days_since_contact']
    
    # Personalize based on source
    if source == 'Sally':
        intro = f"Following up on our recent conversation"
    elif source == 'Website':
        intro = f"Thank you for your interest in DOPA-TECH"
    elif source == 'Referral':
        intro = f"It was great connecting through our mutual contact"
    else:
        intro = f"Reaching out regarding our previous discussion"
    
    # Build email
    subject = f"Following up: DOPA-TECH + {company}"
    
    body = f"""Hi {name},

{intro}. I wanted to check in and see if you had any questions about how DOPA-TECH can help {company} with content creation and market intelligence.

We specialize in:
• AI-powered content generation for {industry}
• Caribbean and African market intelligence (Wukr Wire)
• Automated content distribution and syndication
• Real-time trade signal monitoring

Would you be available for a quick 15-minute call this week to discuss your specific needs?

Best regards,
Richard Fortune
Founder, DOPA-TECH
richard.fproductions@gmail.com
St. Lucia | The Trenches

P.S. It's been {days_since} days since we last connected - I know you're busy, but I'd love to help accelerate your content strategy.
"""
    
    return subject, body

def send_email(to_email, subject, body):
    """Send email using SMTP"""
    if not all([EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD]):
        print("⚠️  Email credentials not configured. Skipping email send.")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = f"{EMAIL_FROM_NAME} <{EMAIL_USER}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"❌ Error sending email to {to_email}: {e}")
        return False

def update_lead_contact(lead_id):
    """Update last_contact timestamp for lead"""
    connection = get_db_connection()
    cursor = connection.cursor()
    
    query = "UPDATE leads SET last_contact = NOW(), updated_at = NOW() WHERE id = %s"
    cursor.execute(query, (lead_id,))
    connection.commit()
    
    cursor.close()
    connection.close()

def main():
    """Main lead pipeline workflow"""
    print("=" * 80)
    print("LEAD PIPELINE AUTOMATION")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S AST')}")
    print("=" * 80)
    
    # Step 1: Get aging leads (7+ days since last contact)
    print("\n[1/3] Fetching aging leads (7+ days since contact)...")
    aging_leads = get_aging_leads(days_threshold=7)
    print(f"Found {len(aging_leads)} leads requiring follow-up")
    
    if not aging_leads:
        print("\n✅ No leads require follow-up at this time.")
        return
    
    # Step 2: Generate and send follow-up emails
    print("\n[2/3] Generating and sending follow-up emails...")
    sent_count = 0
    failed_count = 0
    
    for lead in aging_leads:
        if not lead['email']:
            print(f"⚠️  Skipping {lead['name']} - no email address")
            continue
        
        subject, body = generate_follow_up_email(lead)
        
        print(f"\nSending to: {lead['name']} ({lead['email']})")
        print(f"Days since contact: {lead['days_since_contact']}")
        print(f"Subject: {subject}")
        
        if send_email(lead['email'], subject, body):
            update_lead_contact(lead['id'])
            sent_count += 1
            print("✅ Email sent successfully")
        else:
            failed_count += 1
            print("❌ Email failed to send")
    
    # Step 3: Summary
    print("\n" + "=" * 80)
    print("LEAD PIPELINE COMPLETE")
    print("=" * 80)
    print(f"Total aging leads: {len(aging_leads)}")
    print(f"Emails sent: {sent_count}")
    print(f"Emails failed: {failed_count}")
    print(f"Skipped (no email): {len(aging_leads) - sent_count - failed_count}")

if __name__ == '__main__':
    main()
