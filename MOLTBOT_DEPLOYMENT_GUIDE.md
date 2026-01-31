# Moltbot + Kimi 2.5 Deployment Guide

**Goal**: Automate 3x daily Substack + Twitter posting (9 AM, 1 PM, 6 PM AST) using Moltbot + Kimi 2.5.

**Advantages over Goose + Claude 3.5 Sonnet**:
- 30x cheaper ($0.30/month vs $9/month)
- Simpler architecture (one system vs two)
- 5x larger context window (1M tokens vs 200K)
- Native cron integration (no orchestration layer needed)

---

## Prerequisites

1. **Moltbot installed** on your local machine
2. **Kimi API key** (get from https://kimi.ai)
3. **Quintapoo Memory Repository** cloned locally
4. **Node.js 22+** and **pnpm** installed
5. **Playwright** installed (`pnpm add playwright`)

---

## Step 1: Install Moltbot

```bash
# Install Moltbot (follow official instructions at https://moltbot.ai)
curl -fsSL https://moltbot.ai/install.sh | bash

# Verify installation
moltbot --version
```

---

## Step 2: Configure Moltbot

### 2.1 Set Kimi API Key

```bash
# Add Kimi API key to environment
export KIMI_API_KEY="your_kimi_api_key_here"

# Or add to ~/.bashrc or ~/.zshrc for persistence
echo 'export KIMI_API_KEY="your_kimi_api_key_here"' >> ~/.bashrc
source ~/.bashrc
```

### 2.2 Configure Database Credentials

```bash
# Add database credentials (get from Manus secrets)
export DATABASE_HOST="gateway01.us-east-1.prod.aws.tidbcloud.com"
export DATABASE_USER="your_db_user"
export DATABASE_PASSWORD="your_db_password"
```

### 2.3 Load Moltbot Configuration

```bash
cd /path/to/quintapoo-memory

# Load Moltbot config
moltbot config load moltbot_config.json

# Verify config
moltbot config show
```

---

## Step 3: Install Playwright and Dependencies

```bash
cd /path/to/quintapoo-memory

# Install Playwright
pnpm add playwright

# Install Playwright browsers
npx playwright install chromium

# Test Playwright installation
npx playwright --version
```

---

## Step 4: Save Browser Sessions (One-Time Setup)

### 4.1 Log in to Substack

```bash
# Run Substack posting script manually
node scripts/post_to_substack.mjs "Test Title" "Test Subtitle" "Test body content"

# Browser will open
# Log in via Google OAuth (richard.fproductions@gmail.com)
# Press Enter after logging in
# Script will save session to .moltbot/sessions/
```

### 4.2 Log in to Twitter

```bash
# Run Twitter posting script manually
node scripts/post_to_twitter.mjs '["Test tweet 1", "Test tweet 2"]'

# Browser will open
# Log in via Google OAuth (richard.fproductions@gmail.com)
# Press Enter after logging in
# Script will save session to .moltbot/sessions/
```

---

## Step 5: Load Moltbot Tasks

```bash
cd /path/to/quintapoo-memory

# Load tasks configuration
moltbot schedule load moltbot_tasks.json

# Verify tasks loaded
moltbot schedule list
```

Expected output:
```
Tasks loaded:
- morning_intelligence_drop (9:00 AM AST daily)
- midday_engagement (1:00 PM AST daily)
- evening_thought_leadership (6:00 PM AST daily)
```

---

## Step 6: Test Tasks Manually

### 6.1 Test Morning Intelligence Drop

```bash
moltbot run morning_intelligence_drop
```

Expected behavior:
1. Queries database for latest Base 44 processed content
2. Generates Substack post (800-1200 words, WUKY tone)
3. Opens Substack editor in browser
4. Fills title, subtitle, body
5. Saves as draft
6. Generates Twitter thread (6 tweets)
7. Opens Twitter in browser
8. Posts thread
9. Logs results to `/home/ubuntu/quintapoo-memory/logs/moltbot.log`

### 6.2 Test Midday Engagement

```bash
moltbot run midday_engagement
```

Expected behavior:
1. Queries database for lead analytics (by island)
2. Generates Twitter thread (5 tweets, data-driven)
3. Opens Twitter in browser
4. Posts thread
5. Logs results

### 6.3 Test Evening Thought Leadership

```bash
moltbot run evening_thought_leadership
```

Expected behavior:
1. Reads content buffer (`content/daily_posts_caribbean_tourism.md`)
2. Selects next post in rotation
3. Generates Substack post (800-1200 words)
4. Posts to Substack
5. Generates Twitter thread (7 tweets)
6. Posts to Twitter
7. Logs results

---

## Step 7: Enable Automated Scheduling

```bash
# Start Moltbot scheduler (runs in background)
moltbot schedule start

# Verify scheduler is running
moltbot schedule status
```

Expected output:
```
Scheduler status: RUNNING
Next execution:
- morning_intelligence_drop: Tomorrow at 9:00 AM AST
- midday_engagement: Tomorrow at 1:00 PM AST
- evening_thought_leadership: Today at 6:00 PM AST
```

---

## Step 8: Monitor Execution

### 8.1 View Logs

```bash
# Tail Moltbot logs in real-time
tail -f /home/ubuntu/quintapoo-memory/logs/moltbot.log

# View last 50 lines
tail -50 /home/ubuntu/quintapoo-memory/logs/moltbot.log
```

### 8.2 Check Task History

```bash
# View execution history
moltbot schedule history

# View specific task history
moltbot schedule history morning_intelligence_drop
```

---

## Troubleshooting

### Issue: "Browser session expired"

**Solution**: Re-run manual login scripts
```bash
node scripts/post_to_substack.mjs "Test" "Test" "Test"
node scripts/post_to_twitter.mjs '["Test"]'
```

### Issue: "Database connection failed"

**Solution**: Verify database credentials
```bash
echo $DATABASE_HOST
echo $DATABASE_USER
# Check if credentials match Manus secrets
```

### Issue: "Kimi API rate limit exceeded"

**Solution**: Check API usage at https://kimi.ai/dashboard
- Free tier: 1M tokens/month
- Upgrade to paid tier if needed

### Issue: "Task failed to execute"

**Solution**: Check logs for detailed error
```bash
tail -100 /home/ubuntu/quintapoo-memory/logs/moltbot.log | grep ERROR
```

---

## Maintenance

### Update Content Buffer

Edit `/home/ubuntu/quintapoo-memory/content/daily_posts_caribbean_tourism.md` to add new posts. Moltbot will automatically rotate through them.

### Adjust Posting Schedule

Edit `moltbot_tasks.json` and reload:
```bash
moltbot schedule reload moltbot_tasks.json
```

### Pause Automation

```bash
# Stop scheduler
moltbot schedule stop

# Resume scheduler
moltbot schedule start
```

---

## Cost Estimation

**Kimi 2.5 Pricing**:
- Input: $0.14 per 1M tokens
- Output: $0.42 per 1M tokens

**Daily Usage** (3 posts/day):
- Input: ~3,000 tokens/post × 3 = 9,000 tokens/day
- Output: ~2,000 tokens/post × 3 = 6,000 tokens/day

**Monthly Cost**:
- Input: 9,000 × 30 = 270,000 tokens = $0.04
- Output: 6,000 × 30 = 180,000 tokens = $0.08
- **Total: $0.12/month**

Compare to Goose + Claude 3.5 Sonnet: $9/month (75x more expensive)

---

## Next Steps

1. **Monitor first week** - Check logs daily, verify posts are published correctly
2. **Adjust content strategy** - Update content buffer based on engagement metrics
3. **Scale to more platforms** - Add LinkedIn, Hashnode, Dev.to posting scripts
4. **Build analytics dashboard** - Track post performance, engagement rates, lead conversion

---

## Support

**Moltbot Issues**: https://github.com/moltbot/moltbot/issues  
**Kimi API Issues**: https://kimi.ai/support  
**Quintapoo Issues**: https://github.com/YOUR_USERNAME/quintapoo-memory/issues

---

**Status**: Ready for deployment. Execute immediately.
