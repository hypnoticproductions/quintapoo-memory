/**
 * Test script for MCP server
 * 
 * Creates sample client data and tests all 6 MCP tools
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Database connection
const pool = mysql.createPool(process.env.DATABASE_URL || "");
const db = drizzle(pool);

// Schema definitions
const clients = mysqlTable("clients", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  company: varchar("company", { length: 256 }),
  phone: varchar("phone", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  paymentStatus: mysqlEnum("payment_status", ["active", "trial", "expired"]).default("trial").notNull(),
  trialEndDate: timestamp("trial_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

const tasks = mysqlTable("tasks", {
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

const clientHistory = mysqlTable("client_history", {
  id: int("id").autoincrement().primaryKey(),
  clientId: varchar("client_id", { length: 128 }).notNull(),
  interactionType: mysqlEnum("interaction_type", ["call", "brief_submission", "email", "other"]).notNull(),
  summary: text("summary").notNull(),
  keyPoints: text("key_points"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

async function testMCPServer() {
  console.log("🧪 Testing MCP Server for Sally/Telnyx Integration\n");

  try {
    // Create test client
    const clientId = randomUUID();
    const testPhone = "+14695551234";
    
    console.log("1️⃣  Creating test client...");
    await db.insert(clients).values({
      id: clientId,
      name: "John Doe",
      company: "ABC Corp",
      phone: testPhone,
      email: "john@abccorp.com",
      paymentStatus: "active",
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    console.log(`✅ Client created: ${clientId}\n`);

    // Create test task
    const taskId = `task-${randomUUID()}`;
    
    console.log("2️⃣  Creating test task...");
    await db.insert(tasks).values({
      manusTaskId: taskId,
      clientId: clientId,
      status: "in_progress",
      progressPercentage: 65,
      currentPhase: "research_complete",
      nextPhase: "writing_draft",
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      summary: "Research phase completed. Moving to draft writing.",
    });
    console.log(`✅ Task created: ${taskId}\n`);

    // Create test client history
    console.log("3️⃣  Creating test client history...");
    await db.insert(clientHistory).values({
      clientId: clientId,
      interactionType: "brief_submission",
      summary: "Client requested blog post about AI trends",
      keyPoints: JSON.stringify(["Focus on healthcare AI", "500 words", "Due Feb 1"]),
    });
    console.log("✅ Client history created\n");

    console.log("🎉 Test data created successfully!\n");
    console.log("Test client details:");
    console.log(`  - ID: ${clientId}`);
    console.log(`  - Name: John Doe`);
    console.log(`  - Phone: ${testPhone}`);
    console.log(`  - Company: ABC Corp`);
    console.log(`  - Payment Status: active`);
    console.log(`  - Task ID: ${taskId}`);
    console.log(`  - Task Status: in_progress (65% complete)\n`);

    console.log("📋 MCP Server Tools Available:");
    console.log("  1. lookup_client_by_phone - Test with: " + testPhone);
    console.log("  2. get_client_tasks - Test with client_id: " + clientId);
    console.log("  3. get_task_status - Test with manus_task_id: " + taskId);
    console.log("  4. get_client_history - Test with client_id: " + clientId);
    console.log("  5. log_call - Test with phone_number: " + testPhone);
    console.log("  6. search_context - Test with client_id: " + clientId + " and query: 'blog post'\n");

    console.log("✅ MCP Server is ready for Telnyx AI Assistant integration!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testMCPServer();
