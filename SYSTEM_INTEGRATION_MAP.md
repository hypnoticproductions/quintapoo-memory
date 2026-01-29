# Quintapoo Memory Repository - System Integration Map

**Last Updated**: January 29, 2026  
**Version**: 1.0.4

---

## System Architecture

Quintapoo Memory Repository serves as the central nervous system for Engine Two, coordinating multi-agent workflows, storing persistent context, and managing client data across all entry points.

---

## Current Integrations

### Base 44 Engine (Bidirectional)

**Purpose**: Content enrichment and processing

**Inbound Flow**:
```
Base 44 processes article
    ↓
POST to /api/trpc/base44.ingest
    ↓
Validate payload schema
    ↓
Save to processed_content table
    ↓
Display in dashboard
```

**Outbound Flow**:
```
Article created in dashboard
    ↓
Stored in articles table
    ↓
Daily 6 AM automation OR manual send
    ↓
POST to Base 44 webhook
    ↓
Mark as sent in database
```

**Database Tables**: `articles`, `processed_content`, `webhook_logs`  
**Status**: ✅ Operational (7/7 tests passing)  
**Cron**: Daily 6 AM AST dispatch

---

### Sally Hub (Outbound)

**Purpose**: Task event notifications to Sally system

**Flow**:
```
Task created/completed in Quintapoo
    ↓
Generate HMAC-SHA256 signature
    ↓
POST to Sally Hub webhook
    ↓
Retry with exponential backoff (1s, 2s, 4s, 8s)
    ↓
Log to webhook_logs table
```

**Authentication**: HMAC-SHA256 with `SALLY_WEBHOOK_SECRET`  
**Endpoints**: `sally.sendTaskCreated`, `sally.sendTaskCompleted`  
**Status**: ✅ Operational (6/6 tests passing)  
**Retry Logic**: Exponential backoff, 10s timeout

---

### Manus Chat (Inbound)

**Purpose**: Receive task events from Manus chat instance

**Flow**:
```
Manus chat completes work
    ↓
POST to /api/trpc/sally.inboundFromManus
    ↓
Validate X-Manus-Signature header
    ↓
Log event to webhook_logs (source: manus_chat)
    ↓
Trigger downstream actions (future)
```

**Authentication**: `X-Manus-Signature: contancybearsfruit`  
**Events**: `task.created`, `task.completed`  
**Status**: ✅ Operational (6/6 tests passing)

---

### Telnyx AI Assistant (MCP Server)

**Purpose**: Phone call client lookup and task management

**Architecture**:
```
Telnyx AI Assistant (Sally voice)
    ↓
MCP Protocol (HTTP SSE)
    ↓
/api/mcp/invoke endpoint
    ↓
MySQL Database (clients, tasks, call_logs)
```

**Authentication**: `quintapoo: contancybearsfruit`  
**Tools Available** (6):
1. `lookup_client_by_phone` - Find client by phone number
2. `get_client_tasks` - Get all tasks for client
3. `get_task_status` - Get detailed task progress
4. `get_client_history` - Get past interactions
5. `log_call` - Record call in database
6. `search_context` - Search client history

**Database Tables**: `clients`, `tasks`, `call_logs`, `client_history`  
**Status**: ⚠️ Built, not configured in Telnyx yet  
**Test Client**: +14695551234 (John Doe, ABC Corp)

---

### Custom Emailer App (External)

**Purpose**: Newsletter distribution to business network

**Integration**:
```
Content created in /newsletters/ folder
    ↓
Committed to GitHub
    ↓
Custom emailer app pulls from GitHub
    ↓
Sends to 108 business contacts
```

**App URL**: https://emailer-c8wa-2lsi656m9-hypnotic-productions-projects.vercel.app/  
**Database**: `WUKR_WIRE_MASTER_NETWORK.csv` (108 contacts)  
**Content Folders**: `/newsletters/`, `/proposals/`  
**Status**: ✅ Operational

---

## Pending Integrations (From Engine Two Diagram)

### QR Code System
**Entry Point**: Physical marketing → Coco  
**Status**: ❌ Not implemented  
**Required**:
- QR code generator endpoint
- Landing page with tracking
- Coco agent integration

### Website Form → Sally
**Entry Point**: dopa.buzz web forms  
**Status**: ⚠️ Website exists, no form integration  
**Required**:
- Contact form on dopa.buzz
- Form submission → Sally webhook
- Lead qualification logic

