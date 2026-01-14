#!/usr/bin/env node

import { exec } from "child_process";
import { access, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tools = [
  {
    name: "git-cleaner",
    path: "git-cleaner",
    description: "Auto-stage and categorize changes into semantic commits",
  },
  {
    name: "lint-fixer",
    path: "lint-fixer",
    description: "Run ESLint/Prettier and auto-fix code issues",
  },
  {
    name: "type-checker",
    path: "type-checker",
    description: "TypeScript strict mode checking and error suggestions",
  },
  {
    name: "gitignore-enforcer",
    path: "gitignore-enforcer",
    description: "Scan untracked files and enforce hardened .gitignore rules",
  },
  {
    name: "config-sweeper",
    path: "config-sweeper",
    description: "Detect deprecated configs and phantom secrets",
  },
];

async function installTool(tool) {
  const toolPath = join(__dirname, tool.path);

  try {
    // Check if tool directory exists
    await access(toolPath);

    console.log(`\n📦 Installing ${tool.name}...`);

    // Install dependencies
    await new Promise((resolve, reject) => {
      const npmInstall = exec("npm install", { cwd: toolPath });

      npmInstall.stdout.on("data", (data) => {
        process.stdout.write(data);
      });

      npmInstall.stderr.on("data", (data) => {
        process.stderr.write(data);
      });

      npmInstall.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });

    console.log(`✅ ${tool.name} installed successfully`);
    console.log(`   ${tool.description}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to install ${tool.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Vauntico MCP Tools Installation");
  console.log("=====================================");

  const results = {
    installed: [],
    failed: [],
  };

  // Install each tool
  for (const tool of tools) {
    const success = await installTool(tool);
    if (success) {
      results.installed.push(tool.name);
    } else {
      results.failed.push(tool.name);
    }
  }

  // Summary
  console.log("\n📊 Installation Summary:");
  console.log("=====================================");

  if (results.installed.length > 0) {
    console.log("✅ Successfully installed:");
    results.installed.forEach((tool) => {
      console.log(`   - ${tool}`);
    });
  }

  if (results.failed.length > 0) {
    console.log("\n❌ Failed to install:");
    results.failed.forEach((tool) => {
      console.log(`   - ${tool}`);
    });
  }

  // Generate MCP client configuration
  const config = {
    mcpServers: {},
  };

  const toolDirs = results.installed
    .map((name) => {
      const tool = tools.find((t) => t.name === name);
      return {
        [name]: {
          command: "node",
          args: [join(__dirname, tool.path, "index.js")],
          cwd: join(__dirname, tool.path),
        },
      };
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  Object.assign(config.mcpServers, toolDirs);

  const configPath = join(__dirname, "mcp-config.json");
  await writeFile(configPath, JSON.stringify(config, null, 2));

  console.log("\n🔧 MCP Configuration:");
  console.log("=====================================");
  console.log(`Configuration saved to: ${configPath}`);
  console.log("\nAdd this to your MCP client (e.g., Claude Desktop):");
  console.log(JSON.stringify(config, null, 2));

  console.log("\n📚 Next Steps:");
  console.log("=====================================");
  console.log("1. Restart your MCP client to load the new servers");
  console.log("2. Use tools via MCP calls in your AI assistant");
  console.log(
    "3. Run individual tools directly with: cd [tool-dir] && npm start"
  );

  console.log("\n🎉 Installation complete!");
}

main().catch(console.error);
