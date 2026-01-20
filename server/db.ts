import { eq, desc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, InsertArticle, processedContent, InsertProcessedContent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Article Management
export async function createArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(articles).values(article);
}

export async function getUnsentArticles() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(articles)
    .where(isNull(articles.sentToBase44))
    .orderBy(desc(articles.createdAt));
}

export async function markArticleAsSent(taskId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(articles)
    .set({ sentToBase44: new Date() })
    .where(eq(articles.taskId, taskId));
}

export async function getAllArticles(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(limit);
}

// Processed Content Management
export async function saveProcessedContent(content: InsertProcessedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(processedContent).values(content);
}

export async function getProcessedContent(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(processedContent)
    .orderBy(desc(processedContent.receivedAt))
    .limit(limit);
}
