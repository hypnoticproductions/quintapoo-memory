# Engine Two - Complete Agent Architecture Analysis

**Date**: January 29, 2026  
**Status**: Gap Analysis & Integration Planning

---

## Architecture Overview

Engine Two is the complete orchestration system for Dopa Tech operations, managing multi-agent workflows from lead capture through payment processing.

---

## Entry Points (6 Channels)

### 1. **QR Code → Coco**
- **Purpose**: Physical marketing materials
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No QR code generation or tracking system
- **Action Required**: Create QR code generator + landing page tracker

### 2. **Website (dopa.buzz) → Sally**
- **Purpose**: Web form submissions
- **Status**: ⚠️ PARTIALLY IMPLEMENTED
- **Current**: Website exists, Sally webhook exists
- **Gap**: No form-to-Sally integration
- **Action Required**: Build web form that triggers Sally workflow

### 3. **Calls NA/EU → Telnyx**
- **Purpose**: Phone calls from North America/Europe
- **Status**: ⚠️ IN PROGRESS
- **Current**: Telnyx MCP server built, Sally script created
- **Gap**: Telnyx not configured, no phone number purchased
- **Action Required**: Purchase Dallas number, configure Telnyx AI Assistant

### 4. **Calls Africa (Multi-lang) → Gima**
- **Purpose**: Phone calls from Africa (multi-language support)
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No Gima agent, no multi-language voice system
- **Action Required**: Research African voice AI providers, build Gima agent

### 5. **Intl/Complex/Async → Manus**
- **Purpose**: Complex tasks requiring deep research/async work
- **Status**: ✅ IMPLEMENTED
- **Current**: Manus chat inbound webhook operational
- **Integration**: `/api/trpc/sally.inboundFromManus` receives task events

### 6. **WhatsApp (Voice Notes) → Coco**
- **Purpose**: WhatsApp voice note submissions
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No WhatsApp Business API integration
- **Action Required**: Set up WhatsApp Business, build Coco voice transcription agent

---

## Agents (5 Roles)

### 1. **SALLY WORKER** (Website Voice)
- **Backend**: Bolt
- **API**: OpenAI
- **LLM**: Claude
- **Role**: CLOSER
- **Function**: Writes leads to repo
- **Status**: ⚠️ PARTIALLY IMPLEMENTED
- **Current**: Webhook service exists (`server/sally.ts`), sends task.created/task.completed events
- **Gap**: No Bolt integration, Sally doesn't actually "close" leads or write to repo autonomously
- **Action Required**: Build Sally decision engine (qualify/disqualify leads), auto-create tasks in Manus

### 2. **TELNYX** (Phone NA/EU)
- **Backend**: Telnyx
- **Model**: Owen
- **LLM**: 4o
- **Role**: SCHEDULER
- **Function**: Zapier → GCal → Zoom Links
- **Status**: ⚠️ IN PROGRESS
- **Current**: MCP server built with 6 tools (lookup_client_by_phone, get_task_status, log_call, etc.)
- **Gap**: No Zapier integration, no calendar booking system, Telnyx not configured
- **Action Required**: 
  - Purchase Dallas phone number
  - Configure Telnyx AI Assistant with MCP server
  - Build Zapier → GCal → Zoom automation
  - Import real client data to MCP database

### 3. **COCO WUKR** (WhatsApp)
- **Backend**: 11Labs
- **Voice Notes**: Yes
- **Discovery Agent**: Yes
- **Role**: QUALIFIER
- **Function**: Creates PRs (Leads, Briefs, Notes, Ideas)
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No WhatsApp integration, no 11Labs voice transcription, no PR creation system
- **Action Required**:
  - Set up WhatsApp Business API
  - Integrate 11Labs voice-to-text
  - Build PR (Pull Request) creation workflow
  - Define "qualification" criteria for leads

