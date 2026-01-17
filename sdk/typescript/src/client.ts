import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  ApiConfiguration,
  SuccessResponse,
  ErrorResponse,
  VaunticoApiError,
  RateLimitError,
  GetTrustScoreParams,
  TrustScoreResponse,
  TrustScoreCalculationRequest,
  TrustScoreCalculationResponse,
  GetTrustScoreTrendsParams,
  TrendResponse,
  GetUserFeaturesParams,
  FeaturesResponse,
  GetUserByIdParams,
  User,
  HealthCheck,
} from "./types";

export class VaunticoApiClient {
  private client: AxiosInstance;
  private config: ApiConfiguration;

  constructor(config: ApiConfiguration = {}) {
    this.config = {
      basePath: "https://api.vauntico.com/v1",
      timeout: 30000,
      retries: 3,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.basePath,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "vauntico-sdk-ts/1.0.0",
        ...this.config.headers,
      },
    });

    // Add authentication headers
    if (this.config.apiKey) {
      this.client.defaults.headers.common["X-API-Key"] = this.config.apiKey;
    }

    // Request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleRequestError(error),
    );

    // Request interceptor for retry logic
    this.client.interceptors.request.use(
      (config) => {
        (config as any).metadata = { startTime: new Date() };
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  private handleRequestError(error: any): never {
    if (error.response) {
      const { status, data } = error.response;

      // Handle rate limiting
      if (status === 429) {
        throw new RateLimitError(data);
      }

      // Handle other API errors
      if (data && typeof data === "object" && "error" in data) {
        throw new VaunticoApiError(
          data,
          data.code,
          data.metadata?.correlationId,
        );
      }

      throw new VaunticoApiError(
        { error: data?.message || `HTTP ${status}` },
        "HTTP_ERROR",
        error.response.headers?.["x-correlation-id"],
      );
    } else if (error.request) {
      throw new VaunticoApiError(
        { error: "Network error - no response received" },
        "NETWORK_ERROR",
      );
    } else {
      throw new VaunticoApiError(
        { error: error.message || "Unknown error" },
        "UNKNOWN_ERROR",
      );
    }
  }

  private async makeRequest<T>(
    config: AxiosRequestConfig,
  ): Promise<SuccessResponse<T>> {
    try {
      const response: AxiosResponse<SuccessResponse<T>> =
        await this.client.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user trust score
   */
  async getTrustScore(
    params: GetTrustScoreParams,
  ): Promise<TrustScoreResponse> {
    const response = await this.makeRequest<TrustScoreResponse>({
      method: "GET",
      url: "/dashboard/trustscore",
      params: {
        userId: params.userId,
        includeFactors: params.includeFactors ?? true,
        cache: params.cache ?? true,
      },
    });

    return response.data;
  }

  /**
   * Trigger trust score calculation
   */
  async calculateTrustScore(
    request: TrustScoreCalculationRequest,
  ): Promise<TrustScoreCalculationResponse> {
    const response = await this.makeRequest<TrustScoreCalculationResponse>({
      method: "POST",
      url: "/dashboard/trustscore",
      data: request,
    });

    return response.data;
  }

  /**
   * Get trust score trends
   */
  async getTrustScoreTrends(
    params: GetTrustScoreTrendsParams,
  ): Promise<TrendResponse> {
    const response = await this.makeRequest<TrendResponse>({
      method: "GET",
      url: "/dashboard/trend",
      params: {
        userId: params.userId,
        timeframe: params.timeframe ?? "30d",
        granularity: params.granularity ?? "daily",
        includeBenchmark: params.includeBenchmark ?? true,
      },
    });

    return response.data;
  }

  /**
   * Get user features
   */
  async getUserFeatures(
    params: GetUserFeaturesParams,
  ): Promise<FeaturesResponse> {
    const response = await this.makeRequest<FeaturesResponse>({
      method: "GET",
      url: "/dashboard/features",
      params: {
        userId: params.userId,
        category: params.category,
        status: params.status,
        includeComingSoon: params.includeComingSoon ?? true,
      },
    });

    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest<User>({
      method: "GET",
      url: "/users/me",
    });

    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(params: GetUserByIdParams): Promise<User> {
    const response = await this.makeRequest<User>({
      method: "GET",
      url: `/users/${params.userId}`,
      params: {
        includePrivate: params.includePrivate ?? false,
      },
    });

    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthCheck> {
    const response = await this.makeRequest<HealthCheck>({
      method: "GET",
      url: "/health",
    });

    return response.data;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiConfiguration>): void {
    this.config = { ...this.config, ...newConfig };

    // Update axios instance
    if (newConfig.basePath) {
      this.client.defaults.baseURL = newConfig.basePath;
    }

    if (newConfig.timeout) {
      this.client.defaults.timeout = newConfig.timeout;
    }

    if (newConfig.apiKey) {
      this.client.defaults.headers.common["X-API-Key"] = newConfig.apiKey;
    }

    if (newConfig.headers) {
      this.client.defaults.headers = {
        ...this.client.defaults.headers,
        ...newConfig.headers,
      };
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfiguration {
    return { ...this.config };
  }
}

// Export default instance for convenience
export const createApiClient = (
  config?: ApiConfiguration,
): VaunticoApiClient => {
  return new VaunticoApiClient(config);
};

// Export types
export * from "./types";
