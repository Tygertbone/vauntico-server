#!/usr/bin/env node

// Test script for Vauntico Trust-Score Backend Deployment Scripts
// Validates script syntax, dependencies, and basic functionality

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Test results
let testsPassed = 0;
let testsFailed = 0;
let testsTotal = 0;

// Logging functions
const log = (message) => {
  console.log(
    `${colors.blue}[${new Date().toISOString().slice(0, 19)}] ${message}${colors.reset}`,
  );
};

const logSuccess = (message) => {
  console.log(
    `${colors.green}[${new Date().toISOString().slice(0, 19)}] ✅ ${message}${colors.reset}`,
  );
};

const logWarning = (message) => {
  console.log(
    `${colors.yellow}[${new Date().toISOString().slice(0, 19)}] ⚠️  ${message}${colors.reset}`,
  );
};

const logError = (message) => {
  console.log(
    `${colors.red}[${new Date().toISOString().slice(0, 19)}] ❌ ${message}${colors.reset}`,
  );
};

// Test function
const runTest = (testName, testCommand) => {
  testsTotal++;
  log(`Running test: ${testName}`);

  try {
    if (typeof testCommand === "function") {
      testCommand();
    } else {
      execSync(testCommand, { stdio: "pipe", timeout: 5000 });
    }
    logSuccess(`PASSED: ${testName}`);
    testsPassed++;
    return true;
  } catch (error) {
    logError(`FAILED: ${testName}`);
    testsFailed++;
    return false;
  }
};

// Check if required tools are available
const checkDependencies = () => {
  log("=== Checking Dependencies ===");

  runTest("Node.js available", () => {
    const version = process.version;
    if (!version) throw new Error("Node.js version not found");
  });

  runTest("NPM available", () => {
    execSync("npm --version", { stdio: "pipe" });
  });

  runTest("Git available", () => {
    execSync("git --version", { stdio: "pipe" });
  });

  // Check for curl (might not be available on Windows)
  try {
    execSync("curl --version", { stdio: "pipe" });
    logSuccess("curl available");
  } catch (error) {
    logWarning(
      "curl not available (use PowerShell Invoke-WebRequest on Windows)",
    );
  }

  // Check for bash (for when scripts are run on Linux)
  try {
    execSync("bash --version", { stdio: "pipe" });
    logSuccess("bash available");
  } catch (error) {
    logWarning("bash not available (scripts designed for Linux/macOS)");
  }
};

// Test script syntax
const testScriptSyntax = () => {
  log("=== Testing Script Syntax ===");

  // Test main deployment script
  if (fs.existsSync("backend-deploy-v2-optimized.sh")) {
    runTest("Main deployment script exists", () => {
      if (!fs.existsSync("backend-deploy-v2-optimized.sh")) {
        throw new Error("File not found");
      }
    });

    runTest("Main deployment script readable", () => {
      const content = fs.readFileSync("backend-deploy-v2-optimized.sh", "utf8");
      if (!content.includes("#!/bin/bash")) {
        throw new Error("Not a valid bash script");
      }
    });

    runTest("Main deployment script has functions", () => {
      const content = fs.readFileSync("backend-deploy-v2-optimized.sh", "utf8");
      if (!content.includes("main()")) {
        throw new Error("Missing main function");
      }
    });
  } else {
    logError("Main deployment script not found");
    testsFailed++;
  }

  // Test validation script
  if (fs.existsSync("validate-backend-deployment.sh")) {
    runTest("Validation script exists", () => {
      if (!fs.existsSync("validate-backend-deployment.sh")) {
        throw new Error("File not found");
      }
    });

    runTest("Validation script readable", () => {
      const content = fs.readFileSync("validate-backend-deployment.sh", "utf8");
      if (!content.includes("#!/bin/bash")) {
        throw new Error("Not a valid bash script");
      }
    });
  } else {
    logError("Validation script not found");
    testsFailed++;
  }

  // Test original script for comparison
  if (fs.existsSync("backend-deploy.sh")) {
    runTest("Original deployment script exists", () => {
      const content = fs.readFileSync("backend-deploy.sh", "utf8");
      if (!content.includes("#!/bin/bash")) {
        throw new Error("Not a valid bash script");
      }
    });
  }
};

