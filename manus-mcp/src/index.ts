import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const REPO_OWNER = process.env.REPO_OWNER || "hypnoticproductions";
const REPO_NAME = process.env.REPO_NAME || "quintapoo-memory";

// ============================================
// MANUS MCP SERVER
// ============================================

const server = new Server(
  { name: "manus-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ============================================
// TOOL DEFINITIONS
// ============================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "query_leads",
      description: "Query leads from Manus repo. Filter by date, status, product, or source.",
      inputSchema: {
        type: "object",
        properties: {
          days: { type: "number", description: "Leads from last N days (default: 7)" },
          product: { type: "string", description: "Filter by product: harvester, safetravel, wukr, morphic" },
          status: { type: "string", description: "Filter by status: new, contacted, qualified, closed" },
          source: { type: "string", description: "Filter by source: coco, sally, gima, telnyx, multibot" },
        },
      },
    },
    {
      name: "query_notes",
      description: "Query notes and field memos from Manus repo.",
      inputSchema: {
        type: "object",
        properties: {
          days: { type: "number", description: "Notes from last N days (default: 7)" },
          search: { type: "string", description: "Search term in note content" },
        },
      },
    },
    {
      name: "query_tasks",
      description: "Query tasks and action items from Manus repo.",
      inputSchema: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: open, done, urgent" },
          assignee: { type: "string", description: "Filter by assignee: richard, rashad" },
        },
      },
    },
    {
      name: "get_pipeline_summary",
      description: "Get pipeline summary with counts by product, status, and source.",
      inputSchema: {
        type: "object",
        properties: {
          period: { type: "string", description: "today, week, month, all (default: week)" },
        },
      },
    },
    {
      name: "get_agent_activity",
      description: "Get activity log for a specific agent.",
      inputSchema: {
        type: "object",
        properties: {
          agent: { type: "string", description: "Agent name: sally, coco, gima, telnyx, multibot" },
          days: { type: "number", description: "Activity from last N days (default: 7)" },
        },
        required: ["agent"],
      },
    },
    {
      name: "get_cost_analysis",
      description: "Get API usage and cost analysis.",
      inputSchema: {
        type: "object",
        properties: {
          period: { type: "string", description: "week, month, quarter (default: month)" },
        },
      },
    },
    {
      name: "get_document",
      description: "Retrieve a specific document from the repo by path or search.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Full path like /leads/2026-01-29-john-intake.md" },
          search: { type: "string", description: "Search by name or keyword" },
        },
      },
    },
    {
      name: "list_pending_prs",
      description: "List pending pull requests awaiting review.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "generate_report",
      description: "Generate a report: daily, weekly, or monthly.",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", description: "Report type: daily, weekly, monthly" },
        },
        required: ["type"],
      },
    },
    {
      name: "write_note",
      description: "Write a new note to the repo (from Multibot/field).",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Note content" },
          source: { type: "string", description: "Source: multibot, manual" },
          tags: { type: "array", items: { type: "string" }, description: "Tags for categorization" },
        },
        required: ["content"],
      },
    },
  ],
}));

// ============================================
// TOOL HANDLERS
// ============================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "query_leads":
        return await queryLeads(args);
      case "query_notes":
        return await queryNotes(args);
      case "query_tasks":
        return await queryTasks(args);
      case "get_pipeline_summary":
        return await getPipelineSummary(args);
      case "get_agent_activity":
        return await getAgentActivity(args);
      case "get_cost_analysis":
        return await getCostAnalysis(args);
      case "get_document":
        return await getDocument(args);
      case "list_pending_prs":
        return await listPendingPRs();
      case "generate_report":
        return await generateReport(args);
      case "write_note":
        return await writeNote(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getRepoContents(path: string): Promise<any[]> {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
    });
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

async function getFileContent(path: string): Promise<string> {
  const { data } = await octokit.repos.getContent({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
  });
  if ("content" in data) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  throw new Error("Not a file");
}

function parseMarkdownFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const frontmatter: Record<string, any> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length) {
      frontmatter[key.trim().toLowerCase()] = valueParts.join(":").trim();
    }
  });
  return frontmatter;
}