### WhatsApp Business → Coco
**Entry Point**: WhatsApp voice notes  
**Status**: ❌ Not implemented  
**Required**:
- WhatsApp Business API setup
- 11Labs voice transcription
- Coco agent (QUALIFIER role)
- PR creation system (leads, briefs, notes, ideas)

### Gima (Africa Voice)
**Entry Point**: Phone calls from Africa (multi-language)  
**Status**: ❌ Not implemented  
**Required**:
- African phone number (Nigeria/Ghana/Uganda)
- Google Voice API integration
- Gemini multi-language agent
- Lead writing to repo

### GitHub Actions Orchestrator
**Purpose**: Automated workflow routing  
**Status**: ❌ Not implemented  
**Required**:
- `.github/workflows/orchestrator.yml`
- Cron trigger (every 15 minutes)
- PR trigger (on new lead/brief)
- Push trigger (on main branch updates)
- Zapier integrations (Telnyx → GCal, webhook relay)

### Zapier → GCal → Zoom
**Purpose**: Automated meeting scheduling  
**Status**: ❌ Not implemented  
**Required**:
- Zapier account + workflows
- Google Calendar API integration
- Zoom API integration
- Fallback to Calendly

### Stripe Payment System
**Purpose**: Accept fiat payments  
**Status**: ❌ Not implemented  
**Required**:
- `webdev_add_feature` with feature="stripe"
- Product setup (Harvester Beta, SafeTravel, WUKR Wire)
- Checkout flows
- Payment webhook handling

### Circle/Coinbase Crypto
**Purpose**: Accept USDC payments (Caribbean ↔ Africa corridor)  
**Status**: ❌ Not implemented  
**Required**:
- Circle API integration
- USDC payment flow
- Morphic Trade product setup
- Token-gated access (future)

### Client Dashboard (Transparency Layer)
**Purpose**: Real-time progress updates for clients  
**Status**: ❌ Not implemented  
**Required**:
- Client portal UI
- Task progress tracking
- Roadmap visualization
- Status reports
- Changelog generation

### Sensors (Augmented Notifications)
**Purpose**: Advanced intelligence layers  
**Status**: ❌ Not implemented  
**Components**:
- Psych Layer (UVAF profiling)
- Criminal Intel (OSINT collection)
- Spatial/Geo (SafeTravel alerts)

---

## Database Schema

### Existing Tables

**users** - Manus OAuth authentication  
**webhook_logs** - All webhook events (Base 44, Sally, Manus)  
**articles** - Outbound article queue for Base 44  
**processed_content** - Base 44 enriched content  
**clients** - Client database for Telnyx MCP  
**tasks** - Task tracking for Telnyx MCP  
**call_logs** - Phone call records  
**client_history** - Past interactions and briefs

### Required Tables (Not Yet Created)

**leads** - Lead capture from all entry points  
**briefs** - Client brief submissions  
**payments** - Stripe + crypto payment records  
**schedules** - Calendar events (GCal, Zoom)  
**progress_reports** - Automated client updates

---

## File Storage Structure (Required)

```
/home/ubuntu/quintapoo-memory/
├── leads/              # Lead capture data (by month)
├── briefs/             # Client briefs (by client_id)
├── discovery/          # Discovery session notes
├── content-ideas/      # Content ideas from Coco
├── schedules/          # Calendar data
├── transcripts/        # Call transcripts
├── memory/             # Persistent context
├── newsletters/        # ✅ Exists - Wukr Wire content
└── proposals/          # ✅ Exists - Partnership proposals
```

---

## API Endpoints

### Existing (Operational)

**Base 44**:
- `POST /api/trpc/base44.ingest` - Receive processed content
- `POST /api/trpc/base44.send` - Send article to Base 44

**Sally**:
- `POST /api/trpc/sally.sendTaskCreated` - Send task.created event
- `POST /api/trpc/sally.sendTaskCompleted` - Send task.completed event
- `GET /api/trpc/sally.getLogs` - Query Sally webhook logs

**Manus**:
- `POST /api/trpc/sally.inboundFromManus` - Receive task events

**MCP Server**:
- `POST /api/mcp/invoke` - MCP tool invocation (HTTP SSE)
- `GET /api/mcp/sse` - MCP SSE connection
- `GET /api/mcp/tools` - List available tools

### Required (Not Yet Built)

**Leads**:
- `POST /api/trpc/leads.create` - Create new lead
- `GET /api/trpc/leads.list` - List all leads
- `POST /api/trpc/leads.qualify` - Qualify/disqualify lead
- `GET /api/trpc/leads.getAging` - Get aging leads needing follow-up

