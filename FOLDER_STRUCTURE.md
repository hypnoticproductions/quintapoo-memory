# Engine Two Folder Structure

## Overview
This repository serves as the central memory store for Engine Two's multi-agent orchestration system.

## Directory Structure

### `/leads/`
Lead intake files from all agents. Format: `YYYY-MM-DD-[name]-intake.md`

**Sources:**
- Sally (Website voice closer)
- Gima (Africa voice closer)
- Coco (WhatsApp qualifier)

### `/notes/`
Field notes and internal memos. Format: `YYYY-MM-DD-HHmm-[source]-note.md`

**Sources:**
- Multibot (Internal/field capture)
- Manual entries

### `/tasks/`
Action items and task tracking. Includes status and assignee metadata.

### `/briefs/`
Client briefs and project specifications created via agent interactions.

### `/content-ideas/`
Content ideas for Wukr Wire, articles, and marketing materials.

### `/schedules/`
Meeting schedules and calendar entries.

**Sources:**
- Telnyx (Phone scheduler NA/EU)

### `/transcripts/`
Audio transcripts from voice interactions across all agents.

### `/reports/`
Generated reports organized by frequency:
- `/reports/daily/` - Daily lead aging and pipeline checks
- `/reports/weekly/` - Weekly progress reports
- `/reports/monthly/` - Monthly cost analysis and metrics

### `/metrics/`
Usage tracking and cost analysis data.

**Files:**
- `usage.json` - API usage and cost tracking

## Frontmatter Standard

All markdown files must include:

```yaml
---
date: YYYY-MM-DD HH:mm
source: coco | sally | gima | telnyx | multibot | manual
product: harvester | safetravel | wukr | morphic | general
status: new | contacted | qualified | closed | lost
assignee: richard | rashad
tags: []
---
```

## Agent Write Patterns

| Agent | Writes To | Source Tag |
|-------|-----------|------------|
| Sally (Website Voice) | `/leads/` | `sally` |
| Telnyx (Phone NA/EU) | `/schedules/` | `telnyx` |
| Coco Wukr (WhatsApp) | `/leads/`, `/briefs/`, `/notes/`, `/content-ideas/` (PRs) | `coco` |
| Gima (Africa Voice) | `/leads/` | `gima` |
| Multibot (Internal/Field) | `/notes/` | `multibot` |

## Automation

GitHub Actions cron job runs every 15 minutes to:
- Process new PRs
- Check lead aging
- Generate reports
- Update metrics

See `.github/workflows/manus-sync.yml` for details.
