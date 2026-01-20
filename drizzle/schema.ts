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

// Webhook Logs Table for Base 44 Engine Two
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 128 }).notNull(),
  payload: text("payload").notNull(),
  signature: varchar("signature", { length: 256 }),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

// Articles Table for tracking content to send to Base 44
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("task_id", { length: 128 }).notNull().unique(),
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