**Briefs**:
- `POST /api/trpc/briefs.submit` - Submit client brief
- `GET /api/trpc/briefs.list` - List briefs by client
- `POST /api/trpc/briefs.approve` - Approve brief

**Payments**:
- `POST /api/trpc/payments.createCheckout` - Create Stripe checkout
- `POST /api/trpc/payments.webhook` - Handle Stripe webhook
- `POST /api/trpc/payments.createCryptoPayment` - Create USDC payment

**Scheduling**:
- `POST /api/trpc/schedules.create` - Create meeting
- `GET /api/trpc/schedules.list` - List upcoming meetings
- `POST /api/trpc/schedules.cancel` - Cancel meeting

**Progress**:
- `POST /api/trpc/progress.generateReport` - Generate progress report
- `POST /api/trpc/progress.sendToClient` - Email report to client

---

## Authentication & Security

### Webhook Authentication

**Sally Hub (Outbound)**: HMAC-SHA256 signature with `SALLY_WEBHOOK_SECRET`  
**Manus Chat (Inbound)**: Header `X-Manus-Signature: contancybearsfruit`  
**Telnyx MCP (Inbound)**: Header `quintapoo: contancybearsfruit`  
**Base 44 (Inbound)**: No authentication (public endpoint)

### User Authentication

**Method**: Manus OAuth  
**Session**: JWT cookie  
**Endpoints**: `/api/oauth/callback`, `trpc.auth.me`, `trpc.auth.logout`

---

## Environment Variables

### Existing

```
DATABASE_URL - MySQL/TiDB connection
JWT_SECRET - Session signing
VITE_APP_ID - Manus OAuth app ID
OAUTH_SERVER_URL - Manus OAuth backend
SALLY_WEBHOOK_URL - Sally Hub endpoint
SALLY_WEBHOOK_SECRET - HMAC secret
SALLY_WEBHOOK_ENABLED - Enable/disable Sally webhooks
```

### Required (Not Yet Set)

```
STRIPE_SECRET_KEY - Stripe API key
STRIPE_WEBHOOK_SECRET - Stripe webhook signing
CIRCLE_API_KEY - Circle USDC API key
WHATSAPP_API_KEY - WhatsApp Business API
TELNYX_API_KEY - Telnyx API key
TELNYX_PHONE_NUMBER - Dallas phone number
GOOGLE_CALENDAR_API_KEY - GCal integration
ZOOM_API_KEY - Zoom meeting generation
ZAPIER_WEBHOOK_URL - Zapier trigger endpoint
```

---

## Testing Coverage

### Current Test Suites

**Base 44**: 7/7 tests passing  
**Sally Webhooks**: 6/6 tests passing  
**Manus Inbound**: 6/6 tests passing  
**MCP Server**: Manual testing only (no automated tests)

### Required Test Coverage

- Lead qualification logic
- Payment processing (Stripe + crypto)
- Calendar scheduling workflows
- Client dashboard data access
- File storage read/write operations

---

## Deployment Architecture

**Platform**: Manus hosting (Full Stack)  
**Live URL**: https://3000-i6xyylpsiofyh4vmefvks-1bb073c2.us2.manus.computer  
**GitHub**: https://github.com/hypnoticproductions/quintapoo-memory  
**Branch**: main (auto-sync on checkpoint)  
**Database**: MySQL (TiDB) via Manus  
**Storage**: S3 (via Manus built-in helpers)

---

## Monitoring & Observability

### Current

- Dashboard shows system status
- Base 44 article queue monitoring
- Recent processed content display
- Webhook logs table

### Required

- Lead pipeline metrics
- Payment transaction logs
- Call volume analytics
- Client satisfaction tracking
- System health monitoring
- Error alerting

---

## Next Integration Priorities

**Week 1** (Revenue Foundation):
1. Add Stripe integration
2. Configure Telnyx AI Assistant
3. Build Sally lead qualification engine
4. Create client dashboard

**Week 2** (Operational Automation):
5. Implement calendar integration (Zapier → GCal → Zoom)
6. Build lead tracking + aging alerts
7. Create file storage system
8. Add automated progress reports

**Month 2** (Scale & Expansion):
9. WhatsApp Business + Coco agent
10. QR code system
11. Gima (Africa voice)
12. Crypto payments (Circle USDC)

---

**Status**: Integration map complete. Ready for implementation.
