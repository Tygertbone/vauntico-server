#!/usr/bin/env node

/**
 * Vauntico Pre-Push Validation Script
 *
 * This script runs comprehensive validation checks before allowing code to be pushed.
 * It ensures code quality, environment configuration, and dependency integrity.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const VALIDATION_CONFIG = {
  allowedFileTypes: [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".md",
    ".yaml",
    ".yml",
    ".html",
    ".css",
    ".scss",
  ],
  maxFileSize: 100 * 1024, // 100KB
  ignoredDirectories: [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".husky",
    ".vscode",
  ],
  requiredEnvVars: ["NODE_ENV", "PORT", "DATABASE_URL", "JWT_SECRET"],
};

// Validation functions
function validateFileTypes() {
  console.log("🔍 Validating file types...");

  const stagedFiles = execSync("git diff --cached --name-only")
    .toString()
    .trim()
    .split("\n");
  const invalidFiles = [];

  for (const file of stagedFiles) {
    if (!file) continue;

    const ext = path.extname(file);
    if (!VALIDATION_CONFIG.allowedFileTypes.includes(ext)) {
      invalidFiles.push(file);
    }
  }

  if (invalidFiles.length > 0) {
    console.error("❌ Invalid file types detected:");
    invalidFiles.forEach((file) => console.error(`  - ${file}`));
    return false;
  }

  console.log("✅ File types validation passed");
  return true;
}

function validateFileSizes() {
  console.log("📏 Validating file sizes...");

  const stagedFiles = execSync("git diff --cached --name-only")
    .toString()
    .trim()
    .split("\n");
  const largeFiles = [];

  for (const file of stagedFiles) {
    if (!file) continue;

    try {
      const stats = fs.statSync(file);
      if (stats.size > VALIDATION_CONFIG.maxFileSize) {
        largeFiles.push({ file, size: formatFileSize(stats.size) });
      }
    } catch (error) {
      // File might not exist locally (e.g., deleted files)
      continue;
    }
  }

  if (largeFiles.length > 0) {
    console.error("❌ Large files detected:");
    largeFiles.forEach(({ file, size }) =>
      console.error(`  - ${file} (${size})`),
    );
    return false;
  }

  console.log("✅ File size validation passed");
  return true;
}

function validateEnvironmentVariables() {
  console.log("🌍 Validating environment variables...");

  // Check if .env file exists
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    console.warn("⚠️  .env file not found. Using .env.example for validation.");
    // Don't fail if .env doesn't exist, but check .env.example
    const exampleEnvPath = path.join(__dirname, "..", ".env.example");
    if (!fs.existsSync(exampleEnvPath)) {
      console.error("❌ Neither .env nor .env.example found");
      return false;
    }
  }

  // Check for sensitive files being committed
  const stagedFiles = execSync("git diff --cached --name-only")
    .toString()
    .trim()
    .split("\n");
  const sensitiveFiles = [".env", ".env.local", ".env.production"];

  for (const file of stagedFiles) {
    if (sensitiveFiles.includes(path.basename(file))) {
      console.error(`❌ Sensitive file ${file} is being committed!`);
      return false;
    }
  }

  console.log("✅ Environment validation passed");
  return true;
}

function validateDependencies() {
  console.log("📦 Validating dependencies...");

  try {
    // Check if package-lock.json is up to date
    execSync("npm ls", { stdio: "pipe" });
    console.log("✅ Dependency validation passed");
    return true;
  } catch (error) {
    console.error("❌ Dependency validation failed:");
    console.error(error.message);
    return false;
  }
}

function validateCommitMessage() {
  console.log("💬 Validating commit message...");

  try {
    const commitMsg = fs.readFileSync(".git/COMMIT_EDITMSG", "utf8").trim();
    const commitPattern =
      /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(?:\(.+?\))?: .{1,}$/;

    if (!commitPattern.test(commitMsg)) {
      console.error(
        "❌ Commit message does not follow conventional commit format",
      );
      console.error("Expected format: type(scope): description");
      console.error("Example: feat: add new feature");
      return false;
    }

    console.log("✅ Commit message validation passed");
    return true;
  } catch (error) {
    console.warn(
      "⚠️  Could not validate commit message (may be running outside commit hook)",
    );
    return true;
  }
}

// Helper functions
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Main validation function
function runValidation() {
  console.log("🚀 Starting Vauntico Pre-Push Validation...\n");

  const validations = [
    validateFileTypes,
    validateFileSizes,
    validateEnvironmentVariables,
    validateDependencies,
    validateCommitMessage,
  ];

  let allPassed = true;

  for (const validation of validations) {
    try {
      const passed = validation();
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ Validation error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("✅ All validations passed! Safe to push.");
    process.exit(0);
  } else {
    console.log(
      "❌ Some validations failed. Please fix the issues before pushing.",
    );
    process.exit(1);
  }
}

// Run validation
runValidation();
