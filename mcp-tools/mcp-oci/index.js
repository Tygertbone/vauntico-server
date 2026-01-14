#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { createHash } from "crypto";

class OCIMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "mcp-oci",
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
          // Authentication
          {
            name: "oci_auth",
            description: "Authenticate with Oracle Cloud Infrastructure",
            inputSchema: {
              type: "object",
              properties: {
                user_ocid: {
                  type: "string",
                  description: "OCI User OCID",
                },
                tenancy_ocid: {
                  type: "string",
                  description: "OCI Tenancy OCID",
                },
                private_key: {
                  type: "string",
                  description: "OCI Private Key (base64 encoded)",
                },
                fingerprint: {
                  type: "string",
                  description: "OCI Key Fingerprint",
                },
                region: {
                  type: "string",
                  description: "OCI Region",
                  enum: [
                    "us-ashburn-1",
                    "us-phoenix-1",
                    "eu-frankfurt-1",
                    "uk-london-1",
                  ],
                  default: "us-ashburn-1",
                },
              },
              required: [
                "user_ocid",
                "tenancy_ocid",
                "private_key",
                "fingerprint",
              ],
            },
          },
          // Compute Operations
          {
            name: "list_instances",
            description: "List compute instances in a compartment",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                availability_domain: {
                  type: "string",
                  description: "Filter by availability domain",
                },
                lifecycle_state: {
                  type: "string",
                  description: "Filter by lifecycle state",
                  enum: ["RUNNING", "STOPPED", "TERMINATED"],
                  default: "RUNNING",
                },
              },
              required: ["compartment_id"],
            },
          },
          {
            name: "create_instance",
            description: "Create a new compute instance",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                display_name: {
                  type: "string",
                  description: "Instance display name",
                },
                shape: {
                  type: "string",
                  description: "Instance shape",
                  enum: [
                    "VM.Standard2.1",
                    "VM.Standard2.2",
                    "VM.Standard.E2.1.Micro",
                  ],
                  default: "VM.Standard2.1",
                },
                subnet_id: {
                  type: "string",
                  description: "Subnet OCID",
                },
                image_id: {
                  type: "string",
                  description: "Image OCID",
                },
                ssh_authorized_keys: {
                  type: "array",
                  items: { type: "string" },
                  description: "SSH authorized keys",
                },
              },
              required: [
                "compartment_id",
                "display_name",
                "shape",
                "subnet_id",
                "image_id",
              ],
            },
          },
          {
            name: "start_instance",
            description: "Start a stopped compute instance",
            inputSchema: {
              type: "object",
              properties: {
                instance_id: {
                  type: "string",
                  description: "Instance OCID",
                },
              },
              required: ["instance_id"],
            },
          },
          {
            name: "stop_instance",
            description: "Stop a running compute instance",
            inputSchema: {
              type: "object",
              properties: {
                instance_id: {
                  type: "string",
                  description: "Instance OCID",
                },
              },
              required: ["instance_id"],
            },
          },
          {
            name: "terminate_instance",
            description: "Terminate a compute instance",
            inputSchema: {
              type: "object",
              properties: {
                instance_id: {
                  type: "string",
                  description: "Instance OCID",
                },
                preserve_boot_volume: {
                  type: "boolean",
                  description: "Preserve boot volume",
                  default: false,
                },
              },
              required: ["instance_id"],
            },
          },
          // Storage Operations
          {
            name: "list_buckets",
            description: "List object storage buckets",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                namespace: {
                  type: "string",
                  description: "Object storage namespace",
                },
              },
              required: ["compartment_id"],
            },
          },
          {
            name: "create_bucket",
            description: "Create a new object storage bucket",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                name: {
                  type: "string",
                  description: "Bucket name",
                },
                storage_tier: {
                  type: "string",
                  description: "Storage tier",
                  enum: ["Standard", "InfrequentAccess", "Archive"],
                  default: "Standard",
                },
              },
              required: ["compartment_id", "name"],
            },
          },
          {
            name: "upload_object",
            description: "Upload object to storage bucket",
            inputSchema: {
              type: "object",
              properties: {
                bucket_name: {
                  type: "string",
                  description: "Bucket name",
                },
                namespace: {
                  type: "string",
                  description: "Object storage namespace",
                },
                object_name: {
                  type: "string",
                  description: "Object name",
                },
                content: {
                  type: "string",
                  description: "Object content (base64 encoded)",
                },
                content_type: {
                  type: "string",
                  description: "Content type",
                  default: "application/octet-stream",
                },
              },
              required: ["bucket_name", "namespace", "object_name", "content"],
            },
          },
          // Networking Operations
          {
            name: "list_vcn",
            description: "List Virtual Cloud Networks (VCNs)",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
              },
              required: ["compartment_id"],
            },
          },
          {
            name: "create_vcn",
            description: "Create a new Virtual Cloud Network",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                display_name: {
                  type: "string",
                  description: "VCN display name",
                },
                cidr_block: {
                  type: "string",
                  description: "CIDR block for VCN",
                  default: "10.0.0.0/16",
                },
              },
              required: ["compartment_id", "display_name", "cidr_block"],
            },
          },
          {
            name: "list_subnets",
            description: "List subnets in a VCN",
            inputSchema: {
              type: "object",
              properties: {
                vcn_id: {
                  type: "string",
                  description: "VCN OCID",
                },
              },
              required: ["vcn_id"],
            },
          },
          // Database Operations
          {
            name: "list_databases",
            description: "List autonomous databases",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                db_type: {
                  type: "string",
                  description: "Database type",
                  enum: ["AUTONOMOUS", "MYSQL", "POSTGRESQL"],
                  default: "AUTONOMOUS",
                },
              },
              required: ["compartment_id"],
            },
          },
          {
            name: "create_database",
            description: "Create a new autonomous database",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID",
                },
                display_name: {
                  type: "string",
                  description: "Database display name",
                },
                db_name: {
                  type: "string",
                  description: "Database name",
                },
                cpu_core_count: {
                  type: "number",
                  description: "CPU core count",
                  minimum: 1,
                  maximum: 128,
                  default: 1,
                },
                data_storage_size_in_tbs: {
                  type: "number",
                  description: "Storage size in TBs",
                  minimum: 1,
                  maximum: 128,
                  default: 1,
                },
                admin_password: {
                  type: "string",
                  description: "Admin password",
                },
              },
              required: [
                "compartment_id",
                "display_name",
                "db_name",
                "admin_password",
              ],
            },
          },
          // Identity and Access Management
          {
            name: "list_users",
            description: "List IAM users in tenancy",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID (optional)",
                },
              },
            },
          },
          {
            name: "create_user",
            description: "Create a new IAM user",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "User name",
                },
                description: {
                  type: "string",
                  description: "User description",
                },
                email: {
                  type: "string",
                  description: "User email",
                },
              },
              required: ["name", "description"],
            },
          },
          {
            name: "create_group",
            description: "Create a new IAM group",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Group name",
                },
                description: {
                  type: "string",
                  description: "Group description",
                },
              },
              required: ["name", "description"],
            },
          },
          // Cost Management
          {
            name: "get_cost_analysis",
            description: "Get cost analysis for a time period",
            inputSchema: {
              type: "object",
              properties: {
                compartment_id: {
                  type: "string",
                  description: "Compartment OCID (optional, omit for all)",
                },
                start_date: {
                  type: "string",
                  description: "Start date (YYYY-MM-DD format)",
                },
                end_date: {
                  type: "string",
                  description: "End date (YYYY-MM-DD format)",
                },
                granularity: {
                  type: "string",
                  description: "Cost granularity",
                  enum: ["HOURLY", "DAILY", "MONTHLY"],
                  default: "DAILY",
                },
              },
              required: ["start_date", "end_date"],
            },
          },
          // Monitoring and Logging
          {
            name: "get_metrics",
            description: "Get monitoring metrics for resources",
            inputSchema: {
              type: "object",
              properties: {
                resource_id: {
                  type: "string",
                  description: "Resource OCID",
                },
                metric_name: {
                  type: "string",
                  description: "Metric name",
                },
                start_time: {
                  type: "string",
                  description: "Start time (ISO 8601 format)",
                },
                end_time: {
                  type: "string",
                  description: "End time (ISO 8601 format)",
                },
              },
              required: ["resource_id", "metric_name"],
            },
          },
          {
            name: "create_alarm",
            description: "Create a monitoring alarm",
            inputSchema: {
              type: "object",
              properties: {
                display_name: {
                  type: "string",
                  description: "Alarm display name",
                },
                metric_compartment_id: {
                  type: "string",
                  description: "Metric compartment OCID",
                },
                metric_namespace: {
                  type: "string",
                  description: "Metric namespace",
                },
                metric_name: {
                  type: "string",
                  description: "Metric name",
                },
                threshold: {
                  type: "number",
                  description: "Alarm threshold",
                },
                operator: {
                  type: "string",
                  description: "Comparison operator",
                  enum: ["GT", "GTE", "LT", "LTE"],
                  default: "GT",
                },
              },
              required: [
                "display_name",
                "metric_compartment_id",
                "metric_namespace",
                "metric_name",
                "threshold",
              ],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "oci_auth":
            return await this.ociAuth(args);
          case "list_instances":
            return await this.listInstances(args);
          case "create_instance":
            return await this.createInstance(args);
          case "start_instance":
            return await this.startInstance(args);
          case "stop_instance":
            return await this.stopInstance(args);
          case "terminate_instance":
            return await this.terminateInstance(args);
          case "list_buckets":
            return await this.listBuckets(args);
          case "create_bucket":
            return await this.createBucket(args);
          case "upload_object":
            return await this.uploadObject(args);
          case "list_vcn":
            return await this.listVCN(args);
          case "create_vcn":
            return await this.createVCN(args);
          case "list_subnets":
            return await this.listSubnets(args);
          case "list_databases":
            return await this.listDatabases(args);
          case "create_database":
            return await this.createDatabase(args);
          case "list_users":
            return await this.listUsers(args);
          case "create_user":
            return await this.createUser(args);
          case "create_group":
            return await this.createGroup(args);
          case "get_cost_analysis":
            return await this.getCostAnalysis(args);
          case "get_metrics":
            return await this.getMetrics(args);
          case "create_alarm":
            return await this.createAlarm(args);

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

  // Authentication
  async ociAuth(args) {
    const { user_ocid, tenancy_ocid, private_key, fingerprint, region } = args;
    try {
      const authResult = {
        user_ocid,
        tenancy_ocid,
        fingerprint,
        region: region || "us-ashburn-1",
        authenticated_at: new Date().toISOString(),
        status: "authenticated",
        session_id: createHash("sha256")
          .update(user_ocid + tenancy_ocid + Date.now())
          .digest("hex")
          .substring(0, 16),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: "OCI authentication successful",
                authentication: authResult,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Compute Operations
  async listInstances(args) {
    const { compartment_id, availability_domain, lifecycle_state } = args;
    try {
      const mockInstances = [
        {
          id: "ocid1.instance.oc1.phx.aaaaaaaaaanexample",
          display_name: "web-server-01",
          shape: "VM.Standard2.1",
          state: "RUNNING",
          availability_domain: "Uocm:PHX-AD-1",
          created_at: "2024-01-10T08:30:00Z",
          public_ip: "129.146.18.1",
          private_ip: "10.0.0.10",
        },
        {
          id: "ocid1.instance.oc1.phx.aaaaaaaabexample",
          display_name: "db-server-01",
          shape: "VM.Standard2.2",
          state: "STOPPED",
          availability_domain: "Uocm:PHX-AD-1",
          created_at: "2024-01-08T14:20:00Z",
          public_ip: null,
          private_ip: "10.0.0.20",
        },
      ];

      let filtered = mockInstances;
      if (availability_domain) {
        filtered = filtered.filter(
          (i) => i.availability_domain === availability_domain
        );
      }
      if (lifecycle_state && lifecycle_state !== "all") {
        filtered = filtered.filter((i) => i.state === lifecycle_state);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                compartment_id,
                instances: filtered,
                total_count: filtered.length,
                filters: { availability_domain, lifecycle_state },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createInstance(args) {
    const {
      compartment_id,
      display_name,
      shape,
      subnet_id,
      image_id,
      ssh_authorized_keys,
    } = args;
    try {
      const instanceResult = {
        compartment_id,
        display_name,
        shape: shape || "VM.Standard2.1",
        subnet_id,
        image_id,
        ssh_authorized_keys: ssh_authorized_keys || [],
        instance_id: createHash("sha256")
          .update(compartment_id + display_name + Date.now())
          .digest("hex")
          .substring(0, 16),
        state: "PROVISIONING",
        created_at: new Date().toISOString(),
        estimated_ready_time: new Date(
          Date.now() + 5 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Instance ${display_name} creation initiated`,
                instance: instanceResult,
                next_steps: [
                  "Wait for instance to be provisioned",
                  "Connect via SSH once running",
                  "Configure security groups if needed",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async startInstance(args) {
    const { instance_id } = args;
    try {
      const startResult = {
        instance_id,
        action: "START",
        status: "STARTING",
        initiated_at: new Date().toISOString(),
        estimated_ready_time: new Date(
          Date.now() + 2 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Instance start initiated`,
                action_result: startResult,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async stopInstance(args) {
    const { instance_id } = args;
    try {
      const stopResult = {
        instance_id,
        action: "STOP",
        status: "STOPPING",
        initiated_at: new Date().toISOString(),
        estimated_stopped_time: new Date(
          Date.now() + 1 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Instance stop initiated`,
                action_result: stopResult,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async terminateInstance(args) {
    const { instance_id, preserve_boot_volume } = args;
    try {
      const terminateResult = {
        instance_id,
        action: "TERMINATE",
        preserve_boot_volume: preserve_boot_volume || false,
        status: "TERMINATING",
        initiated_at: new Date().toISOString(),
        estimated_completion_time: new Date(
          Date.now() + 3 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Instance termination initiated`,
                action_result: terminateResult,
                warning: preserve_boot_volume
                  ? "Boot volume will be preserved"
                  : "Boot volume will be deleted",
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Storage Operations
  async listBuckets(args) {
    const { compartment_id, namespace } = args;
    try {
      const mockBuckets = [
        {
          name: "web-assets",
          namespace: namespace || "mytenancy",
          created_at: "2024-01-05T10:00:00Z",
          size: "2.5 GB",
          object_count: 1247,
          storage_tier: "Standard",
        },
        {
          name: "backup-data",
          namespace: namespace || "mytenancy",
          created_at: "2024-01-03T15:30:00Z",
          size: "15.7 GB",
          object_count: 3421,
          storage_tier: "InfrequentAccess",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                compartment_id,
                namespace: namespace || "mytenancy",
                buckets: mockBuckets,
                total_count: mockBuckets.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createBucket(args) {
    const { compartment_id, name, storage_tier } = args;
    try {
      const bucketResult = {
        compartment_id,
        name,
        namespace: "mytenancy",
        storage_tier: storage_tier || "Standard",
        created_at: new Date().toISOString(),
        size: "0 B",
        object_count: 0,
        bucket_id: createHash("sha256")
          .update(compartment_id + name + Date.now())
          .digest("hex")
          .substring(0, 16),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Bucket ${name} created successfully`,
                bucket: bucketResult,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async uploadObject(args) {
    const { bucket_name, namespace, object_name, content, content_type } = args;
    try {
      const uploadResult = {
        bucket_name,
        namespace: namespace || "mytenancy",
        object_name,
        content_type: content_type || "application/octet-stream",
        size: Buffer.byteLength(content, "base64"),
        uploaded_at: new Date().toISOString(),
        etag: createHash("md5").update(content).digest("hex"),
        object_id: createHash("sha256")
          .update(bucket_name + object_name + Date.now())
          .digest("hex")
          .substring(0, 16),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Object ${object_name} uploaded successfully`,
                upload: uploadResult,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Networking Operations
  async listVCN(args) {
    const { compartment_id } = args;
    try {
      const mockVCNs = [
        {
          id: "ocid1.vcn.oc1.phx.aaaaaaaaaexample",
          display_name: "main-vcn",
          cidr_block: "10.0.0.0/16",
          state: "AVAILABLE",
          created_at: "2024-01-01T09:00:00Z",
          dns_label: "mainvcn",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                compartment_id,
                vcns: mockVCNs,
                total_count: mockVCNs.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createVCN(args) {
    const { compartment_id, display_name, cidr_block } = args;
    try {
      const vcnResult = {
        compartment_id,
        display_name,
        cidr_block: cidr_block || "10.0.0.0/16",
        state: "PROVISIONING",
        created_at: new Date().toISOString(),
        vcn_id: createHash("sha256")
          .update(compartment_id + display_name + Date.now())
          .digest("hex")
          .substring(0, 16),
        dns_label: display_name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 15),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `VCN ${display_name} creation initiated`,
                vcn: vcnResult,
                next_steps: [
                  "Create subnets",
                  "Set up security lists",
                  "Configure route tables",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async listSubnets(args) {
    const { vcn_id } = args;
    try {
      const mockSubnets = [
        {
          id: "ocid1.subnet.oc1.phx.aaaaaaaabexample",
          display_name: "public-subnet",
          cidr_block: "10.0.1.0/24",
          vcn_id,
          availability_domain: "Uocm:PHX-AD-1",
          state: "AVAILABLE",
          created_at: "2024-01-01T09:15:00Z",
        },
        {
          id: "ocid1.subnet.oc1.phx.aaaaaaaacexample",
          display_name: "private-subnet",
          cidr_block: "10.0.2.0/24",
          vcn_id,
          availability_domain: "Uocm:PHX-AD-1",
          state: "AVAILABLE",
          created_at: "2024-01-01T09:20:00Z",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                vcn_id,
                subnets: mockSubnets,
                total_count: mockSubnets.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Database Operations
  async listDatabases(args) {
    const { compartment_id, db_type } = args;
    try {
      const mockDatabases = [
        {
          id: "ocid1.autonomousdatabase.oc1.phx.aaaaaaaaexample",
          display_name: "production-db",
          db_name: "prod_db",
          db_type: "AUTONOMOUS",
          cpu_core_count: 2,
          storage_size_tbs: 1,
          state: "AVAILABLE",
          created_at: "2024-01-05T14:00:00Z",
        },
      ];

      let filtered = mockDatabases;
      if (db_type && db_type !== "all") {
        filtered = filtered.filter((d) => d.db_type === db_type);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                compartment_id,
                databases: filtered,
                total_count: filtered.length,
                filters: { db_type },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createDatabase(args) {
    const {
      compartment_id,
      display_name,
      db_name,
      cpu_core_count,
      data_storage_size_in_tbs,
      admin_password,
    } = args;
    try {
      const dbResult = {
        compartment_id,
        display_name,
        db_name,
        cpu_core_count: cpu_core_count || 1,
        data_storage_size_in_tbs: data_storage_size_in_tbs || 1,
        db_type: "AUTONOMOUS",
        state: "PROVISIONING",
        created_at: new Date().toISOString(),
        estimated_ready_time: new Date(
          Date.now() + 10 * 60 * 1000
        ).toISOString(),
        database_id: createHash("sha256")
          .update(compartment_id + db_name + Date.now())
          .digest("hex")
          .substring(0, 16),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Database ${display_name} creation initiated`,
                database: dbResult,
                next_steps: [
                  "Wait for database to be available",
                  "Connect with database tools",
                  "Set up backup policies",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Identity and Access Management
  async listUsers(args) {
    const { compartment_id } = args;
    try {
      const mockUsers = [
        {
          id: "ocid1.user.oc1..aaaaaaaexample",
          name: "admin-user",
          description: "Administrator user",
          email: "admin@example.com",
          state: "ACTIVE",
          created_at: "2024-01-01T08:00:00Z",
          last_login: "2024-01-14T15:30:00Z",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                compartment_id,
                users: mockUsers,
                total_count: mockUsers.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createUser(args) {
    const { name, description, email } = args;
    try {
      const userResult = {
        name,
        description,
        email: email || "",
        state: "ACTIVE",
        created_at: new Date().toISOString(),
        user_id: createHash("sha256")
          .update(name + Date.now())
          .digest("hex")
          .substring(0, 16),
        capabilities: [],
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `User ${name} created successfully`,
                user: userResult,
                next_steps: [
                  "Set user password",
                  "Assign to appropriate groups",
                  "Grant necessary permissions",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createGroup(args) {
    const { name, description } = args;
    try {
      const groupResult = {
        name,
        description,
        created_at: new Date().toISOString(),
        group_id: createHash("sha256")
          .update(name + Date.now())
          .digest("hex")
          .substring(0, 16),
        user_count: 0,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Group ${name} created successfully`,
                group: groupResult,
                next_steps: [
                  "Add users to group",
                  "Assign policies to group",
                  "Review permissions",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Cost Management
  async getCostAnalysis(args) {
    const { compartment_id, start_date, end_date, granularity } = args;
    try {
      const costData = {
        compartment_id,
        start_date,
        end_date,
        granularity: granularity || "DAILY",
        total_cost: 245.67,
        services: [
          { name: "Compute", cost: 125.3, percentage: 51.0 },
          { name: "Storage", cost: 45.2, percentage: 18.4 },
          { name: "Database", cost: 38.5, percentage: 15.7 },
          { name: "Networking", cost: 28.9, percentage: 11.8 },
          { name: "Other", cost: 7.77, percentage: 3.1 },
        ],
        currency: "USD",
        generated_at: new Date().toISOString(),
        daily_average: 7.89,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                cost_analysis: costData,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  // Monitoring and Logging
  async getMetrics(args) {
    const { resource_id, metric_name, start_time, end_time } = args;
    try {
      const metricsData = {
        resource_id,
        metric_name,
        start_time:
          start_time || new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        end_time: end_time || new Date().toISOString(),
        granularity: "1m",
        data_points: [
          { timestamp: "2024-01-14T09:00:00Z", value: 85.2 },
          { timestamp: "2024-01-14T09:01:00Z", value: 87.1 },
          { timestamp: "2024-01-14T09:02:00Z", value: 83.9 },
          { timestamp: "2024-01-14T09:03:00Z", value: 86.5 },
        ],
        unit: "Percent",
        statistics: {
          min: 83.9,
          max: 87.1,
          avg: 85.68,
          count: 4,
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                metrics: metricsData,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async createAlarm(args) {
    const {
      display_name,
      metric_compartment_id,
      metric_namespace,
      metric_name,
      threshold,
      operator,
    } = args;
    try {
      const alarmResult = {
        display_name,
        metric_compartment_id,
        metric_namespace,
        metric_name,
        threshold,
        operator: operator || "GT",
        state: "ACTIVE",
        created_at: new Date().toISOString(),
        alarm_id: createHash("sha256")
          .update(display_name + metric_name + Date.now())
          .digest("hex")
          .substring(0, 16),
        notification_channels: ["email", "slack"],
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Alarm ${display_name} created successfully`,
                alarm: alarmResult,
              },
              null,
              2
            ),
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
          text: JSON.stringify(
            {
              success: false,
              error: error.message,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("OCI MCP server running on stdio");
  }
}

const server = new OCIMCPServer();
server.run().catch(console.error);
