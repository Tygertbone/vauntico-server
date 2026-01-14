#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

class MonitoringMCPServer {
  constructor() {
    this.prometheusUrl = process.env.PROMETHEUS_URL;
    this.grafanaUrl = process.env.GRAFANA_URL;
    this.sentryUrl = process.env.SENTRY_URL;
    
    this.server = new Server(
      {
        name: "mcp-monitoring",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Prometheus Metrics Tools
          {
            name: "metrics_export",
            description: "Export metrics from Prometheus to various formats",
            inputSchema: {
              type: "object",
              properties: {
                service: {
                  type: "string",
                  description: "Service name to export metrics for",
                },
                metric_names: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of metric names to export",
                  default: ["cpu_usage", "memory_usage", "request_count"],
                },
                time_range: {
                  type: "string",
                  description: "Time range for metrics (1h, 24h, 7d, 30d)",
                  default: "24h",
                },
                format: {
                  type: "string",
                  description: "Export format (json, csv, prometheus)",
                  enum: ["json", "csv", "prometheus"],
                  default: "json",
                },
                output_file: {
                  type: "string",
                  description: "Output file path (optional)",
                },
              },
              required: ["service", "metric_names"],
            },
          },
          {
            name: "metrics_query",
            description: "Query Prometheus using PromQL",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "PromQL query string",
                },
                time_range: {
                  type: "string",
                  description: "Time range for query (1h, 24h, 7d, 30d)",
                  default: "1h",
                },
                format: {
                  type: "string",
                  description: "Response format (json, table, raw)",
                  enum: ["json", "table", "raw"],
                  default: "table",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "metrics_create_alert",
            description: "Create alert rules in Prometheus",
            inputSchema: {
              type: "object",
              properties: {
                alert_name: {
                  type: "string",
                  description: "Name of the alert rule",
                },
                expression: {
                  type: "string",
                  description: "PromQL expression for the alert",
                },
                severity: {
                  type: "string",
                  description: "Alert severity (info, warning, error, critical)",
                  enum: ["info", "warning", "error", "critical"],
                  default: "warning",
                },
                for_duration: {
                  type: "string",
                  description: "Alert duration (5m, 10m, 30m, 1h)",
                  default: "10m",
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Alert labels",
                  default: [],
                },
                annotations: {
                  type: "object",
                  description: "Alert annotations",
                  default: {},
                },
                summary: {
                  type: "string",
                  description: "Alert summary message",
                },
              },
              required: ["alert_name", "expression"],
            },
          },
          {
            name: "metrics_delete_alert",
            description: "Delete alert rules in Prometheus",
            inputSchema: {
              type: "object",
              properties: {
                alert_name: {
                  type: "string",
                  description: "Name of the alert rule to delete",
                },
              },
              required: ["alert_name"],
            },
          },

          // Grafana Tools
          {
            name: "dashboards_sync",
            description: "Sync dashboards with monitoring configuration",
            inputSchema: {
              type: "object",
              properties: {
                dashboard_ids: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of dashboard IDs to sync",
                  default: [],
                },
                config_source: {
                  type: "string",
                  description: "Source of dashboard configuration",
                  enum: ["file", "api", "git"],
                  default: "file",
                },
                config_path: {
                  type: "string",
                  description: "Path to dashboard configuration file",
                  default: "monitoring/dashboards",
                },
                dry_run: {
                  type: "boolean",
                  description: "Preview changes without applying them",
                  default: false,
                },
              },
              required: ["dashboard_ids"],
            },
          },
          {
            name: "dashboards_create",
            description: "Create new Grafana dashboards from templates",
            inputSchema: {
              type: "object",
              properties: {
                dashboard_name: {
                  type: "string",
                  description: "Name of the new dashboard",
                },
                template: {
                  type: "string",
                  description: "Dashboard template to use",
                  enum: ["application", "infrastructure", "custom", "business-metrics"],
                  default: "application",
                },
                folder: {
                  type: "string",
                  description: "Folder to organize dashboard in",
                  default: "General",
                },
                panels: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        description: "Panel title",
                      },
                      type: {
                        type: "string",
                        description: "Panel type (graph, stat, table, heatmap)",
                        enum: ["graph", "stat", "table", "heatmap"],
                      },
                      metrics: {
                        type: "array",
                        items: { type: "string" },
                        description: "Metrics to display in panel",
                      },
                      targets: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            expression: {
                                type: "string",
                                description: "PromQL expression for metric",
                              },
                            legend_format: {
                                type: "string",
                                description: "Legend format for metric",
                              },
                          },
                        },
                      },
                    },
                  },
                },
                variables: {
                  type: "object",
                  description: "Dashboard variables",
                  default: {},
                },
                refresh_interval: {
                  type: "string",
                  description: "Dashboard refresh interval (1m, 5m, 15m, 1h)",
                  default: "1m",
                },
                time_from: {
                  type: "string",
                  description: "Start time for dashboard time range",
                  default: "now-1h",
                },
                time_to: {
                  type: "string",
                  description: "End time for dashboard time range",
                  default: "now",
                },
              },
              required: ["dashboard_name", "template", "folder"],
            },
          },
          {
            name: "dashboards_list",
            description: "List available Grafana dashboards",
            inputSchema: {
              type: "object",
              properties: {
                folder: {
                  type: "string",
                  description: "Folder to search for dashboards",
                  default: "General",
                },
                search: {
                  type: "string",
                  description: "Search term for dashboard names",
                  default: "",
                },
              },
              required: ["folder"],
            },
          },

          // Sentry Tools
          {
            name: "errors_group",
            description: "Group Sentry errors by issue and environment",
            inputSchema: {
              type: "object",
              properties: {
                time_range: {
                  type: "string",
                  description: "Time range for error grouping (1h, 24h, 7d, 30d)",
                  default: "24h",
                },
                group_by: {
                  type: "string",
                  description: "Group errors by (issue, environment, release, user, browser)",
                  default: "issue",
                },
                threshold: {
                  type: "number",
                  description: "Minimum error count to create a group",
                  default: 5,
                },
                environment: {
                  type: "string",
                  description: "Environment to filter by (production, staging, development)",
                  default: "production",
                },
                release: {
                  type: "string",
                  description: "Release version to filter by",
                  default: "",
                },
              },
              required: ["time_range"],
            },
          },
          {
            name: "errors_resolve",
            description: "Mark Sentry errors as resolved",
            inputSchema: {
              type: "object",
              properties: {
                issue_id: {
                  type: "string",
                  description: "Sentry issue ID to mark as resolved",
                },
                resolution_comment: {
                  type: "string",
                  description: "Resolution comment for the issue",
                  default: "Resolved via monitoring system",
                },
              external_id: {
                  type: "string",
                  description: "External issue ID to link (Jira, GitHub issue, etc)",
                  default: "",
                },
                external_url: {
                  type: "string",
                  description: "URL to external issue tracking system",
                  default: "",
                },
                resolved: {
                  type: "boolean",
                  description: "Mark issue as resolved",
                  default: false,
                },
              },
              required: ["issue_id"],
            },
          },
          {
            name: "sentry_config",
            description: "Configure Sentry project settings",
            inputSchema: {
              type: "object",
              properties: {
                environment: {
                  type: "string",
                  description: "Environment (production, staging, development)",
                  default: "production",
                },
                dsn: {
                  type: "string",
                  description: "Sentry DSN for project",
                },
                release: {
                  type: "string",
                  description: "Release version for Sentry",
                  default: "",
                },
                sample_rate: {
                  type: "number",
                  description: "Error sampling rate (0.0 to 1.0)",
                  default: 0.1,
                },
                max_breadcrumbs: {
                  type: "number",
                  description: "Maximum number of breadcrumbs",
                  default: 100,
                },
                debug: {
                  type: "boolean",
                  description: "Enable Sentry debug mode",
                  default: false,
                },
                server_name: {
                  type: "string",
                  description: "Server name for Sentry",
                  default: "vauntico-api",
                },
              },
              required: ["environment"],
            },
          },
          {
            name: "sentry_deploy",
            description: "Deploy Sentry release and update configuration",
            inputSchema: {
              type: "object",
              properties: {
                version: {
                  type: "string",
                  description: "Release version to deploy",
                  default: "latest",
                },
                environment: {
                  type: "string",
                  description: "Environment to deploy to (production, staging)",
                  default: "production",
                },
                auto_create_release: {
                  type: "boolean",
                  description: "Automatically create Sentry release",
                  default: true,
                },
                dry_run: {
                  type: "boolean",
                  description: "Preview deployment without making changes",
                  default: false,
                },
              },
              required: ["environment"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Prometheus Metrics
          case "metrics_export":
            return await this.metricsExport(args);
          case "metrics_query":
            return await this.metricsQuery(args);

          // Grafana Tools
          case "dashboards_sync":
            return await this.dashboardsSync(args);
          case "dashboards_create":
            return await this.dashboardsCreate(args);
          case "dashboards_list":
            return await this.dashboardsList(args);

          // Sentry Tools
          case "errors_group":
            return await this.sentryErrorsGroup(args);
          case "errors_resolve":
            return await this.sentryErrorsResolve(args);
          case "sentry_config":
            return await this.sentryConfig(args);
          case "sentry_deploy":
            return await this.sentryDeploy(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  // Prometheus Metrics Methods
  async metricsExport(args) {
    const { service, metric_names, time_range = "24h", format = "json", output_file } = args;
    
    try {
      // Mock Prometheus metrics export
      console.log(`📊 Exporting metrics for service: ${service}`);
      console.log(`📈 Metrics: ${metric_names.join(", ")}`);
      console.log(`📅 Time range: ${time_range}`);
      console.log(`📋 Format: ${format}`);
      
      const mockData = {
        service,
        time_range,
        format,
        exported_at: new Date().toISOString(),
        metrics: [
          {
            name: "cpu_usage",
            value: Math.random() * 100,
            unit: "percent",
          timestamp: new Date().toISOString(),
          },
          {
            name: "memory_usage",
            value: Math.random() * 1024,
            unit: "MB",
            timestamp: new Date().toISOString(),
          },
          {
            name: "request_count",
            value: Math.floor(Math.random() * 1000),
            unit: "count",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      
      let output = mockData;
      if (output_file) {
        const fs = require('fs');
        fs.writeFileSync(output_file, JSON.stringify(mockData, null, 2));
        output.output_file = output_file;
        output.written_to = output_file;
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              exported_to: output_file,
              metrics: mockData.metrics,
              total_metrics: mockData.metrics.length,
            format: format,
            service: service,
              time_range: time_range,
            generated_at: mockData.exported_at,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async metricsQuery(args) {
    const { query, time_range = "1h", format = "table" } = args;
    
    try {
      // Mock Prometheus query
      console.log(`🔍 Executing PromQL query: ${query}`);
      console.log(`📅 Time range: ${time_range}`);
      console.log(`📋 Format: ${format}`);
      
      const mockData = {
        query,
        time_range,
        format,
        executed_at: new Date().toISOString(),
        results: [
          {
            metric: "cpu_usage",
            labels: { service: "api", instance: "prod-1" },
            value: 75.5,
            timestamp: "2024-01-14T10:30:00Z",
          },
          {
            metric: "memory_usage",
            labels: { service: "api", instance: "prod-2" },
            value: 512,
            timestamp: "2024-01-14T10:31:00Z",
          },
        ],
        result_type: format === "table" ? "table" : "series",
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              query: mockData.query,
              time_range: time_range,
              format: format,
              executed_at: mockData.executed_at,
              results: mockData.results,
              result_type: mockData.result_type,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Grafana Methods
  async dashboardsSync(args) {
    const { dashboard_ids, config_source = "file", config_path = "monitoring/dashboards", dry_run = false } = args;
    
    try {
      console.log(`📊 Syncing dashboards: ${dashboard_ids.join(", ")}`);
      console.log(`📁 Config source: ${config_source}`);
      console.log(`📋 Config path: ${config_path}`);
      console.log(`🚀 Dry run: ${dry_run}`);
      
      // Mock dashboard sync
      const syncedDashboards = dashboard_ids.map(id => ({
        id,
        name: `Dashboard ${id}`,
        status: "synced",
        synced_at: new Date().toISOString(),
      }));
      
      if (!dry_run) {
        const fs = require('fs');
        const existingConfig = fs.existsSync(config_path) ? JSON.parse(fs.readFileSync(config_path, 'utf8')) : { dashboards: [] };
        
        const updatedConfig = {
          dashboards: [...existingConfig.dashboards, ...syncedDashboards],
          last_synced: new Date().toISOString(),
        };
        
        fs.writeFileSync(config_path, JSON.stringify(updatedConfig, null, 2));
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              synced_dashboards: syncedDashboards,
              total_synced: syncedDashboards.length,
              config_updated: !dry_run,
              config_path: config_path,
              message: dry_run ? "Sync preview completed" : `${syncedDashboards.length} dashboards synced`,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async dashboardsCreate(args) {
    const { dashboard_name, template = "application", folder = "General", panels, variables = {}, refresh_interval = "1m", time_from = "now-1h", time_to = "now" } = args;
    
    try {
      console.log(`📝 Creating dashboard: ${dashboard_name}`);
      console.log(`📋 Template: ${template}`);
      console.log(`📁 Folder: ${folder}`);
      console.log(`📊 Panels: ${panels.length}`);
      console.log(`📋 Variables: ${Object.keys(variables).length}`);
      console.log(`🕒 Refresh interval: ${refresh_interval}`);
      
      // Mock dashboard creation
      const mockDashboard = {
        id: `dashboard_${Date.now().getTime()}`,
        name: dashboard_name,
        template,
        folder,
        panels,
        variables,
        refresh_interval,
        time_from,
        time_to,
        created_at: new Date().toISOString(),
        url: `${this.grafanaUrl}/d/${mockDashboard.id}`,
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              dashboard: mockDashboard,
              message: `Dashboard '${dashboard_name}' created successfully`,
              dashboard_url: mockDashboard.url,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async dashboardsList(args) {
    const { folder = "General", search = "" } = args;
    
    try {
      console.log(`📊 Listing dashboards in folder: ${folder}`);
      console.log(`🔍 Search term: ${search}`);
      
      // Mock dashboard list
      const mockDashboards = [
        {
          id: "dashboard_1",
          name: "Application Overview",
          description: "Main application metrics dashboard",
          folder: "Applications",
          created_at: "2024-01-01T12:00:00Z",
          updated_at: "2024-01-14T10:30:00Z",
          panels: 3,
          variables: { "app_name": "vauntico-api" },
        },
        {
          id: "dashboard_2",
          name: "Infrastructure",
          description: "Infrastructure monitoring dashboard",
          folder: "Infrastructure",
          created_at: "2024-01-01T11:00:00Z",
          updated_at: "2024-01-14T09:15:00Z",
          panels: 5,
          variables: { "cluster": "prod", "namespace": "default" },
        },
        {
          id: "dashboard_3",
          name: "Business Metrics",
          description: "Business KPI dashboard",
          folder: "Business",
          created_at: "2024-01-02T15:00:00Z",
          updated_at: "2024-01-14T08:30:00Z",
          panels: 8,
          variables: { "revenue_target": 1000000, "currency": "USD" },
        },
      ];
      
      const filteredDashboards = search 
        ? mockDashboards.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
        : mockDashboards;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              dashboards: filteredDashboards,
              total_count: filteredDashboards.length,
              folder: folder,
              search_term: search,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Sentry Methods
  async sentryErrorsGroup(args) {
    const { time_range = "24h", group_by = "issue", threshold = 5, environment = "production", release = "" } = args;
    
    try {
      console.log(`🔍 Grouping Sentry errors by: ${group_by}`);
      console.log(`📊 Time range: ${time_range}`);
      console.log(`📋 Threshold: ${threshold}`);
      console.log(`🌍 Environment: ${environment}`);
      console.log(`📦 Release: ${release}`);
      
      // Mock Sentry error grouping
      const mockGroups = [
        {
          group_id: `group_${Date.now()}`,
          group_by,
          time_range,
          threshold,
          environment,
          release,
          error_count: 12,
          errors: [
            {
              id: "error_1",
              message: "Database connection timeout",
              level: "error",
              timestamp: "2024-01-14T10:15:00Z",
              issue_id: "ISSUE-123",
              count: 3,
            },
            {
              id: "error_2",
              message: "API rate limit exceeded",
              level: "warning",
              timestamp: "2024-01-14T11:30:00Z",
              issue_id: "ISSUE-124",
              count: 1,
            },
          ],
        },
        created_at: new Date().toISOString(),
      ];
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              groups: mockGroups,
              total_groups: mockGroups.length,
              total_errors: mockGroups.reduce((sum, g) => sum + g.error_count, 0),
              group_summary: {
                total_errors: mockGroups.reduce((sum, g) => sum + g.error_count, 0),
                by_level: {
                  error: mockGroups.filter(g => g.errors.some(e => e.level === "error")).length,
                  warning: mockGroups.filter(g => g.errors.some(e => e.level === "warning")).length,
                  info: mockGroups.filter(g => g.errors.some(e => e.level === "info")).length,
                critical: mockGroups.filter(g => g.errors.some(e => e.level === "critical")).length,
                },
              },
              highest_level: mockGroups.some(g => g.level === "critical") ? "critical" : mockGroups.some(g => g.level === "error") ? "error" : mockGroups.some(g => g.level === "warning") ? "warning" : "info",
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async sentryErrorsResolve(args) {
    const { issue_id, resolution_comment = "Resolved via monitoring system", external_id = "", external_url = "", resolved = false } = args;
    
    try {
      console.log(`✅ Resolving Sentry issue: ${issue_id}`);
      console.log(`📝 Resolution: ${resolution_comment}`);
      
      // Mock error resolution
      const mockResolution = {
        issue_id,
        resolution_comment,
        external_id,
        external_url,
        resolved,
        resolved_at: new Date().toISOString(),
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              resolution: mockResolution,
              message: `Issue ${issue_id} marked as resolved`,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async sentryConfig(args) {
    const { environment = "production", dsn = "", release = "", sample_rate = 0.1, max_breadcrumbs = 100, debug = false, server_name = "vauntico-api" } = args;
    
    try {
      console.log(`⚙️ Configuring Sentry for environment: ${environment}`);
      console.log(`🔑 DSN: ${dsn}`);
      console.log(`📦 Release: ${release}`);
      console.log(`📊 Sample rate: ${sample_rate}`);
      console.log(`🔍 Max breadcrumbs: ${max_breadcrumbs}`);
      console.log(`🐛 Debug mode: ${debug}`);
      console.log(`🏷️ Server name: ${server_name}`);
      
      // Mock configuration
      const mockConfig = {
        environment,
        dsn,
        release,
        sample_rate,
        max_breadcrumbs,
        debug,
        server_name,
        configured_at: new Date().toISOString(),
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              config: mockConfig,
              message: `Sentry configured for ${environment} environment`,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async sentryDeploy(args) {
    const { version = "latest", environment = "production", auto_create_release = true, dry_run = false } = args;
    
    try {
      console.log(`🚀 Deploying Sentry version ${version} to ${environment}`);
      console.log(`📦 Auto-create release: ${auto_create_release}`);
      console.log(`🔍 Dry run: ${dry_run}`);
      
      // Mock deployment
      const mockDeployment = {
        version,
        environment,
        auto_create_release,
        dry_run,
        deployed_at: new Date().toISOString(),
        release_url: `https://releases.sentry.io/${version}`,
        deployed_by: "monitoring-system",
      };
      
      if (!dry_run) {
        console.log(`📊 Release created: ${mockDeployment.release_url}`);
        console.log(`🚀 Deployed by: ${mockDeployment.deployed_by}`);
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              deployment: mockDeployment,
              message: dry_run ? "Deployment preview completed" : `Sentry version ${version} deployed to ${environment}`,
              release_url: mockDeployment.release_url,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  formatError(error) {
    return {
      content: [
        {
          type: "text",
            text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
          },
        ],
      };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Monitoring MCP server running on stdio");
  }
}

const server = new MonitoringMCPServer();
server.run().catch(console.error);
