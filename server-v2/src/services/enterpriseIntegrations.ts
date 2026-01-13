import axios from "axios";
import {
  enterpriseComplianceManager,
  ComplianceFramework,
} from "../middleware/enterprise-compliance";

// Enterprise Integration Service
// Handles Slack notifications, Notion dashboards, and webhook systems for enterprise partners

export interface SlackNotification {
  type:
    | "trust_score_update"
    | "compliance_alert"
    | "kpi_milestone"
    | "security_incident"
    | "integration_status";
  userId?: string;
  organization?: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface NotionKPIData {
  organization: string;
  trustScore: number;
  complianceScore: number;
  kpiMetrics: {
    mrr: number;
    activeUsers: number;
    integrationUsage: number;
    complianceAdherence: number;
  };
  timestamp: Date;
  trends: {
    trustScoreChange: number;
    complianceScoreChange: number;
    mrrGrowth: number;
  };
}

export interface WebhookSubscription {
  id: string;
  organizationId: string;
  endpoint: string;
  secret: string;
  events: string[];
  active: boolean;
  retryCount: number;
  lastDelivery?: Date;
  createdAt: Date;
}

export interface WebhookPayload {
  id: string;
  event: string;
  timestamp: Date;
  organization: string;
  data: any;
  signature: string;
}

export class EnterpriseIntegrationService {
  private static instance: EnterpriseIntegrationService;
  private webhookSubscriptions: Map<string, WebhookSubscription> = new Map();
  private slackWebhookUrl?: string;
  private notionToken?: string;
  private notionDatabaseId?: string;

  private constructor() {
    this.initializeIntegrations();
  }

  static getInstance(): EnterpriseIntegrationService {
    if (!EnterpriseIntegrationService.instance) {
      EnterpriseIntegrationService.instance =
        new EnterpriseIntegrationService();
    }
    return EnterpriseIntegrationService.instance;
  }

  private initializeIntegrations(): void {
    this.slackWebhookUrl = process.env.SLACK_ENTERPRISE_WEBHOOK_URL;
    this.notionToken = process.env.NOTION_API_TOKEN;
    this.notionDatabaseId = process.env.NOTION_KPI_DATABASE_ID;
  }

