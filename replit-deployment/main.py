#!/usr/bin/env python3
"""
Voice-to-Repo Webhook - Replit Deployment
Receives audio from agents, transcribes, classifies, and routes to quintapoo-memory
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from pathlib import Path
import subprocess
import json
import requests
from datetime import datetime
import os
from typing import Optional
import base64

app = FastAPI(title="Voice-to-Repo", version="1.0.0")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_OWNER = "hypnoticproductions"
REPO_NAME = "quintapoo-memory"
API_KEY = os.getenv("VOICE_API_KEY", "your_secret_key")

VALID_SOURCES = ["multibot", "coco", "gima", "sally", "telnyx"]

# ============================================
# AUTHENTICATION
# ============================================

def verify_api_key(authorization: Optional[str] = Header(None)):
    """Verify API key from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid authorization")
    
    token = authorization.replace("Bearer ", "")
    if token != API_KEY:
        raise HTTPException(403, "Invalid API key")


# ============================================
# MAIN ENDPOINT
# ============================================

@app.post("/voice/{source}")
async def process_voice(
    source: str,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """
    Process voice input from agents
    
    Args:
        source: Agent source (multibot, coco, gima, sally, telnyx)
        file: Audio file (ogg, opus, wav, mp3, webm)
    
    Returns:
        Processing status and intent classification
    """
    verify_api_key(authorization)
    
    # Validate source
    if source not in VALID_SOURCES:
        raise HTTPException(400, f"Invalid source. Must be one of: {VALID_SOURCES}")
    
    # Validate file size (max 10MB)
    file_size = 0
    temp_path = f"/tmp/{file.filename}"
    
    with open(temp_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
            file_size += len(chunk)
            if file_size > 10 * 1024 * 1024:
                os.remove(temp_path)
                raise HTTPException(413, "File too large. Max 10MB.")
            f.write(chunk)
    
    try:
        # Convert to WAV
        wav_path = convert_to_wav(temp_path)
        
        # Transcribe
        transcription = transcribe_audio(wav_path)
        
        # Classify intent
        classification = classify_intent(transcription, source)
        
        # Route based on intent
        result = route_content(transcription, classification, source)
        
        # Update metrics
        update_metrics(classification)
        
        # Cleanup
        os.remove(temp_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)
        
        return {
            "status": "processed",
            "intent": classification["intent"],
            "confidence": classification["confidence"],
            "file": result.get("file"),
            "pr_url": result.get("pr_url")
        }
    
    except Exception as e:
        # Cleanup on error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(500, f"Processing error: {str(e)}")


# ============================================
# AUDIO PROCESSING
# ============================================

def convert_to_wav(input_path: str) -> str:
    """Convert audio to WAV format using ffmpeg"""
    wav_path = input_path.rsplit(".", 1)[0] + ".wav"
    
    result = subprocess.run([
        "ffmpeg", "-i", input_path,
        "-ar", "16000",  # 16kHz sample rate
        "-ac", "1",      # Mono
        "-y",            # Overwrite
        wav_path
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        raise Exception(f"Audio conversion failed: {result.stderr}")
    
    return wav_path


def transcribe_audio(wav_path: str) -> str:
    """Transcribe audio using OpenAI Whisper API"""
    
    with open(wav_path, "rb") as audio_file:
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            files={"file": audio_file},
            data={"model": "whisper-1", "language": "en"}
        )
    
    if response.status_code != 200:
        raise Exception(f"Transcription failed: {response.text}")
    
    return response.json()["text"]


# ============================================
# INTENT CLASSIFICATION
# ============================================

def classify_intent(text: str, source: str) -> dict:
    """Classify intent using OpenAI GPT"""
    
    prompt = f"""Classify this voice transcription into one of these intents:
- lead: New business opportunity, client inquiry
- note: Field observation, internal memo
- task: Action item, to-do
- idea: Content idea, marketing concept
- query: Question requiring response

Source agent: {source}
Transcription: "{text}"

Return ONLY valid JSON in this format:
{{"intent": "lead", "confidence": 0.95, "title": "Brief title", "tags": ["tag1", "tag2"]}}"""
    
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3
        }
    )
    
    if response.status_code != 200:
        raise Exception(f"Classification failed: {response.text}")
    
    result = response.json()["choices"][0]["message"]["content"]
    
    # Parse JSON from response
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        # Fallback if LLM doesn't return valid JSON
        return {
            "intent": "note",
            "confidence": 0.5,
            "title": "Voice note",
            "tags": ["unclassified"]
        }


# ============================================
# ROUTING
# ============================================

def route_content(text: str, classification: dict, source: str) -> dict:
    """Route content to appropriate folder"""
    
    intent = classification["intent"]
    
    if intent == "lead":
        return create_lead_pr(text, classification, source)
    elif intent == "note":
        return commit_note(text, classification, source)
    elif intent == "task":
        return commit_task(text, classification, source)
    elif intent == "idea":
        return create_idea_pr(text, classification, source)
    elif intent == "query":
        return {"response": "Query processing not yet implemented"}
    else:
        return commit_note(text, classification, source)


def create_lead_pr(text: str, classification: dict, source: str) -> dict:
    """Create PR for new lead"""
    
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    time_str = timestamp.strftime("%H:%M")
    title = classification.get("title", "New Lead")
    filename = f"{date_str}-{title.lower().replace(' ', '-')[:30]}-intake.md"
    
    content = f"""---
date: {date_str} {time_str}
source: {source}
product: general
status: new
assignee: richard
tags: {json.dumps(classification.get("tags", ["voice-intake"]))}
---

# Lead: {title}

**Source:** {source}
**Date:** {timestamp.strftime("%Y-%m-%d %H:%M")}

## Transcription
{text}

## Next Steps
- [ ] Initial contact
- [ ] Qualification call
- [ ] Send proposal
"""
    
    # Create PR via GitHub API
    return create_github_pr(f"leads/{filename}", content, f"New lead from {source}: {title}")


def commit_note(text: str, classification: dict, source: str) -> dict:
    """Commit note directly to repo"""
    
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    time_str = timestamp.strftime("%H%M")
    filename = f"{date_str}-{time_str}-{source}-note.md"
    
    content = f"""---
date: {timestamp.strftime("%Y-%m-%d %H:%M")}
source: {source}
tags: {json.dumps(classification.get("tags", ["voice-note"]))}
---

{text}
"""
    
    return commit_to_github(f"notes/{filename}", content, f"Note from {source}: {date_str}")


def commit_task(text: str, classification: dict, source: str) -> dict:
    """Commit task to repo"""
    
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    title = classification.get("title", "New Task")
    filename = f"{date_str}-{title.lower().replace(' ', '-')[:30]}.md"
    
    # Check if urgent
    urgent_keywords = ["urgent", "asap", "immediately", "critical", "emergency"]
    is_urgent = any(keyword in text.lower() for keyword in urgent_keywords)
    
    content = f"""---
date: {timestamp.strftime("%Y-%m-%d %H:%M")}
source: {source}
status: open
assignee: richard
priority: {"urgent" if is_urgent else "normal"}
tags: {json.dumps(classification.get("tags", ["voice-task"]))}
---

# Task: {title}

{text}

## Deadline
Not specified
"""
    
    return commit_to_github(f"tasks/{filename}", content, f"Task from {source}: {title}")


def create_idea_pr(text: str, classification: dict, source: str) -> dict:
    """Create PR for content idea"""
    
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    title = classification.get("title", "Content Idea")
    filename = f"{date_str}-{title.lower().replace(' ', '-')[:30]}.md"
    
    content = f"""---
date: {timestamp.strftime("%Y-%m-%d %H:%M")}
source: {source}
product: wukr
tags: {json.dumps(classification.get("tags", ["voice-idea"]))}
---

# Content Idea: {title}

{text}

## Potential Formats
- Article
- Newsletter
- Social post
"""
    
    return create_github_pr(f"content-ideas/{filename}", content, f"Content idea from {source}: {title}")


# ============================================
# GITHUB INTEGRATION
# ============================================

def commit_to_github(path: str, content: str, message: str) -> dict:
    """Commit file directly to main branch"""
    
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}"
    
    response = requests.put(
        url,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        },
        json={
            "message": message,
            "content": base64.b64encode(content.encode()).decode(),
            "branch": "main"
        }
    )
    
    if response.status_code in [200, 201]:
        return {"file": path, "status": "committed"}
    else:
        raise Exception(f"GitHub commit failed: {response.text}")


def create_github_pr(path: str, content: str, title: str) -> dict:
    """Create pull request for review"""
    
    # For now, commit directly (PR creation requires branch management)
    # TODO: Implement proper PR creation with branch
    return commit_to_github(path, content, title)


# ============================================
# METRICS
# ============================================

def update_metrics(classification: dict):
    """Update usage metrics"""
    
    # TODO: Implement metrics update via GitHub API
    # Read current metrics/usage.json
    # Increment counters
    # Write back to repo
    pass


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "voice-to-repo",
        "version": "1.0.0",
        "platform": "replit"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "voice-to-repo",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Health check",
            "/voice/{source}": "Process voice input (POST)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
