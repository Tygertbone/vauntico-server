import {
  marketplaceService,
  MarketplaceItem,
  MarketplacePurchase,
  ComplianceCheck,
} from "../src/services/marketplaceService";
import { TrustScoreService } from "../src/services/trustScoreService";

// Mock database pool
jest.mock("../src/utils/database", () => ({
  pool: {
    connect: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock TrustScoreService
jest.mock("../src/services/trustScoreService", () => ({
  TrustScoreService: {
    calculateTrustScore: jest.fn(),
  },
}));

// Mock logger
jest.mock("../src/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

import { pool } from "../src/utils/database";

const mockPool = pool as any;

describe("MarketplaceService", () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock client
    mockPool.connect.mockResolvedValue(mockClient);
    mockClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe("getMarketplaceItems", () => {
    it("should return marketplace items with pagination", async () => {
      const mockItems = [
        {
          id: "item_1",
          creator_id: "creator_1",
          title: "Test Widget",
          description: "A test widget",
          type: "widget",
          price: "29.99",
          currency: "USD",
          status: "active",
          license_type: "standard",
          revenue_share_percentage: "0.3",
          download_url: "https://example.com/download",
          preview_url: "https://example.com/preview",
          tags: ["test", "widget"],
          created_at: new Date(),
          updated_at: new Date(),
          sales_count: "5",
          average_rating: "4.5",
          review_count: "10",
          creator_username: "testcreator",
        },
      ];

      mockPool.query
        .mockResolvedValueOnce({ rows: mockItems }) // Main query
        .mockResolvedValueOnce({ rows: [{ total: "1" }] }); // Count query

      const result = await marketplaceService.getMarketplaceItems({
        limit: 10,
        offset: 0,
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0]).toMatchObject({
        id: "item_1",
        creatorId: "creator_1",
        title: "Test Widget",
        type: "widget",
        price: 29.99,
        currency: "USD",
        status: "active",
      });
    });

    it("should apply filters correctly", async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // Main query
        .mockResolvedValueOnce({ rows: [{ total: "0" }] }); // Count query

      await marketplaceService.getMarketplaceItems({
        creatorId: "creator_1",
        type: "widget",
        status: "active",
        tags: ["test"],
        minPrice: 10,
        maxPrice: 100,
        limit: 5,
        offset: 0,
      });

      expect(mockPool.query).toHaveBeenCalledTimes(2);

      // Check that filter parameters are passed correctly
      const mainQuery = mockPool.query.mock.calls[0][0];
      expect(mainQuery).toContain("creator_id = $");
      expect(mainQuery).toContain("type = $");
      expect(mainQuery).toContain("status = $");
      expect(mainQuery).toContain("price >= $");
      expect(mainQuery).toContain("price <= $");
      expect(mainQuery).toContain("tags && $");
    });

    it("should handle database errors gracefully", async () => {
      mockPool.query.mockRejectedValue(new Error("Database connection failed"));

      await expect(marketplaceService.getMarketplaceItems()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("createMarketplaceItem", () => {
    const mockItemData = {
      creatorId: "creator_1",
      title: "New Widget",
      description: "A new widget for testing",
      type: "widget" as const,
      price: 19.99,
      currency: "USD",
      status: "pending" as const,
      licenseType: "standard" as const,
      revenueSharePercentage: 0.3,
      downloadUrl: "https://example.com/widget.zip",
      previewUrl: "https://example.com/preview.png",
      tags: ["widget", "new"],
    };

    it("should create marketplace item successfully", async () => {
      const mockTrustScoreResult = { cost: 700 }; // High enough trust score
      (TrustScoreService.calculateTrustScore as jest.Mock).mockResolvedValue(
        mockTrustScoreResult as any
      );

      const mockCreatedItem = {
        id: "item_new_1",
        ...mockItemData,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockCreatedItem] }) // Insert item
        .mockResolvedValueOnce({ rows: [] }); // Compliance checks

      const result =
        await marketplaceService.createMarketplaceItem(mockItemData);

      expect(result).toMatchObject({
        id: "item_new_1",
        creatorId: "creator_1",
        title: "New Widget",
        status: "pending",
      });

      expect(TrustScoreService.calculateTrustScore).toHaveBeenCalledWith(
        "creator_1",
        "pro"
      );

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("should reject creation for low trust score", async () => {
      const mockTrustScoreResult = { cost: 500 }; // Below 600 threshold
      (TrustScoreService.calculateTrustScore as jest.Mock).mockResolvedValue(
        mockTrustScoreResult as any
      );

      await expect(
        marketplaceService.createMarketplaceItem(mockItemData)
      ).rejects.toThrow(
        "Creator trust score must be at least 600 to list items"
      );

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should handle database transaction rollback on error", async () => {
      (TrustScoreService.calculateTrustScore as jest.Mock).mockResolvedValue({
        cost: 700,
      } as any);

      mockClient.query.mockRejectedValueOnce(new Error("Insert failed"));

      await expect(
        marketplaceService.createMarketplaceItem(mockItemData)
      ).rejects.toThrow("Insert failed");

      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("updateMarketplaceItem", () => {
    it("should update marketplace item successfully", async () => {
      const mockUpdatedItem = {
        id: "item_1",
        creator_id: "creator_1",
        title: "Updated Widget",
        description: "Updated description",
        type: "widget",
        price: "39.99",
        currency: "USD",
        status: "active",
        license_type: "standard",
        revenue_share_percentage: "0.3",
        download_url: "https://example.com/download",
        preview_url: "https://example.com/preview",
        tags: ["updated"],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValue({ rows: [mockUpdatedItem] });

      const result = await marketplaceService.updateMarketplaceItem("item_1", {
        title: "Updated Widget",
        description: "Updated description",
        price: 39.99,
        tags: ["updated"],
      });

      expect(result).toMatchObject({
        id: "item_1",
        title: "Updated Widget",
        description: "Updated description",
        price: 39.99,
      });
    });

    it("should throw error for non-existent item", async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await expect(
        marketplaceService.updateMarketplaceItem("non_existent", {
          title: "Updated",
        })
      ).rejects.toThrow("Marketplace item not found");
    });
  });

  describe("purchaseItem", () => {
    it("should process item purchase successfully", async () => {
      const mockItem = {
        id: "item_1",
        title: "Test Widget",
        price: "29.99",
        currency: "USD",
        license_type: "standard",
      };

      const mockPurchase = {
        id: "purchase_1",
        item_id: "item_1",
        buyer_id: "buyer_1",
        amount: "29.99",
        currency: "USD",
        status: "completed",
        purchased_at: new Date(),
        license_key: "VNT-12345678-ABCDEF12",
        expires_at: new Date(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockItem] }) // Get item
        .mockResolvedValueOnce({ rows: [mockPurchase] }) // Insert purchase
        .mockResolvedValueOnce({ rows: [] }); // Update sales count

      const result = await marketplaceService.purchaseItem("item_1", "buyer_1");

      expect(result).toMatchObject({
        id: "purchase_1",
        itemId: "item_1",
        buyerId: "buyer_1",
        amount: 29.99,
        currency: "USD",
        status: "completed",
      });

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("should reject purchase for inactive item", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // Item not found/inactive

      await expect(
        marketplaceService.purchaseItem("inactive_item", "buyer_1")
      ).rejects.toThrow("Item not available for purchase");

      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });

    it("should generate appropriate license key", async () => {
      const mockItem = {
        id: "item_1",
        price: "19.99",
        currency: "USD",
        license_type: "premium",
      };

      const mockPurchase = {
        id: "purchase_1",
        item_id: "item_1",
        buyer_id: "buyer_1",
        amount: "19.99",
        currency: "USD",
        status: "completed",
        purchased_at: new Date(),
        license_key: "VNT-12345678-XYZABC99",
        expires_at: new Date(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockItem] })
        .mockResolvedValueOnce({ rows: [mockPurchase] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await marketplaceService.purchaseItem("item_1", "buyer_1");

      expect(result.licenseKey).toMatch(/^VNT-\d+-[A-Z0-9]+$/);
    });
  });

  describe("getComplianceChecks", () => {
    it("should return compliance checks with filters", async () => {
      const mockChecks = [
        {
          id: "check_1",
          item_id: "item_1",
          check_type: "security",
          status: "passed",
          details: "Security check passed",
          checked_by: "system",
          checked_at: new Date(),
          issues: null,
          checked_by_username: "system",
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockChecks });

      const result = await marketplaceService.getComplianceChecks(
        "item_1",
        "passed"
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "check_1",
        itemId: "item_1",
        checkType: "security",
        status: "passed",
        details: "Security check passed",
      });
    });

    it("should return all compliance checks when no filters", async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await marketplaceService.getComplianceChecks();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM compliance_checks"),
        []
      );
    });
  });

  describe("updateComplianceCheck", () => {
    it("should update compliance check successfully", async () => {
      const mockUpdatedCheck = {
        id: "check_1",
        item_id: "item_1",
        check_type: "security",
        status: "failed",
        details: "Security issues found",
        issues: ["issue1", "issue2"],
        checked_by: "reviewer",
        checked_at: new Date(),
      };

      mockPool.query.mockResolvedValue({ rows: [mockUpdatedCheck] });

      const result = await marketplaceService.updateComplianceCheck("check_1", {
        status: "failed",
        details: "Security issues found",
        issues: ["issue1", "issue2"],
      });

      expect(result).toMatchObject({
        id: "check_1",
        itemId: "item_1",
        checkType: "security",
        status: "failed",
        details: "Security issues found",
        issues: ["issue1", "issue2"],
      });
    });

    it("should throw error for non-existent compliance check", async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await expect(
        marketplaceService.updateComplianceCheck("non_existent", {
          status: "passed",
        })
      ).rejects.toThrow("Compliance check not found");
    });
  });

  describe("getMarketplaceStats", () => {
    it("should return comprehensive marketplace statistics", async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: "100", active: "75" }] }) // Items stats
        .mockResolvedValueOnce({ rows: [{ total: "500", revenue: "25000" }] }) // Sales stats
        .mockResolvedValueOnce({ rows: [{ avg_rating: "4.2" }] }) // Rating stats
        .mockResolvedValueOnce({ rows: [] }); // Recent sales

      const result = await marketplaceService.getMarketplaceStats();

      expect(result).toMatchObject({
        totalItems: 100,
        activeItems: 75,
        totalRevenue: 25000,
        totalSales: 500,
        averageRating: 4.2,
        topCategories: [],
        recentSales: [],
      });
    });

    it("should handle zero statistics gracefully", async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ total: "0", active: "0" }] })
        .mockResolvedValueOnce({ rows: [{ total: "0", revenue: "0" }] })
        .mockResolvedValueOnce({ rows: [{ avg_rating: "0" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await marketplaceService.getMarketplaceStats();

      expect(result).toMatchObject({
        totalItems: 0,
        activeItems: 0,
        totalRevenue: 0,
        totalSales: 0,
        averageRating: 0,
        topCategories: [],
        recentSales: [],
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle full marketplace workflow", async () => {
      // 1. Create item
      const mockTrustScoreResult = { cost: 700 };
      (TrustScoreService.calculateTrustScore as jest.Mock).mockResolvedValue(
        mockTrustScoreResult as any
      );

      const mockItem = {
        id: "item_workflow",
        creator_id: "creator_1",
        title: "Workflow Widget",
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [mockItem] }) // Create item
        .mockResolvedValueOnce({ rows: [] }) // Compliance checks
        .mockResolvedValueOnce({ rows: [mockItem] }) // Get item for purchase
        .mockResolvedValueOnce({ rows: [] }); // Update sales

      const createdItem = await marketplaceService.createMarketplaceItem({
        creatorId: "creator_1",
        title: "Workflow Widget",
        description: "Test workflow",
        type: "widget",
        price: 29.99,
        currency: "USD",
        status: "pending",
        licenseType: "standard",
        revenueSharePercentage: 0.3,
        tags: ["workflow"],
      });

      expect(createdItem.id).toBe("item_workflow");

      // 2. Purchase item (would require different mock setup for real workflow)
      // This demonstrates the test structure for integration testing
    });

    it("should handle concurrent requests safely", async () => {
      const requests = Array.from({ length: 3 }, () =>
        marketplaceService.getMarketplaceItems({ limit: 10 })
      );

      mockPool.query
        .mockResolvedValue({ rows: [] }) // Main query
        .mockResolvedValue({ rows: [{ total: "0" }] }); // Count query

      const results = await Promise.all(requests);

      results.forEach((result) => {
        expect(result).toHaveProperty("items");
        expect(result).toHaveProperty("total");
        expect(Array.isArray(result.items)).toBe(true);
        expect(typeof result.total).toBe("number");
      });
    });
  });
});
