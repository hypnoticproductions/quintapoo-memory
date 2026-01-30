# Voice-to-Repo Skill

## Purpose
Receive audio from any agent, transcribe, classify intent, and route to the correct folder in quintapoo-memory.

## Architecture

### Entry Point
Webhook endpoint: `/voice/:source`

**Supported sources:**
- `multibot` - Internal/field capture
- `coco` - WhatsApp qualifier
- `gima` - Africa voice closer
- `sally` - Website voice closer

### Processing Pipeline

```
Audio Input → Format Conversion → Transcription → Intent Classification → Routing → Metrics Logging
```

## Implementation

### 1. Audio Reception
Accept audio formats:
- `ogg/opus` (Telegram, WhatsApp)
- `wav` (Standard)
- `mp3` (Universal)
- `webm` (Web-based)

### 2. Format Conversion
Use `ffmpeg` to normalize all audio to WAV format:
```bash
ffmpeg -i input.{ogg|opus|mp3|webm} -ar 16000 -ac 1 output.wav
```

### 3. Transcription
Use Grok API (or alternative) for speech-to-text:

**API Endpoint:** `https://api.x.ai/v1/audio/transcriptions`

**Request:**
```json
{
  "file": "audio.wav",
  "model": "whisper-1",
  "language": "en"
}
```

**Alternative:** OpenAI Whisper API if Grok unavailable

### 4. Intent Classification

Use LLM (Grok/Claude) to classify transcription into:

| Intent | Description | Target Folder |
|--------|-------------|---------------|
| `lead` | New business opportunity, client inquiry | `/leads/` |
| `note` | Field observation, internal memo | `/notes/` |
| `task` | Action item, to-do | `/tasks/` |
| `idea` | Content idea, marketing concept | `/content-ideas/` |
| `query` | Question requiring response | Return via source agent |

**Classification Prompt:**
```
Classify this transcription into one of: lead, note, task, idea, query.

Transcription: "{text}"

Return JSON: {"intent": "lead|note|task|idea|query", "confidence": 0.0-1.0}
```

### 5. Routing Logic

#### Lead → Create PR to `/leads/`
```markdown
---
date: YYYY-MM-DD HH:mm
source: {sally|gima|coco}
product: {harvester|safetravel|wukr|morphic|general}
status: new
assignee: richard
tags: [voice-intake]
---

# Lead: {extracted_name}

**Source:** {agent_name}
**Date:** {timestamp}

## Transcription
{full_text}

## Next Steps
- [ ] Initial contact
- [ ] Qualification call
- [ ] Send proposal
```

#### Note → Commit to `/notes/`
```markdown
---
date: YYYY-MM-DD HH:mm
source: {multibot|manual}
tags: [voice-note, {extracted_tags}]
---

{full_text}
```

#### Task → Commit to `/tasks/` + Flag if Urgent
```markdown
---
date: YYYY-MM-DD HH:mm
source: {agent}
status: open
assignee: {richard|rashad}
priority: {normal|urgent}
tags: [voice-task]
---

# Task: {extracted_title}

{full_text}

## Deadline
{extracted_deadline or "Not specified"}
```

#### Idea → Create PR to `/content-ideas/`
```markdown
---
date: YYYY-MM-DD HH:mm
source: {agent}
product: {wukr|general}
tags: [voice-idea]
---

# Content Idea: {extracted_title}

{full_text}

## Potential Formats
- Article
- Newsletter
- Social post
```

#### Query → Respond via Source Agent
Process query through appropriate agent system and return response.

### 6. Metrics Logging

Update `/metrics/usage.json`:
```json
{
  "grok_calls": +1,
  "claude_tokens": +{token_count},
  "github_calls": +1,
  "estimated_cost": +{calculated_cost}
}
```

## API Implementation Example

### FastAPI Server (Python)

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from pathlib import Path
import subprocess
import json
import requests
from datetime import datetime

app = FastAPI()

GROK_API_KEY = "your_grok_api_key"
GITHUB_TOKEN = "your_github_token"
REPO = "hypnoticproductions/quintapoo-memory"

@app.post("/voice/{source}")
async def process_voice(source: str, file: UploadFile = File(...)):
    # Validate source
    valid_sources = ["multibot", "coco", "gima", "sally"]
    if source not in valid_sources:
        raise HTTPException(400, "Invalid source")
    
    # Save uploaded file
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    # Convert to WAV
    wav_path = temp_path.replace(Path(temp_path).suffix, ".wav")
    subprocess.run([
        "ffmpeg", "-i", temp_path, 
        "-ar", "16000", "-ac", "1", wav_path
    ])
    
    # Transcribe
    with open(wav_path, "rb") as audio:
        response = requests.post(
            "https://api.x.ai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {GROK_API_KEY}"},
            files={"file": audio},
            data={"model": "whisper-1"}
        )
    
    transcription = response.json()["text"]
    
    # Classify intent
    classification = classify_intent(transcription)
    
    # Route based on intent
    if classification["intent"] == "lead":
        create_lead_pr(transcription, source)
    elif classification["intent"] == "note":
        commit_note(transcription, source)
    elif classification["intent"] == "task":
        commit_task(transcription, source)
    elif classification["intent"] == "idea":
        create_idea_pr(transcription, source)
    elif classification["intent"] == "query":
        return {"response": process_query(transcription, source)}
    
    # Log metrics
    update_metrics()
    
    return {"status": "processed", "intent": classification["intent"]}

def classify_intent(text: str) -> dict:
    # Use Grok/Claude to classify
    # Return {"intent": "lead", "confidence": 0.95}
    pass

def create_lead_pr(text: str, source: str):
    # Create PR to /leads/ via GitHub API
    pass

def commit_note(text: str, source: str):
    # Commit to /notes/ via GitHub API
    pass

def commit_task(text: str, source: str):
    # Commit to /tasks/ via GitHub API
    pass

def create_idea_pr(text: str, source: str):
    # Create PR to /content-ideas/ via GitHub API
    pass

def update_metrics():
    # Update /metrics/usage.json
    pass
```

## Deployment

### Option 1: Vercel Serverless Function
Deploy as serverless function at `manus.dopa.buzz/voice/:source`

### Option 2: Railway/Render
Deploy FastAPI app with persistent endpoint

### Option 3: AWS Lambda
Trigger via API Gateway

## Testing

### Test Audio Upload
```bash
curl -X POST https://manus.dopa.buzz/voice/multibot \
  -F "file=@test_audio.wav" \
  -H "Authorization: Bearer {api_key}"
```

### Expected Response
```json
{
  "status": "processed",
  "intent": "note",
  "file": "notes/2026-01-30-1422-multibot-note.md"
}
```

## Security

1. **API Key Authentication:** All webhook requests require valid API key
2. **Source Validation:** Only accept from registered agents
3. **Rate Limiting:** Max 100 requests per agent per hour
4. **File Size Limit:** Max 10MB audio files

## Future Enhancements

1. **Multi-language Support:** Detect language and transcribe accordingly
2. **Speaker Diarization:** Identify multiple speakers in audio
3. **Sentiment Analysis:** Flag urgent/emotional content
4. **Auto-tagging:** Extract keywords and auto-tag documents
5. **Voice Signature:** Verify agent identity via voice print
