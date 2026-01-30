# Manus MCP Server

Model Context Protocol (MCP) server for Engine Two agent orchestration system.

## Features

- Query leads, notes, and tasks from the quintapoo-memory repository
- Get pipeline summaries and agent activity reports
- Generate daily, weekly, and monthly reports
- Track API usage and costs
- Write notes directly from Claude Desktop
- List pending pull requests

## Installation

### Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token with repo access
- Claude Desktop installed

### Setup Steps

1. **Install dependencies:**
   ```bash
   cd manus-mcp
   npm install
   ```

2. **Build the server:**
   ```bash
   npm run build
   ```

3. **Configure environment variables:**
   
   Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your GitHub token:
   ```
   GITHUB_TOKEN=ghp_your_actual_token_here
   REPO_OWNER=hypnoticproductions
   REPO_NAME=quintapoo-memory
   ```

4. **Add to Claude Desktop:**

   Edit Claude Desktop config file:
   
   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   
   **Linux:** `~/.config/Claude/claude_desktop_config.json`

   Add this configuration:
   ```json
   {
     "mcpServers": {
       "manus": {
         "command": "node",
         "args": ["/absolute/path/to/quintapoo-memory/manus-mcp/dist/index.js"],
         "env": {
           "GITHUB_TOKEN": "ghp_your_actual_token_here",
           "REPO_OWNER": "hypnoticproductions",
           "REPO_NAME": "quintapoo-memory"
         }
       }
     }
   }
   ```

   **Important:** Replace `/absolute/path/to/` with the actual path to your cloned repository.

5. **Restart Claude Desktop**

## Available Tools

### Query Tools
- `query_leads` - Filter leads by date, product, status, or source
- `query_notes` - Search notes and field memos
- `query_tasks` - Filter tasks by status or assignee
- `get_document` - Retrieve specific documents by path or search

### Analytics Tools
- `get_pipeline_summary` - Pipeline metrics by product, status, and source
- `get_agent_activity` - Activity log for specific agents
- `get_cost_analysis` - API usage and cost tracking

### Management Tools
- `list_pending_prs` - List open pull requests
- `generate_report` - Generate daily, weekly, or monthly reports
- `write_note` - Create new notes in the repository

## Usage Examples

In Claude Desktop, you can now ask:

- "Show me pipeline summary for this week"
- "List all new leads from Sally"
- "What tasks are assigned to Richard?"
- "Show pending PRs"
- "Generate a weekly report"
- "Write a note: Met with client about Harvester integration"

## Development

Watch mode for development:
```bash
npm run watch
```

## Troubleshooting

1. **Server not appearing in Claude Desktop:**
   - Check that the path in config is absolute, not relative
   - Verify the build completed successfully (`dist/index.js` exists)
   - Restart Claude Desktop completely

2. **GitHub API errors:**
   - Verify your GitHub token has `repo` scope
   - Check token hasn't expired
   - Ensure REPO_OWNER and REPO_NAME are correct

3. **Permission errors:**
   - Ensure the GitHub token has write access if using `write_note`
   - Check repository permissions

## Architecture

This MCP server connects Claude Desktop to the quintapoo-memory GitHub repository, enabling:

- Real-time queries of leads, notes, and tasks
- Automated report generation
- Cost tracking and analytics
- Direct write access for note-taking

All data is stored in GitHub, providing version control, collaboration, and backup.
