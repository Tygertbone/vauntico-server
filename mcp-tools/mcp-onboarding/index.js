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

class OnboardingMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "mcp-onboarding",
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
          // User Registration
          {
            name: "register_user",
            description: "Register a new contributor in the onboarding system",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username or identifier",
                },
                email: {
                  type: "string",
                  description: "Contact email address",
                },
                role: {
                  type: "string",
                  description: "Contributor role",
                  enum: ["contributor", "maintainer", "reviewer", "admin"],
                  default: "contributor",
                },
                skills: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of technical skills",
                },
                interests: {
                  type: "array",
                  items: { type: "string" },
                  description: "Areas of interest in the project",
                },
              },
              required: ["username", "email"],
            },
          },
          // Welcome Messages
          {
            name: "send_welcome_message",
            description: "Send personalized welcome message to new contributor",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username",
                },
                channel: {
                  type: "string",
                  description: "Communication channel",
                  enum: ["email", "slack", "discord", "github"],
                  default: "github",
                },
                template: {
                  type: "string",
                  description: "Welcome template type",
                  enum: ["standard", "developer", "designer", "contributor"],
                  default: "standard",
                },
              },
              required: ["username"],
            },
          },
          // Onboarding Tasks
          {
            name: "create_onboarding_tasks",
            description:
              "Generate personalized onboarding tasks for contributor",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username",
                },
                role: {
                  type: "string",
                  description: "Contributor role",
                  enum: ["contributor", "maintainer", "reviewer", "admin"],
                  default: "contributor",
                },
                skills: {
                  type: "array",
                  items: { type: "string" },
                  description: "Known skills to tailor tasks",
                },
                difficulty: {
                  type: "string",
                  description: "Task difficulty level",
                  enum: ["beginner", "intermediate", "advanced"],
                  default: "beginner",
                },
              },
              required: ["username"],
            },
          },
          // Progress Tracking
          {
            name: "track_onboarding_progress",
            description: "Track and update onboarding progress for contributor",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username",
                },
                task_id: {
                  type: "string",
                  description: "Task identifier",
                },
                status: {
                  type: "string",
                  description: "Task completion status",
                  enum: ["pending", "in_progress", "completed", "blocked"],
                  default: "pending",
                },
                notes: {
                  type: "string",
                  description: "Optional notes about progress",
                },
              },
              required: ["username", "task_id", "status"],
            },
          },
          // Resource Recommendations
          {
            name: "recommend_resources",
            description:
              "Recommend learning resources based on role and skills",
            inputSchema: {
              type: "object",
              properties: {
                role: {
                  type: "string",
                  description: "Contributor role",
                  enum: ["contributor", "maintainer", "reviewer", "admin"],
                  default: "contributor",
                },
                skills: {
                  type: "array",
                  items: { type: "string" },
                  description: "Current skill set",
                },
                interests: {
                  type: "array",
                  items: { type: "string" },
                  description: "Areas of interest",
                },
                resource_type: {
                  type: "string",
                  description: "Type of resources to recommend",
                  enum: [
                    "documentation",
                    "tutorials",
                    "videos",
                    "articles",
                    "courses",
                  ],
                  default: "documentation",
                },
              },
              required: ["role"],
            },
          },
          // Mentor Assignment
          {
            name: "assign_mentor",
            description: "Assign a mentor to a new contributor",
            inputSchema: {
              type: "object",
              properties: {
                mentee_username: {
                  type: "string",
                  description: "New contributor username",
                },
                mentor_username: {
                  type: "string",
                  description: "Mentor username",
                },
                focus_areas: {
                  type: "array",
                  items: { type: "string" },
                  description: "Areas mentor will focus on",
                },
                duration_weeks: {
                  type: "number",
                  description: "Mentorship duration in weeks",
                  default: 4,
                },
              },
              required: ["mentee_username", "mentor_username"],
            },
          },
          // Onboarding Checklist
          {
            name: "generate_checklist",
            description: "Generate personalized onboarding checklist",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username",
                },
                role: {
                  type: "string",
                  description: "Contributor role",
                  enum: ["contributor", "maintainer", "reviewer", "admin"],
                  default: "contributor",
                },
                include_setup: {
                  type: "boolean",
                  description: "Include development setup tasks",
                  default: true,
                },
                include_documentation: {
                  type: "boolean",
                  description: "Include documentation review tasks",
                  default: true,
                },
              },
              required: ["username", "role"],
            },
          },
          // Community Integration
          {
            name: "schedule_community_introduction",
            description: "Schedule introduction to community channels",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username",
                },
                channels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Community channels to introduce to",
                },
                introduction_type: {
                  type: "string",
                  description: "Type of introduction",
                  enum: [
                    "announcement",
                    "spotlight",
                    "welcome",
                    "team_introduction",
                  ],
                  default: "welcome",
                },
              },
              required: ["username"],
            },
          },
          // Feedback Collection
          {
            name: "collect_onboarding_feedback",
            description: "Collect feedback on onboarding experience",
            inputSchema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  description: "GitHub username",
                },
                feedback_type: {
                  type: "string",
                  description: "Type of feedback",
                  enum: ["initial", "mid_point", "completion", "retrospective"],
                  default: "initial",
                },
                questions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Custom feedback questions",
                },
              },
              required: ["username"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "register_user":
            return await this.registerUser(args);
          case "send_welcome_message":
            return await this.sendWelcomeMessage(args);
          case "create_onboarding_tasks":
            return await this.createOnboardingTasks(args);
          case "track_onboarding_progress":
            return await this.trackOnboardingProgress(args);
          case "recommend_resources":
            return await this.recommendResources(args);
          case "assign_mentor":
            return await this.assignMentor(args);
          case "generate_checklist":
            return await this.generateChecklist(args);
          case "schedule_community_introduction":
            return await this.scheduleCommunityIntroduction(args);
          case "collect_onboarding_feedback":
            return await this.collectOnboardingFeedback(args);

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

  // User Registration
  async registerUser(args) {
    const { username, email, role, skills, interests } = args;
    try {
      const userId = createHash("sha256")
        .update(username + email)
        .digest("hex")
        .substring(0, 8);

      const userData = {
        user_id: userId,
        username,
        email,
        role: role || "contributor",
        skills: skills || [],
        interests: interests || [],
        registration_date: new Date().toISOString(),
        onboarding_status: "pending",
        progress: {
          tasks_completed: 0,
          total_tasks: 0,
          completion_percentage: 0,
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `User ${username} registered successfully`,
                user: userData,
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

  // Welcome Messages
  async sendWelcomeMessage(args) {
    const { username, channel, template } = args;
    try {
      const templates = {
        standard: `Welcome to Vauntico, @${username}! 🎉 We're excited to have you as part of our community. Check out our contributor guide to get started.`,
        developer: `Welcome @${username}! 👋 Great to have a developer on board! Our technical documentation and issue tracker are great places to start.`,
        designer: `Welcome @${username}! 🎨 We're thrilled to have your design expertise! Our design system and UI guidelines are perfect starting points.`,
        contributor: `Welcome to the team, @${username}! 🚀 Your contribution journey starts here. Don't hesitate to ask questions and engage with the community.`,
      };

      const message = templates[template] || templates.standard;
      const deliveryChannel = channel || "github";

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Welcome message sent to ${username} via ${deliveryChannel}`,
                content: message,
                delivery_info: {
                  channel: deliveryChannel,
                  timestamp: new Date().toISOString(),
                  template_used: template,
                },
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

  // Onboarding Tasks
  async createOnboardingTasks(args) {
    const { username, role, skills, difficulty } = args;
    try {
      const taskTemplates = {
        contributor: {
          beginner: [
            "Read the contributing guidelines",
            "Set up local development environment",
            "Introduce yourself in the community chat",
            "Review the code of conduct",
            "Find and read documentation for your area of interest",
          ],
          intermediate: [
            "Fix a good first issue",
            "Review a pull request",
            "Participate in a discussion",
            "Update documentation",
            "Add a test case",
          ],
          advanced: [
            "Implement a new feature",
            "Lead a code review",
            "Mentor another contributor",
            "Improve CI/CD pipeline",
            "Architect a solution",
          ],
        },
        maintainer: {
          beginner: [
            "Review project governance",
            "Understand release process",
            "Set up deployment access",
            "Review security policies",
            "Join maintainer meetings",
          ],
          intermediate: [
            "Manage GitHub teams",
            "Handle security issues",
            "Coordinate releases",
            "Review large PRs",
            "Manage project roadmap",
          ],
          advanced: [
            "Design architecture improvements",
            "Handle major incident response",
            "Strategic planning",
            "Community leadership",
            "Cross-team collaboration",
          ],
        },
      };

      const userRole = role || "contributor";
      const taskDifficulty = difficulty || "beginner";
      const tasks =
        taskTemplates[userRole]?.[taskDifficulty] ||
        taskTemplates.contributor.beginner;

      const taskObjects = tasks.map((task, index) => ({
        task_id: `${username}_task_${index + 1}`,
        title: task,
        status: "pending",
        priority: index === 0 ? "high" : "normal",
        estimated_hours:
          taskDifficulty === "beginner"
            ? 2
            : taskDifficulty === "intermediate"
              ? 4
              : 8,
        created_at: new Date().toISOString(),
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Created ${tasks.length} onboarding tasks for ${username}`,
                tasks: taskObjects,
                metadata: {
                  role: userRole,
                  difficulty: taskDifficulty,
                  total_estimated_hours: taskObjects.reduce(
                    (sum, task) => sum + task.estimated_hours,
                    0
                  ),
                },
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

  // Progress Tracking
  async trackOnboardingProgress(args) {
    const { username, task_id, status, notes } = args;
    try {
      const progressEntry = {
        username,
        task_id,
        status,
        notes: notes || "",
        timestamp: new Date().toISOString(),
        updated_by: "mcp-onboarding",
      };

      // Simulate progress calculation
      const mockProgress = {
        total_tasks: 8,
        completed_tasks: status === "completed" ? 3 : 2,
        completion_percentage: status === "completed" ? 37.5 : 25,
        current_streak: 3,
        estimated_completion: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Progress updated for ${username} - Task ${task_id}: ${status}`,
                progress_update: progressEntry,
                overall_progress: mockProgress,
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

  // Resource Recommendations
  async recommendResources(args) {
    const { role, skills, interests, resource_type } = args;
    try {
      const resources = {
        contributor: {
          documentation: [
            "CONTRIBUTING.md - How to contribute",
            "README.md - Project overview",
            "CODE_OF_CONDUCT.md - Community guidelines",
            "docs/GETTING_STARTED.md - Setup guide",
            "docs/ARCHITECTURE.md - System design",
          ],
          tutorials: [
            "Setting up your development environment",
            "Making your first pull request",
            "Code review best practices",
            "Git workflow tutorial",
            "Testing strategies",
          ],
          videos: [
            "Project introduction and demo",
            "Development workflow walkthrough",
            "Code review process",
            "Community contribution guide",
            "Technical deep-dive sessions",
          ],
        },
        maintainer: {
          documentation: [
            "docs/MAINTAINERS.md - Maintainer guide",
            "docs/RELEASE_PROCESS.md - Release procedure",
            "docs/SECURITY.md - Security policies",
            "docs/GOVERNANCE.md - Project governance",
            "docs/COMMUNITY_MANAGEMENT.md - Community guidelines",
          ],
          tutorials: [
            "Release management",
            "Security incident handling",
            "Community moderation",
            "Strategic planning",
            "Cross-team coordination",
          ],
        },
      };

      const userRole = role || "contributor";
      const resourceCategory = resource_type || "documentation";
      const recommendations =
        resources[userRole]?.[resourceCategory] ||
        resources.contributor.documentation;

      // Add personalized recommendations based on skills and interests
      const personalized = [];
      if (skills?.includes("javascript")) {
        personalized.push("JavaScript best practices guide");
      }
      if (interests?.includes("ui")) {
        personalized.push("UI component documentation");
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Resource recommendations for ${userRole} role`,
                resources: recommendations,
                personalized_recommendations: personalized,
                metadata: {
                  role: userRole,
                  resource_type: resourceCategory,
                  total_resources: recommendations.length + personalized.length,
                },
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

  // Mentor Assignment
  async assignMentor(args) {
    const { mentee_username, mentor_username, focus_areas, duration_weeks } =
      args;
    try {
      const mentorship = {
        mentorship_id: createHash("sha256")
          .update(mentee_username + mentor_username + Date.now())
          .digest("hex")
          .substring(0, 8),
        mentee_username,
        mentor_username,
        focus_areas: focus_areas || ["general onboarding"],
        duration_weeks: duration_weeks || 4,
        start_date: new Date().toISOString(),
        end_date: new Date(
          Date.now() + (duration_weeks || 4) * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "active",
        meeting_frequency: "weekly",
        goals: [
          "Complete onboarding checklist",
          "Make first contribution",
          "Understand project architecture",
          "Build community connections",
        ],
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Mentorship established: ${mentor_username} mentoring ${mentee_username}`,
                mentorship,
                next_steps: [
                  "Schedule first mentorship meeting",
                  "Set communication preferences",
                  "Define specific goals",
                  "Establish check-in schedule",
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

  // Generate Checklist
  async generateChecklist(args) {
    const { username, role, include_setup, include_documentation } = args;
    try {
      const baseChecklist = [
        "Accept community invitation",
        "Introduce yourself in welcome channel",
        "Read code of conduct",
        "Review contribution guidelines",
      ];

      const setupChecklist = include_setup
        ? [
            "Set up development environment",
            "Install required dependencies",
            "Run the application locally",
            "Set up Git configuration",
            "Configure IDE/editor",
            "Set up linting and formatting",
          ]
        : [];

      const documentationChecklist = include_documentation
        ? [
            "Read project README",
            "Review architecture documentation",
            "Study API documentation",
            "Understand coding standards",
            "Review testing guidelines",
          ]
        : [];

      const roleSpecific = {
        contributor: [
          "Find a good first issue",
          "Join relevant discussions",
          "Follow project on GitHub",
          "Subscribe to announcements",
        ],
        maintainer: [
          "Set up deployment access",
          "Review security policies",
          "Join maintainer meetings",
          "Set up alert notifications",
        ],
        reviewer: [
          "Understand review criteria",
          "Set up review notifications",
          "Study code review guidelines",
          "Practice reviewing sample PRs",
        ],
        admin: [
          "Set up administrative access",
          "Review governance policies",
          "Set up security monitoring",
          "Configure backup systems",
        ],
      };

      const allTasks = [
        ...baseChecklist,
        ...setupChecklist,
        ...documentationChecklist,
        ...(roleSpecific[role] || roleSpecific.contributor),
      ];

      const checklist = allTasks.map((task, index) => ({
        task_id: `${username}_checklist_${index + 1}`,
        task,
        completed: false,
        priority: index < 3 ? "high" : "normal",
        category:
          index < baseChecklist.length
            ? "community"
            : index < baseChecklist.length + setupChecklist.length
              ? "setup"
              : index <
                  baseChecklist.length +
                    setupChecklist.length +
                    documentationChecklist.length
                ? "documentation"
                : "role_specific",
        order: index + 1,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Generated personalized checklist for ${username}`,
                checklist,
                summary: {
                  total_tasks: checklist.length,
                  high_priority: checklist.filter((t) => t.priority === "high")
                    .length,
                  categories: [...new Set(checklist.map((t) => t.category))],
                },
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

  // Community Introduction
  async scheduleCommunityIntroduction(args) {
    const { username, channels, introduction_type } = args;
    try {
      const defaultChannels = ["general", "welcome", "introductions"];
      const targetChannels = channels || defaultChannels;

      const introductions = targetChannels.map((channel) => ({
        channel,
        username,
        type: introduction_type || "welcome",
        scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        template: this.getIntroductionTemplate(introduction_type),
        status: "scheduled",
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Community introductions scheduled for ${username}`,
                introductions,
                scheduled_count: introductions.length,
                next_introduction: introductions[0]?.scheduled_time,
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

  // Feedback Collection
  async collectOnboardingFeedback(args) {
    const { username, feedback_type, questions } = args;
    try {
      const defaultQuestions = {
        initial: [
          "How was your registration experience?",
          "Did you find the welcome information helpful?",
          "What could we improve in the onboarding process?",
        ],
        mid_point: [
          "How are you progressing with your onboarding tasks?",
          "Do you feel supported by the community?",
          "What resources have been most helpful?",
        ],
        completion: [
          "Overall, how satisfied are you with the onboarding experience?",
          "What was the most valuable part of onboarding?",
          "What would you change about the process?",
        ],
        retrospective: [
          "Looking back, what prepared you best for contributing?",
          "What surprised you about the community or project?",
          "What advice would you give to new contributors?",
        ],
      };

      const feedbackQuestions =
        questions ||
        defaultQuestions[feedback_type] ||
        defaultQuestions.initial;

      const feedbackSession = {
        session_id: createHash("sha256")
          .update(username + feedback_type + Date.now())
          .digest("hex")
          .substring(0, 8),
        username,
        feedback_type: feedback_type || "initial",
        questions: feedbackQuestions,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 week
        status: "pending",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                message: `Feedback session created for ${username}`,
                feedback_session: feedbackSession,
                collection_methods: [
                  "In-app survey",
                  "Email questionnaire",
                  "One-on-one conversation",
                  "Community forum post",
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

  getIntroductionTemplate(type) {
    const templates = {
      announcement: `📢 New Contributor Alert! Please welcome @{username} to our community!`,
      spotlight: `✨ Contributor Spotlight! Meet @{username}, our newest team member!`,
      welcome: `👋 A warm welcome to @{username} who just joined our community!`,
      team_introduction: `🚀 Team Update! @{username} has joined as a new contributor!`,
    };
    return templates[type] || templates.welcome;
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
    console.error("Onboarding MCP server running on stdio");
  }
}

const server = new OnboardingMCPServer();
server.run().catch(console.error);
