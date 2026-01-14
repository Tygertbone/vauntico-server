import { pool } from "../utils/database";
import logger from "../utils/logger";
import { TrustScoreService } from "./trustScoreService";

export interface MarketplaceItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  type: "widget" | "badge" | "integration" | "template";
  price: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "active" | "inactive";
  licenseType: "standard" | "premium" | "exclusive";
  revenueSharePercentage: number;
  downloadUrl?: string;
  previewUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
}

export interface MarketplacePurchase {
  id: string;
  itemId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "refunded" | "cancelled";
  purchasedAt: Date;
  licenseKey?: string;
  expiresAt?: Date;
  refundReason?: string;
}

export interface ComplianceCheck {
  id: string;
  itemId: string;
  checkType: "security" | "content" | "license" | "performance";
  status: "pending" | "passed" | "failed" | "requires_review";
  details: string;
  checkedBy: string;
  checkedAt: Date;
  issues?: string[];
}

export interface MarketplaceStats {
  totalItems: number;
  activeItems: number;
  totalRevenue: number;
  totalSales: number;
  averageRating: number;
  topCategories: { category: string; count: number }[];
  recentSales: MarketplacePurchase[];
}

class MarketplaceService {
  private readonly REVENUE_SHARE_DEFAULT = 0.3; // 30% default revenue share
  private readonly COMPLIANCE_CHECK_TYPES = [
    "security",
    "content",
    "license",
    "performance",
  ] as const;

