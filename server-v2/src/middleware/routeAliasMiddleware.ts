import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include routeAlias
declare global {
  namespace Express {
    interface Request {
      routeAlias?: string;
    }
  }
}

/**
 * Route Alias Middleware
 * Handles route aliasing for backward compatibility and clean URLs
 */
export class RouteAliasMiddleware {
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.initializeAliases();
  }

  /**
   * Initialize route aliases
   */
  private initializeAliases(): void {
    // Creator-focused aliases
    this.aliases.set('/creator/trust-score', '/api/v1/trust-lineage/test');
    this.aliases.set('/creator/calculator', '/#calculator');
    this.aliases.set('/creator/dashboard', '/dashboard');

    // Enterprise-focused aliases
    this.aliases.set('/enterprise/docs', '/api-docs');
    this.aliases.set('/enterprise/api', '/api/v1');
    this.aliases.set('/enterprise/pricing', '/pricing');

    // Legacy aliases for backward compatibility
    this.aliases.set('/old-calculator', '/#calculator');
    this.aliases.set('/trust-score-tool', '/#calculator');
  }

  /**
   * Add a new route alias
   */
  addAlias(from: string, to: string): void {
    this.aliases.set(from, to);
  }

  /**
   * Remove a route alias
   */
  removeAlias(from: string): void {
    this.aliases.delete(from);
  }

  /**
   * Get all aliases
   */
  getAliases(): Map<string, string> {
    return new Map(this.aliases);
  }

  /**
   * Middleware function to handle route aliasing
   */
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const originalUrl = req.url;
      const alias = this.aliases.get(originalUrl);

      if (alias) {
        // Store original URL for logging/analytics
        req.routeAlias = originalUrl;

        // Check if it's an external redirect (starts with http)
        if (alias.startsWith('http')) {
          res.redirect(301, alias);
          return;
        }

        // Internal redirect
        req.url = alias;
      }

      next();
    } catch (error) {
      console.error('Route alias middleware error:', error);
      next();
    }
  };

  /**
   * Check if a route has an alias
   */
  hasAlias(route: string): boolean {
    return this.aliases.has(route);
  }

  /**
   * Get alias for a route
   */
  getAlias(route: string): string | undefined {
    return this.aliases.get(route);
  }

  /**
   * Get statistics about aliases
   */
  getStats(): { totalAliases: number; mostUsed: string[] } {
    const totalAliases = this.aliases.size;
    const mostUsed = Array.from(this.aliases.keys()).slice(0, 5);

    return {
      totalAliases,
      mostUsed
    };
  }
}

// Export singleton instance
export const routeAliasMiddleware = new RouteAliasMiddleware();

// Export middleware function for direct use
export const routeAliasHandler = routeAliasMiddleware.middleware;