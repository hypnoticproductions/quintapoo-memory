# Claude Desktop Posting Guide

## Overview

This guide explains how to use Claude Desktop to post Caribbean tourism content to Substack and Twitter automatically.

---

## Prerequisites

1. **Claude Desktop** installed on your machine
2. **Node.js** installed (v18 or higher)
3. **Git** configured with Quintapoo repository access
4. **Google OAuth** accounts for Substack and Twitter

---

## One-Time Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/quintapoo-memory.git
cd quintapoo-memory
```

### Step 2: Install Dependencies

```bash
npm install playwright
npx playwright install chromium
```

### Step 3: Run Login Script

```bash
node scripts/claude_desktop_login.mjs
```

**What happens:**
1. Browser windows open for Substack and Twitter
2. You log in via Google OAuth
3. Sessions are saved locally (`.substack-session.json`, `.twitter-session.json`)
4. Press Enter after each login to save

---

## Daily Posting

### Run Posting Script

```bash
node scripts/claude_desktop_post.mjs
```

**What happens:**
1. Script loads next post from rotation (Post 1-6)
2. Posts to Substack (saved as draft)
3. Posts to Twitter (published immediately)
4. Updates posting history (`.posting-history.json`)
5. Rotates to next post for tomorrow

---

## Posting Schedule

**Recommended:** Run 3x daily via Claude Desktop

- **9 AM AST:** Post 1-2 (Language Barriers + Saint Lucia)
- **1 PM AST:** Post 3-4 (Dominica + Barbados)
- **6 PM AST:** Post 5-6 (Grenada + St. Vincent)

**Automation Options:**

1. **Manual (Claude Desktop):** Run script 3x daily
2. **Cron (Local Machine):** Set up cron job to run script automatically
3. **Manus (Future):** Upload session files to Manus for cloud automation

---

## Content Rotation

The script automatically rotates through 6 posts:

1. **Language Barriers Kill Caribbean Tourism Revenue**
2. **Saint Lucia's Tourism Industry is Sleeping on AI**
3. **Dominica's Eco-Tourism Needs AI**
4. **Barbados is Winning the AI Tourism Race**
5. **Grenada's Spice Island Brand Needs Digital Heat**
6. **St. Vincent is the Caribbean's Best-Kept Secret**

After Post 6, it loops back to Post 1.

---

## Troubleshooting

### Session Expired

If you see "Session not found" errors:

```bash
node scripts/claude_desktop_login.mjs
```

Re-login to refresh sessions.

### Browser Not Opening

Ensure Chromium is installed:

```bash
npx playwright install chromium
```

### Content Not Loading

Ensure content file exists:

```bash
ls -l content/daily_posts_caribbean_tourism.md
```

---

## Uploading Sessions to Manus (Optional)

To enable cloud automation, upload session files to Manus:

1. **Locate session files:**
   - `.substack-session.json`
   - `.twitter-session.json`

2. **Upload to Manus project:**
   - Use Manus UI file upload
   - Place in project root directory

3. **Manus scheduled task will use these sessions** for automated posting (3x daily)

---

## File Structure

```
quintapoo-memory/
├── scripts/
│   ├── claude_desktop_login.mjs      # One-time login setup
│   ├── claude_desktop_post.mjs       # Daily posting script
│   └── ...
├── content/
│   └── daily_posts_caribbean_tourism.md  # 6 posts content
├── .substack-session.json            # Substack browser session (generated)
├── .twitter-session.json             # Twitter browser session (generated)
├── .posting-history.json             # Posting rotation tracker (generated)
└── README_CLAUDE_DESKTOP.md          # This file
```

---

## Support

If you encounter issues, contact richard@dopa.buzz or check the Manus project dashboard.