function filterByDate(files: any[], days: number): any[] {
  const cutoff = subDays(new Date(), days);
  return files.filter((f) => {
    const dateMatch = f.name.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]) >= cutoff;
    }
    return true;
  });
}

// ============================================
// TOOL IMPLEMENTATIONS
// ============================================

async function queryLeads(args: any) {
  const days = args.days || 7;
  const files = await getRepoContents("leads");
  let filtered = filterByDate(files, days);

  const leads = await Promise.all(
    filtered.slice(0, 50).map(async (f) => {
      const content = await getFileContent(`leads/${f.name}`);
      const meta = parseMarkdownFrontmatter(content);
      return {
        file: f.name,
        ...meta,
        preview: content.slice(0, 200),
      };
    })
  );

  let result = leads;
  if (args.product) {
    result = result.filter((l) => l.product?.toLowerCase().includes(args.product.toLowerCase()));
  }
  if (args.source) {
    result = result.filter((l) => l.source?.toLowerCase().includes(args.source.toLowerCase()));
  }
  if (args.status) {
    result = result.filter((l) => l.status?.toLowerCase().includes(args.status.toLowerCase()));
  }

  return {
    content: [
      {
        type: "text",
        text: `## Leads (Last ${days} days)\n\nFound ${result.length} leads.\n\n${JSON.stringify(result, null, 2)}`,
      },
    ],
  };
}

async function queryNotes(args: any) {
  const days = args.days || 7;
  const files = await getRepoContents("notes");
  let filtered = filterByDate(files, days);

  const notes = await Promise.all(
    filtered.slice(0, 30).map(async (f) => {
      const content = await getFileContent(`notes/${f.name}`);
      return { file: f.name, content: content.slice(0, 500) };
    })
  );

  let result = notes;
  if (args.search) {
    result = result.filter((n) => n.content.toLowerCase().includes(args.search.toLowerCase()));
  }

  return {
    content: [{ type: "text", text: `## Notes (Last ${days} days)\n\n${JSON.stringify(result, null, 2)}` }],
  };
}

async function queryTasks(args: any) {
  const files = await getRepoContents("tasks");

  const tasks = await Promise.all(
    files.slice(0, 50).map(async (f) => {
      const content = await getFileContent(`tasks/${f.name}`);
      const meta = parseMarkdownFrontmatter(content);
      return { file: f.name, ...meta };
    })
  );

  let result = tasks;
  if (args.status) {
    result = result.filter((t) => t.status?.toLowerCase() === args.status.toLowerCase());
  }
  if (args.assignee) {
    result = result.filter((t) => t.assignee?.toLowerCase().includes(args.assignee.toLowerCase()));
  }

  return {
    content: [{ type: "text", text: `## Tasks\n\n${JSON.stringify(result, null, 2)}` }],
  };
}

async function getPipelineSummary(args: any) {
  const period = args.period || "week";
  const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 365;

  const files = await getRepoContents("leads");
  const filtered = filterByDate(files, days);

  const leads = await Promise.all(
    filtered.map(async (f) => {
      const content = await getFileContent(`leads/${f.name}`);
      return parseMarkdownFrontmatter(content);
    })
  );

  const byProduct: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  leads.forEach((l) => {
    byProduct[l.product || "unknown"] = (byProduct[l.product || "unknown"] || 0) + 1;
    bySource[l.source || "unknown"] = (bySource[l.source || "unknown"] || 0) + 1;
    byStatus[l.status || "new"] = (byStatus[l.status || "new"] || 0) + 1;
  });

  const summary = `## Pipeline Summary (${period})

**Total Leads:** ${leads.length}

**By Product:**
${Object.entries(byProduct).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**By Source:**
${Object.entries(bySource).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

**By Status:**
${Object.entries(byStatus).map(([k, v]) => `- ${k}: ${v}`).join("\n")}
`;

  return { content: [{ type: "text", text: summary }] };
}