  // Slack Integration
  async sendSlackNotification(
    notification: SlackNotification,
  ): Promise<boolean> {
    try {
      if (!this.slackWebhookUrl) {
        console.warn("Slack webhook URL not configured");
        return false;
      }

      const colorMap = {
        info: "#36a64f",
        warning: "#ff9500",
        error: "#ff0000",
        critical: "#8b0000",
      };

      const payload = {
        attachments: [
          {
            color: colorMap[notification.severity],
            title: `🏢 Vauntico Enterprise: ${notification.title}`,
            text: notification.message,
            fields: [
              {
                title: "Organization",
                value: notification.organization || "N/A",
                short: true,
              },
              {
                title: "Severity",
                value: notification.severity.toUpperCase(),
                short: true,
              },
              {
                title: "Type",
                value: notification.type.replace("_", " ").toUpperCase(),
                short: true,
              },
              {
                title: "Timestamp",
                value:
                  notification.timestamp?.toISOString() ||
                  new Date().toISOString(),
                short: true,
              },
            ],
            footer: "Vauntico Enterprise Platform",
            ts: Math.floor(
              (notification.timestamp?.getTime() || Date.now()) / 1000,
            ),
          },
        ],
      };

      if (notification.metadata) {
        payload.attachments[0].fields.push({
          title: "Additional Details",
          value:
            "```json\n" +
            JSON.stringify(notification.metadata, null, 2) +
            "\n```",
          short: false,
        });
      }

      const response = await axios.post(this.slackWebhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        // Log successful Slack notification
        enterpriseComplianceManager.logComplianceEvent({
          userId: notification.userId,
          ipAddress: "system",
          userAgent: "enterprise-integration-service",
          framework: ComplianceFramework.POPIA,
          dataCategory: "communication" as any,
          processingPurpose: "legitimate_interests" as any,
          action: "share",
          dataSubject: notification.userId || "system",
          riskLevel: "low",
          metadata: {
            integration: "slack",
            notificationType: notification.type,
            severity: notification.severity,
          },
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      return false;
    }
  }

  // Notion Integration
  async updateNotionKPIDashboard(kpiData: NotionKPIData): Promise<boolean> {
    try {
      if (!this.notionToken || !this.notionDatabaseId) {
        console.warn("Notion integration not configured");
        return false;
      }

      // Create new page in Notion database
      const pageData = {
        parent: {
          database_id: this.notionDatabaseId,
        },
        properties: {
          Organization: {
            title: [
              {
                text: {
                  content: kpiData.organization,
                },
              },
            ],
          },
          "Trust Score": {
            number: kpiData.trustScore,
          },
          "Compliance Score": {
            number: kpiData.complianceScore,
          },
          MRR: {
            number: kpiData.kpiMetrics.mrr,
          },
          "Active Users": {
            number: kpiData.kpiMetrics.activeUsers,
          },
          "Integration Usage": {
            number: kpiData.kpiMetrics.integrationUsage,
          },
          "Compliance Adherence": {
            number: kpiData.kpiMetrics.complianceAdherence,
          },
          "Trust Score Change": {
            number: kpiData.trends.trustScoreChange,
          },
          "Compliance Score Change": {
            number: kpiData.trends.complianceScoreChange,
          },
          "MRR Growth": {
            number: kpiData.trends.mrrGrowth,
          },
          "Last Updated": {
            date: {
              start: kpiData.timestamp.toISOString(),
            },
          },
        },
        children: [
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              text: [
                {
                  type: "text",
                  text: {
                    content: "📊 Enterprise KPI Summary",
                  },
                },
              ],
            },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              text: [
                {
                  type: "text",
                  text: {
                    content: `Organization: ${kpiData.organization}\nTrust Score: ${kpiData.trustScore}\nCompliance Score: ${kpiData.complianceScore}\nMRR: $${kpiData.kpiMetrics.mrr.toLocaleString()}\nActive Users: ${kpiData.kpiMetrics.activeUsers.toLocaleString()}\nIntegration Usage: ${kpiData.kpiMetrics.integrationUsage}%\nCompliance Adherence: ${kpiData.kpiMetrics.complianceAdherence}%`,
                  },
                },
              ],
            },
          },
        ],
      };

      const response = await axios.post(
        "https://api.notion.com/v1/pages",
        pageData,
        {
          headers: {
            Authorization: `Bearer ${this.notionToken}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          timeout: 15000,
        },
      );

      if (response.status === 200) {
        // Log successful Notion update
        enterpriseComplianceManager.logComplianceEvent({
          ipAddress: "system",
          userAgent: "enterprise-integration-service",
          framework: ComplianceFramework.POPIA,
          dataCategory: "financial" as any,
          processingPurpose: "contractual" as any,
          action: "store",
          dataSubject: kpiData.organization,
          riskLevel: "medium",
          metadata: {
            integration: "notion",
            organization: kpiData.organization,
            trustScore: kpiData.trustScore,
            complianceScore: kpiData.complianceScore,
          },
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to update Notion KPI dashboard:", error);
      return false;
    }
  }

  // Webhook System
  async createWebhookSubscription(
    subscription: Omit<WebhookSubscription, "id" | "createdAt" | "retryCount">,
  ): Promise<string> {
    const id = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullSubscription: WebhookSubscription = {
      ...subscription,
      id,
      createdAt: new Date(),
      retryCount: 0,
    };

    this.webhookSubscriptions.set(id, fullSubscription);

    // Log webhook subscription creation
    enterpriseComplianceManager.logComplianceEvent({
      ipAddress: "system",
      userAgent: "enterprise-integration-service",
      framework: ComplianceFramework.POPIA,
      dataCategory: "personal_identifiable" as any,
      processingPurpose: "consent" as any,
      action: "store",
      dataSubject: subscription.organizationId,
      riskLevel: "medium",
      metadata: {
        webhookId: id,
        endpoint: subscription.endpoint,
        events: subscription.events,
      },
    });

    return id;
  }

  async deliverWebhook(
    event: string,
    organization: string,
    data: any,
  ): Promise<void> {
    const relevantSubscriptions = Array.from(
      this.webhookSubscriptions.values(),
    ).filter(
      (sub) =>
        sub.active &&
        sub.organizationId === organization &&
        sub.events.includes(event),
    );

    for (const subscription of relevantSubscriptions) {
      try {
        const payload: WebhookPayload = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event,
          timestamp: new Date(),
          organization,
          data,
          signature: this.generateSignature(data, subscription.secret),
        };

        await axios.post(subscription.endpoint, payload, {
          headers: {
            "Content-Type": "application/json",
            "X-Vauntico-Signature": payload.signature,
            "X-Vauntico-Event": event,
          },
          timeout: 10000,
        });

        // Reset retry count on successful delivery
        subscription.retryCount = 0;
        subscription.lastDelivery = new Date();
      } catch (error) {
        console.error(
          `Failed to deliver webhook to ${subscription.endpoint}:`,
          error,
        );
        subscription.retryCount++;

        // Disable subscription after 3 failed attempts
        if (subscription.retryCount >= 3) {
          subscription.active = false;
          await this.sendSlackNotification({
            type: "integration_status",
            organization,
            severity: "warning",
            title: "Webhook Subscription Disabled",
            message: `Webhook subscription for ${subscription.endpoint} has been disabled after 3 failed delivery attempts.`,
            metadata: {
              webhookId: subscription.id,
              endpoint: subscription.endpoint,
              retryCount: subscription.retryCount,
            },
          });
        }
      }
    }
  }

  private generateSignature(data: any, secret: string): string {
    const crypto = require("crypto");
    const payload = JSON.stringify(data);
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  // Integration Health Check
  async checkIntegrationHealth(): Promise<{
    slack: boolean;
    notion: boolean;
    webhooks: { active: number; total: number; deliveryRate: number };
  }> {
    const slackHealthy = this.slackWebhookUrl ? true : false;
    const notionHealthy =
      this.notionToken && this.notionDatabaseId ? true : false;

    const webhookSubscriptions = Array.from(this.webhookSubscriptions.values());
    const activeWebhooks = webhookSubscriptions.filter(
      (sub) => sub.active,
    ).length;
    const totalWebhooks = webhookSubscriptions.length;

    // Calculate delivery rate (webhooks delivered in last 24h / total attempts)
    const recentDeliveries = webhookSubscriptions.filter(
      (sub) =>
        sub.lastDelivery &&
        sub.lastDelivery > new Date(Date.now() - 24 * 60 * 60 * 1000),
    ).length;

    const deliveryRate =
      totalWebhooks > 0 ? (recentDeliveries / totalWebhooks) * 100 : 0;

    return {
      slack: slackHealthy,
      notion: notionHealthy,
      webhooks: {
        active: activeWebhooks,
        total: totalWebhooks,
        deliveryRate,
      },
    };
  }

  // Get integration statistics
  getIntegrationStats(): {
    slackNotifications: { today: number; thisWeek: number; thisMonth: number };
    notionUpdates: { today: number; thisWeek: number; thisMonth: number };
    webhookDeliveries: { successful: number; failed: number; pending: number };
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(
      today.getTime() - today.getDay() * 24 * 60 * 60 * 1000,
    );
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // These would normally be tracked in a database
    // For now, return mock data
    return {
      slackNotifications: {
        today: 12,
        thisWeek: 45,
        thisMonth: 180,
      },
      notionUpdates: {
        today: 3,
        thisWeek: 15,
        thisMonth: 60,
      },
      webhookDeliveries: {
        successful: 245,
        failed: 3,
        pending: 7,
      },
    };
  }
}

export const enterpriseIntegrationService =
  EnterpriseIntegrationService.getInstance();
