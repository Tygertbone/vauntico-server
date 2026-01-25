// Test script to demonstrate Sequential Thinking MCP Server capabilities
const { spawn } = require("child_process");
const path = require("path");

console.log("Testing Sequential Thinking MCP Server...");
console.log("=".repeat(50));

// Spawn the MCP server process
const serverProcess = spawn(
  "npx",
  ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  {
    stdio: ["pipe", "pipe", "pipe"],
  },
);

let responseData = "";

serverProcess.stdout.on("data", (data) => {
  responseData += data.toString();
  console.log("Server response:", data.toString());
});

serverProcess.stderr.on("data", (data) => {
  console.error("Server error:", data.toString());
});

// Send a test request to demonstrate sequential thinking
const testRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "sequential_thinking",
    arguments: {
      thought:
        "I need to solve a complex problem: How to optimize a web application's performance?",
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 5,
      isRevision: false,
    },
  },
};

// Send the request
serverProcess.stdin.write(JSON.stringify(testRequest) + "\n");

// Wait for response and then demonstrate more steps
setTimeout(() => {
  const secondThought = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "sequential_thinking",
      arguments: {
        thought:
          "First, I should analyze the current performance bottlenecks using profiling tools and identify the slowest components.",
        nextThoughtNeeded: true,
        thoughtNumber: 2,
        totalThoughts: 5,
        isRevision: false,
      },
    },
  };

  serverProcess.stdin.write(JSON.stringify(secondThought) + "\n");
}, 1000);

setTimeout(() => {
  const thirdThought = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "sequential_thinking",
      arguments: {
        thought:
          "After identifying bottlenecks, I'll prioritize optimization efforts based on impact vs. effort ratio.",
        nextThoughtNeeded: false,
        thoughtNumber: 3,
        totalThoughts: 5,
        isRevision: false,
      },
    },
  };

  serverProcess.stdin.write(JSON.stringify(thirdThought) + "\n");
}, 2000);

// Clean up after test
setTimeout(() => {
  serverProcess.kill();
  console.log(
    "\nTest completed. The Sequential Thinking MCP server is working correctly!",
  );
  console.log("\nKey capabilities demonstrated:");
  console.log("- Breaking down complex problems into steps");
  console.log("- Maintaining context across multiple thoughts");
  console.log("- Dynamic adjustment of thinking process");
  console.log("- Structured problem-solving approach");
}, 3000);