### 4. **GIMA** (Africa Voice)
- **Backend**: Google
- **Multi-language**: Africa
- **LLM**: Gemini
- **Role**: CLOSER
- **Function**: Writes leads to repo
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No Google Voice API integration, no multi-language support, no African phone number
- **Action Required**:
  - Research African voice providers (Twilio Africa, local carriers)
  - Build Gemini-powered multi-language agent
  - Purchase African phone number (Nigeria, Ghana, Uganda)
  - Integrate with Quintapoo Memory Repo

### 5. **MANUS** (Async/Intl)
- **Backend**: Claude + GitHub
- **Orchestrator**: Yes
- **Role**: ORCHESTRATOR
- **Function**: Repo (All)
- **Status**: ✅ IMPLEMENTED
- **Current**: Inbound webhook receives task events from Manus chat
- **Integration**: `/api/trpc/sally.inboundFromManus` logs events to `webhook_logs` table
- **Gap**: No outbound task creation from Quintapoo → Manus (one-way only)
- **Action Required**: Build tRPC endpoint to create Manus tasks programmatically

---

## Core Systems

### **MANUS MEMORY REPO** (GitHub + Claude Backend)
- **Location**: `/home/ubuntu/quintapoo-memory`
- **GitHub**: https://github.com/hypnoticproductions/quintapoo-memory
- **Storage Paths**:
  - `/leads/` - Lead capture data
  - `/briefs/` - Client briefs
  - `/discovery/` - Discovery session notes
  - `/content-ideas/` - Content ideas from Coco
  - `/schedules/` - Calendar data
  - `/transcripts/` - Call transcripts
  - `/memory/` - Persistent context
- **Status**: ⚠️ PARTIALLY IMPLEMENTED
- **Current**: Database tables exist (webhook_logs, articles, processed_content, clients, tasks, call_logs, client_history)
- **Gap**: No file-based storage system for leads/briefs/transcripts
- **Action Required**: Create folder structure + file writing endpoints

### **ORCHESTRATOR** (GitHub Actions)
- **Triggers**:
  - Cron: `*/15 * * * *` (every 15 minutes)
  - PR Triggers: On new PR creation
  - Push Triggers: On push to main branch
- **Integrations**:
  - Zapier: Telnyx → GCal, Webhook Relay, Schedule Fallback
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No GitHub Actions workflows exist
- **Action Required**: Create `.github/workflows/` with orchestration logic

### **TRANSPARENCY LAYER**
- **Purpose**: Client-facing progress updates
- **Components**:
  - Progress Agent
  - Roadmap Updates
  - Status Reports
  - Client Dashboards
  - Changelog Gen
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No client dashboard, no progress tracking UI
- **Action Required**: Build client portal with real-time task status

### **SENSORS** (Augmented Notifications)
- **Psych Layer**: UVAF Profiling
- **Criminal Intel**: OSINT Collection
- **Spatial/Geo**: SafeTravel alerts
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No notification system beyond basic webhooks
- **Action Required**: Build notification engine with profiling/intel/geo layers

---

## Outputs

### **MANUS PROCESS**
- Merge PRs
- Sync Memory State
- Update Claude Ctx
- Flag Urgencies
- **Status**: ⚠️ PARTIALLY IMPLEMENTED
- **Current**: Base 44 integration processes content, stores in `processed_content` table
- **Gap**: No PR merging, no Claude context updates, no urgency flagging
- **Action Required**: Build PR review system, Claude context sync, urgency detection

### **SCHEDULING**
- Personal Number
- Zoom Links
- GCal Integration
- Calendly Backup
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No calendar integration
- **Action Required**: Build Zapier → GCal → Zoom workflow

### **SEGMENT PLUGS**
- Harvester Beta (recruitment)
- SafeTravel Signup
- WUKR Wire Intro
- Morphic Consult
- **Status**: ⚠️ PARTIALLY IMPLEMENTED
- **Current**: WUKR Wire newsletter system exists (108 contacts)
- **Gap**: No Harvester, SafeTravel, or Morphic integrations
- **Action Required**: Build segment-specific landing pages + signup flows

