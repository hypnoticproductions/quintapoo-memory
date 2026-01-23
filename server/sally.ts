import crypto from "crypto";
import { getDb } from "./db";
import { webhookLogs } from "../drizzle/schema";

/**
 * Sally Webhook Service
 * Sends task events to Sally system with HMAC authentication and retry logic
 */

const SALLY_WEBHOOK_URL =
  process.env.SALLY_WEBHOOK_URL ||
  "https://gvqhpyzczswpcdnqkppp.supabase.co/functions/v1/sally-webhook";
const SALLY_WEBHOOK_SECRET =
  process.env.SALLY_WEBHOOK_SECRET ||
  "53c82b4e6f1f858985c226828e929296ec89a5836ab42f07e60bb04e6722d30e";
const SALLY_WEBHOOK_ENABLED = process.env.SALLY_WEBHOOK_ENABLED === "true";
const WEBHOOK_TIMEOUT_MS = 10000; // 10 seconds
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000]; // Exponential backoff

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
function generateHmacSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return `sha256=${hmac.digest("hex")}`;
}

/**
 * Send webhook to Sally with retry logic
 */
async function sendWebhookWithRetry(
  payload: object,
  attempt: number = 0
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payloadString = JSON.stringify(payload);
  const signature = generateHmacSignature(payloadString, SALLY_WEBHOOK_SECRET);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const response = await fetch(SALLY_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Manus-Signature": signature,
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 2xx = success
    if (response.ok) {
      return { success: true, statusCode: response.status };
    }

    // 4xx = client error, don't retry
    if (response.status >= 400 && response.status < 500) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        statusCode: response.status,
        error: `Client error (${response.status}): ${errorText}`,
      };
    }

    // 5xx = server error, retry
    if (response.status >= 500 && attempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[attempt];
      console.log(
        `[Sally Webhook] Server error (${response.status}), retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWebhookWithRetry(payload, attempt + 1);
    }

    // Max retries exceeded
    const errorText = await response.text().catch(() => "Unknown error");
    return {
      success: false,
      statusCode: response.status,
      error: `Max retries exceeded. Last error (${response.status}): ${errorText}`,
    };
  } catch (error: any) {
    // Network error or timeout
    if (error.name === "AbortError") {
      if (attempt < RETRY_DELAYS_MS.length) {
        const delay = RETRY_DELAYS_MS[attempt];
        console.log(
          `[Sally Webhook] Timeout, retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendWebhookWithRetry(payload, attempt + 1);
      }
      return { success: false, error: "Timeout after max retries" };
    }

    // Other network errors
    if (attempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[attempt];
      console.log(
        `[Sally Webhook] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length}): ${error.message}`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWebhookWithRetry(payload, attempt + 1);
    }

    return {
      success: false,
      error: `Network error after max retries: ${error.message}`,
    };
  }
}

/**
 * Log webhook attempt to database
 */
async function logWebhookAttempt(
  event: string,
  taskId: string,
  clientId: string,
  payload: object,
  success: boolean,
  statusCode?: number,
  error?: string
) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Sally Webhook] Database not available, skipping log");
      return;
    }
    await db.insert(webhookLogs).values({
      source: "sally",
      event,
      payload: JSON.stringify(payload),
      response: JSON.stringify({
        success,
        statusCode,
        error,
        timestamp: new Date().toISOString(),
      }),
      statusCode: statusCode || null,
      success: success ? 1 : 0,
      receivedAt: new Date(),
      createdAt: new Date(),
    });
  } catch (dbError: any) {
    console.error("[Sally Webhook] Failed to log to database:", dbError.message);
  }
}

/**
 * Send task.created event to Sally
 */
export async function sendTaskCreatedEvent(
  taskId: string,
  clientId: string,
  metadata: {
    briefContent?: string;
    conversationScore?: number;
    paymentStatus?: string;
    priority?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!SALLY_WEBHOOK_ENABLED) {
    console.log("[Sally Webhook] Disabled, skipping task.created event");
    return { success: false, error: "Webhook disabled" };
  }

  const payload = {
    event: "task.created",
    task_id: taskId,
    client_id: clientId,
    timestamp: new Date().toISOString(),
    metadata,
  };

  console.log(`[Sally Webhook] Sending task.created for task ${taskId}`);
  const result = await sendWebhookWithRetry(payload);

  await logWebhookAttempt(
    "task.created",
    taskId,
    clientId,
    payload,
    result.success,
    result.statusCode,
    result.error
  );

  if (result.success) {
    console.log(`[Sally Webhook] task.created sent successfully for task ${taskId}`);
  } else {
    console.error(
      `[Sally Webhook] task.created failed for task ${taskId}: ${result.error}`
    );
  }

  return result;
}

/**
 * Send task.completed event to Sally
 */
export async function sendTaskCompletedEvent(
  taskId: string,
  clientId: string,
  metadata: {
    completionNotes?: string;
    outcome?: string;
    nextSteps?: string;
    contactMethod?: string;
    durationMinutes?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!SALLY_WEBHOOK_ENABLED) {
    console.log("[Sally Webhook] Disabled, skipping task.completed event");
    return { success: false, error: "Webhook disabled" };
  }

  const payload = {
    event: "task.completed",
    task_id: taskId,
    client_id: clientId,
    timestamp: new Date().toISOString(),
    metadata,
  };

  console.log(`[Sally Webhook] Sending task.completed for task ${taskId}`);
  const result = await sendWebhookWithRetry(payload);

  await logWebhookAttempt(
    "task.completed",
    taskId,
    clientId,
    payload,
    result.success,
    result.statusCode,
    result.error
  );

  if (result.success) {
    console.log(`[Sally Webhook] task.completed sent successfully for task ${taskId}`);
  } else {
    console.error(
      `[Sally Webhook] task.completed failed for task ${taskId}: ${result.error}`
    );
  }

  return result;
}
