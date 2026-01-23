import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

/**
 * Manus Chat Inbound Webhook Tests
 * Tests X-Manus-Signature header validation and payload processing
 */

describe("Manus Chat Inbound Webhook", () => {
  const createMockContext = (signature?: string): Context => ({
    req: {
      headers: {
        "x-manus-signature": signature,
      },
    } as any,
    res: {} as any,
    user: null,
  });

  it("should accept webhook with valid X-Manus-Signature header", async () => {
    const ctx = createMockContext("contancybearsfruit");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sally.inboundFromManus({
      event: "task.created",
      task_id: "test_task_001",
      client_id: "client_uuid_123",
      timestamp: new Date().toISOString(),
      metadata: {
        briefContent: "Test consultation request",
        priority: "high",
      },
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Webhook received");
  });

  it("should reject webhook with invalid X-Manus-Signature header", async () => {
    const ctx = createMockContext("wrong_signature");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.sally.inboundFromManus({
        event: "task.created",
        task_id: "test_task_002",
        client_id: "client_uuid_456",
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow("Invalid X-Manus-Signature header");
  });

  it("should reject webhook with missing X-Manus-Signature header", async () => {
    const ctx = createMockContext(undefined);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.sally.inboundFromManus({
        event: "task.completed",
        task_id: "test_task_003",
        client_id: "client_uuid_789",
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow("Invalid X-Manus-Signature header");
  });

  it("should accept task.completed event with valid signature", async () => {
    const ctx = createMockContext("contancybearsfruit");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sally.inboundFromManus({
      event: "task.completed",
      task_id: "test_task_004",
      client_id: "client_uuid_999",
      timestamp: new Date().toISOString(),
      metadata: {
        outcome: "qualified",
        completionNotes: "Consultation successful",
        durationMinutes: 30,
      },
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Webhook received");
  });

  it("should validate event enum (task.created or task.completed only)", async () => {
    const ctx = createMockContext("contancybearsfruit");
    const caller = appRouter.createCaller(ctx);

    // @ts-expect-error Testing invalid event type
    await expect(
      caller.sally.inboundFromManus({
        event: "task.invalid",
        task_id: "test_task_005",
        client_id: "client_uuid_000",
        timestamp: new Date().toISOString(),
      })
    ).rejects.toThrow();
  });

  it("should validate required fields", async () => {
    const ctx = createMockContext("contancybearsfruit");
    const caller = appRouter.createCaller(ctx);

    // @ts-expect-error Testing missing required fields
    await expect(
      caller.sally.inboundFromManus({
        event: "task.created",
        // Missing task_id, client_id, timestamp
      })
    ).rejects.toThrow();
  });
});
