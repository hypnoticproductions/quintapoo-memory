import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getDb } from "./db.js";
import { clients, tasks, callLogs, clientHistory } from "../drizzle/schema.js";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * MCP Server for Sally/Telnyx AI Assistant Integration
 * 
 * Exposes 6 tools for phone call interactions:
 * 1. lookup_client_by_phone - Find client by phone number
 * 2. get_client_tasks - Get all tasks for a client
 * 3. get_task_status - Get detailed task status
 * 4. get_client_history - Get past interactions
 * 5. log_call - Record phone call
 * 6. search_context - Search client history
 */

const server = new Server(
  {
    name: "quintapoo-sally-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool 1: lookup_client_by_phone
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "lookup_client_by_phone",
        description: "Find client information by phone number. Returns client details including payment status and active tasks.",
        inputSchema: {
          type: "object",
          properties: {
            phone_number: {
              type: "string",
              description: "Phone number in E.164 format (e.g., +1234567890)",
            },
          },
          required: ["phone_number"],
        },
      },
      {
        name: "get_client_tasks",
        description: "Get all tasks for a specific client. Returns task list with status and timestamps.",
        inputSchema: {
          type: "object",
          properties: {
            client_id: {
              type: "string",
              description: "Client UUID",
            },
          },
          required: ["client_id"],
        },
      },
      {
        name: "get_task_status",
        description: "Get current status and details of a specific task. Returns progress, phases, and estimated completion.",
        inputSchema: {
          type: "object",
          properties: {
            manus_task_id: {
              type: "string",
              description: "Manus task identifier",
            },
          },
          required: ["manus_task_id"],
        },
      },
      {
        name: "get_client_history",
        description: "Get past interactions and briefs for context. Returns recent call logs and brief submissions.",
        inputSchema: {
          type: "object",
          properties: {
            client_id: {
              type: "string",
              description: "Client UUID",
            },
            limit: {
              type: "number",
              description: "Maximum number of interactions to return (default: 5)",
              default: 5,
            },
          },
          required: ["client_id"],
        },
      },
      {
        name: "log_call",
        description: "Record this phone call in the database. Logs call duration, purpose, summary, and action items.",
        inputSchema: {
          type: "object",
          properties: {
            client_id: {
              type: "string",
              description: "Client UUID (optional if client not found)",
            },
            phone_number: {
              type: "string",
              description: "Phone number in E.164 format",
            },
            call_duration_seconds: {
              type: "number",
              description: "Call duration in seconds",
            },
            call_purpose: {
              type: "string",
              enum: ["status_check", "new_task", "support", "unknown"],
              description: "Purpose of the call",
            },
            summary: {
              type: "string",
              description: "Summary of the call conversation",
            },
            action_required: {
              type: "boolean",
              description: "Whether follow-up action is required",
            },
            notes: {
              type: "string",
              description: "Additional notes about the call",
            },
          },
          required: ["phone_number", "summary", "call_purpose"],
        },
      },
      {
        name: "search_context",
        description: "Search for specific information in client history. Returns relevant past interactions matching the query.",
        inputSchema: {
          type: "object",
          properties: {
            client_id: {
              type: "string",
              description: "Client UUID",
            },
            query: {
              type: "string",
              description: "Search query (e.g., 'blog post deadline')",
            },
          },
          required: ["client_id", "query"],
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const db = await getDb();
  if (!db) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: "Database connection failed" }),
        },
      ],
      isError: true,
    };
  }

  try {
    switch (request.params.name) {
      case "lookup_client_by_phone": {
        const { phone_number } = request.params.arguments as { phone_number: string };
        
        const client = await db.select().from(clients).where(eq(clients.phone, phone_number)).limit(1);
        
        if (client.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ found: false }),
              },
            ],
          };
        }

        // Get most recent task for this client
        const recentTask = await db
          .select()
          .from(tasks)
          .where(eq(tasks.clientId, client[0].id))
          .orderBy(desc(tasks.createdAt))
          .limit(1);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                found: true,
                client: {
                  id: client[0].id,
                  name: client[0].name,
                  company: client[0].company,
                  payment_status: client[0].paymentStatus,
                  trial_end_date: client[0].trialEndDate?.toISOString(),
                  phone: client[0].phone,
                  manus_task_id: recentTask[0]?.manusTaskId,
                },
              }),
            },
          ],
        };
      }

      case "get_client_tasks": {
        const { client_id } = request.params.arguments as { client_id: string };
        
        const clientTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.clientId, client_id))
          .orderBy(desc(tasks.createdAt));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tasks: clientTasks.map((task) => ({
                  manus_task_id: task.manusTaskId,
                  status: task.status,
                  created_at: task.createdAt.toISOString(),
                  last_updated: task.updatedAt.toISOString(),
                })),
              }),
            },
          ],
        };
      }

      case "get_task_status": {
        const { manus_task_id } = request.params.arguments as { manus_task_id: string };
        
        const task = await db
          .select()
          .from(tasks)
          .where(eq(tasks.manusTaskId, manus_task_id))
          .limit(1);

        if (task.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: "Task not found" }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                task_id: task[0].manusTaskId,
                status: task[0].status,
                progress_percentage: task[0].progressPercentage,
                current_phase: task[0].currentPhase,
                next_phase: task[0].nextPhase,
                estimated_completion: task[0].estimatedCompletion?.toISOString(),
                last_activity: task[0].lastActivity.toISOString(),
                summary: task[0].summary,
              }),
            },
          ],
        };
      }

      case "get_client_history": {
        const { client_id, limit = 5 } = request.params.arguments as {
          client_id: string;
          limit?: number;
        };
        
        const history = await db
          .select()
          .from(clientHistory)
          .where(eq(clientHistory.clientId, client_id))
          .orderBy(desc(clientHistory.createdAt))
          .limit(limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                interactions: history.map((item) => ({
                  date: item.createdAt.toISOString(),
                  type: item.interactionType,
                  summary: item.summary,
                  key_points: item.keyPoints ? JSON.parse(item.keyPoints) : [],
                })),
              }),
            },
          ],
        };
      }

      case "log_call": {
        const {
          client_id,
          phone_number,
          call_duration_seconds,
          call_purpose,
          summary,
          action_required,
          notes,
        } = request.params.arguments as {
          client_id?: string;
          phone_number: string;
          call_duration_seconds?: number;
          call_purpose: "status_check" | "new_task" | "support" | "unknown";
          summary: string;
          action_required?: boolean;
          notes?: string;
        };

        const callId = randomUUID();

        await db.insert(callLogs).values({
          id: callId,
          clientId: client_id,
          phoneNumber: phone_number,
          callDurationSeconds: call_duration_seconds,
          callPurpose: call_purpose,
          summary,
          actionRequired: action_required ? 1 : 0,
          notes,
        });

        // Also add to client history if client_id provided
        if (client_id) {
          await db.insert(clientHistory).values({
            clientId: client_id,
            interactionType: "call",
            summary,
            keyPoints: notes ? JSON.stringify([notes]) : null,
          });
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                call_id: callId,
              }),
            },
          ],
        };
      }

      case "search_context": {
        const { client_id, query } = request.params.arguments as {
          client_id: string;
          query: string;
        };
        
        // Simple text search in client history
        const history = await db
          .select()
          .from(clientHistory)
          .where(eq(clientHistory.clientId, client_id))
          .orderBy(desc(clientHistory.createdAt));

        // Filter by query (simple substring match)
        const results = history
          .filter(
            (item) =>
              item.summary.toLowerCase().includes(query.toLowerCase()) ||
              (item.keyPoints && item.keyPoints.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 5)
          .map((item: any) => ({
            relevance_score: 0.8, // Simplified scoring
            content: item.summary,
            source: item.interactionType,
            date: item.createdAt.toISOString(),
          }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ results }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Quintapoo Sally MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
