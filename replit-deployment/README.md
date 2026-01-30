# Voice-to-Repo Webhook - Replit Deployment

FastAPI webhook that receives audio from voice agents, transcribes via Whisper, classifies intent via GPT, and commits to GitHub.

## Quick Deploy to Replit

1. **Import to Replit:**
   - Go to https://replit.com/new/github
   - Paste this repo URL or upload files
   - Replit will auto-detect Python and install dependencies

2. **Set Secrets (Environment Variables):**
   - Click "Secrets" (lock icon) in left sidebar
   - Add these secrets:
     ```
     OPENAI_API_KEY=[your OpenAI API key]
     GITHUB_TOKEN=[your GitHub personal access token]
     VOICE_API_KEY=[generate random 32-char string]
     ```

3. **Install ffmpeg:**
   - Open Shell in Replit
   - Run: `nix-env -iA nixpkgs.ffmpeg`

4. **Run:**
   - Click "Run" button
   - Replit will start uvicorn server
   - Get public URL from Webview panel

5. **Deploy (Always-On):**
   - Click "Deploy" button
   - Choose "Autoscale" deployment
   - Get permanent public URL

## API Usage

### Health Check
```bash
curl https://your-repl.replit.app/health
```

### Process Voice
```bash
curl -X POST https://your-repl.replit.app/voice/sally \
  -H "Authorization: Bearer YOUR_VOICE_API_KEY" \
  -F "file=@audio.mp3"
```

## Endpoints

- `GET /` - Service info
- `GET /health` - Health check
- `POST /voice/{source}` - Process voice input
  - Sources: multibot, coco, gima, sally, telnyx
  - Requires: `Authorization: Bearer {VOICE_API_KEY}` header
  - Accepts: audio files (mp3, wav, ogg, opus, webm)

## Architecture

```
Voice Agent → POST /voice/{source} → Transcribe (Whisper) → Classify (GPT) → Route to GitHub
```

## Folder Routing

- **lead** → `leads/` (creates PR)
- **note** → `notes/` (direct commit)
- **task** → `tasks/` (direct commit)
- **idea** → `content-ideas/` (creates PR)
- **query** → Not yet implemented

## GitHub Integration

Commits to: `hypnoticproductions/quintapoo-memory`

## Cost

- Replit Free: Dev environment (sleeps after inactivity)
- Replit Hacker ($7/mo): Always-on deployments
- OpenAI: ~$0.006 per minute of audio (Whisper) + ~$0.0001 per classification (GPT-4o-mini)
