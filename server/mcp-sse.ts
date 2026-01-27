import { Router, Request, Response } from 'express';
import { getDb } from './db';
import { clients, tasks, callLogs, clientHistory } from '../drizzle/schema';
import { eq, and, desc, or, like } from 'drizzle-orm';

const router = Router();

// Authentication middleware
const authenticateMCP = (req: Request, res: Response, next: Function) => {
  const secret = req.headers['x-quintapoo-mcp-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (secret !== 'contancybearsfruit') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// SSE endpoint for MCP tools
router.get('/sse', authenticateMCP, async (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', tools: [
    'lookup_client_by_phone',
    'get_client_tasks',
    'get_task_status',
    'get_client_history',
    'log_call',
    'search_context'
  ] })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`: keepalive\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// HTTP POST endpoint for tool invocation
router.post('/invoke', authenticateMCP, async (req: Request, res: Response) => {
  const { tool, arguments: args } = req.body;

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    let result;

    switch (tool) {
      case 'lookup_client_by_phone':
        const client = await db.select().from(clients).where(eq(clients.phone, args.phone)).limit(1);
        result = client[0] || null;
        break;

      case 'get_client_tasks':
        const clientTasks = await db.select().from(tasks).where(eq(tasks.clientId, args.client_id));
        result = clientTasks;
        break;

      case 'get_task_status':
        const task = await db.select().from(tasks).where(eq(tasks.id, args.task_id)).limit(1);
        result = task[0] || null;
        break;

      case 'get_client_history':
        const history = await db.select().from(clientHistory)
          .where(eq(clientHistory.clientId, args.client_id))
          .orderBy(desc(clientHistory.createdAt))
          .limit(args.limit || 10);
        result = history;
        break;

      case 'log_call':
        await db.insert(callLogs).values({
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          clientId: args.client_id,
          phoneNumber: args.phone_number || 'unknown',
          callDurationSeconds: args.duration || 0,
          callPurpose: args.call_purpose || 'unknown',
          summary: args.summary,
          actionRequired: args.action_required ? 1 : 0,
          notes: args.notes || null,
          createdAt: new Date()
        });
        result = { success: true, message: 'Call logged successfully' };
        break;

      case 'search_context':
        const searchResults = await db.select().from(clientHistory)
          .where(
            or(
              like(clientHistory.interactionType, `%${args.query}%`),
              like(clientHistory.summary, `%${args.query}%`)
            )
          )
          .limit(args.limit || 10);
        result = searchResults;
        break;

      default:
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }

    res.json({ success: true, result });
  } catch (error: any) {
    console.error(`MCP tool error (${tool}):`, error);
    res.status(500).json({ error: 'Internal server error', message: error?.message || 'Unknown error' });
  }
});

// List available tools
router.get('/tools', authenticateMCP, (req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: 'lookup_client_by_phone',
        description: 'Look up client information by phone number',
        parameters: {
          phone: { type: 'string', required: true, description: 'Client phone number (E.164 format)' }
        }
      },
      {
        name: 'get_client_tasks',
        description: 'Get all tasks for a specific client',
        parameters: {
          client_id: { type: 'number', required: true, description: 'Client ID' }
        }
      },
      {
        name: 'get_task_status',
        description: 'Get detailed status of a specific task',
        parameters: {
          task_id: { type: 'number', required: true, description: 'Task ID' }
        }
      },
      {
        name: 'get_client_history',
        description: 'Get interaction history for a client',
        parameters: {
          client_id: { type: 'number', required: true, description: 'Client ID' },
          limit: { type: 'number', required: false, description: 'Number of records to return (default: 10)' }
        }
      },
      {
        name: 'log_call',
        description: 'Log a phone call interaction',
        parameters: {
          client_id: { type: 'number', required: true, description: 'Client ID' },
          call_type: { type: 'string', required: true, description: 'Type of call (inbound/outbound)' },
          duration: { type: 'number', required: false, description: 'Call duration in seconds' },
          summary: { type: 'string', required: true, description: 'Call summary' },
          outcome: { type: 'string', required: false, description: 'Call outcome' }
        }
      },
      {
        name: 'search_context',
        description: 'Search client interaction history by keyword',
        parameters: {
          query: { type: 'string', required: true, description: 'Search query' },
          limit: { type: 'number', required: false, description: 'Number of results (default: 10)' }
        }
      }
    ]
  });
});

export default router;
