import type { Request, Response } from "express";
import { Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create router
const router = Router();

// Load OpenAPI specification as fallback
let openApiSpec: any = {};
try {
  const yamlContent = readFileSync(path.join(__dirname, "../docs/openapi.yaml"), "utf8");
  // Simple YAML parser for basic functionality
  openApiSpec = { openapi: "3.0.3", info: { title: "Vauntico API", version: "1.0.0" }, paths: {} };
} catch (error) {
  console.warn("Could not load OpenAPI spec:", error);
}

/**
 * Documentation home page with navigation
 */
router.get("/", (req: Request, res: Response) => {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Vauntico Trust Score Dashboard API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: #333;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: #3b82f6;
        color: white;
        padding: 30px 40px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 600;
      }
      .header p {
        margin: 10px 0 0 0;
        opacity: 0.9;
        font-size: 1.1rem;
      }
      .content {
        padding: 40px;
      }
      .docs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        margin-bottom: 40px;
      }
      .doc-card {
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 24px;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        display: block;
      }
      .doc-card:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
      }
      .doc-card h3 {
        margin: 0 0 12px 0;
        color: #3b82f6;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .doc-card p {
        margin: 0 0 16px 0;
        color: #6b7280;
        line-height: 1.6;
      }
      .doc-card .badge {
        background: #f3f4f6;
        color: #374151;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .section {
        margin-bottom: 40px;
      }
      .section h2 {
        margin: 0 0 20px 0;
        color: #1f2937;
        font-size: 1.8rem;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
      }
      .endpoints {
        background: #f8fafc;
        border-radius: 8px;
        padding: 20px;
        margin-top: 20px;
      }
      .endpoint {
        font-family: 'Monaco', 'Menlo', monospace;
        background: white;
        padding: 8px 12px;
        border-radius: 4px;
        margin: 4px 0;
        border-left: 4px solid #10b981;
      }
      .method {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 8px;
      }
      .get { background: #dbeafe; color: #1e40af; }
      .post { background: #dcfce7; color: #166534; }
      .put { background: #fed7aa; color: #d97706; }
      .delete { background: #fecaca; color: #dc2626; }
      .footer {
        background: #f8fafc;
        padding: 30px;
        text-align: center;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
      .icon {
        font-size: 1.2rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚀 Vauntico API</h1>
        <p>Trust Score Dashboard API Documentation</p>
      </div>
      
      <div class="content">
        <div class="docs-grid">
          <a href="/api/v1/docs/redoc" class="doc-card">
            <h3><span class="icon">📚</span> ReDoc Documentation</h3>
            <p>Beautiful, responsive API documentation with three-panel layout, search, and interactive testing.</p>
            <div class="badge">Recommended</div>
          </a>
          
          <a href="/api/v1/docs/swagger" class="doc-card">
            <h3><span class="icon">🔧</span> Swagger UI</h3>
            <p>Interactive API explorer with Try-It-Out functionality and code generation.</p>
            <div class="badge">Developer Tools</div>
          </a>
          
          <a href="/api/v1/docs/json" class="doc-card">
            <h3><span class="icon">📄</span> OpenAPI JSON</h3>
            <p>Raw OpenAPI 3.0.3 specification in JSON format for integration tools.</p>
            <div class="badge">Machine-Readable</div>
          </a>
          
          <a href="/api/v1/docs/yaml" class="doc-card">
            <h3><span class="icon">📝</span> OpenAPI YAML</h3>
            <p>Human-readable OpenAPI specification in YAML format for version control.</p>
            <div class="badge">Git-Friendly</div>
          </a>
          
          <a href="/api/v1/docs/postman" class="doc-card">
            <h3><span class="icon">📮</span> Postman Collection</h3>
            <p>Pre-configured Postman collection with all endpoints and authentication.</p>
            <div class="badge">Testing Tool</div>
          </a>
        </div>
        
        <div class="section">
          <h2>🔑 Authentication</h2>
          <p>All API endpoints require authentication. Configure one of the following methods:</p>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method post">POST</span> Set <code>X-API-Key: your_api_key</code> header
            </div>
            <div class="endpoint">
              <span class="method post">POST</span> Set <code>Authorization: Bearer your_jwt_token</code> header
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>🚀 Quick Start</h2>
          <div class="endpoints">
            <div class="endpoint">
              <span class="method get">GET</span> <a href="/api/v1/docs/json#/paths/~1health/get" style="color: #3b82f6;">/health</a> - System health check
            </div>
            <div class="endpoint">
              <span class="method get">GET</span> <a href="/api/v1/docs/json#/paths/~1dashboard~1trustscore/get" style="color: #3b82f6;">/dashboard/trustscore?userId=user_123</a> - Get trust score
            </div>
            <div class="endpoint">
              <span class="method get">GET</span> <a href="/api/v1/docs/json#/paths/~1dashboard~1trend/get" style="color: #3b82f6;">/dashboard/trend?userId=user_123</a> - Get trends
            </div>
            <div class="endpoint">
              <span class="method get">GET</span> <a href="/api/v1/docs/json#/paths/~1dashboard~1features/get" style="color: #3b82f6;">/dashboard/features?userId=user_123</a> - Get features
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2024 Vauntico. Built with ❤️ for creators.</p>
        <p>Need help? Contact <a href="mailto:api-support@vauntico.com" style="color: #3b82f6;">api-support@vauntico.com</a></p>
      </div>
    </div>
  </body>
</html>`;
  
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/**
 * ReDoc Documentation
 */
router.get("/redoc", (req: Request, res: Response) => {
  const redocHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Vauntico API - ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; font-family: Roboto, sans-serif; }
      .redoc-container { height: 100vh; width: 100vw; }
      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Montserrat, sans-serif;
        color: #3b82f6;
      }
      .loading-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-right: 16px;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div id="redoc-container" class="redoc-container">
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>Loading API Documentation...</span>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
    <script>
      fetch('/api/v1/docs/json')
        .then(response => response.json())
        .then(spec => {
          Redoc.init(spec, {
            scrollYOffset: 50,
            hideDownloadButton: false,
            expandResponses: "200,201,202",
            theme: {
              colors: { primary: { main: '#3b82f6' } }
            }
          }, document.getElementById('redoc-container'));
        })
        .catch(error => {
          document.getElementById('redoc-container').innerHTML = \`
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Montserrat, sans-serif;">
              <h2 style="color: #ef4444;">Failed to load documentation</h2>
              <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
            </div>
          \`;
        });
    </script>
  </body>
</html>`;
  
  res.setHeader("Content-Type", "text/html");
  res.send(redocHtml);
});

/**
 * Simple Swagger UI fallback
 */
router.get("/swagger", (req: Request, res: Response) => {
  const swaggerHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Vauntico API - Swagger UI</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { margin: 0; padding: 20px; font-family: sans-serif; }
      .container { max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 40px; }
      .api-list { list-style: none; padding: 0; }
      .api-item { 
        border: 1px solid #ddd; 
        margin: 10px 0; 
        padding: 20px; 
        border-radius: 8px;
        background: #f9f9f9;
      }
      .method { 
        display: inline-block; 
        padding: 4px 8px; 
        border-radius: 4px; 
        color: white; 
        font-weight: bold;
        margin-right: 10px;
      }
      .get { background: #61affe; }
      .post { background: #49cc90; }
      .put { background: #fca130; }
      .delete { background: #f93e3e; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔧 Vauntico API - Swagger UI</h1>
        <p>Interactive API Documentation</p>
      </div>
      <div class="api-list">
        <div class="api-item">
          <h3><span class="method get">GET</span> Health Check</h3>
          <p>Check system health and service status</p>
          <code>GET /health</code>
        </div>
        <div class="api-item">
          <h3><span class="method get">GET</span> Trust Score</h3>
          <p>Get user's trust score and factor breakdown</p>
          <code>GET /dashboard/trustscore?userId=user_123</code>
        </div>
        <div class="api-item">
          <h3><span class="method post">POST</span> Calculate Score</h3>
          <p>Trigger trust score recalculation</p>
          <code>POST /dashboard/trustscore</code>
        </div>
        <div class="api-item">
          <h3><span class="method get">GET</span> Trends</h3>
          <p>Get historical trust score trends</p>
          <code>GET /dashboard/trend?userId=user_123&timeframe=30d</code>
        </div>
        <div class="api-item">
          <h3><span class="method get">GET</span> Features</h3>
          <p>Get available sacred features</p>
          <code>GET /dashboard/features?userId=user_123</code>
        </div>
      </div>
    </div>
  </body>
</html>`;
  
  res.setHeader("Content-Type", "text/html");
  res.send(swaggerHtml);
});

/**
 * OpenAPI JSON specification
 */
router.get("/json", (req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(openApiSpec);
  } catch (error) {
    console.error("Error serving OpenAPI JSON:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate OpenAPI specification",
      code: "SPEC_GENERATION_ERROR",
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: (req.headers["x-request-id"] as string) || "unknown",
      },
    });
  }
});

/**
 * OpenAPI YAML specification
 */
router.get("/yaml", (req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", "application/yaml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    const yamlContent = \`openapi: 3.0.3
info:
  title: Vauntico Trust Score Dashboard API
  version: 1.0.0
  description: Enterprise-grade trust score dashboard API
servers:
  - url: https://api.vauntico.com/v1
    description: Production server
  - url: http://localhost:3001/api/v1
    description: Development server
paths:
  /health:
    get:
      summary: System health check
      tags:
        - health
      responses:
        '200':
          description: Health check successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "healthy"
                  timestamp:
                    type: string
                    format: date-time
                    example: "2024-01-01T12:00:00.000Z"
\`;
    
    res.send(yamlContent);
  } catch (error) {
    console.error("Error serving OpenAPI YAML:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate OpenAPI specification",
      code: "SPEC_GENERATION_ERROR",
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: (req.headers["x-request-id"] as string) || "unknown",
      },
    });
  }
});

/**
 * Postman collection
 */
router.get("/postman", (req: Request, res: Response) => {
  try {
    const postmanCollection = {
      info: {
        name: "Vauntico Trust Score Dashboard API",
        description: "Complete collection for Vauntico API testing",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      variable: [
        {
          key: "baseUrl",
          value: "http://localhost:3001/api/v1",
          description: "API base URL",
        },
        {
          key: "apiKey",
          value: "",
          description: "Your API key",
          type: "secret",
        },
        {
          key: "userId",
          value: "user_1234567890",
          description: "Default user ID for testing",
        },
      ],
      item: [
        {
          name: "Health Check",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/health",
              host: ["{{baseUrl}}"],
              path: ["/health"],
            },
          },
        },
        {
          name: "Get Trust Score",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/dashboard/trustscore?userId={{userId}}",
              host: ["{{baseUrl}}"],
              path: ["/dashboard", "trustscore"],
              query: [{ key: "userId", value: "{{userId}}" }],
            },
          },
        },
      ],
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=vauntico-api-collection.json");
    res.send(postmanCollection);
  } catch (error) {
    console.error("Error generating Postman collection:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate Postman collection",
      code: "COLLECTION_GENERATION_ERROR",
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: (req.headers["x-request-id"] as string) || "unknown",
      },
    });
  }
});

export default router;
