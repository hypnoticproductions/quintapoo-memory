import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { webhookLogs } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { sendArticleToBase44, sendArticleBatchToBase44 } from "./base44";
import { saveProcessedContent, getProcessedContent, createArticle, getUnsentArticles, markArticleAsSent, getAllArticles } from "./db";
import { sendTaskCreatedEvent, sendTaskCompletedEvent } from "./sally";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Base 44 Engine Two Webhook Endpoint
  base44: router({
    ingest: publicProcedure
      .input(z.object({
        external_content_id: z.string(),
        signal: z.object({
          tension: z.string(),
          mood: z.string(),
        }),
        angle: z.string(),
        song: z.object({
          id: z.string(),
          title: z.string(),
          artist: z.string(),
          spotify_url: z.string().nullable(),
          audio_preview_url: z.null(),
          genre: z.string(),
          themes: z.array(z.string()),
        }),
        article: z.object({
          title: z.string(),
          body: z.string(),
        }),
        assets: z.object({
          model_image_url: z.null(),
          shopify_product_url: z.null(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        
        // Log the incoming webhook
        const logEntry = {
          source: 'base44_engine_two',
          payload: JSON.stringify(input),
          signature: input.external_content_id,
          receivedAt: new Date(),
        };

        if (db) {
          await db.insert(webhookLogs).values(logEntry);
        }

        // Save processed content to database
        await saveProcessedContent({
          externalContentId: input.external_content_id,
          tension: input.signal.tension,
          mood: input.signal.mood,
          angle: input.angle,
          songId: input.song.id,
          songTitle: input.song.title,
          songArtist: input.song.artist,
          songSpotifyUrl: input.song.spotify_url,
          songGenre: input.song.genre,
          songThemes: JSON.stringify(input.song.themes),
          articleTitle: input.article.title,
          articleBody: input.article.body,
        });

        console.log('[Base 44] Processed content received:', {
          timestamp: new Date().toISOString(),
          content_id: input.external_content_id,
          article_title: input.article.title,
          tension: input.signal.tension,
          mood: input.signal.mood,
        });

        return {
          success: true,
          received: true,
          content_id: input.external_content_id,
          timestamp: new Date().toISOString(),
        };
      }),
    
    // Query recent webhook logs
    getLogs: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const logs = await db
          .select()
          .from(webhookLogs)
          .orderBy(webhookLogs.receivedAt)
          .limit(input.limit);
        
        return logs;
      }),
    
    // Send single article to Base 44
    sendArticle: publicProcedure
      .input(z.object({
        taskId: z.string(),
        title: z.string(),
        content: z.string().min(100),
        attachmentUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await sendArticleToBase44(
          input.taskId,
          input.title,
          input.content,
          input.attachmentUrl
        );
        return result;
      }),
    
    // Send batch of articles to Base 44
    sendBatch: publicProcedure
      .input(z.object({
        articles: z.array(z.object({
          taskId: z.string(),
          title: z.string(),
          content: z.string().min(100),
          attachmentUrl: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const results = await sendArticleBatchToBase44(input.articles);
        
        // Mark sent articles in database
        for (const result of results) {
          if (result.success) {
            await markArticleAsSent(result.taskId);
          }
        }
        
        return results;
      }),
    
    // Article management endpoints
    createArticle: publicProcedure
      .input(z.object({
        taskId: z.string(),
        title: z.string(),
        content: z.string(),
        attachmentUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createArticle(input);
        return { success: true };
      }),
    
    getUnsentArticles: publicProcedure
      .query(async () => {
        return await getUnsentArticles();
      }),
    
    getAllArticles: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return await getAllArticles(input.limit);
      }),
    
    getProcessedContent: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return await getProcessedContent(input.limit);
      }),
  }),

  // Sally Webhook Integration
  sally: router({    
    // Manual webhook trigger for task.created event
    sendTaskCreated: publicProcedure
      .input(z.object({
        taskId: z.string(),
        clientId: z.string(),
        metadata: z.object({
          briefContent: z.string().optional(),
          conversationScore: z.number().optional(),
          paymentStatus: z.string().optional(),
          priority: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await sendTaskCreatedEvent(
          input.taskId,
          input.clientId,
          input.metadata || {}
        );
        return result;
      }),
    
    // Manual webhook trigger for task.completed event
    sendTaskCompleted: publicProcedure
      .input(z.object({
        taskId: z.string(),
        clientId: z.string(),
        metadata: z.object({
          completionNotes: z.string().optional(),
          outcome: z.string().optional(),
          nextSteps: z.string().optional(),
          contactMethod: z.string().optional(),
          durationMinutes: z.number().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await sendTaskCompletedEvent(
          input.taskId,
          input.clientId,
          input.metadata || {}
        );
        return result;
      }),
    
    // Get Sally webhook logs
    getLogs: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const logs = await db
          .select()
          .from(webhookLogs)
          .where(eq(webhookLogs.source, "sally"))
          .orderBy(desc(webhookLogs.receivedAt))
          .limit(input.limit);
        
        return logs;
      }),
    
    // Inbound webhook from Manus chat
    inboundFromManus: publicProcedure
      .input(z.object({
        event: z.enum(["task.created", "task.completed"]),
        task_id: z.string(),
        client_id: z.string(),
        timestamp: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate X-Manus-Signature header
        const signature = ctx.req.headers["x-manus-signature"];
        const expectedSignature = "contancybearsfruit";
        
        if (signature !== expectedSignature) {
          throw new Error("Invalid X-Manus-Signature header");
        }
        
        // Log webhook to database
        const db = await getDb();
        if (db) {
          await db.insert(webhookLogs).values({
            source: "manus_chat",
            event: input.event,
            payload: JSON.stringify(input),
            response: JSON.stringify({ success: true }),
            statusCode: 200,
            success: 1,
            receivedAt: new Date(),
            createdAt: new Date(),
          });
        }
        
        console.log(`[Manus Chat Webhook] ${input.event} received for task ${input.task_id}`);
        
        return { success: true, message: "Webhook received" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
