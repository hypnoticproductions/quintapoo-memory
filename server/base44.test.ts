import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as base44Module from "./base44";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Base 44 Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("base44.sendArticle", () => {
    it("validates minimum content length", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Mock the sendArticleToBase44 function
      const mockSend = vi.spyOn(base44Module, "sendArticleToBase44");
      mockSend.mockResolvedValue({ success: true });

      // Test with content too short (< 100 chars)
      await expect(
        caller.base44.sendArticle({
          taskId: "test-001",
          title: "Test Article",
          content: "Too short",
        })
      ).rejects.toThrow();

      expect(mockSend).not.toHaveBeenCalled();
    });

    it("successfully sends article with valid content", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const mockSend = vi.spyOn(base44Module, "sendArticleToBase44");
      mockSend.mockResolvedValue({ success: true });

      const validContent = "A".repeat(150); // 150 characters

      const result = await caller.base44.sendArticle({
        taskId: "test-002",
        title: "Valid Test Article",
        content: validContent,
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        "test-002",
        "Valid Test Article",
        validContent,
        undefined
      );
    });

    it("handles Base 44 API errors gracefully", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const mockSend = vi.spyOn(base44Module, "sendArticleToBase44");
      mockSend.mockResolvedValue({
        success: false,
        error: "Base 44 service unavailable",
      });

      const validContent = "A".repeat(150);

      const result = await caller.base44.sendArticle({
        taskId: "test-003",
        title: "Error Test",
        content: validContent,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Base 44 service unavailable");
    });
  });

  describe("base44.ingest", () => {
    it("accepts valid Base 44 processed content", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const validPayload = {
        external_content_id: "MANUS_test-004",
        signal: {
          tension: "Caribbean Brain Gain",
          mood: "energetic",
        },
        angle: "manus_ai",
        song: {
          id: "MANUS_test-004",
          title: "Test Song",
          artist: "Richard Danni Barri Fortune",
          spotify_url: null,
          audio_preview_url: null,
          genre: "Caribbean",
          themes: ["innovation", "diaspora"],
        },
        article: {
          title: "Test Processed Article",
          body: "This is the processed article body from Base 44.",
        },
        assets: {
          model_image_url: null,
          shopify_product_url: null,
        },
      };

      const result = await caller.base44.ingest(validPayload);

      expect(result.success).toBe(true);
      expect(result.received).toBe(true);
      expect(result.content_id).toBe("MANUS_test-004");
      expect(result.timestamp).toBeDefined();
    });

    it("validates required fields in Base 44 payload", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const invalidPayload = {
        external_content_id: "MANUS_test-005",
        // Missing required fields
      } as any;

      await expect(caller.base44.ingest(invalidPayload)).rejects.toThrow();
    });
  });

  describe("base44.sendBatch", () => {
    it("sends multiple articles in batch", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const mockBatchSend = vi.spyOn(base44Module, "sendArticleBatchToBase44");
      mockBatchSend.mockResolvedValue([
        { taskId: "batch-001", success: true },
        { taskId: "batch-002", success: true },
      ]);

      const validContent = "A".repeat(150);

      const result = await caller.base44.sendBatch({
        articles: [
          {
            taskId: "batch-001",
            title: "Batch Article 1",
            content: validContent,
          },
          {
            taskId: "batch-002",
            title: "Batch Article 2",
            content: validContent,
          },
        ],
      });

      expect(result).toHaveLength(2);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(true);
    });
  });
});
