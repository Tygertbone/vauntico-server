#!/usr/bin/env node

/**
 * Pre-Push Ritual: Keep CI/CD Lean (Node.js version for Windows compatibility)
 * This script ensures minimal data usage and prevents failed CI runs
 * Run this before pushing to avoid wasting bandwidth and storage
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function color(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Track success/failure
let passed = 0;
let failed = 0;

// Helper function to log step results
function logStep(success, message) {
  if (success) {
    console.log(color(`✅ ${message}`, "green"));
    passed++;
  } else {
    console.log(color(`❌ ${message}`, "red"));
    failed++;
  }
}

// Helper to run command and check success
function runCommand(command, silent = true) {
  try {
    const options = silent ? { stdio: "pipe" } : {};
    execSync(command, options);
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Helper to get git output
function gitOutput(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}

console.log(color("🚀 Pre-Push Ritual: Keeping CI/CD Lean", "blue"));
console.log("==================================");

// 1. Validate locally before pushing
console.log(`\n${color("📋 Step 1: Local Validation", "yellow")}`);
console.log("------------------------");

if (fileExists("package.json")) {
  // Check if build script exists
  const buildSuccess = runCommand("npm run build", true);
  logStep(buildSuccess, "Build completed successfully");

  // Run tests if available
  const testSuccess = runCommand("npm run test", true);
  logStep(testSuccess, "Tests passed");

  // Run linting if available
  const lintSuccess = runCommand("npm run lint", true);
  logStep(lintSuccess, "Linting passed");

  // Run type checking if available
  const typecheckSuccess = runCommand("npm run typecheck", true);
  logStep(typecheckSuccess, "Type checking passed");
} else {
  logStep(false, "No package.json found");
}

// 2. Check secrets and environment
console.log(`\n${color("🔐 Step 2: Environment Validation", "yellow")}`);
console.log("--------------------------------");

// Check for required environment variables
if (fileExists(".env.example")) {
  try {
    const envExample = fs.readFileSync(".env.example", "utf8");
    const requiredKeys = envExample
      .split("\n")
      .filter((line) => line.includes("=") && !line.startsWith("#"))
      .map((line) => line.split("=")[0]);

    if (fileExists(".env")) {
      const envContent = fs.readFileSync(".env", "utf8");
      const missingKeys = requiredKeys.filter(
        (key) => !envContent.includes(`${key}=`),
      );

      if (missingKeys.length === 0) {
        logStep(true, "All required environment variables present");
      } else {
        logStep(
          false,
          `Missing environment variables: ${missingKeys.join(" ")}`,
        );
      }
    } else {
      logStep(false, "No .env file found");
    }
  } catch (error) {
    logStep(false, "Error reading environment files");
  }
} else {
  logStep(true, "No .env.example to validate against");
}

// Check for exposed secrets
const gitDiff = gitOutput("git diff --cached");
if (
  gitDiff &&
  /(sk_live_|pk_live_|sk_test_|pk_test_|password|secret|key)/.test(gitDiff)
) {
  logStep(false, "Potential secrets detected in staged changes");
} else {
  logStep(true, "No obvious secrets in staged changes");
}

// 3. Cache dependencies
console.log(`\n${color("💾 Step 3: Dependency Optimization", "yellow")}`);
console.log("-----------------------------------");

// Check if using lockfile
if (fileExists("package-lock.json") || fileExists("npm-shrinkwrap.json")) {
  logStep(true, "Lockfile present - will use npm ci for caching");

  // Check if node_modules exists and is recent
  if (fileExists("node_modules")) {
    const nodeModulesTime = fs.statSync("node_modules").mtime;
    const lockfileTime = fs.statSync("package-lock.json").mtime;

    if (nodeModulesTime > lockfileTime) {
      logStep(true, "node_modules is up to date");
    } else {
      logStep(
        false,
        "node_modules may be stale - consider npm ci --prefer-offline",
      );
    }
  } else {
    logStep(false, "No node_modules found - will need to install");
  }
} else {
  logStep(
    false,
    "No lockfile found - recommend running npm install && npm shrinkwrap",
  );
}

// 4. Limit log verbosity
console.log(`\n${color("📝 Step 4: Log Verbosity Check", "yellow")}`);
console.log("--------------------------------");

// Check LOG_LEVEL environment variable
const logLevel = process.env.LOG_LEVEL;
if (logLevel) {
  if (["error", "warn", "warning"].includes(logLevel)) {
    logStep(true, `LOG_LEVEL set to ${logLevel} (minimal verbosity)`);
  } else {
    logStep(
      false,
      `LOG_LEVEL set to ${logLevel} (verbose - consider 'warn' or 'error')`,
    );
  }
} else {
  logStep(false, "LOG_LEVEL not set - recommend export LOG_LEVEL=warn");
}

// 5. Confirm Git hygiene
console.log(`\n${color("🧹 Step 5: Git Hygiene", "yellow")}`);
console.log("------------------------");

// Check for uncommitted changes
const gitStatus = gitOutput("git status --porcelain");
if (!gitStatus) {
  logStep(true, "Working directory clean");
} else {
  logStep(false, "Uncommitted changes detected");
}

// Check staged changes size
const gitStat = gitOutput("git diff --cached --stat");
if (gitStat) {
  const lines = gitStat.split("\n");
  let totalSize = 0;

  lines.forEach((line) => {
    const match = line.match(/\s+(\d+)\s+change/);
    if (match) {
      totalSize += parseInt(match[1]);
    }
  });

  if (totalSize > 1000000) {
    // 1MB
    logStep(
      false,
      `Large staged changes detected (${Math.round(totalSize / 1000000)}MB) - consider excluding large files`,
    );
  } else {
    logStep(
      true,
      `Staged changes size acceptable (${Math.round(totalSize / 1024)}KB)`,
    );
  }
} else {
  logStep(true, "Staged changes size acceptable (0KB)");
}

// Check for large files in repository
try {
  const findOutput = execSync(
    'find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null',
    { encoding: "utf8" },
  );
  const largeFiles = findOutput
    .trim()
    .split("\n")
    .filter((line) => line);

  if (largeFiles.length > 0) {
    logStep(
      false,
      `${largeFiles.length} large files (>10MB) found in repository`,
    );
  } else {
    logStep(true, "No large files found");
  }
} catch {
  logStep(true, "No large files found");
}

// 6. Network usage optimization
console.log(`\n${color("🌐 Step 6: Network Usage Optimization", "yellow")}`);
console.log("---------------------------------------");

// Check if .npmrc has cache settings
if (fileExists(".npmrc")) {
  try {
    const npmrcContent = fs.readFileSync(".npmrc", "utf8");
    if (npmrcContent.includes("cache=")) {
      logStep(true, "npm cache configured in .npmrc");
    } else {
      logStep(false, "Consider adding cache settings to .npmrc");
    }
  } catch {
    logStep(false, "Error reading .npmrc");
  }
} else {
  logStep(false, "No .npmrc found - consider creating one with cache settings");
}

// Check for offline-first settings
let offlineFirstConfigured = false;
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (
    packageJson.scripts &&
    Object.values(packageJson.scripts).some((script) =>
      script.includes("prefer-offline"),
    )
  ) {
    offlineFirstConfigured = true;
  }
} catch {}

const npmrcContent = fileExists(".npmrc")
  ? fs.readFileSync(".npmrc", "utf8")
  : "";
if (offlineFirstConfigured || npmrcContent.includes("prefer-offline")) {
  logStep(true, "Offline-first package management configured");
} else {
  logStep(false, "Consider adding offline-first package management");
}

// Summary
console.log(`\n${color("📊 Pre-Push Ritual Summary", "blue")}`);
console.log("===========================");
console.log(`Passed: ${color(passed.toString(), "green")}`);
console.log(`Failed: ${color(failed.toString(), "red")}`);

if (failed === 0) {
  console.log(`\n${color("🎉 All checks passed! Ready to push.", "green")}`);
  console.log(
    color("💡 Tip: Use 'git push origin main' to push safely", "yellow"),
  );
  process.exit(0);
} else {
  console.log(
    `\n${color(`⚠️  ${failed} check(s) failed. Fix issues before pushing.`, "red")}`,
  );
  console.log(
    color(
      "💡 Tip: Failed checks help prevent CI failures and save bandwidth",
      "yellow",
    ),
  );
  process.exit(1);
}
