import type { Request, Response, NextFunction } from "express";

/**
 * Route Alias DTO Interface
 */
interface RouteAliasDTO {
  alias: string;
  target: string;
}

/**
 * Extended Request interface for route alias metadata
 */
interface AugmentedRequest extends Request {
  routeAlias?: {
    enterpriseRoute: string;
    sacredRoute: string;
    aliasType: string;
  };
}

/**
 * Route Alias Middleware
 * Maps enterprise route names to sacred feature route names
 */
export const routeAliasMiddleware = (
  req: AugmentedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Define route alias mappings
  const routeAliases: Record<string, string> = {
    // Trust Lineage → Legacy Tree
    "/api/v1/trust-lineage": "/api/v1/trust-score",
    "/api/v1/trust-lineage/:userId": "/api/v1/trust-score/:userId",
    "/api/v1/trust-lineage/:userId/history":
      "/api/v1/trust-score/:userId/history",

    // Credibility Circles → Love Loops
    "/api/v1/credibility-circles": "/api/v1/love-loops",
    "/api/v1/credibility-circles/:userId": "/api/v1/love-loops/:userId",

    // Narrative Engine → Lore Generator
    "/api/v1/narrative-engine": "/api/v1/lore-generator",
    "/api/v1/narrative-engine/:userId": "/api/v1/lore-generator/:userId",

    // Community Resonance → Ubuntu Echo
    "/api/v1/community-resonance": "/api/v1/ubuntu-echo",
    "/api/v1/community-resonance/:userId": "/api/v1/ubuntu-echo/:userId",
  };

  try {
    // Check if current path matches any alias
    const originalPath: string = req.path;
    const matchedAlias: string | undefined = Object.keys(routeAliases).find(
      (alias: string) => {
        // Convert alias to regex pattern
        const aliasPattern: string = alias.replace(/:(\w+)/g, "([^/]+)");
        const regex: RegExp = new RegExp(`^${aliasPattern}$`);
        return regex.test(originalPath);
      }
    );

    if (matchedAlias) {
      // Replace the path with the actual route
      const actualRoute: string = routeAliases[matchedAlias];
      req.url = req.url.replace(matchedAlias, actualRoute);

      // Add metadata for analytics tracking with proper typing
      req.routeAlias = {
        enterpriseRoute: matchedAlias,
        sacredRoute: actualRoute,
        aliasType: "enterprise-to-sacred",
      };
    }
  } catch (error) {
    // Log error but continue with request processing
    console.error(
      "Route alias middleware error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  // Continue to the actual route handler
  next();
};

/**
 * Analytics tracking for route aliases
 */
export const trackRouteAliasUsage = (
  req: AugmentedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (req.routeAlias) {
      const { enterpriseRoute, sacredRoute } = req.routeAlias;
      console.log(`Route Alias Used: ${enterpriseRoute} → ${sacredRoute}`);
      // In a real implementation, this would log to analytics service
    }
  } catch (error) {
    // Log error but continue with request processing
    console.error(
      "Route alias tracking error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  next();
};

/**
 * Type-safe route alias resolution utility
 */
export const resolveRouteAlias = (
  alias: string,
  aliasMap: Record<string, string>
): string | null => {
  try {
    return aliasMap[alias] || null;
  } catch (error) {
    console.error(
      "Route resolution error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
};

/**
 * Validate route alias DTO
 */
export const validateRouteAlias = (routeAlias: RouteAliasDTO): boolean => {
  return !!(
    routeAlias?.alias &&
    routeAlias?.target &&
    typeof routeAlias.alias === "string" &&
    typeof routeAlias.target === "string"
  );
};
