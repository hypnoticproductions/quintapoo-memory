# Voice-to-Repo Webhook Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended)

**Why Railway:**
- Zero-config deployment
- Automatic HTTPS
- Built-in environment variable management
- Free tier available
- Persistent storage

**Steps:**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   cd /path/to/quintapoo-memory
   railway init
   ```

4. **Set environment variables:**
   ```bash
   railway variables set OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   railway variables set GITHUB_TOKEN="YOUR_GITHUB_TOKEN"
   railway variables set VOICE_API_KEY="YOUR_SECRET_API_KEY"
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get public URL:**
   ```bash
   railway domain
   ```

---

### Option 2: Render

**Steps:**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `hypnoticproductions/quintapoo-memory`
4. Configure:
   - **Name:** `voice-to-repo-webhook`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile.voice`
   - **Instance Type:** Free
5. Add environment variables:
   - `OPENAI_API_KEY`
   - `GITHUB_TOKEN`
   - `VOICE_API_KEY`
6. Click "Create Web Service"

---

### Option 3: Fly.io

**Steps:**

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Launch app:**
   ```bash
   cd /path/to/quintapoo-memory
   fly launch --dockerfile Dockerfile.voice
   ```

4. **Set secrets:**
   ```bash
   fly secrets set OPENAI_API_KEY="YOUR_KEY"
   fly secrets set GITHUB_TOKEN="YOUR_TOKEN"
   fly secrets set VOICE_API_KEY="YOUR_SECRET"
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

---

### Option 4: Vercel (Serverless)

**Note:** Requires converting FastAPI to Vercel serverless format.

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "builds": [
       {
         "src": "voice-to-repo.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "voice-to-repo.py"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   cd /path/to/quintapoo-memory
   vercel --prod
   ```

4. **Set environment variables in Vercel dashboard**

---

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for Whisper transcription | `sk-proj-...` |
| `GITHUB_TOKEN` | GitHub personal access token with repo access | `ghp_...` |
| `VOICE_API_KEY` | Secret key for webhook authentication | `your_secret_key_here` |

---

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-webhook-url.railway.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "voice-to-repo",
  "version": "1.0.0"
}
```

### 2. Test Voice Upload
```bash
curl -X POST https://your-webhook-url.railway.app/voice/multibot \
  -H "Authorization: Bearer YOUR_VOICE_API_KEY" \
  -F "file=@test_audio.wav"
```

**Expected response:**
```json
{
  "status": "processed",
  "intent": "note",
  "confidence": 0.95,
  "file": "notes/2026-01-30-1422-multibot-note.md"
}
```

---

## Agent Integration

Once deployed, configure your agents to send audio to:

**Endpoint:** `https://your-webhook-url.railway.app/voice/:source`

**Sources:**
- `multibot` - Internal/field capture
- `coco` - WhatsApp qualifier
- `gima` - Africa voice closer
- `sally` - Website voice closer
- `telnyx` - Phone scheduler

**Headers:**
```
Authorization: Bearer YOUR_VOICE_API_KEY
Content-Type: multipart/form-data
```

**Body:**
```
file: <audio_file> (ogg, opus, wav, mp3, webm)
```

---

## Monitoring

### Railway Dashboard
- View logs: `railway logs`
- Check metrics: Railway dashboard → Metrics tab
- Monitor deployments: Railway dashboard → Deployments tab

### Render Dashboard
- View logs in Render dashboard
- Set up alerts for errors
- Monitor resource usage

### Fly.io Dashboard
- View logs: `fly logs`
- Check status: `fly status`
- Monitor metrics in Fly.io dashboard

---

## Troubleshooting

### Issue: "Module not found" error
**Solution:** Ensure all dependencies are in `voice-to-repo-requirements.txt`

### Issue: "ffmpeg not found"
**Solution:** Dockerfile includes ffmpeg installation. Rebuild if needed.

### Issue: "GitHub API rate limit"
**Solution:** Use authenticated GitHub token with higher rate limits

### Issue: "OpenAI API error"
**Solution:** Verify API key is valid and has credits

---

## Cost Estimates

### Railway
- **Free tier:** 500 hours/month, $5 credit
- **Paid:** $5/month for 500 hours
- **Estimated:** ~$5-10/month for moderate usage

### Render
- **Free tier:** 750 hours/month
- **Paid:** $7/month for starter instance
- **Estimated:** Free for low usage, $7/month for production

### Fly.io
- **Free tier:** 3 shared-cpu VMs, 160GB bandwidth
- **Paid:** $1.94/month per VM
- **Estimated:** Free for low usage, $2-5/month for production

### Vercel
- **Free tier:** 100GB bandwidth, 100 hours serverless
- **Paid:** $20/month Pro plan
- **Estimated:** Free for low usage, $20/month for high traffic

---

## Security Considerations

1. **API Key Rotation:** Rotate `VOICE_API_KEY` regularly
2. **Rate Limiting:** Implement rate limiting per agent (100 req/hour)
3. **File Size Limits:** Max 10MB enforced in code
4. **HTTPS Only:** All platforms provide automatic HTTPS
5. **Source Validation:** Only accept from registered agents

---

## Next Steps

1. Choose deployment platform (Railway recommended)
2. Deploy webhook
3. Test with sample audio
4. Configure agents to use webhook URL
5. Monitor logs for first 24 hours
6. Set up alerts for errors

---

## Files in Repository

- `voice-to-repo.py` - Main webhook application
- `voice-to-repo-requirements.txt` - Python dependencies
- `Dockerfile.voice` - Docker configuration
- `railway.json` - Railway deployment config
- `VOICE_TO_REPO_SKILL.md` - Architecture documentation
- `VOICE_WEBHOOK_DEPLOYMENT.md` - This file

---

## Support

For issues or questions:
1. Check logs in deployment platform
2. Review `VOICE_TO_REPO_SKILL.md` for architecture details
3. Test locally: `python voice-to-repo.py` then `curl localhost:8000/health`
