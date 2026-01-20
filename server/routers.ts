import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { webhookLogs } from "../drizzle/schema";

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
        payload: z.any(),
        signature: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        
        // Log the incoming webhook
        const logEntry = {
          source: 'base44_engine_two',
          payload: JSON.stringify(input.payload),
          signature: input.signature || null,
          receivedAt: new Date(),
        };

        if (db) {
          await db.insert(webhookLogs).values(logEntry);
        }

        console.log('[Base 44] Webhook received:', {
          timestamp: new Date().toISOString(),
          signature: input.signature,
          payloadKeys: Object.keys(input.payload || {}),
        });

        return {
          success: true,
          received: true,
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
  }),
});

export type AppRouter = typeof appRouter;
