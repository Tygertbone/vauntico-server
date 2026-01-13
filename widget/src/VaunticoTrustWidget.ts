/**
 * Vauntico Trust Score Widget - Phase 2 White Label Solution
 * Embeddable widget for displaying trust scores with customizable branding
 */

export interface WidgetConfig {
  apiKey: string;
  userId: string;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  fontFamily?: string;
  showLogo?: boolean;
  showDetails?: boolean;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: boolean;
  refreshInterval?: number;
  onScoreUpdate?: (score: TrustScoreData) => void;
  onError?: (error: Error) => void;
}

export interface TrustScoreData {
  score: number;
  tier: string;
  factors: Record<string, any>;
  calculatedAt: string;
  expiresAt: string;
  monetization: {
    tier: string;
    creditsRemaining?: number;
    nextCalculationCost?: number;
  };
  metadata: {
    version: string;
    endpoint: string;
    rateLimitRemaining?: number;
  };
}

export interface WidgetStyles {
  container: React.CSSProperties;
  score: React.CSSProperties;
  tier: React.CSSProperties;
  details: React.CSSProperties;
  loading: React.CSSProperties;
  error: React.CSSProperties;
}

class VaunticoTrustWidget {
  private container: HTMLElement;
  private config: Required<WidgetConfig>;
  private currentScore: TrustScoreData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isLoading = false;

  constructor(container: HTMLElement, config: WidgetConfig) {
    this.container = container;
    this.config = this.mergeConfig(config);
    this.init();
  }

  private mergeConfig(config: WidgetConfig): Required<WidgetConfig> {
    return {
      apiKey: config.apiKey,
      userId: config.userId,
      theme: config.theme || "light",
      primaryColor: config.primaryColor || "#007bff",
      fontFamily:
        config.fontFamily ||
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      showLogo: config.showLogo !== false,
      showDetails: config.showDetails !== false,
      width: config.width || "300px",
      height: config.height || "auto",
      borderRadius: config.borderRadius || "8px",
      animation: config.animation !== false,
      refreshInterval: config.refreshInterval || 300000, // 5 minutes
      onScoreUpdate: config.onScoreUpdate || (() => {}),
      onError: config.onError || (() => {}),
    };
  }

  private init(): void {
    this.setupStyles();
    this.render();
    this.loadTrustScore();
    this.startAutoRefresh();
  }

