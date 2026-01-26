# Quintapoo Sally MCP Server Integration Guide

## Overview

This MCP (Model Context Protocol) server exposes 6 tools for Telnyx AI Assistant "Sally" to access Quintapoo's client database during phone calls. Sally can look up clients, check task status, retrieve history, and log calls in real-time.

---

## Architecture

```
Telnyx AI Assistant (Sally)
    ↓
MCP Protocol (stdio)
    ↓
Quintapoo MCP Server (mcp-server-standalone.mjs)
    ↓
MySQL Database (TiDB)
```

---

## Available Tools

### 1. `lookup_client_by_phone`
**Purpose**: Find client information by phone number

**Input**:
```json
{
  "phone_number": "+1234567890"
}
```

**Output**:
```json
{
  "found": true,
  "client": {
    "id": "uuid",
    "name": "John Doe",
    "company": "ABC Corp",
    "payment_status": "active",
    "trial_end_date": "2026-02-01T00:00:00Z",
    "phone": "+1234567890",
    "manus_task_id": "task-123"
  }
}
```

---

### 2. `get_client_tasks`
**Purpose**: Get all tasks for a client

**Input**:
```json
{
  "client_id": "uuid"
}
```

**Output**:
```json
{
  "tasks": [
    {
      "manus_task_id": "task-123",
      "status": "in_progress",
      "created_at": "2026-01-15T10:00:00Z",
      "last_updated": "2026-01-25T14:30:00Z"
    }
  ]
}
```

---

### 3. `get_task_status`
**Purpose**: Get detailed task status

**Input**:
```json
{
  "manus_task_id": "task-123"
}
```

**Output**:
```json
{
  "task_id": "task-123",
  "status": "in_progress",
  "progress_percentage": 65,
  "current_phase": "research_complete",
  "next_phase": "writing_draft",
  "estimated_completion": "2026-01-28T00:00:00Z",
  "last_activity": "2026-01-26T09:15:00Z",
  "summary": "Research phase completed. Moving to draft writing."
}
```

---

### 4. `get_client_history`
**Purpose**: Get past interactions and briefs

**Input**:
```json
{
  "client_id": "uuid",
  "limit": 5
}
```

**Output**:
```json
{
  "interactions": [
    {
      "date": "2026-01-20T14:00:00Z",
      "type": "call",
      "summary": "Client requested blog post about AI trends",
      "key_points": ["Focus on healthcare AI", "500 words", "Due Feb 1"]
    }
  ]
}
```

---

### 5. `log_call`
**Purpose**: Record phone call in database

**Input**:
```json
{
  "client_id": "uuid",
  "phone_number": "+1234567890",
  "call_duration_seconds": 180,
  "call_purpose": "status_check",
  "summary": "Client called to check task status. Provided update on progress.",
  "action_required": false,
  "notes": "Client satisfied with progress"
}
```

**Output**:
```json
{
  "success": true,
  "call_id": "uuid"
}
```

---

### 6. `search_context`
**Purpose**: Search client history for specific information

**Input**:
```json
{
  "client_id": "uuid",
  "query": "blog post deadline"
}
```

**Output**:
```json
{
  "results": [
    {
      "relevance_score": 0.95,
      "content": "Blog post deadline is February 1st",
      "source": "brief_submission",
      "date": "2026-01-20T14:00:00Z"
    }
  ]
}
```

---

## Telnyx AI Assistant Configuration

### Step 1: Add MCP Server to Telnyx

In your Telnyx AI Assistant configuration, add the MCP server:

```json
{
  "mcpServers": {
    "quintapoo-sally": {
      "command": "node",
      "args": ["/home/ubuntu/quintapoo-memory/mcp-server-standalone.mjs"],
      "env": {
        "DATABASE_URL": "mysql://user:pass@host:port/database"
      }
    }
  }
}
```

### Step 2: Configure Sally's System Prompt

