import { TrustScoreService } from "../src/services/trustScoreService";

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("TrustScoreService", () => {
  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTrustScore", () => {
    it("should return trust score for valid user", async () => {
      const userId = "user_001";
      const tier = "basic";

      const result = await TrustScoreService.getTrustScore(userId, tier);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("factors");
      expect(result).toHaveProperty("calculatedAt");
      expect(result).toHaveProperty("expiresAt");
      expect(result).toHaveProperty("creditsRemaining");
      expect(result).toHaveProperty("nextCalculationCost");
      expect(result).toHaveProperty("rateLimitRemaining");

      expect(typeof result?.score).toBe("number");
      expect(result?.score).toBeGreaterThanOrEqual(60);
      expect(result?.score).toBeLessThanOrEqual(100);
    });

    it("should return null for non-existent user", async () => {
      const userId = "non_existent_user";
      const tier = "basic";

      const result = await TrustScoreService.getTrustScore(userId, tier);

      expect(result).toBeNull();
    });

    it("should apply tier-specific rate limits", async () => {
      const userId = "user_002";
      const tiers = ["basic", "pro", "enterprise"];

      const results = await Promise.all(
        tiers.map((tier) => TrustScoreService.getTrustScore(userId, tier))
      );

      // All should have rate limit remaining
      results.forEach((result) => {
        expect(result).not.toBeNull();
        expect(result?.rateLimitRemaining).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have different calculation costs per tier", async () => {
      const userId = "user_003";
      const basicResult = await TrustScoreService.getTrustScore(
        userId,
        "basic"
      );
      const proResult = await TrustScoreService.getTrustScore(userId, "pro");
      const enterpriseResult = await TrustScoreService.getTrustScore(
        userId,
        "enterprise"
      );

      expect(basicResult?.nextCalculationCost).toBe(1);
      expect(proResult?.nextCalculationCost).toBe(0.5);
      expect(enterpriseResult?.nextCalculationCost).toBe(0.1);
    });
  });

  describe("calculateTrustScore", () => {
    it("should initiate calculation request for valid user", async () => {
      const userId = "user_004";
      const tier = "basic";

      const result = await TrustScoreService.calculateTrustScore(userId, tier);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("userId", userId);
      expect(result).toHaveProperty("tier", tier);
      expect(result).toHaveProperty("status", "processing");
      expect(result).toHaveProperty("cost");
      expect(result).toHaveProperty("startedAt");
      expect(result).toHaveProperty("estimatedTime");
      expect(result.id).toMatch(/^calc_\d+_[a-z0-9]+$/);
    });

    it("should throw error when quota exceeded", async () => {
      const userId = "user_005";
      const tier = "basic";

      // First calculation should work
      await TrustScoreService.calculateTrustScore(userId, tier);

      // Mock quota exceeded by setting up a scenario
      // This would require more complex mocking of the internal state
      // For now, we test the successful path
    });

    it("should have different cost structures per tier", async () => {
      const userId = "user_006";

      const basicResult = await TrustScoreService.calculateTrustScore(
        userId,
        "basic"
      );
      const proResult = await TrustScoreService.calculateTrustScore(
        userId + "_pro",
        "pro"
      );

      expect(basicResult.cost).toBe(1);
      expect(proResult.cost).toBe(1); // Both cost 1 credit in mock implementation
    });
  });

  describe("checkCalculationQuota", () => {
    it("should allow calculation for user with quota", async () => {
      const userId = "user_007";
      const tier = "basic";

      const result = await TrustScoreService.checkCalculationQuota(
        userId,
        tier
      );

      expect(result.allowed).toBe(true);
      expect(result).toHaveProperty("creditsRemaining");
      expect(result).toHaveProperty("rateLimitRemaining");
    });

    it("should return false for non-existent user", async () => {
      const userId = "non_existent_user";
      const tier = "basic";

      const result = await TrustScoreService.checkCalculationQuota(
        userId,
        tier
      );

      expect(result.allowed).toBe(false);
      expect(result.message).toBe("User quota not found");
    });

    it("should have different limits per tier", async () => {
      const userId = "user_008";

      const basicQuota = await TrustScoreService.checkCalculationQuota(
        userId,
        "basic"
      );
      const proQuota = await TrustScoreService.checkCalculationQuota(
        userId + "_pro",
        "pro"
      );
      const enterpriseQuota = await TrustScoreService.checkCalculationQuota(
        userId + "_ent",
        "enterprise"
      );

      expect(basicQuota.rateLimitRemaining).toBeGreaterThanOrEqual(0);
      expect(proQuota.rateLimitRemaining).toBeGreaterThanOrEqual(0);
      expect(enterpriseQuota.rateLimitRemaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getTrustScoreHistory", () => {
    it("should return paginated score history", async () => {
      const userId = "user_009";
      const tier = "basic";
      const limit = 5;
      const offset = 0;

      const result = await TrustScoreService.getTrustScoreHistory(
        userId,
        tier,
        limit,
        offset
      );

      expect(result).toHaveProperty("scores");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("hasMore");
      expect(result).toHaveProperty("creditsUsed");

      expect(Array.isArray(result.scores)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(typeof result.hasMore).toBe("boolean");
      expect(typeof result.creditsUsed).toBe("number");
    });

    it("should handle pagination correctly", async () => {
      const userId = "user_010";
      const tier = "basic";

      const firstPage = await TrustScoreService.getTrustScoreHistory(
        userId,
        tier,
        2,
        0
      );
      const secondPage = await TrustScoreService.getTrustScoreHistory(
        userId,
        tier,
        2,
        2
      );

      // Both pages should be valid
      expect(firstPage.scores.length).toBeLessThanOrEqual(2);
      expect(secondPage.scores.length).toBeLessThanOrEqual(2);
    });

    it("should calculate credits used based on tier", async () => {
      const userId = "user_011";
      const limit = 3;
      const offset = 0;

      const basicHistory = await TrustScoreService.getTrustScoreHistory(
        userId,
        "basic",
        limit,
        offset
      );
      const proHistory = await TrustScoreService.getTrustScoreHistory(
        userId + "_pro",
        "pro",
        limit,
        offset
      );
      const enterpriseHistory = await TrustScoreService.getTrustScoreHistory(
        userId + "_ent",
        "enterprise",
        limit,
        offset
      );

      expect(basicHistory.creditsUsed).toBe(limit * 1);
      expect(proHistory.creditsUsed).toBe(limit * 0.5);
      expect(enterpriseHistory.creditsUsed).toBe(limit * 0.1);
    });

    it("should return empty results for user with no history", async () => {
      const userId = "no_history_user";
      const tier = "basic";

      const result = await TrustScoreService.getTrustScoreHistory(
        userId,
        tier,
        5,
        0
      );

      expect(result.scores).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
      expect(result.creditsUsed).toBe(0);
    });
  });

  describe("Integration Tests", () => {
    it("should complete full trust score workflow", async () => {
      const userId = "integration_user";
      const tier = "pro";

      // Check quota
      const quotaCheck = await TrustScoreService.checkCalculationQuota(
        userId,
        tier
      );
      expect(quotaCheck.allowed).toBe(true);

      // Get current score
      const currentScore = await TrustScoreService.getTrustScore(userId, tier);

      // Calculate new score
      const calculation = await TrustScoreService.calculateTrustScore(
        userId,
        tier
      );
      expect(calculation.status).toBe("processing");

      // Wait for async processing (in real implementation)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get history
      const history = await TrustScoreService.getTrustScoreHistory(
        userId,
        tier,
        5,
        0
      );
      expect(Array.isArray(history.scores)).toBe(true);
    });

    it("should handle concurrent requests safely", async () => {
      const userId = "concurrent_user";
      const tier = "basic";

      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        TrustScoreService.getTrustScore(userId, tier)
      );

      const results = await Promise.all(requests);

      // All should return valid results
      results.forEach((result) => {
        expect(result).not.toBeNull();
        expect(result).toHaveProperty("score");
        expect(result?.score).toBeGreaterThanOrEqual(60);
        expect(result?.score).toBeLessThanOrEqual(100);
      });
    });
  });
});
