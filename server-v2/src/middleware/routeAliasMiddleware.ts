import { Request, Response, NextFunction } from 'express';

/**
 * Route Alias Middleware
 * Maps enterprise route names to sacred feature route names
 */
export const routeAliasMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Define route alias mappings
  const routeAliases: Record<string, string> = {
    // Trust Lineage → Legacy Tree
    '/api/v1/trust-lineage': '/api/v1/trust-score',
    '/api/v1/trust-lineage/:userId': '/api/v1/trust-score/:userId',
    '/api/v1/trust-lineage/:userId/history': '/api/v1/trust-score/:userId/history',

  // Credibility Circles → Love Loops
  '/api/v1/credibility-circles': '/api/v1/love-loops',
  '/api/v1/credibility-circles/:userId': '/api/v1/love-loops/:userId',

  // Narrative Engine → Lore Generator
  '/api/v1/narrative-engine': '/api/v1/lore-generator',
  '/api/v1/narrative-engine/:userId': '/api/v1/lore-generator/:userId',

  // Community Resonance → Ubuntu Echo
  '/api/v1/community-resonance': '/api/v1/ubuntu-echo',
  '/api/v1/community-resonance/:userId': '/api/v1/ubuntu-echo/:userId'
  };

  // Check if current path matches any alias
  const originalPath = req.path;
  const matchedAlias = Object.keys(routeAliases).find(alias => {
    // Convert alias to regex pattern
    const aliasPattern = alias.replace(/:(\w+)/g, '([^/]+)');
    const regex = new RegExp(`^${aliasPattern}$`);
    return regex.test(originalPath);
  });

  if (matchedAlias) {
    // Replace the path with the actual route
    const actualRoute = routeAliases[matchedAlias];
    req.url = req.url.replace(matchedAlias, actualRoute);

    // Add metadata for analytics tracking
    req['routeAlias'] = {
      enterpriseRoute: matchedAlias,
      sacredRoute: actualRoute,
      aliasType: 'enterprise-to-sacred'
    };
  }

  // Continue to the actual route handler
  next();
};

/**
 * Analytics tracking for route aliases
 */
export const trackRouteAliasUsage = (req: Request, res: Response, next: NextFunction) => {
  if (req['routeAlias']) {
    const { enterpriseRoute, sacredRoute } = req['routeAlias'];
    console.log(`Route Alias Used: ${enterpriseRoute} → ${sacredRoute}`);
    // In a real implementation, this would log to analytics service
  }
  next();
};
</final_file_content>
<task_progress>
- [x] Analyze current homepage structure and identify files to update
- [x] Review enterprise naming conventions already in place
- [x] Examine CI/CD pipeline for deployment impact
- [x] Draft new hero section structure with enterprise messaging
- [x] Define CSS/layout adjustments for enterprise tone
- [x] Create semantic commit message
- [x] Outline CI/CD impact and rollback plan
- [x] Provide comprehensive strategic replan for dual-personality architecture
- [x] Create TrustScoreCalculator component (viral growth hook)
- [x] Create SacredFeaturesShowcase component
- [x] Rewrite homepage hero section with creator-focused messaging
- [x] Create enterprise API documentation page
- [x] Create backend route aliases for dual naming
- [x] Implement route alias middleware
- [ ] Set up analytics and feature flags
</task_progress>
</write_to_file>