### **PROGRESS REPORTS**
- Weekly Rollups
- Client Updates
- Roadmap Progress
- Metric Dashboards
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No reporting system
- **Action Required**: Build automated report generation + email delivery

### **NO LEAD DROPS**
- Every Contact Gets Follow-up
- Pipeline Tracked
- Aging Alerts
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No CRM pipeline, no aging alerts
- **Action Required**: Build lead tracking system with automated follow-ups

---

## Payments

### **FIAT (Stripe)**
- Sally/Gima → Stripe Checkout
- Harvester Beta ($9.99/$49.99)
- SafeTravel Tiers ($9.99/$49.99)
- WUKR Wire ($29/$999/$2500)
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No Stripe integration
- **Action Required**: Use `webdev_add_feature` with feature="stripe"

### **CRYPTO (Circle/Coinbase)**
- Morphic Trade → USDC (Circle)
- No Forex Fees
- Caribbean ↔ Africa Corridor
- Crowdfund → Circle/Coinbase
- Community Investment Rounds
- Token-gated Access (Future)
- **Status**: ❌ NOT IMPLEMENTED
- **Gap**: No crypto payment system
- **Action Required**: Research Circle API, build USDC payment flow

---

## Critical Gaps Summary

### **HIGH PRIORITY (Blocking Revenue)**
1. ❌ **Stripe Integration** - Cannot accept payments
2. ❌ **Sally Lead Qualification Engine** - Leads not being processed
3. ❌ **Telnyx Configuration** - Phone system not operational
4. ❌ **Client Dashboard** - No transparency for paying customers
5. ❌ **Calendar Integration** - Cannot schedule calls

### **MEDIUM PRIORITY (Operational Efficiency)**
6. ❌ **GitHub Actions Orchestrator** - Manual task routing
7. ❌ **WhatsApp/Coco Integration** - Missing entry point
8. ❌ **Progress Reports** - No automated client updates
9. ❌ **Lead Tracking System** - Leads can drop
10. ❌ **File Storage System** - No persistent lead/brief storage

### **LOW PRIORITY (Future Scale)**
11. ❌ **Gima (Africa Voice)** - Africa market not served
12. ❌ **QR Code System** - Physical marketing not tracked
13. ❌ **Crypto Payments** - Alternative payment method
14. ❌ **Sensors/UVAF Profiling** - Advanced intelligence
15. ❌ **Segment Plugs** - Product-specific funnels

---

## Existing Integrations (Working)

### ✅ **Base 44 Integration**
- **Inbound**: `/api/trpc/base44.ingest` receives processed content
- **Outbound**: Daily 6 AM dispatch sends articles to Base 44
- **Database**: `articles`, `processed_content`, `webhook_logs` tables
- **Tests**: 7/7 passing

### ✅ **Sally Webhook (Outbound)**
- **Endpoint**: Sends task.created/task.completed to Sally Hub
- **Authentication**: HMAC-SHA256 signature
- **Retry Logic**: Exponential backoff (1s, 2s, 4s, 8s)
- **Tests**: 6/6 passing

### ✅ **Manus Chat Webhook (Inbound)**
- **Endpoint**: `/api/trpc/sally.inboundFromManus`
- **Authentication**: `X-Manus-Signature: contancybearsfruit`
- **Function**: Receives task events from Manus chat instance
- **Tests**: 6/6 passing

### ✅ **Telnyx MCP Server**
- **Endpoint**: `/api/mcp/invoke` (HTTP SSE)
- **Authentication**: `quintapoo: contancybearsfruit`
- **Tools**: 6 (lookup_client_by_phone, get_task_status, log_call, etc.)
- **Status**: Built, not configured in Telnyx yet

