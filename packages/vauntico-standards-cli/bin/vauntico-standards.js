#!/usr/bin/env node

/**
 * Vauntico Standards CLI
 *
 * Automated governance and compliance enforcement for Vauntico projects
 *
 * Usage: vauntico-standards [command] [options]
 */

const { Command } = require("commander");
const chalk = require("chalk");
const path = require("path");
const { StandardsEnforcer } = require("../src/enforcer.js");

const program = new Command();

program
  .name("vauntico-standards")
  .description(
    "Vauntico Standards Enforcement CLI - Automated governance and compliance enforcement"
  )
  .version("1.0.0");

program
  .command("check")
  .description("Run comprehensive standards compliance check")
  .option(
    "-c, --category <type>",
    "Run specific category (lint, security, logger, docs, workflow, governance)"
  )
  .option("-q, --quick", "Fast scan for critical issues only")
  .option("--comprehensive", "Full comprehensive scan with detailed reporting")
  .option("--fix", "Attempt to auto-fix common issues")
  .option("--report", "Generate detailed compliance report")
  .option("-v, --verbose", "Show detailed output")
  .action(async (options) => {
    const enforcer = new StandardsEnforcer(process.cwd());

    try {
      if (options.category) {
        await enforcer.runCategoryCheck(options.category, options);
      } else if (options.quick) {
        await enforcer.runQuickScan(options);
      } else if (options.comprehensive) {
        await enforcer.runComprehensiveScan(options);
      } else if (options.fix) {
        await enforcer.runAutoFix(options);
      } else if (options.report) {
        await enforcer.generateComplianceReport(options);
      } else {
        await enforcer.runAllChecks();
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize standards enforcement in current repository")
  .option(
    "-t, --template <type>",
    "Template type (basic, enterprise, microservice)",
    "basic"
  )
  .option("-f, --force", "Overwrite existing configuration")
  .action(async (options) => {
    const { initRepository } = require("../src/init.js");

    try {
      await initRepository(process.cwd(), options.template, options.force);
      console.log(
        chalk.green("✅ Standards enforcement initialized successfully")
      );
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("config")
  .description("Manage standards configuration")
  .option("-s, --set <key=value>", "Set configuration value")
  .option("-g, --get <key>", "Get configuration value")
  .option("-l, --list", "List all configuration values")
  .action(async (options) => {
    const { manageConfig } = require("../src/config.js");

    try {
      if (options.set) {
        const [key, value] = options.set.split("=");
        manageConfig.set(key, value);
        console.log(chalk.green(`✅ Set ${key} = ${value}`));
      } else if (options.get) {
        const value = manageConfig.get(options.get);
        console.log(`${options.get} = ${value}`);
      } else if (options.list) {
        const config = manageConfig.list();
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(chalk.yellow("Please specify --set, --get, or --list"));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("dashboard")
  .description("Open compliance dashboard")
  .option("-p, --port <number>", "Dashboard port", "3000")
  .option("--local", "Run dashboard locally", false)
  .action(async (options) => {
    const { startDashboard } = require("../src/dashboard.js");

    try {
      await startDashboard(options.port, options.local);
      console.log(chalk.green(`📊 Dashboard started on port ${options.port}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("monitor")
  .description("Start continuous monitoring")
  .option("-i, --interval <seconds>", "Monitoring interval in seconds", "300")
  .option("--webhook <url>", "Webhook URL for notifications")
  .action(async (options) => {
    const { startMonitoring } = require("../src/monitor.js");

    try {
      await startMonitoring(parseInt(options.interval), options.webhook);
      console.log(
        chalk.green(`🔍 Started monitoring with ${options.interval}s interval`)
      );
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("report")
  .description("Generate compliance report")
  .option(
    "-f, --format <type>",
    "Report format (json, markdown, html)",
    "markdown"
  )
  .option("-o, --output <path>", "Output file path")
  .option("--email <address>", "Email report to address")
  .action(async (options) => {
    const enforcer = new StandardsEnforcer(process.cwd());
    const { generateReport } = require("../src/report.js");

    try {
      await enforcer.runAllChecks();
      await generateReport(
        enforcer,
        options.format,
        options.output,
        options.email
      );
      console.log(chalk.green("📄 Compliance report generated"));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Error handling
program.on("command:*", () => {
  console.error(chalk.red("Invalid command: %s"), program.args.join(" "));
  console.log("See --help for a list of available commands.");
  process.exit(1);
});

// Parse command line arguments
program.parse();
