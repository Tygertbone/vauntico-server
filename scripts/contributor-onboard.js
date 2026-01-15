#!/usr/bin/env node

/**
 * Vauntico Contributor Onboarding CLI
 *
 * This script validates a new contributor's development environment
 * by running ESLint, CodeQL local scan, and logger tests.
 *
 * Usage: node scripts/contributor-onboard.js
 *        --help     Show this help message
 *        --check     Run all validations (ESLint, CodeQL, Logger)
 *        --lint      Run ESLint only
 *        --codeql    Run CodeQL local scan only
 *        --logger    Test logger functionality only
 */

import { spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[32m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function colorText(text, color) {
  return `${color}${text}\x1b[0m}`;
}

function showHelp() {
  console.log(colorText("🚀 Vauntico Contributor Onboarding CLI", "cyan"));
  console.log("");
  console.log(colorText("USAGE:", "yellow"));
  console.log("  node scripts/contributor-onboard.js [options]");
  console.log("");
  console.log(colorText("OPTIONS:", "green"));
  console.log("  --help     Show this help message");
  console.log("  --check     Run all validations (ESLint, CodeQL, Logger)");
  console.log("  --lint      Run ESLint only");
  console.log("  --codeql    Run CodeQL local scan only");
  console.log("  --logger    Test logger functionality only");
  console.log("");
  console.log(colorText("EXAMPLES:", "blue"));
  console.log("  # Run all checks before first contribution");
  console.log("  node scripts/contributor-onboard.js --check");
  console.log("");
  console.log("  # Run specific check");
  console.log("  node scripts/contributor-onboard.js --lint");
  console.log("  node scripts/contributor-onboard.js --codeql");
  console.log("  node scripts/contributor-onboard.js --logger");
  console.log("");
}

function runESLint() {
  console.log(colorText("🔍 Running ESLint validation...", "yellow"));

  return new Promise((resolve, reject) => {
    const eslint = spawn(
      "npx",
      ["eslint", "server-v2/src", "--ext", ".ts,.js"],
      {
        stdio: "inherit",
        shell: true,
      }
    );

    eslint.on("close", (code) => {
      if (code === 0) {
        console.log(colorText("✅ ESLint validation passed!", "green"));
        resolve({ success: true, tool: "eslint" });
      } else {
        console.log(colorText("❌ ESLint validation failed!", "red"));
        console.log(colorText(`Exit code: ${code}`, "yellow"));
        reject(new Error(`ESLint failed with exit code ${code}`));
      }
    });

    eslint.stderr.on("data", (data) => {
      console.log(colorText("ESLint output:", "yellow"));
      process.stdout.write(data);
    });
  });
}

function runCodeQL() {
  console.log(colorText("🔍 Running CodeQL local scan...", "yellow"));

  return new Promise((resolve, reject) => {
    const codeql = spawn(
      "node",
      [process.argv[1], "scripts/run-codeql-local.sh"],
      {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd(),
      }
    );

    codeql.on("close", (code) => {
      if (code === 0) {
        console.log(colorText("✅ CodeQL scan completed!", "green"));
        resolve({ success: true, tool: "codeql" });
      } else {
        console.log(colorText("❌ CodeQL scan failed!", "red"));
        console.log(colorText(`Exit code: ${code}`, "yellow"));
        reject(new Error(`CodeQL failed with exit code ${code}`));
      }
    });

    codeql.stderr.on("data", (data) => {
      console.log(colorText("CodeQL output:", "yellow"));
      process.stdout.write(data);
    });
  });
}

async function testLogger() {
  console.log(colorText("🔍 Testing logger functionality...", "yellow"));

  try {
    // Test if logger exists and can be imported
    const loggerPath = path.join(
      process.cwd(),
      "server-v2/src/utils/logger.ts"
    );

    if (!existsSync(loggerPath)) {
      throw new Error("Logger file not found at server-v2/src/utils/logger.ts");
    }

    // Import logger dynamically to test
    const { logger } = await import(`file://${loggerPath}`);

    // Test basic logging
    logger.info("🧪 Contributor onboarding test - INFO level");
    logger.warn("⚠️ Contributor onboarding test - WARN level");

    console.log(colorText("✅ Logger functionality test passed!", "green"));
    return { success: true, tool: "logger" };
  } catch (error) {
    console.log(colorText("❌ Logger test failed:", "red"));
    console.log(error.message);
    return { success: false, tool: "logger", error: error.message };
  }
}

async function runAllChecks() {
  console.log(
    colorText(
      "🚀 Running comprehensive contributor onboarding checks...",
      "cyan"
    )
  );

  const results = [];

  try {
    const eslintResult = await runESLint();
    results.push(eslintResult);

    const codeqlResult = await runCodeQL();
    results.push(codeqlResult);

    const loggerResult = await testLogger();
    results.push(loggerResult);
  } catch (error) {
    console.log(colorText("❌ Onboarding checks failed:", "red"));
    console.log(error.message);
    return results;
  }

  const hasFailures = results.some((result) => !result.success);

  if (hasFailures) {
    console.log("");
    console.log(colorText("❌ ONBOARDING FAILED - Issues found:", "red"));
    results.forEach((result) => {
      if (!result.success) {
        console.log(
          colorText(
            `  ❌ ${result.tool.toUpperCase()}: ${result.error || "Unknown error"}`,
            "red"
          )
        );
      }
    });

    console.log("");
    console.log(
      colorText("Please fix the above issues before contributing.", "yellow")
    );
  } else {
    console.log("");
    console.log(
      colorText("✅ ALL CHECKS PASSED - Ready to contribute!", "green")
    );
    results.forEach((result) => {
      console.log(
        colorText(
          `  ✅ ${result.tool.toUpperCase()}: ${result.success ? "OK" : "FAILED"}`,
          result.success ? "green" : "red"
        )
      );
    });
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "--help":
    case "help":
    case "--h":
      showHelp();
      break;
    case "--check":
      await runAllChecks();
      break;
    case "--lint":
      await runESLint();
      break;
    case "--codeql":
      await runCodeQL();
      break;
    case "--logger":
      await testLogger();
      break;
    default:
      console.log(colorText("Unknown command. Use --help for usage.", "red"));
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(colorText("❌ Contributor onboarding failed:", "red"));
    console.error(error.message);
    process.exit(1);
  });
}
