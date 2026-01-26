import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Webhook Logs Table for Base 44 Engine Two and Sally
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 128 }).notNull(), // 'base44' or 'sally'
  event: varchar("event", { length: 128 }), // e.g., 'task.created', 'task.completed'
  payload: text("payload").notNull(),
  response: text("response"), // Response from webhook endpoint
  signature: varchar("signature", { length: 256 }),
  statusCode: int("status_code"), // HTTP status code
  success: int("success").notNull().default(0), // 1 = success, 0 = failure
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

// Articles Table for tracking content to send to Base 44
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("task_id", { length: 128 }).notNull().unique(),
  sallyClientId: varchar("sally_client_id", { length: 128 }), // Sally client UUID
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 1024 }),
  sentToBase44: timestamp("sent_to_base44"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// Processed Content Table for storing Base 44 enriched content
export const processedContent = mysqlTable("processed_content", {
  id: int("id").autoincrement().primaryKey(),
  externalContentId: varchar("external_content_id", { length: 128 }).notNull().unique(),
  tension: varchar("tension", { length: 256 }),
  mood: varchar("mood", { length: 128 }),
  angle: varchar("angle", { length: 128 }),
  songId: varchar("song_id", { length: 128 }),
  songTitle: varchar("song_title", { length: 512 }),
  songArtist: varchar("song_artist", { length: 256 }),
  songSpotifyUrl: varchar("song_spotify_url", { length: 1024 }),
  songGenre: varchar("song_genre", { length: 128 }),
  songThemes: text("song_themes"), // JSON array stored as text
  articleTitle: varchar("article_title", { length: 512 }).notNull(),
  articleBody: text("article_body").notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export type ProcessedContent = typeof processedContent.$inferSelect;
export type InsertProcessedContent = typeof processedContent.$inferInsert;

// Clients Table for Sally/Telnyx integration
export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 128 }).primaryKey(), // UUID
  name: varchar("name", { length: 256 }).notNull(),
  company: varchar("company", { length: 256 }),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  paymentStatus: mysqlEnum("payment_status", ["active", "trial", "expired"]).default("trial").notNull(),
  trialEndDate: timestamp("trial_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Tasks Table for tracking Manus tasks linked to clients
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  manusTaskId: varchar("manus_task_id", { length: 128 }).notNull().unique(),
  clientId: varchar("client_id", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["pending", "active", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  progressPercentage: int("progress_percentage").default(0).notNull(),
  currentPhase: varchar("current_phase", { length: 256 }),
  nextPhase: varchar("next_phase", { length: 256 }),
  estimatedCompletion: timestamp("estimated_completion"),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Call Logs Table for recording Sally phone interactions
export const callLogs = mysqlTable("call_logs", {
  id: varchar("id", { length: 128 }).primaryKey(), // UUID
  clientId: varchar("client_id", { length: 128 }),
  phoneNumber: varchar("phone_number", { length: 32 }).notNull(),
  callDurationSeconds: int("call_duration_seconds"),
  callPurpose: mysqlEnum("call_purpose", ["status_check", "new_task", "support", "unknown"]).default("unknown").notNull(),
  summary: text("summary").notNull(),
  actionRequired: int("action_required").default(0).notNull(), // 1 = true, 0 = false
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;

// Client History Table for tracking interactions and briefs
export const clientHistory = mysqlTable("client_history", {
  id: int("id").autoincrement().primaryKey(),
  clientId: varchar("client_id", { length: 128 }).notNull(),
  interactionType: mysqlEnum("interaction_type", ["call", "brief_submission", "email", "other"]).notNull(),
  summary: text("summary").notNull(),
  keyPoints: text("key_points"), // JSON array stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ClientHistory = typeof clientHistory.$inferSelect;
export type InsertClientHistory = typeof clientHistory.$inferInsert;