```
You are Sally, a friendly and professional customer service representative for Dopa.buzz,
an AI-powered content creation service. You help clients with task status updates,
new content briefs, and general support.

PERSONALITY:
- Warm, professional, and efficient
- Use natural conversational language
- Be proactive - reference client history when relevant
- Show empathy when there are delays or issues
- Keep responses concise but complete

MCP TOOL USAGE:
- ALWAYS invoke lookup_client_by_phone at the start of every call
- Load client history for context when client is found
- Use get_task_status whenever client asks about progress
- ALWAYS log every call before ending conversation
- Search context when you need to reference past conversations

CONVERSATION RULES:
1. Greet warmly and identify yourself
2. Look up the client immediately
3. Personalize based on their status and history
4. Listen for the call purpose (status check, new task, support)
5. Use MCP tools to provide accurate, real-time information
6. Summarize action items before closing
7. Log the call with detailed notes

ERROR HANDLING:
- If MCP tools fail, gracefully fall back to manual conversation
- Always prioritize good customer experience over technical issues
- Never mention "system errors" or "database issues" - say "let me check on that for you"
```

### Step 3: Test the Integration

Use the test client data created by `test-mcp-server.mjs`:

- **Test Phone**: +14695551234
- **Test Client**: John Doe (ABC Corp)
- **Test Task**: task-d0ea6f0f-3b26-48da-981a-4ecc8e578949

Call the Telnyx number and verify Sally can:
1. Look up the client by phone number
2. Retrieve task status (65% complete, in_progress)
3. Access client history (blog post request)
4. Log the call to the database

---

## Database Schema

The MCP server uses these tables:

### `clients`
- `id` (varchar, PK) - Client UUID
- `name` (varchar) - Client name
- `company` (varchar) - Company name
- `phone` (varchar, unique) - Phone number (E.164 format)
- `email` (varchar) - Email address
- `payment_status` (enum: active, trial, expired)
- `trial_end_date` (timestamp)
- `created_at`, `updated_at` (timestamps)

### `tasks`
- `id` (int, PK) - Auto-increment ID
- `manus_task_id` (varchar, unique) - Manus task identifier
- `client_id` (varchar, FK) - Client UUID
- `status` (enum: pending, active, in_progress, completed, cancelled)
- `progress_percentage` (int) - 0-100
- `current_phase` (varchar) - Current work phase
- `next_phase` (varchar) - Next work phase
- `estimated_completion` (timestamp)
- `last_activity` (timestamp)
- `summary` (text) - Task summary
- `created_at`, `updated_at` (timestamps)

### `call_logs`
- `id` (varchar, PK) - Call UUID
- `client_id` (varchar, FK) - Client UUID
- `phone_number` (varchar) - Caller phone number
- `call_duration_seconds` (int)
- `call_purpose` (enum: status_check, new_task, support, unknown)
- `summary` (text) - Call summary
- `action_required` (int) - 1 = true, 0 = false
- `notes` (text) - Additional notes
- `created_at` (timestamp)

### `client_history`
- `id` (int, PK) - Auto-increment ID
- `client_id` (varchar, FK) - Client UUID
- `interaction_type` (enum: call, brief_submission, email, other)
- `summary` (text) - Interaction summary
- `key_points` (text) - JSON array of key points
- `created_at` (timestamp)

---

## Running the MCP Server

### Local Testing
```bash
cd /home/ubuntu/quintapoo-memory
node mcp-server-standalone.mjs
```

### Production Deployment
The MCP server runs via stdio and is invoked by Telnyx AI Assistant. No separate deployment needed—just configure the path in Telnyx settings.

---

## Troubleshooting

### MCP Server Not Responding
- Check DATABASE_URL environment variable is set
- Verify database connection: `mysql -h <host> -u <user> -p <database>`
- Check server logs for errors

### Tools Returning Empty Results
- Verify test data exists: `node test-mcp-server.mjs`
- Check phone number format (must be E.164: +1234567890)
- Verify client_id and manus_task_id are correct UUIDs

### Sally Not Invoking Tools
- Check Telnyx AI Assistant system prompt includes MCP tool usage instructions
- Verify MCP server is configured in Telnyx settings
- Test tools manually using MCP inspector

---

## Next Steps

1. **Add Real Client Data** - Import existing clients from your CRM
2. **Integrate with Manus** - Send task updates from Manus to Quintapoo database
3. **Build Dashboard** - Create UI to view call logs and client interactions
4. **Add Analytics** - Track call volume, common issues, client satisfaction

---

## Support

For issues or questions:
- Check logs: `node mcp-server-standalone.mjs 2>&1 | tee mcp-server.log`
- Test database connection: `node test-mcp-server.mjs`
- Review Telnyx AI Assistant documentation: https://telnyx.com/docs/ai