async function getAgentActivity(args: any) {
  const agent = args.agent.toLowerCase();
  const days = args.days || 7;

  const leadFiles = await getRepoContents("leads");
  const filtered = filterByDate(leadFiles, days);

  const agentLeads = await Promise.all(
    filtered.map(async (f) => {
      const content = await getFileContent(`leads/${f.name}`);
      const meta = parseMarkdownFrontmatter(content);
      if (meta.source?.toLowerCase().includes(agent)) {
        return { file: f.name, ...meta };
      }
      return null;
    })
  );

  const result = agentLeads.filter(Boolean);

  return {
    content: [
      {
        type: "text",
        text: `## Agent Activity: ${agent} (Last ${days} days)\n\n**Actions:** ${result.length}\n\n${JSON.stringify(result, null, 2)}`,
      },
    ],
  };
}

async function getCostAnalysis(args: any) {
  const period = args.period || "month";

  // Check for usage-logs file
  let usageData: any = { api_calls: 0, tokens: 0, estimated_cost: 0 };
  try {
    const content = await getFileContent("metrics/usage.json");
    usageData = JSON.parse(content);
  } catch {
    // No usage file yet
  }

  const report = `## Cost Analysis (${period})

**API Usage:**
- Grok Transcription: ${usageData.grok_calls || 0} calls
- Claude Tokens: ${usageData.claude_tokens || 0} tokens
- GitHub API: ${usageData.github_calls || 0} calls

**Estimated Costs:**
- Grok: $${((usageData.grok_calls || 0) * 0.006).toFixed(2)}
- Claude: $${((usageData.claude_tokens || 0) / 1000 * 0.015).toFixed(2)}
- Total: $${usageData.estimated_cost || "0.00"}

*Note: Costs are estimates. Check provider dashboards for actuals.*
`;

  return { content: [{ type: "text", text: report }] };
}

async function getDocument(args: any) {
  if (args.path) {
    const content = await getFileContent(args.path);
    return { content: [{ type: "text", text: content }] };
  }

  if (args.search) {
    const folders = ["leads", "notes", "briefs", "content-ideas"];
    for (const folder of folders) {
      const files = await getRepoContents(folder);
      const match = files.find((f) => f.name.toLowerCase().includes(args.search.toLowerCase()));
      if (match) {
        const content = await getFileContent(`${folder}/${match.name}`);
        return { content: [{ type: "text", text: `**Found:** ${folder}/${match.name}\n\n${content}` }] };
      }
    }
    return { content: [{ type: "text", text: "Document not found." }] };
  }

  return { content: [{ type: "text", text: "Provide path or search term." }] };
}

async function listPendingPRs() {
  const { data } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: "open",
  });

  const prs = data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login,
    created: pr.created_at,
    url: pr.html_url,
  }));

  return {
    content: [
      {
        type: "text",
        text: `## Pending PRs\n\n${prs.length} open.\n\n${JSON.stringify(prs, null, 2)}`,
      },
    ],
  };
}

async function generateReport(args: any) {
  const type = args.type;

  const summary = await getPipelineSummary({
    period: type === "daily" ? "today" : type === "weekly" ? "week" : "month",
  });

  const prs = await listPendingPRs();

  const report = `# ${type.charAt(0).toUpperCase() + type.slice(1)} Report
**Generated:** ${format(new Date(), "yyyy-MM-dd HH:mm")}

${summary.content[0].text}

---

${prs.content[0].text}

---
*Generated by Manus MCP*
`;

  return { content: [{ type: "text", text: report }] };
}

async function writeNote(args: any) {
  const date = format(new Date(), "yyyy-MM-dd-HHmm");
  const source = args.source || "manual";
  const filename = `${date}-${source}-note.md`;
  const tags = args.tags || [];

  const content = `---
date: ${format(new Date(), "yyyy-MM-dd HH:mm")}
source: ${source}
tags: [${tags.join(", ")}]
---

${args.content}
`;

  await octokit.repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: `notes/${filename}`,
    message: `Note from ${source}: ${date}`,
    content: Buffer.from(content).toString("base64"),
  });

  return {
    content: [{ type: "text", text: `Note saved: notes/${filename}` }],
  };
}

// ============================================
// START SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Manus MCP server running");
}

main().catch(console.error);