### ✅ **Wukr Wire Newsletter**
- **Database**: 108 business contacts (Phase 1 + Phase 2)
- **Delivery**: Custom emailer app (https://emailer-c8wa-2lsi656m9-hypnotic-productions-projects.vercel.app/)
- **Content**: `/newsletters/` folder in GitHub

---

## Implementation Roadmap

### **Phase 1: Revenue Foundation (Week 1-2)**
- [ ] Add Stripe integration (`webdev_add_feature` stripe)
- [ ] Purchase Dallas phone number for Telnyx
- [ ] Configure Telnyx AI Assistant with MCP server
- [ ] Build Sally lead qualification engine
- [ ] Create basic client dashboard

### **Phase 2: Operational Automation (Week 3-4)**
- [ ] Build Zapier → GCal → Zoom workflow
- [ ] Create GitHub Actions orchestrator
- [ ] Implement file storage system (leads/briefs/transcripts)
- [ ] Build lead tracking + aging alerts
- [ ] Add automated progress reports

### **Phase 3: Scale & Expansion (Month 2)**
- [ ] WhatsApp Business API + Coco agent
- [ ] QR code generation + tracking
- [ ] Gima (Africa voice) research + build
- [ ] Crypto payment integration (Circle USDC)
- [ ] Advanced sensors (UVAF, OSINT, geo)

---

## Database Schema Additions Required

### **New Tables Needed**

```sql
-- Leads table
CREATE TABLE leads (
  id VARCHAR(36) PRIMARY KEY,
  source ENUM('qr_code', 'website', 'phone', 'whatsapp', 'referral'),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  status ENUM('new', 'qualified', 'disqualified', 'converted'),
  assigned_agent ENUM('sally', 'telnyx', 'coco', 'gima', 'manus'),
  qualification_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_contact TIMESTAMP,
  converted_at TIMESTAMP
);

-- Briefs table
CREATE TABLE briefs (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(36),
  lead_id VARCHAR(36),
  brief_type ENUM('content', 'strategy', 'research', 'video', 'other'),
  content TEXT,
  status ENUM('submitted', 'in_review', 'approved', 'in_progress', 'completed'),
  submitted_by ENUM('sally', 'telnyx', 'coco', 'gima', 'client'),
  file_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Payments table
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(36),
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  payment_method ENUM('stripe', 'crypto'),
  stripe_payment_id VARCHAR(255),
  crypto_tx_hash VARCHAR(255),
  product ENUM('harvester_beta', 'safetravel', 'wukr_wire', 'morphic_consult', 'custom'),
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Schedules table
CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  client_id VARCHAR(36),
  meeting_type ENUM('discovery', 'status_update', 'strategy', 'support'),
  scheduled_time TIMESTAMP,
  zoom_link VARCHAR(500),
  gcal_event_id VARCHAR(255),
  status ENUM('scheduled', 'completed', 'cancelled', 'no_show'),
  created_by ENUM('telnyx', 'sally', 'manual'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Progress_reports table
CREATE TABLE progress_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(36),
  report_type ENUM('weekly', 'milestone', 'completion'),
  content TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

---

## File Storage Structure

```
/home/ubuntu/quintapoo-memory/
├── leads/
│   ├── 2026-01/
│   │   ├── lead-uuid-1.json
│   │   └── lead-uuid-2.json
├── briefs/
│   ├── client-uuid/
│   │   ├── brief-uuid-1.md
│   │   └── brief-uuid-2.md
├── discovery/
│   ├── client-uuid/
│   │   └── discovery-session-2026-01-29.md
├── content-ideas/
│   ├── idea-uuid-1.md
│   └── idea-uuid-2.md
├── schedules/
│   ├── 2026-01/
│   │   └── meetings.json
├── transcripts/
│   ├── call-uuid-1.txt
│   └── call-uuid-2.txt
├── memory/
│   ├── client-context/
│   │   └── client-uuid.json
│   └── system-state.json
```

---

## Next Actions

1. **Immediate**: Add Stripe integration to enable payments
2. **Today**: Purchase Dallas phone number, configure Telnyx
3. **This Week**: Build Sally lead qualification engine
4. **This Week**: Create client dashboard for transparency
5. **Next Week**: Implement calendar integration (Zapier → GCal → Zoom)

---

**Status**: Architecture analysis complete. Ready for implementation.
