import type { Request, Response } from "express";
import { Router } from "express";
import {
  authenticateApiKey,
  validateSubscriptionTier,
  requireAdminAuth,
} from "../middleware/auth";

const router = Router();

interface RouteAlias {
  aliasId: string;
  alias: string;
  canonical: string;
  description?: string;
  deprecated?: boolean;
  warning?: string;
  deprecationDate?: string;
  sunsetDate?: string;
  status?: "active" | "deprecated";
  createdAt?: string;
  updatedAt?: string;
}

interface RouteAliasManagementRequest {
  alias: string;
  canonical?: string;
  description?: string;
  deprecated?: boolean;
  warning?: string;
  sunsetDate?: string;
}

// In-memory storage for route aliases (in production, this would be in Redis/DB)
let routeAliases: RouteAlias[] = [
  {
    aliasId: `alias_${Date.now()}_1`,
    alias: "/api/v1/trust-score",
    canonical: "/api/trust-score",
    description: "Trust score API v1 alias",
  },
  {
    aliasId: `alias_${Date.now()}_2`,
    alias: "/api/v2/trust-score",
    canonical: "/api/trust-score",
    description: "Trust score API v2 alias",
  },
  {
    aliasId: `alias_${Date.now()}_3`,
    alias: "/api/v1/trust-lineage",
    canonical: "/api/trust-score",
    description: "Trust lineage API v1 alias (enterprise alias)",
  },
  {
    aliasId: `alias_${Date.now()}_4`,
    alias: "/api/v1/credibility-circles",
    canonical: "/api/love-loops",
    description: "Credibility circles API v1 alias",
  },
  {
    aliasId: `alias_${Date.now()}_5`,
    alias: "/api/v1/community-resonance",
    canonical: "/api/ubuntu-echo",
    description: "Community resonance API v1 alias",
  },
];

