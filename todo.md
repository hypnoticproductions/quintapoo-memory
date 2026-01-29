# Project TODO

## Base 44 Integration
- [x] Upgrade to Full Stack architecture (web-db-user)
- [x] Create webhook_logs database table
- [x] Implement Base 44 inbound endpoint
- [x] Update inbound webhook schema to match Base 44 output format
- [x] Create database tables for article tracking and processed content
- [x] Build outbound webhook function (Manus → Base 44)
- [x] Add manual "Send to Base 44" button on dashboard
- [x] Create webhook monitoring panel on dashboard
- [x] Implement daily automation schedule for article dispatch (6 AM AST daily)
- [x] Test complete bidirectional flow (7/7 tests passing)
- [x] Save checkpoint after integration complete (v df110c33)

## Wednesday Protocol (COMPLETE)
- [x] Execute Wukr Wire intelligence scrape (YouTube, Twitter, news)
- [x] Identify top 5 signals
- [x] Log signals to Operational Hub
- [x] Generate new article from signals
- [x] Send new article to Base 44
- [x] Syndicate to LinkedIn (manual)
- [x] Syndicate to Twitter (manual)
- [x] Syndicate to Substack (manual)
- [ ] Syndicate to Reddit (4 subreddits) - PENDING
- [ ] Syndicate to Medium - PENDING

## System Improvements
- [x] Create session initialization script with date/time verification
- [x] Add date/time display to dashboard header
- [ ] Build content freshness tracker in database
- [ ] Add "Daily Protocol Checklist" widget to dashboard

## Network Building - PHASE 1 (Tech/Fintech - COMPLETE)
- [x] Research target businesses in Kampala (tech, fintech, clean energy) - 21 companies identified
- [x] Research target businesses in Accra (startups, recent funding recipients) - 11 companies identified
- [x] Research target businesses in Barbados (digital nomad, citizenship, tech) - 17 companies/entities identified
- [x] Extract contact information (emails, LinkedIn, Twitter) - 49 companies processed
- [ ] Import contacts to Google Sheets Operational Hub CRM

## Network Building - PHASE 2 (High-Value Sectors - EXECUTING NOW)
### Target Sectors:
- [ ] Fashion & Textiles (Kampala, Accra, Barbados, Jamaica, Trinidad)
- [ ] Modeling Agencies (Caribbean-wide)
- [ ] Music Industry (Labels, Studios, Artists, Producers)
- [ ] Agriculture Export (Coffee, Cocoa, Spices, Tropical Fruits)
- [ ] Tourism (Hotels, Tour Operators, Experience Providers)
- [ ] Alcohols, Wines, Beverages (Rum distilleries, Craft breweries)
- [ ] Naturopathic Health Supplies (Natural remedies, Supplements)
- [ ] Hair Care (Natural products, Salons, Product lines)

