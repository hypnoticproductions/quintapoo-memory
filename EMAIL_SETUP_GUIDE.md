# Email Setup Guide for Lead Pipeline

**Issue**: Gmail SMTP "Connection unexpectedly closed" errors blocking automated lead follow-up emails.

**Root Cause**: Gmail security policies block "less secure apps" and require App-Specific Passwords for automated SMTP access.

---

## Solution 1: Gmail App Password (Recommended)

### Prerequisites
- Google account with 2-Step Verification enabled
- Access to Google Account settings

### Steps
1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)" → Enter "Quintapoo Lead Pipeline"
4. Click "Generate"
5. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
6. Update EMAIL_PASSWORD in Manus secrets with App Password

### Update Secrets
Use `webdev_edit_secrets` to update EMAIL_PASSWORD with the generated App Password.

---

## Solution 2: SendGrid API (Alternative)

### Advantages
- Higher deliverability rates
- Better spam folder avoidance
- Email analytics (open rates, click rates)
- 100 emails/day free tier

### Setup
1. Sign up at https://sendgrid.com
2. Create API key with "Mail Send" permissions
3. Install SendGrid Python library:
   ```bash
   sudo pip3 install sendgrid
   ```
4. Update `lead_pipeline.py` to use SendGrid API instead of SMTP

### Code Changes
```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email_sendgrid(to_email, subject, body):
    message = Mail(
        from_email='richard.fproductions@gmail.com',
        to_emails=to_email,
        subject=subject,
        plain_text_content=body
    )
    
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"SendGrid error: {e}")
        return False
```

---

## Solution 3: Mailgun API (Alternative)

### Advantages
- Simple REST API
- Good deliverability
- 5,000 emails/month free tier

### Setup
1. Sign up at https://www.mailgun.com
2. Verify domain or use sandbox domain
3. Get API key from dashboard
4. Install requests library (already installed)

### Code Changes
```python
import requests

def send_email_mailgun(to_email, subject, body):
    return requests.post(
        "https://api.mailgun.net/v3/YOUR_DOMAIN/messages",
        auth=("api", os.getenv('MAILGUN_API_KEY')),
        data={
            "from": "DOPA-TECH <richard.fproductions@gmail.com>",
            "to": [to_email],
            "subject": subject,
            "text": body
        }
    )
```

---

## Testing Email Delivery

After configuring any solution, test with:

```bash
cd /home/ubuntu/quintapoo-memory
python3 scripts/lead_pipeline.py
```

**Expected Output**:
```
Found 99 leads requiring follow-up
Processing batch of 5 leads (max 5 per run, 99 total)
Sending to: Company Name (email@example.com)
✅ Email sent successfully
```

**Check**:
1. Inbox of test email address
2. Spam folder (if using Gmail SMTP)
3. SendGrid/Mailgun dashboard for delivery status

---

## Recommendation

**For immediate deployment**: Use Gmail App Password (Solution 1) - fastest setup, no code changes.

**For production scale**: Migrate to SendGrid (Solution 2) - better deliverability, analytics, and no Gmail rate limits.

---

## Current Status

- **EMAIL_USER**: richard.fproductions@gmail.com ✅
- **EMAIL_HOST**: smtp.gmail.com ✅
- **EMAIL_PORT**: 587 ✅
- **EMAIL_PASSWORD**: ⚠️ Needs App Password
- **EMAIL_FROM_NAME**: DOPA-TECH ✅

**Next Action**: Generate Gmail App Password and update EMAIL_PASSWORD secret.