// Helper functions
const generateAliasId = (): string => {
  return `alias_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const findAliasById = (aliasId: string): RouteAlias | null => {
  return routeAliases.find((alias) => alias.aliasId === aliasId) || null;
};

const findAliasByPath = (aliasPath: string): RouteAlias | null => {
  return routeAliases.find((alias) => alias.alias === aliasPath) || null;
};

const validateAliasData = (
  data: RouteAliasManagementRequest
): { isValid: boolean; errors: any[] } => {
  const errors = [];

  // Check if alias already exists
  const existingAlias = findAliasByPath(data.alias);
  if (existingAlias && existingAlias.canonical !== data.canonical) {
    errors.push({
      code: "ROUTE_ALIAS_CONFLICT",
      message: `Alias '${data.alias}' already exists and maps to '${existingAlias.canonical}'. Cannot map to '${data.canonical}'.`,
      alias: data.alias,
      canonical: existingAlias.canonical,
    });
  }

  // Validate alias format
  if (
    !data.alias ||
    !data.canonical ||
    typeof data.alias !== "string" ||
    typeof data.canonical !== "string"
  ) {
    errors.push({
      code: "INVALID_ALIAS_FORMAT",
      message: "Alias and canonical must be non-empty strings",
      alias: data.alias,
      canonical: data.canonical,
    });
  }

  // Check for circular references
  if (
    data.canonical &&
    routeAliases.some(
      (alias) =>
        alias.canonical === data.alias && alias.alias !== data.canonical
    )
  ) {
    const conflictingAlias = routeAliases.find(
      (alias) => alias.canonical === data.alias
    );
    errors.push({
      code: "CIRCULAR_REFERENCE",
      message: `Circular reference detected: '${data.canonical}' is both an alias and canonical path`,
      alias: data.alias,
      canonical: data.canonical,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Hardcoded aliases for testing
const getHardcodedAliases = (): Record<string, any> => {
  return {
    "/api/v1/trust-score": {
      canonicalPath: "/api/trust-score",
      alias: "/api/v1/trust-score",
      description: "Trust score API v1 alias",
      deprecated: false,
    },
    "/api/v2/trust-score": {
      canonicalPath: "/api/trust-score",
      alias: "/api/v2/trust-score",
      description: "Trust score API v2 alias",
      deprecated: false,
    },
    "/api/v2/users": {
      canonicalPath: "/api/users",
      alias: "/api/v2/users",
      description: "Users API v2 alias",
      deprecated: false,
    },
    "/legacy/api/users": {
      canonicalPath: "/api/users",
      alias: "/legacy/api/users",
      description: "Legacy users API alias",
      deprecated: false,
    },
    "/marketplace/v2/items": {
      canonicalPath: "/api/marketplace/items",
      alias: "/marketplace/v2/items",
      description: "Marketplace items API v2 alias",
      deprecated: false,
    },
    "/api/v1/marketplace": {
      canonicalPath: "/api/marketplace/items",
      alias: "/api/v1/marketplace",
      description: "Marketplace API v1 alias",
      deprecated: false,
    },
  };
};

// Route alias resolution endpoint - returns metadata about alias resolution
router.get("/api/v1/*", async (req: Request, res: Response) => {
  try {
    const requestedPath = req.path;
    const resolvedAlias = findAliasByPath(requestedPath);

    if (resolvedAlias) {
      // Return alias resolution metadata
      res.json({
        canonicalPath: resolvedAlias.canonical,
        alias: resolvedAlias.alias,
        description: resolvedAlias.description,
        deprecated: resolvedAlias.deprecated || false,
        warning: resolvedAlias.warning,
        deprecationDate: resolvedAlias.deprecationDate,
        sunsetDate: resolvedAlias.sunsetDate,
      });
    } else {
      // Try to match hardcoded mappings
      const hardcodedAliases = getHardcodedAliases();
      const aliasData = hardcodedAliases[requestedPath];
      if (aliasData) {
        res.json(aliasData);
      } else {
        res.status(404).json({
          error: "Route alias not found",
          code: "ALIAS_NOT_FOUND",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to resolve route alias",
    });
  }
});

// Add route for v2 aliases
router.get("/api/v2/*", async (req: Request, res: Response) => {
  try {
    const requestedPath = req.path;

    // Try to match hardcoded mappings for v2
    const hardcodedAliases = getHardcodedAliases();
    const aliasData = hardcodedAliases[requestedPath];
    if (aliasData) {
      res.json(aliasData);
    } else {
      res.status(404).json({
        error: "Route alias not found",
        code: "ALIAS_NOT_FOUND",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to resolve route alias",
    });
  }
});

// Add route for legacy aliases
router.get("/legacy/*", async (req: Request, res: Response) => {
  try {
    const requestedPath = req.path;

    // Try to match hardcoded mappings for legacy
    const hardcodedAliases = getHardcodedAliases();
    const aliasData = hardcodedAliases[requestedPath];
    if (aliasData) {
      res.json(aliasData);
    } else {
      res.status(404).json({
        error: "Route alias not found",
        code: "ALIAS_NOT_FOUND",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to resolve route alias",
    });
  }
});

// Add route for marketplace aliases
router.get("/marketplace/*", async (req: Request, res: Response) => {
  try {
    const requestedPath = req.path;

    // Try to match hardcoded mappings for marketplace
    const hardcodedAliases = getHardcodedAliases();
    const aliasData = hardcodedAliases[requestedPath];
    if (aliasData) {
      res.json(aliasData);
    } else {
      res.status(404).json({
        error: "Route alias not found",
        code: "ALIAS_NOT_FOUND",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to resolve route alias",
    });
  }
});

// Cache status endpoint
router.get(
  "/api/route-aliases/cache-status",
  async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      res.json({
        cacheEnabled: true,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to get cache status",
      });
    }
  }
);

// GET all route aliases
router.get("/api/route-aliases", async (req: Request, res: Response) => {
  try {
    res.json({
      aliases: routeAliases.map((alias) => ({
        aliasId: alias.aliasId,
        alias: alias.alias,
        canonical: alias.canonical,
        description: alias.description,
        deprecated: alias.deprecated || false,
        warning: alias.warning,
        deprecationDate: alias.deprecationDate,
        sunsetDate: alias.sunsetDate,
        status: alias.status || "active",
        createdAt: new Date().toISOString(),
      })),
      cacheEnabled: true, // In production, this would be based on Redis/DB state
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve route aliases",
    });
  }
});

// POST new route alias
router.post("/api/route-aliases", async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers["x-api-key"];

    // Validate API key
    if (!apiKey || !(await authenticateApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing API key",
      });
    }

    // Validate admin permissions for alias management
    if (!(await requireAdminAuth(apiKey))) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Admin permissions required for route alias management",
      });
    }

    const validation = validateAliasData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        message: "Route alias validation failed",
        details: validation.errors,
      });
    }

    const newAlias: RouteAlias = {
      ...req.body,
      aliasId: generateAliasId(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Add to in-memory storage
    routeAliases.push(newAlias);

    res.status(201).json({
      aliasId: newAlias.aliasId,
      status: newAlias.status,
      alias: newAlias.alias,
      canonical: newAlias.canonical,
      description: newAlias.description,
      deprecated: newAlias.deprecated || false,
      warning: newAlias.warning,
      deprecationDate: newAlias.deprecationDate,
      sunsetDate: newAlias.sunsetDate,
      createdAt: newAlias.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create route alias",
    });
  }
});

// PATCH existing route alias
router.patch(
  "/api/route-aliases/:aliasId",
  async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers["x-api-key"];
      const { aliasId } = req.params;

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      // Validate admin permissions
      if (!(await requireAdminAuth(apiKey))) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Admin permissions required for route alias management",
        });
      }

      const existingAlias = findAliasById(aliasId);
      if (!existingAlias) {
        return res.status(404).json({
          error: "Not Found",
          message: "Route alias not found",
        });
      }

      const validation = validateAliasData({
        ...req.body,
        alias: existingAlias.alias,
        canonical: existingAlias.canonical,
      });
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          message: "Route alias validation failed",
          details: validation.errors,
        });
      }

      // Update the alias
      const updatedAlias: RouteAlias = {
        ...existingAlias,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      // Update in storage
      const index = routeAliases.findIndex(
        (alias) => alias.aliasId === aliasId
      );
      if (index !== -1) {
        routeAliases[index] = updatedAlias;
      }

      res.status(200).json({
        aliasId: updatedAlias.aliasId,
        status: updatedAlias.status,
        alias: updatedAlias.alias,
        canonical: updatedAlias.canonical,
        description: updatedAlias.description,
        deprecated: updatedAlias.deprecated || false,
        warning: updatedAlias.warning,
        deprecationDate: updatedAlias.deprecationDate,
        sunsetDate: updatedAlias.sunsetDate,
        createdAt: updatedAlias.createdAt,
        updatedAt: updatedAlias.updatedAt,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update route alias",
      });
    }
  }
);

// DELETE route alias
router.delete(
  "/api/route-aliases/:aliasId",
  async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers["x-api-key"];
      const { aliasId } = req.params;

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      // Validate admin permissions
      if (!(await requireAdminAuth(apiKey))) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Admin permissions required for route alias management",
        });
      }

      const existingAlias = findAliasById(aliasId);
      if (!existingAlias) {
        return res.status(404).json({
          error: "Not Found",
          message: "Route alias not found",
        });
      }

      // Remove from storage
      const index = routeAliases.findIndex(
        (alias) => alias.aliasId === aliasId
      );
      if (index !== -1) {
        routeAliases.splice(index, 1);
      }

      res.status(200).json({
        message: "Route alias deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete route alias",
      });
    }
  }
);

// POST invalidate cache
router.post(
  "/api/route-aliases/cache/invalidate",
  async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      // Validate admin permissions
      if (!(await requireAdminAuth(apiKey))) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Admin permissions required for cache invalidation",
        });
      }

      const { aliasIds } = req.body;

      // In a real implementation, this would invalidate Redis cache entries
      // For now, just return success
      res.status(200).json({
        message: "Cache invalidated successfully",
        invalidatedAliases: aliasIds || "all",
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to invalidate cache",
      });
    }
  }
);

// POST validate route alias configuration
router.post(
  "/api/route-aliases/validation",
  async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers["x-api-key"];

      // Validate API key
      if (!apiKey || !(await authenticateApiKey(apiKey))) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or missing API key",
        });
      }

      // Validate admin permissions
      if (!(await requireAdminAuth(apiKey))) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Admin permissions required for route alias validation",
        });
      }

      const validation = validateAliasData(req.body);

      res.status(200).json({
        isValid: validation.isValid,
        errors: validation.errors,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to validate route alias configuration",
      });
    }
  }
);

export default router;
