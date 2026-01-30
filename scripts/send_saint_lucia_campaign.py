#!/usr/bin/env python3
"""
Send Saint Lucia tour operator outreach emails
Uses Email Template Version 1 (Direct Value Prop)
Batch size: 5 emails (test batch)
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import mysql.connector
from urllib.parse import urlparse
from datetime import datetime

# Email configuration
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('GMAIL_APP_PASSWORD') or os.getenv('EMAIL_PASSWORD')
EMAIL_FROM_NAME = os.getenv('EMAIL_FROM_NAME', 'Richard Fortune, DOPA-TECH')

# Parse DATABASE_URL
database_url = os.getenv('DATABASE_URL')
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

cursor = conn.cursor(dictionary=True)

# Fetch 5 Saint Lucia tour operators (test batch)
cursor.execute("""
    SELECT id, name, email, company, phone
    FROM leads
    WHERE source = 'saint_lucia_tourism'
    AND status = 'new'
    LIMIT 5
""")

leads = cursor.fetchall()

print(f"Found {len(leads)} leads to email")

# Email template (Version 1: Direct Value Prop)
def generate_email_body(business_name):
    return f"""Hi {business_name} Team,

I'm Richard Fortune, founder of DOPA-TECH—a Saint Lucian tech company built by someone who actually worked in the hospitality industry. I know the challenges you face when guests speak Mandarin, French, German, or Spanish, and your tour guides are scrambling to communicate.

**What if your tour guides could speak 20+ languages instantly?**

We've built **Sally WUKR**, a multi-language voice agent designed specifically for Caribbean tourism. It's not a chatbot—it's a real-time voice assistant that can:

✅ **Translate tour commentary** in 20+ languages (Mandarin, French, Spanish, German, Italian, Portuguese, Japanese, Korean, Russian, Arabic, and more)
✅ **Answer guest questions** about Saint Lucia history, culture, attractions, safety
✅ **Handle booking inquiries** 24/7 (even when your office is closed)
✅ **Provide personalized recommendations** based on guest preferences
✅ **Work offline** (no internet required for core features)

### Why This Matters for Saint Lucia Tourism

- **Chinese tourists** are the fastest-growing segment in Caribbean tourism—but language barriers kill bookings
- **European guests** (French, German, Italian) expect multilingual service
- **Cruise ship passengers** need instant answers in their native language
- **Your competitors** are still using Google Translate (and losing customers)

### Test It Yourself (Right Now)

Visit **www.dopa.buzz** and try Sally WUKR. Ask her about Saint Lucia attractions in any language. See how she responds. Then imagine this voice agent supporting your tour guides in the field.

### Built in Saint Lucia, For Saint Lucia

I'm not some Silicon Valley tech bro. I worked in hospitality here in Saint Lucia. I saw the language barriers. I built this solution specifically for us—for Caribbean tour operators who want to compete globally without losing our local authenticity.

### DOPA-TECH Services (Beyond Voice Agents)

1. **Sally WUKR** - Multi-language voice agent for tour guides and customer service
2. **Harvester** - Legal tech for contract management and compliance (tourism licensing, vendor agreements)
3. **SafeTravel** - Risk management and safety monitoring for excursions
4. **WUKR Wire** - Caribbean market intelligence and content syndication

### Let's Talk

I'm offering **5 free pilot programs** to Saint Lucia tour operators this month. No credit card. No commitment. Just test Sally WUKR with your team for 30 days and see if it increases bookings.

**Email**: richard.fproductions@gmail.com
**Website**: www.dopa.buzz

We're building the future of Caribbean tourism—right here in The Trenches.

**Richard Fortune**
Founder, DOPA-TECH
St. Lucia 🇱🇨

P.S. If you're skeptical, I get it. That's why I'm giving you the demo link first. Go to www.dopa.buzz, test Sally WUKR yourself, and then decide if this is worth 15 minutes of your time.
"""

# Send emails
sent = 0
failed = 0

for lead in leads:
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{EMAIL_FROM_NAME} <{EMAIL_USER}>"
        msg['To'] = lead['email']
        msg['Subject'] = "Saint Lucian-Built AI Voice Agent for Your Tour Guides 🇱🇨"
        
        # Email body
        body = generate_email_body(lead['name'])
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
        
        # Update lead status
        cursor.execute("""
            UPDATE leads
            SET status = 'contacted',
                last_contact = %s,
                updated_at = %s
            WHERE id = %s
        """, (
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            lead['id']
        ))
        conn.commit()
        
        sent += 1
        print(f"✅ Sent to: {lead['name']} ({lead['email']})")
        
    except Exception as e:
        failed += 1
        print(f"❌ Failed to send to {lead['name']}: {e}")

print(f"\n{'='*60}")
print(f"✅ Campaign complete!")
print(f"{'='*60}")
print(f"Emails sent: {sent}")
print(f"Emails failed: {failed}")
print(f"Total processed: {len(leads)}")

# Close connection
cursor.close()
conn.close()