  async getMarketplaceItems(filters?: {
    creatorId?: string;
    type?: MarketplaceItem["type"];
    status?: MarketplaceItem["status"];
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MarketplaceItem[]; total: number }> {
    try {
      let query = `
        SELECT mi.*, 
               u.username as creator_username,
               COALESCE(AVG(mp.rating), 0) as average_rating,
               COALESCE(COUNT(mp.id), 0) as review_count
        FROM marketplace_items mi
        JOIN users u ON mi.creator_id = u.id
        LEFT JOIN marketplace_purchases mp ON mi.id = mp.item_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.creatorId) {
        query += ` AND mi.creator_id = $${paramIndex++}`;
        params.push(filters.creatorId);
      }

      if (filters?.type) {
        query += ` AND mi.type = $${paramIndex++}`;
        params.push(filters.type);
      }

      if (filters?.status) {
        query += ` AND mi.status = $${paramIndex++}`;
        params.push(filters.status);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query += ` AND mi.tags && $${paramIndex++}`;
        params.push(filters.tags);
      }

      if (filters?.minPrice) {
        query += ` AND mi.price >= $${paramIndex++}`;
        params.push(filters.minPrice);
      }

      if (filters?.maxPrice) {
        query += ` AND mi.price <= $${paramIndex++}`;
        params.push(filters.maxPrice);
      }

      query += " GROUP BY mi.id, u.username ORDER BY mi.created_at DESC";

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(DISTINCT mi.id) as total
        FROM marketplace_items mi
        WHERE 1=1
      `;
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (filters?.creatorId) {
        countQuery += ` AND mi.creator_id = $${countParamIndex++}`;
        countParams.push(filters.creatorId);
      }

      if (filters?.type) {
        countQuery += ` AND mi.type = $${countParamIndex++}`;
        countParams.push(filters.type);
      }

      if (filters?.status) {
        countQuery += ` AND mi.status = $${countParamIndex++}`;
        countParams.push(filters.status);
      }

      if (filters?.tags && filters.tags.length > 0) {
        countQuery += ` AND mi.tags && $${countParamIndex++}`;
        countParams.push(filters.tags);
      }

      if (filters?.minPrice) {
        countQuery += ` AND mi.price >= $${countParamIndex++}`;
        countParams.push(filters.minPrice);
      }

      if (filters?.maxPrice) {
        countQuery += ` AND mi.price <= $${countParamIndex++}`;
        countParams.push(filters.maxPrice);
      }

      const countResult = await pool.query(countQuery, countParams);

      return {
        items: result.rows.map(this.mapMarketplaceItem),
        total: parseInt(countResult.rows[0].total),
      };
    } catch (error) {
      logger.error("Error fetching marketplace items:", error);
      throw error;
    }
  }

  async createMarketplaceItem(
    itemData: Omit<
      MarketplaceItem,
      "id" | "createdAt" | "updatedAt" | "salesCount" | "rating" | "reviewCount"
    >,
  ): Promise<MarketplaceItem> {
    try {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Validate creator trust score
        const trustScoreResult = await TrustScoreService.calculateTrustScore(
          itemData.creatorId,
          "pro",
        );
        const trustScore = trustScoreResult.cost; // Use cost as proxy for trust score

        if (trustScore < 600) {
          throw new Error(
            "Creator trust score must be at least 600 to list items",
          );
        }

        const id = this.generateId();
        const query = `
          INSERT INTO marketplace_items (
            id, creator_id, title, description, type, price, currency,
            status, license_type, revenue_share_percentage, download_url,
            preview_url, tags, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          RETURNING *
        `;

        const values = [
          id,
          itemData.creatorId,
          itemData.title,
          itemData.description,
          itemData.type,
          itemData.price,
          itemData.currency || "USD",
          "pending", // All items start as pending
          itemData.licenseType || "standard",
          itemData.revenueSharePercentage || this.REVENUE_SHARE_DEFAULT,
          itemData.downloadUrl,
          itemData.previewUrl,
          itemData.tags || [],
        ];

        const result = await client.query(query, values);

        // Initiate compliance checks
        await this.initiateComplianceChecks(client, id);

        await client.query("COMMIT");

        return this.mapMarketplaceItem(result.rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error("Error creating marketplace item:", error);
      throw error;
    }
  }

  async updateMarketplaceItem(
    id: string,
    updates: Partial<MarketplaceItem>,
  ): Promise<MarketplaceItem> {
    try {
      const query = `
        UPDATE marketplace_items 
        SET title = COALESCE($2, title),
            description = COALESCE($3, description),
            price = COALESCE($4, price),
            currency = COALESCE($5, currency),
            license_type = COALESCE($6, license_type),
            revenue_share_percentage = COALESCE($7, revenue_share_percentage),
            download_url = COALESCE($8, download_url),
            preview_url = COALESCE($9, preview_url),
            tags = COALESCE($10, tags),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id,
        updates.title,
        updates.description,
        updates.price,
        updates.currency,
        updates.licenseType,
        updates.revenueSharePercentage,
        updates.downloadUrl,
        updates.previewUrl,
        updates.tags,
      ];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Marketplace item not found");
      }

      return this.mapMarketplaceItem(result.rows[0]);
    } catch (error) {
      logger.error("Error updating marketplace item:", error);
      throw error;
    }
  }

  async purchaseItem(
    itemId: string,
    buyerId: string,
  ): Promise<MarketplacePurchase> {
    try {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Check if item is available and active
        const itemCheck = await client.query(
          "SELECT * FROM marketplace_items WHERE id = $1 AND status = $2",
          [itemId, "active"],
        );

        if (itemCheck.rows.length === 0) {
          throw new Error("Item not available for purchase");
        }

        const item = itemCheck.rows[0];
        const purchaseId = this.generateId();
        const licenseKey = this.generateLicenseKey();

        const query = `
          INSERT INTO marketplace_purchases (
            id, item_id, buyer_id, amount, currency, status,
            purchased_at, license_key, expires_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
          RETURNING *
        `;

        // Calculate expiry based on license type
        const expiresAt = new Date();
        const durationMonths =
          {
            standard: 12,
            premium: 24,
            exclusive: 36,
          }[item.license_type] || 12;
        expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

        const values = [
          purchaseId,
          itemId,
          buyerId,
          item.price,
          item.currency,
          "completed",
          licenseKey,
          expiresAt,
        ];

        const result = await client.query(query, values);

        // Update sales count for the item
        await client.query(
          "UPDATE marketplace_items SET sales_count = COALESCE(sales_count, 0) + 1 WHERE id = $1",
          [itemId],
        );

        // Award credits to buyer
        await this.awardCredits(
          client,
          buyerId,
          Math.floor(item.price * 0.1), // 10% of purchase price as credits
          "marketplace_purchase",
          purchaseId,
        );

        await client.query("COMMIT");

        return this.mapMarketplacePurchase(result.rows[0]);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error("Error purchasing item:", error);
      throw error;
    }
  }

  async getComplianceChecks(
    itemId?: string,
    status?: ComplianceCheck["status"],
  ): Promise<ComplianceCheck[]> {
    try {
      let query = `
        SELECT cc.*, u.username as checked_by_username
        FROM compliance_checks cc
        JOIN users u ON cc.checked_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (itemId) {
        query += ` AND cc.item_id = $${paramIndex++}`;
        params.push(itemId);
      }

      if (status) {
        query += ` AND cc.status = $${paramIndex++}`;
        params.push(status);
      }

      query += " ORDER BY cc.checked_at DESC";

      const result = await pool.query(query, params);
      return result.rows.map(this.mapComplianceCheck);
    } catch (error) {
      logger.error("Error fetching compliance checks:", error);
      throw error;
    }
  }

  async updateComplianceCheck(
    checkId: string,
    updates: Partial<ComplianceCheck>,
  ): Promise<ComplianceCheck> {
    try {
      const query = `
        UPDATE compliance_checks 
        SET status = COALESCE($2, status),
            details = COALESCE($3, details),
            issues = COALESCE($4, issues),
            checked_at = CASE WHEN $2 IS NOT NULL THEN NOW() ELSE checked_at END
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        checkId,
        updates.status,
        updates.details,
        updates.issues ? JSON.stringify(updates.issues) : null,
      ];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Compliance check not found");
      }

      return this.mapComplianceCheck(result.rows[0]);
    } catch (error) {
      logger.error("Error updating compliance check:", error);
      throw error;
    }
  }

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const [itemsResult, salesResult] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) as total, COUNT(CASE WHEN status = $1 THEN 1 END) as active FROM marketplace_items",
          ["active"],
        ),
        pool.query(
          "SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as revenue FROM marketplace_purchases WHERE status = $1",
          ["completed"],
        ),
      ]);

      const avgRatingResult = await pool.query(
        "SELECT COALESCE(AVG(rating), 0) as avg_rating FROM marketplace_purchases WHERE rating IS NOT NULL",
      );

      // Get recent sales
      const recentSalesResult = await pool.query(
        `
        SELECT mp.*, mi.title as item_title, u.username as buyer_username
        FROM marketplace_purchases mp
        JOIN marketplace_items mi ON mp.item_id = mi.id
        JOIN users u ON mp.buyer_id = u.id
        WHERE mp.status = $1
        ORDER BY mp.purchased_at DESC
        LIMIT 10
      `,
        ["completed"],
      );

      return {
        totalItems: parseInt(itemsResult.rows[0].total),
        activeItems: parseInt(itemsResult.rows[0].active),
        totalRevenue: parseFloat(salesResult.rows[0].revenue),
        totalSales: parseInt(salesResult.rows[0].total),
        averageRating: parseFloat(avgRatingResult.rows[0].avg_rating),
        topCategories: [], // Would need to implement category tracking
        recentSales: recentSalesResult.rows.map(this.mapMarketplacePurchase),
      };
    } catch (error) {
      logger.error("Error fetching marketplace stats:", error);
      throw error;
    }
  }

  private async initiateComplianceChecks(
    client: any,
    itemId: string,
  ): Promise<void> {
    for (const checkType of this.COMPLIANCE_CHECK_TYPES) {
      const checkId = this.generateId();
      await client.query(
        `
        INSERT INTO compliance_checks (id, item_id, check_type, status, checked_by, checked_at)
        VALUES ($1, $2, $3, $4, NOW())
      `,
        [checkId, itemId, checkType, "pending", "system"],
      );
    }
  }

  private async awardCredits(
    client: any,
    userId: string,
    amount: number,
    source: string,
    referenceId: string,
  ): Promise<void> {
    const creditId = this.generateId();
    await client.query(
      `
      INSERT INTO vauntico_credits (id, user_id, amount, source, reference_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `,
      [creditId, userId, amount, source, referenceId],
    );
  }

  private generateLicenseKey(): string {
    return `VNT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  private mapMarketplaceItem(row: any): MarketplaceItem {
    return {
      id: row.id,
      creatorId: row.creator_id,
      title: row.title,
      description: row.description,
      type: row.type,
      price: parseFloat(row.price),
      currency: row.currency,
      status: row.status,
      licenseType: row.license_type,
      revenueSharePercentage: parseFloat(row.revenue_share_percentage),
      downloadUrl: row.download_url,
      previewUrl: row.preview_url,
      tags: row.tags || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      salesCount: parseInt(row.sales_count) || 0,
      rating: parseFloat(row.average_rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
    };
  }

  private mapMarketplacePurchase(row: any): MarketplacePurchase {
    return {
      id: row.id,
      itemId: row.item_id,
      buyerId: row.buyer_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      purchasedAt: row.purchased_at,
      licenseKey: row.license_key,
      expiresAt: row.expires_at,
      refundReason: row.refund_reason,
    };
  }

  private mapComplianceCheck(row: any): ComplianceCheck {
    return {
      id: row.id,
      itemId: row.item_id,
      checkType: row.check_type,
      status: row.status,
      details: row.details,
      checkedBy: row.checked_by,
      checkedAt: row.checked_at,
      issues: row.issues ? JSON.parse(row.issues) : undefined,
    };
  }

  private generateId(): string {
    return `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const marketplaceService = new MarketplaceService();