  private setupStyles(): void {
    const styleId = "vauntico-widget-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = this.getWidgetCSS();
      document.head.appendChild(style);
    }
  }

  private getWidgetCSS(): string {
    const { primaryColor, fontFamily, borderRadius, animation } = this.config;

    return `
      .vauntico-widget {
        font-family: ${fontFamily};
        border-radius: ${borderRadius};
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .vauntico-widget:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      .vauntico-widget.light {
        background: #ffffff;
        color: #333333;
        border: 1px solid #e1e5e9;
      }
      
      .vauntico-widget.dark {
        background: #1a1a1a;
        color: #ffffff;
        border: 1px solid #333333;
      }
      
      .vauntico-widget.auto {
        background: var(--vauntico-bg, #ffffff);
        color: var(--vauntico-color, #333333);
        border: 1px solid var(--vauntico-border, #e1e5e9);
      }
      
      .vauntico-widget-header {
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .vauntico-widget-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
      }
      
      .vauntico-widget-logo svg {
        width: 20px;
        height: 20px;
      }
      
      .vauntico-widget-content {
        padding: 20px;
      }
      
      .vauntico-score-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      
      .vauntico-score-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        position: relative;
        background: conic-gradient(${primaryColor} 0deg, ${primaryColor} var(--score-deg, 180deg), #e0e0e0 var(--score-deg, 180deg));
        ${animation ? "animation: pulse 2s infinite;" : ""}
      }
      
      .vauntico-score-circle::before {
        content: '';
        position: absolute;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: inherit;
        background: inherit;
        background-clip: padding-box;
        border: 5px solid;
        border-color: inherit;
        border-color: ${document.querySelector(".vauntico-widget.light") ? "#ffffff" : "#1a1a1a"};
      }
      
      .vauntico-score-value {
        position: relative;
        z-index: 1;
        color: ${document.querySelector(".vauntico-widget.dark") ? "#ffffff" : "#333333"};
      }
      
      .vauntico-tier-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 12px;
        background: ${primaryColor};
        color: white;
      }
      
      .vauntico-factors {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .vauntico-factor {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .vauntico-factor-bar {
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
      }
      
      .vauntico-factor-fill {
        height: 100%;
        background: ${primaryColor};
        transition: width 0.3s ease;
      }
      
      .vauntico-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #666;
      }
      
      .vauntico-loading::after {
        content: '';
        width: 20px;
        height: 20px;
        border: 2px solid #e0e0e0;
        border-top: 2px solid ${primaryColor};
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 10px;
      }
      
      .vauntico-error {
        padding: 20px;
        text-align: center;
        color: #dc3545;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        margin: 10px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @media (max-width: 768px) {
        .vauntico-widget {
          width: 100% !important;
        }
        
        .vauntico-score-circle {
          width: 60px;
          height: 60px;
          font-size: 18px;
        }
        
        .vauntico-score-circle::before {
          width: 50px;
          height: 50px;
          border-width: 4px;
        }
      }
    `;
  }

  private async loadTrustScore(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.renderLoading();

    try {
      const response = await fetch(
        `/api/v1/trust-score?userId=${encodeURIComponent(this.config.userId)}`,
        {
          headers: {
            "X-API-Key": this.config.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TrustScoreData = await response.json();
      this.currentScore = data;
      this.renderScore(data);
      this.config.onScoreUpdate(data);

      // Track widget usage as KPI metric
      this.trackWidgetUsage("load", data);
    } catch (error) {
      console.error("Vauntico Widget Error:", error);
      this.config.onError(
        error instanceof Error ? error : new Error("Unknown error"),
      );
      this.renderError(
        error instanceof Error
          ? error
          : new Error("Failed to load trust score"),
      );

      // Track widget errors as KPI metric
      this.trackWidgetUsage("error", null);
    } finally {
      this.isLoading = false;
    }
  }

  private trackWidgetUsage(action: string, data: TrustScoreData | null): void {
    // Send usage data to KPI tracking endpoint
    fetch("/api/v1/metrics/widget-usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.config.apiKey,
      },
      body: JSON.stringify({
        action,
        userId: this.config.userId,
        tier: data?.tier || "unknown",
        score: data?.score || 0,
        widgetConfig: {
          theme: this.config.theme,
          showLogo: this.config.showLogo,
          showDetails: this.config.showDetails,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.warn("Failed to track widget usage:", err);
    });
  }

  private render(): void {
    const container = document.createElement("div");
    container.className = `vauntico-widget ${this.config.theme}`;
    container.style.width = this.config.width;
    container.style.height = this.config.height;

    this.container.innerHTML = "";
    this.container.appendChild(container);
  }

  private renderLoading(): void {
    const content = this.container.querySelector(".vauntico-widget");
    if (!content) return;

    content.innerHTML = `
      <div class="vauntico-loading">
        Loading trust score...
      </div>
    `;
  }

  private renderScore(data: TrustScoreData): void {
    const content = this.container.querySelector(".vauntico-widget");
    if (!content) return;

    const scoreDegrees = (data.score / 100) * 360;
    const tierColors = {
      basic: "#28a745",
      pro: "#007bff",
      enterprise: "#6f42c1",
    };

    content.innerHTML = `
      ${
        this.config.showLogo
          ? `
        <div class="vauntico-widget-header">
          <div class="vauntico-widget-logo">
            <svg viewBox="0 0 24 24" fill="${this.config.primaryColor}">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            Vauntico Trust
          </div>
        </div>
      `
          : ""
      }
      <div class="vauntico-widget-content">
        <div class="vauntico-tier-badge">${data.tier}</div>
        <div class="vauntico-score-container">
          <div class="vauntico-score-circle" style="--score-deg: ${scoreDegrees}deg; background: conic-gradient(${tierColors[data.tier as keyof typeof tierColors] || this.config.primaryColor} 0deg, ${tierColors[data.tier as keyof typeof tierColors] || this.config.primaryColor} ${scoreDegrees}deg, #e0e0e0 ${scoreDegrees}deg);">
            <div class="vauntico-score-value">${data.score}</div>
          </div>
        </div>
        
        ${
          this.config.showDetails && data.factors
            ? `
          <div class="vauntico-factors">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Trust Factors</h4>
            ${Object.entries(data.factors)
              .map(
                ([key, value]) => `
              <div class="vauntico-factor">
                <span style="text-transform: capitalize; font-size: 12px;">${key.replace(/_/g, " ")}</span>
                <span style="font-weight: 600; font-size: 12px;">${typeof value === "number" ? Math.round(value) : value}</span>
              </div>
              ${
                typeof value === "number"
                  ? `
                <div class="vauntico-factor-bar">
                  <div class="vauntico-factor-fill" style="width: ${Math.min(value, 100)}%; background: ${tierColors[data.tier as keyof typeof tierColors] || this.config.primaryColor};"></div>
                </div>
              `
                  : ""
              }
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        <div style="margin-top: 16px; font-size: 11px; color: #666; text-align: center;">
          Last updated: ${new Date(data.calculatedAt).toLocaleDateString()}
        </div>
      </div>
    `;
  }

  private renderError(error: Error): void {
    const content = this.container.querySelector(".vauntico-widget");
    if (!content) return;

    content.innerHTML = `
      <div class="vauntico-error">
        <strong>Unable to load trust score</strong>
        <div style="font-size: 14px; margin-top: 8px;">${error.message}</div>
        <button 
          onclick="window.vaunticoWidgetRetry()" 
          style="margin-top: 12px; padding: 8px 16px; background: ${this.config.primaryColor}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
        >
          Retry
        </button>
      </div>
    `;

    // Make retry function globally available
    (window as any).vaunticoWidgetRetry = () => {
      this.loadTrustScore();
    };
  }

  private startAutoRefresh(): void {
    if (this.config.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.loadTrustScore();
      }, this.config.refreshInterval);
    }
  }

  public destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (this.container) {
      this.container.innerHTML = "";
    }

    // Clean up global retry function
    delete (window as any).vaunticoWidgetRetry;
  }

  public updateConfig(newConfig: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.render();
    if (this.currentScore) {
      this.renderScore(this.currentScore);
    } else {
      this.loadTrustScore();
    }
  }

  public getScore(): TrustScoreData | null {
    return this.currentScore;
  }

  public refresh(): void {
    this.loadTrustScore();
  }
}

// Global factory function for easy initialization
(window as any).VaunticoTrustWidget = VaunticoTrustWidget;

// TypeScript declarations for global use
declare global {
  interface Window {
    VaunticoTrustWidget: typeof VaunticoTrustWidget;
    vaunticoWidgetRetry?: () => void;
  }
}

export default VaunticoTrustWidget;