### Research Progress:
- [x] Fashion: Meiling, Claudia Pegus/The Cloth, Beewear, Beautiful Mode, Caribbean Fashion Week
- [x] Modeling: Hi Esteem Agency, Manikin Models, CB Agency, Untouchable Talent, RAW Management
- [x] Music: VP Records (world's largest reggae label)
- [x] Complete agriculture, tourism, beverages, health/hair care research (33 Caribbean businesses identified)
- [x] Research Ghana high-value sectors (fashion, modeling, music, agri, tourism, beverages, health/hair) - 30 businesses identified
- [x] Research Uganda high-value sectors (fashion, modeling, music, agri, tourism, beverages, health/hair) - 25 businesses identified
- [x] Extract contact information for all Phase 2 targets (57 businesses)
- [x] Generate comprehensive CSV (Phase 1 + Phase 2) - 108 total businesses
- [x] Build evening network monitoring system (NetworkMonitor component added to dashboard)

## Daily Social Media Monitoring System
### Infrastructure (TO BUILD):
- [ ] Twitter monitoring script (track mentions, hashtags, engagement)
- [ ] LinkedIn monitoring script (track company posts, engagement)
- [ ] Instagram monitoring script (track fashion, tourism, beverage brands)
- [ ] Create daily monitoring dashboard (engagement metrics, trending posts)

### KPIs (Key Performance Indicators):
- [ ] Define engagement rate target (comments, likes, shares per post)
- [ ] Define response rate target (% of outreach that gets replies)
- [ ] Define conversion rate target (social media → newsletter subscribers)
- [ ] Define partnership conversion target (social media → business deals)

### Automation Workflow:
- [ ] Build automated comment drop system (engage with target posts daily)
- [ ] Build automated DM sequence (personalized outreach to decision-makers)
- [ ] Build automated LinkedIn connection requests (with personalized notes)
- [ ] Schedule daily engagement tasks (morning: Twitter, afternoon: LinkedIn, evening: Instagram)

### Daily Monitoring Schedule:
- [ ] 8 AM AST: Scan Twitter for Caribbean business activity
- [ ] 12 PM AST: Scan LinkedIn for company updates
- [ ] 4 PM AST: Scan Instagram for fashion/tourism/beverage posts
- [ ] 6 PM AST: Generate daily engagement report (who we engaged with, responses received)

## Newsletter Growth Strategy
- [ ] Create sector-specific newsletter segments (Fashion, Music, Agri, Tourism, Beverages, Health)
- [ ] Build email capture forms for each sector
- [ ] Add newsletter signup CTAs to all social media profiles
- [ ] Track newsletter growth rate (daily, weekly, monthly)
- [ ] Send Wukr Wire newsletter to Phase 1 contacts (49 businesses)

## Partnership Pipeline
- [ ] Create partnership tracking system (prospects, in-negotiation, closed deals)
- [ ] Define partnership types (content collaboration, co-marketing, revenue share)
- [ ] Build automated follow-up sequences for partnership prospects
- [ ] Track partnership conversion rate (outreach → meetings → deals)

## Next Session Priorities
1. Complete high-value sector research (fashion, music, agri, tourism, beverages, health, hair care)
2. Extract contact information for all Phase 2 targets
3. Build daily social media monitoring system with KPI dashboard
4. Launch automated engagement workflow
5. Send Wukr Wire newsletter to Phase 1 + Phase 2 contacts
6. Monitor Base 44 for processed content responses

## SUBSTACK COLLABORATION RESEARCH (WEDNESDAY JAN 21)
- [x] Research Natia Kurdadze - find Substack, LinkedIn, Twitter, email
- [x] Identify 10-15 similar Substack growth strategists/content creators
- [x] Draft collaboration pitch tailored to Substack growth strategists
- [x] Create outreach list with contact information
- [ ] Add to CRM in Operational Hub
- [ ] Complete warm-up phase (follow, engage, share) for Top 5 targets
- [ ] Send initial outreach emails to Top 5 (Natia, Sean, Mario, Lenny, Noah)

## EMAILER APP INTEGRATION (WEDNESDAY JAN 21)
- [ ] Create `/newsletters` folder for Wukr Wire and other newsletter content
- [ ] Create `/proposals` folder for business proposals and promotional documents
- [ ] Create sample newsletter template (Markdown)
- [ ] Create sample proposal template (Markdown)
- [ ] Commit to GitHub and provide repository URLs for app developer
- [ ] Document emailer workflow (segmentation, targeting, bulk send)

## SALLY WEBHOOK INTEGRATION (FRIDAY JAN 23)
- [x] Add Sally environment variables (SALLY_WEBHOOK_URL, SALLY_WEBHOOK_SECRET, SALLY_WEBHOOK_ENABLED)
- [x] Create webhook service (server/sally.ts) with HMAC-SHA256 signature
- [x] Implement retry logic (exponential backoff: 1s, 2s, 4s, 8s)
- [x] Add sally_client_id column to articles table
- [x] Update webhookLogs schema for Sally support
- [x] Create tRPC endpoints sally.sendTaskCreated and sally.sendTaskCompleted
- [x] Test HMAC signature generation
- [x] Test webhook delivery with sample payloads (6/6 tests passing)
- [x] Test retry logic
- [x] Run pnpm test (all tests passing)
- [x] Save checkpoint (version a48ce20a)

## MANUS CHAT INBOUND WEBHOOK (FRIDAY JAN 23)
- [x] Create inbound endpoint `/api/trpc/sally.inboundFromManus`
- [x] Validate `X-Manus-Signature: contancybearsfruit` header
- [x] Parse task.created and task.completed payloads
- [x] Log inbound webhooks to database (source: manus_chat)
- [x] Create test for inbound webhook validation (6/6 tests passing)
- [x] Test with sample payloads
- [x] Save checkpoint (version 578c89a3)
- [ ] Provide webhook URL to user for Manus chat configuration

## FRIDAY NEWSLETTER (JAN 23, 2026)
- [x] Gather latest intelligence signals from this week (5 signals)
- [x] Review article content and key insights (Caribbean citizenship article, ARM 0.91)
- [x] Write Wukr Wire Friday newsletter (weekly recap format, 1,247 words)
- [x] Save to /newsletters folder
- [ ] Distribute to contact list (108 businesses)

## MONDAY INTELLIGENCE GATHERING (JAN 26, 2026)
- [x] Search Caribbean business news (past 48 hours)
- [x] Search African business news (Uganda, Ghana focus)
- [x] Search trade/infrastructure signals
- [x] Search startup funding announcements
- [x] Search policy/regulatory changes
- [x] Identify top 5 signals with highest trade relevance
- [x] Generate new article (1,500 words, ARM 0.88 prediction)
- [x] Save intelligence report and article
- [ ] Send article to Base 44

## BASE 44 RETRY + MONDAY NEWSLETTER (JAN 26)
- [ ] Retry sending article to Base 44 (endpoint timeout - pending)
- [x] Create Monday newsletter from today's article
- [x] Save newsletter to /newsletters folder
- [x] Commit to GitHub (checkpoint 42cbcf91)
- [ ] Distribute newsletter to contact list (108 businesses)

## MCP SERVER FOR SALLY/TELNYX INTEGRATION (JAN 26)
- [x] Create database schema (clients, tasks, call_logs, client_history tables)
- [x] Build MCP server with 6 tools:
  - [x] lookup_client_by_phone
  - [x] get_client_tasks
  - [x] get_task_status
  - [x] get_client_history
  - [x] log_call
  - [x] search_context
- [x] Test MCP server with sample data (test client created: +14695551234)
- [x] Create integration documentation for Telnyx AI Assistant
- [x] MCP server ready at /home/ubuntu/quintapoo-memory/mcp-server-standalone.mjs
- [ ] Save checkpoint

## MCP SERVER HTTP SSE ENDPOINT (JAN 27)
- [x] Convert MCP server from stdio to HTTP SSE endpoint
- [x] Add authentication middleware (validate QUINTAPOO_MCP_SECRET header)
- [x] Implement SSE streaming for tool responses
- [x] Create /api/mcp/sse endpoint in Express
- [x] Test SSE connection with curl (tools endpoint working)
- [x] Verify all 6 tools work via HTTP SSE (lookup_client_by_phone tested successfully)
- [ ] Save checkpoint
- [ ] Provide Telnyx configuration values

## ENGINE TWO ARCHITECTURE INTEGRATION (JAN 29, 2026)
- [x] Analyze Engine Two complete architecture diagram
- [x] Identify integration gaps (15 critical gaps found)
- [x] Document system architecture analysis (ENGINE_TWO_ARCHITECTURE_ANALYSIS.md)
- [x] Create system integration map (SYSTEM_INTEGRATION_MAP.md)
- [ ] Save checkpoint

### PHASE 1: REVENUE FOUNDATION (Week 1-2)
#### Stripe Payment Integration
- [ ] Run webdev_add_feature with feature="stripe"
- [ ] Configure Stripe products:
  - [ ] Harvester Beta ($9.99/$49.99)
  - [ ] SafeTravel Tiers ($9.99/$49.99)
  - [ ] WUKR Wire ($29/$999/$2500)
- [ ] Build checkout flows for each product
- [ ] Create payments table in database
- [ ] Implement Stripe webhook handler
- [ ] Test payment processing end-to-end

#### Telnyx Phone System
- [ ] Purchase Dallas phone number (+1-214-XXX-XXXX recommended)
- [ ] Configure Telnyx AI Assistant with MCP server:
  - [ ] Name: quintapoo-sally-mcp
  - [ ] Type: SSE
  - [ ] URL: https://3000-i6xyylpsiofyh4vmefvks-1bb073c2.us2.manus.computer/api/mcp/invoke
  - [ ] Auth header: quintapoo: contancybearsfruit
- [ ] Add Sally voice agent system prompt to Telnyx
- [ ] Test phone call with test client (+14695551234)
- [ ] Import real client data to MCP database

#### Sally Lead Qualification Engine
- [ ] Create leads table in database
- [ ] Build lead qualification scoring logic (0-100 scale)
- [ ] Create tRPC endpoints:
  - [ ] leads.create
  - [ ] leads.qualify
  - [ ] leads.list
  - [ ] leads.getAging
- [ ] Build Sally decision engine (auto-qualify/disqualify)
- [ ] Implement auto-task creation in Manus for qualified leads
- [ ] Test qualification workflow end-to-end

#### Client Dashboard (Transparency Layer)
- [ ] Create client portal UI (new route: /client-portal)
- [ ] Build task progress tracking component
- [ ] Add roadmap visualization
- [ ] Implement real-time status updates
- [ ] Create changelog generation system
- [ ] Add client authentication (separate from admin)
- [ ] Test dashboard with sample client data

### PHASE 2: OPERATIONAL AUTOMATION (Week 3-4)
#### Calendar Integration
- [ ] Set up Zapier account
- [ ] Create Zapier workflows:
  - [ ] Telnyx → GCal event creation
  - [ ] GCal → Zoom link generation
  - [ ] Webhook relay for schedule confirmations
- [ ] Create schedules table in database
- [ ] Build tRPC endpoints:
  - [ ] schedules.create
  - [ ] schedules.list
  - [ ] schedules.cancel
- [ ] Add Calendly as fallback option
- [ ] Test meeting scheduling flow

#### GitHub Actions Orchestrator
- [ ] Create .github/workflows/orchestrator.yml
- [ ] Add cron trigger (every 15 minutes)
- [ ] Add PR trigger (on new lead/brief creation)
- [ ] Add push trigger (on main branch updates)
- [ ] Integrate Zapier webhooks
- [ ] Test automated workflow routing

#### File Storage System
- [ ] Create folder structure:
  - [ ] /leads/ (by month)
  - [ ] /briefs/ (by client_id)
  - [ ] /discovery/ (session notes)
  - [ ] /content-ideas/ (Coco submissions)
  - [ ] /schedules/ (calendar data)
  - [ ] /transcripts/ (call recordings)
  - [ ] /memory/ (persistent context)
- [ ] Build file writing endpoints (tRPC)
- [ ] Implement S3 storage for large files
- [ ] Test file read/write operations

#### Lead Tracking System
- [ ] Build lead pipeline visualization
- [ ] Implement aging alerts (leads >7 days without contact)
- [ ] Create automated follow-up sequences
- [ ] Add lead conversion tracking
- [ ] Build lead analytics dashboard

#### Progress Reports
- [ ] Create progress_reports table
- [ ] Build report generation logic (weekly, milestone, completion)
- [ ] Implement automated email delivery
- [ ] Add report templates (Markdown)
- [ ] Test report generation + delivery

### PHASE 3: SCALE & EXPANSION (Month 2)
#### WhatsApp Business + Coco Agent
- [ ] Set up WhatsApp Business API account
- [ ] Integrate 11Labs voice transcription
- [ ] Build Coco agent (QUALIFIER role)
- [ ] Create PR creation system (leads, briefs, notes, ideas)
- [ ] Test WhatsApp voice note → lead flow

#### QR Code System
- [ ] Build QR code generator endpoint
- [ ] Create landing page with tracking
- [ ] Integrate with Coco agent
- [ ] Test QR code → lead capture flow

#### Gima (Africa Voice Agent)
- [ ] Research African voice providers (Twilio Africa, local carriers)
- [ ] Purchase African phone number (Nigeria/Ghana/Uganda)
- [ ] Build Gemini-powered multi-language agent
- [ ] Integrate with Quintapoo Memory Repo
- [ ] Test multi-language call handling

#### Crypto Payments (Circle USDC)
- [ ] Research Circle API documentation
- [ ] Set up Circle account
- [ ] Build USDC payment flow
- [ ] Create Morphic Trade product setup
- [ ] Implement Caribbean ↔ Africa payment corridor
- [ ] Test crypto payment end-to-end

#### Advanced Sensors
- [ ] Build UVAF profiling system (Psych Layer)
- [ ] Integrate OSINT collection (Criminal Intel)
- [ ] Add SafeTravel geo alerts (Spatial/Geo)
- [ ] Create notification engine for all sensor layers

### SEGMENT PLUGS (Product-Specific Funnels)
- [ ] Harvester Beta landing page + signup flow
- [ ] SafeTravel landing page + signup flow
- [ ] WUKR Wire landing page (already exists, needs signup form)
- [ ] Morphic Consult landing page + booking flow

### DATABASE SCHEMA ADDITIONS
- [ ] Run pnpm db:push after adding new tables:
  - [ ] leads
  - [ ] briefs
  - [ ] payments
  - [ ] schedules
  - [ ] progress_reports

### ENVIRONMENT VARIABLES TO ADD
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] CIRCLE_API_KEY
- [ ] WHATSAPP_API_KEY
- [ ] TELNYX_API_KEY
- [ ] TELNYX_PHONE_NUMBER
- [ ] GOOGLE_CALENDAR_API_KEY
- [ ] ZOOM_API_KEY
- [ ] ZAPIER_WEBHOOK_URL

### TESTING REQUIREMENTS
- [ ] Write tests for lead qualification logic
- [ ] Write tests for payment processing (Stripe + crypto)
- [ ] Write tests for calendar scheduling workflows
- [ ] Write tests for client dashboard data access
- [ ] Write tests for file storage operations

## IMMEDIATE NEXT ACTIONS (TODAY)
1. [ ] Save checkpoint for Engine Two analysis
2. [ ] Purchase Dallas phone number for Telnyx
3. [ ] Configure Telnyx AI Assistant with MCP server
4. [ ] Test phone call with Sally voice agent
5. [ ] Add Stripe integration (webdev_add_feature)