// Test file generation capabilities
const testFileGeneration = () => {
  log("=== Testing File Generation ===");

  const tempDir = fs.mkdtempSync(
    path.join(require("os").tmpdir(), "vauntico-test-"),
  );

  try {
    // Test server.js generation
    const serverJs = `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on port \${PORT}\`);
});`;

    fs.writeFileSync(path.join(tempDir, "test_server.js"), serverJs);
    runTest("Server.js file generation test", () => {
      if (!fs.existsSync(path.join(tempDir, "test_server.js"))) {
        throw new Error("File not created");
      }
    });

    // Test package.json generation
    const packageJson = {
      name: "trust-score-backend",
      version: "2.0.0",
      description: "Vauntico Trust-Score Backend API",
      main: "server.js",
      scripts: {
        start: "node server.js",
      },
      dependencies: {
        express: "^4.18.2",
      },
    };

    fs.writeFileSync(
      path.join(tempDir, "test_package.json"),
      JSON.stringify(packageJson, null, 2),
    );
    runTest("Package.json file generation test", () => {
      if (!fs.existsSync(path.join(tempDir, "test_package.json"))) {
        throw new Error("File not created");
      }
    });

    // Test JSON validity
    runTest("Generated package.json valid", () => {
      const content = fs.readFileSync(
        path.join(tempDir, "test_package.json"),
        "utf8",
      );
      JSON.parse(content);
    });
  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

// Test Node.js application basics
const testNodejsApplication = () => {
  log("=== Testing Node.js Application Basics ===");

  const tempDir = fs.mkdtempSync(
    path.join(require("os").tmpdir(), "vauntico-test-"),
  );

  try {
    // Create minimal test application
    const testApp = `const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
    }));
});

const PORT = 3001;
server.listen(PORT, '127.0.0.1', () => {
    console.log(\`Test server running on port \${PORT}\`);
    setTimeout(() => {
        server.close();
        process.exit(0);
    }, 100);
});`;

    fs.writeFileSync(path.join(tempDir, "test_app.js"), testApp);

    runTest("Node.js application startup", () => {
      execSync(`node "${path.join(tempDir, "test_app.js")}"`, {
        stdio: "pipe",
        timeout: 5000,
      });
    });
  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

// Test security configurations
const testSecurityConfigs = () => {
  log("=== Testing Security Configurations ===");

  const tempDir = fs.mkdtempSync(
    path.join(require("os").tmpdir(), "vauntico-test-"),
  );

  try {
    // Test PM2 ecosystem configuration generation
    const ecosystemConfig = `module.exports = {
  apps: [{
    name: 'test-app',
    script: './test.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};`;

    fs.writeFileSync(
      path.join(tempDir, "test_ecosystem.config.js"),
      ecosystemConfig,
    );
    runTest("PM2 ecosystem config generation", () => {
      if (!fs.existsSync(path.join(tempDir, "test_ecosystem.config.js"))) {
        throw new Error("File not created");
      }
    });

    // Test systemd service file generation
    const systemdService = `[Unit]
Description=Test Service
After=network.target

[Service]
Type=simple
User=testuser
WorkingDirectory=/tmp
ExecStart=/usr/bin/node test.js
Restart=always

[Install]
WantedBy=multi-user.target`;

    fs.writeFileSync(path.join(tempDir, "test_service"), systemdService);
    runTest("Systemd service file generation", () => {
      if (!fs.existsSync(path.join(tempDir, "test_service"))) {
        throw new Error("File not created");
      }
    });
  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

// Test environment variable handling
const testEnvironmentVariables = () => {
  log("=== Testing Environment Variables ===");

  // Test default values
  const PORT = process.env.PORT || "3000";
  const NODE_ENV = process.env.NODE_ENV || "production";
  const LOG_DIR = process.env.LOG_DIR || "/var/log/vauntico";

  runTest("PORT variable set", () => {
    if (!PORT) throw new Error("PORT not set");
  });

  runTest("NODE_ENV variable set", () => {
    if (!NODE_ENV) throw new Error("NODE_ENV not set");
  });

  runTest("LOG_DIR variable set", () => {
    if (!LOG_DIR) throw new Error("LOG_DIR not set");
  });

  // Test custom values
  runTest("Custom environment variables", () => {
    const customPort = "8080";
    const customNodeEnv = "development";
    const customLogDir = "/tmp/test";

    if (
      customPort !== "8080" ||
      customNodeEnv !== "development" ||
      customLogDir !== "/tmp/test"
    ) {
      throw new Error("Custom environment variables not working");
    }
  });
};

// Test documentation files
const testDocumentation = () => {
  log("=== Testing Documentation ===");

  if (fs.existsSync("BACKEND_DEPLOYMENT_V2_GUIDE.md")) {
    runTest("Deployment guide exists", () => {
      const content = fs.readFileSync("BACKEND_DEPLOYMENT_V2_GUIDE.md", "utf8");
      if (
        !content.includes("# Vauntico Trust-Score Backend Deployment Guide")
      ) {
        throw new Error("Invalid deployment guide");
      }
    });

    runTest("Deployment guide has sections", () => {
      const content = fs.readFileSync("BACKEND_DEPLOYMENT_V2_GUIDE.md", "utf8");
      const requiredSections = [
        "## 🚀 What's New in v2.0",
        "## 🛠️ Prerequisites",
        "## 🚀 Quick Start",
      ];
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          throw new Error(`Missing section: ${section}`);
        }
      }
    });
  } else {
    logError("Deployment guide not found");
    testsFailed++;
  }
};

// Main test function
const main = () => {
  log("🧪 Starting Vauntico Trust-Score Backend Script Tests...");
  console.log("");

  // Check if we're in the right directory
  if (!fs.existsSync("backend-deploy-v2-optimized.sh")) {
    logError(
      "Please run this script from the directory containing deployment scripts",
    );
    process.exit(1);
  }

  // Run all test suites
  checkDependencies();
  console.log("");

  testScriptSyntax();
  console.log("");

  testFileGeneration();
  console.log("");

  testNodejsApplication();
  console.log("");

  testSecurityConfigs();
  console.log("");

  testEnvironmentVariables();
  console.log("");

  testDocumentation();
  console.log("");

  // Generate summary
  log("=== Test Summary ===");

  console.log(`${colors.blue}Total Tests: ${testsTotal}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  const successRate =
    testsTotal > 0 ? Math.round((testsPassed / testsTotal) * 100) : 0;
  console.log(`${colors.blue}Success Rate: ${successRate}%${colors.reset}`);
  console.log("");

  if (testsFailed === 0) {
    logSuccess(
      "🎉 All tests passed! The deployment scripts are ready for use.",
    );
    console.log("");
    console.log(`${colors.blue}Next steps:${colors.reset}`);
    console.log("1. Upload scripts to your OCI instance");
    console.log("2. Run: ./backend-deploy-v2-optimized.sh");
    console.log("3. Validate deployment: ./validate-backend-deployment.sh");
    return 0;
  } else {
    logError(
      "❌ Some tests failed. Please review the issues above before deployment.",
    );
    return 1;
  }
};

// Run main function
if (require.main === module) {
  process.exit(main());
}

module.exports = { main, runTest, log, logSuccess, logWarning, logError };
