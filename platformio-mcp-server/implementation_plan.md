# Implementation Plan

## [Overview]

Create a board-agnostic MCP server that enables AI agents to interact with PlatformIO for embedded development across all supported platforms and boards.

The PlatformIO MCP Server will serve as a universal bridge between AI agents like Cline and the PlatformIO ecosystem, supporting over 1,000 embedded development boards across 30+ platforms. This server will expose a comprehensive set of MCP tools that wrap PlatformIO CLI commands, enabling AI agents to discover boards, initialize projects, build firmware, upload to devices, monitor serial output, and manage libraries. The board-agnostic architecture ensures that any board supported by PlatformIO automatically works with this server without code modifications. By leveraging PlatformIO's JSON output format and structured CLI interface, the server will provide reliable, type-safe interactions for embedded development workflows. This implementation will be suitable for submission to the Cline MCP Marketplace, complete with comprehensive documentation, error handling, and testing infrastructure.

## [Types]

Define TypeScript interfaces and Zod schemas for all PlatformIO CLI command inputs and outputs.

**Board Types:**
```typescript
interface BoardInfo {
  id: string;
  name: string;
  platform: string;
  mcu: string;
  frequency: string;
  flash: number;
  ram: number;
  frameworks?: string[];
  vendor?: string;
  url?: string;
}

const BoardInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.string(),
  mcu: z.string(),
  frequency: z.string(),
  flash: z.number(),
  ram: z.number(),
  frameworks: z.array(z.string()).optional(),
  vendor: z.string().optional(),
  url: z.string().optional()
});
```

**Device Types:**
```typescript
interface SerialDevice {
  port: string;
  description: string;
  hwid: string;
}

const SerialDeviceSchema = z.object({
  port: z.string(),
  description: z.string(),
  hwid: z.string()
});
```

**Project Types:**
```typescript
interface ProjectConfig {
  board: string;
  framework?: string;
  projectDir?: string;
  platformOptions?: Record<string, string>;
}

const ProjectConfigSchema = z.object({
  board: z.string(),
  framework: z.string().optional(),
  projectDir: z.string().optional(),
  platformOptions: z.record(z.string()).optional()
});
```

**Build/Upload Types:**
```typescript
interface BuildResult {
  success: boolean;
  environment: string;
  output: string;
  errors?: string[];
}

interface UploadResult {
  success: boolean;
  port?: string;
  output: string;
  errors?: string[];
}
```

**Library Types:**
```typescript
interface LibraryInfo {
  id: number;
  name: string;
  description?: string;
  keywords?: string[];
  authors?: Array<{ name: string; email?: string }>;
  repository?: { type: string; url: string };
  version?: string;
  frameworks?: string[];
  platforms?: string[];
}
```

## [Files]

Create a modular TypeScript project structure with clear separation of concerns.

**New Files to Create:**

1. **`package.json`** - Project metadata, dependencies, scripts, and MCP server configuration
2. **`tsconfig.json`** - TypeScript compiler configuration (ES2022, NodeNext, strict mode)
3. **`src/index.ts`** - Main entry point, stdio transport, tool registration
4. **`src/types.ts`** - All TypeScript interfaces and Zod schemas
5. **`src/platformio.ts`** - PlatformIO CLI wrapper, command execution, JSON parsing
6. **`src/tools/boards.ts`** - MCP tools: list_boards, get_board_info
7. **`src/tools/devices.ts`** - MCP tool: list_devices
8. **`src/tools/projects.ts`** - MCP tool: init_project
9. **`src/tools/build.ts`** - MCP tools: build_project, clean_project
10. **`src/tools/upload.ts`** - MCP tool: upload_firmware
11. **`src/tools/monitor.ts`** - MCP tool: start_monitor
12. **`src/tools/libraries.ts`** - MCP tools: search_libraries, install_library, list_installed_libraries
13. **`src/utils/validation.ts`** - Input validation, path sanitization, injection prevention
14. **`src/utils/errors.ts`** - Custom error classes and formatting
15. **`README.md`** - Comprehensive documentation, usage examples, board-agnostic guide
16. **`llms-install.md`** - AI-friendly installation guide for Cline
17. **`.gitignore`** - Node.js/TypeScript ignores
18. **`LICENSE`** - MIT License
19. **`tests/platformio.test.ts`** - Unit tests for CLI wrapper
20. **`tests/tools.test.ts`** - Unit tests for MCP tools
21. **`.vscode/settings.json`** - VSCode workspace settings

## [Functions]

Implement core functions for CLI execution, tool handlers, and utility operations.

**Core PlatformIO Module (`src/platformio.ts`):**

1. **`execPioCommand(args: string[]): Promise<CommandResult>`** - Executes PlatformIO CLI commands using child_process, handles timeouts and errors
2. **`parsePioJsonOutput<T>(output: string, schema: z.ZodSchema<T>): T`** - Parses and validates JSON output with Zod schemas
3. **`checkPlatformIOInstalled(): Promise<boolean>`** - Verifies PlatformIO CLI availability and version

**Board Tools (`src/tools/boards.ts`):**

4. **`listBoards(filter?: string): Promise<BoardInfo[]>`** - Executes `pio boards --json-output`, parses board information
5. **`getBoardInfo(boardId: string): Promise<BoardInfo>`** - Gets detailed board specifications, throws error if not found

**Device Tools (`src/tools/devices.ts`):**

6. **`listDevices(): Promise<SerialDevice[]>`** - Lists connected serial devices via `pio device list --json-output`

**Project Tools (`src/tools/projects.ts`):**

7. **`initProject(config: ProjectConfig): Promise<{ success: boolean; path: string }>`** - Initializes PlatformIO project with board configuration

**Build Tools (`src/tools/build.ts`):**

8. **`buildProject(projectDir: string, environment?: string): Promise<BuildResult>`** - Builds project via `pio run`, captures output
9. **`cleanProject(projectDir: string): Promise<{ success: boolean }>`** - Cleans build artifacts via `pio run -t clean`

**Upload Tools (`src/tools/upload.ts`):**

10. **`uploadFirmware(projectDir: string, port?: string, environment?: string): Promise<UploadResult>`** - Uploads firmware to device

**Monitor Tools (`src/tools/monitor.ts`):**

11. **`startMonitor(port?: string, baud?: number): Promise<{ success: boolean; message: string }>`** - Provides serial monitor guidance

**Library Tools (`src/tools/libraries.ts`):**

12. **`searchLibraries(query: string): Promise<LibraryInfo[]>`** - Searches library registry via `pio lib search --json-output`
13. **`installLibrary(libraryName: string, projectDir?: string): Promise<{ success: boolean }>`** - Installs library to project or global
14. **`listInstalledLibraries(projectDir?: string): Promise<LibraryInfo[]>`** - Lists installed libraries

**Validation Utilities (`src/utils/validation.ts`):**

15. **`validateBoardId(boardId: string): boolean`** - Validates board ID format, prevents injection
16. **`validateProjectPath(path: string): string`** - Validates and normalizes project paths
17. **`sanitizeInput(input: string): string`** - Sanitizes user input for CLI commands

**Error Utilities (`src/utils/errors.ts`):**

18. **`formatPlatformIOError(error: unknown): string`** - Formats errors with troubleshooting hints
19. **`class PlatformIOError extends Error`** - Custom error class with context

## [Classes]

Implement MCP server class and tool handler organization.

**Main Server Class (`src/index.ts`):**

1. **`class PlatformIOServer`**
   - Constructor: Initializes MCP server with stdio transport
   - Method: `registerTools()` - Registers all MCP tools with handlers
   - Method: `start()` - Starts server and begins listening
   - Method: `handleToolCall(toolName, args)` - Routes tool calls to handlers
   - Method: `shutdown()` - Graceful shutdown

**Tool Handler Classes:**

2. **`class BoardToolHandler`** - Groups board-related tool logic (list_boards, get_board_info)
3. **`class ProjectToolHandler`** - Groups project lifecycle tools (init, build, upload)
4. **`class LibraryToolHandler`** - Groups library management tools (search, install, list)

**Command Executor Class (`src/platformio.ts`):**

5. **`class PlatformIOExecutor`**
   - Method: `execute(command, args)` - Executes PlatformIO CLI commands
   - Method: `checkInstallation()` - Verifies installation
   - Method: `getVersion()` - Gets PlatformIO version
   - Property: `platformioPath` - Path to CLI executable

## [Dependencies]

Install TypeScript, MCP SDK, and development tooling.

**Production Dependencies:**
- `@modelcontextprotocol/sdk@^0.5.0` - MCP server SDK with stdio transport
- `zod@^3.22.0` - Runtime type validation and schema definition

**Development Dependencies:**
- `typescript@^5.3.0` - TypeScript compiler
- `@types/node@^20.0.0` - Node.js type definitions
- `tsx@^4.7.0` - TypeScript execution for development
- `vitest@^1.0.0` - Testing framework
- `@vitest/ui@^1.0.0` - Test UI
- `prettier@^3.1.0` - Code formatting
- `eslint@^8.56.0` - Code linting
- `@typescript-eslint/eslint-plugin@^6.19.0` - TypeScript ESLint rules
- `@typescript-eslint/parser@^6.19.0` - TypeScript ESLint parser

**System Requirements:**
- Node.js >= 18.0.0
- PlatformIO Core CLI (installed separately by user)

## [Testing]

Create comprehensive unit tests and integration test examples.

**Test Files:**
1. **`tests/platformio.test.ts`** - CLI execution, JSON parsing, installation checks
2. **`tests/tools/boards.test.ts`** - Board listing and info retrieval
3. **`tests/tools/projects.test.ts`** - Project init, build, upload operations
4. **`tests/tools/devices.test.ts`** - Device listing and detection
5. **`tests/tools/libraries.test.ts`** - Library search, install, list
6. **`tests/validation.test.ts`** - Input validation and sanitization
7. **`tests/integration/`** - Manual testing guide with real hardware

**Testing Strategy:**
- Unit tests with mocked PlatformIO commands
- >80% code coverage
- Integration test documentation for users with hardware
- Test all error paths and edge cases
- Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`

## [Implementation Order]

Execute implementation in logical phases to minimize integration issues.

**Phase 1: Project Foundation (Steps 1-5)**
1. Initialize npm project with package.json
2. Configure TypeScript with tsconfig.json
3. Set up directory structure (src/, tests/)
4. Create .gitignore and LICENSE files
5. Install all dependencies

**Phase 2: Core Infrastructure (Steps 6-10)**
6. Implement type definitions in src/types.ts
7. Implement PlatformIO CLI wrapper in src/platformio.ts
8. Implement validation utilities in src/utils/validation.ts
9. Implement error handling in src/utils/errors.ts
10. Write unit tests for core infrastructure

**Phase 3: MCP Tools - Discovery (Steps 11-15)**
11. Implement board tools in src/tools/boards.ts
12. Implement device tools in src/tools/devices.ts
13. Implement library search in src/tools/libraries.ts
14. Write unit tests for discovery tools
15. Manual testing with PlatformIO installation

**Phase 4: MCP Tools - Projects (Steps 16-20)**
16. Implement project initialization in src/tools/projects.ts
17. Implement build tools in src/tools/build.ts
18. Implement upload tools in src/tools/upload.ts
19. Implement monitor guidance in src/tools/monitor.ts
20. Write unit tests for project tools

**Phase 5: MCP Tools - Libraries (Steps 21-24)**
21. Complete library management in src/tools/libraries.ts
22. Test library installation workflows
23. Write unit tests for library tools
24. Validate library dependency handling

**Phase 6: Server Integration (Steps 25-29)**
25. Implement main server in src/index.ts
26. Register all MCP tools with schemas
27. Set up stdio transport
28. Implement graceful shutdown
29. Test server startup and tool discovery

**Phase 7: Documentation (Steps 30-34)**
30. Write comprehensive README.md
31. Create llms-install.md for AI setup
32. Add inline code documentation
33. Create usage examples for popular boards
34. Document troubleshooting

**Phase 8: Testing & Validation (Steps 35-39)**
35. Run full test suite
36. Manual integration testing
37. Test fresh installation
38. Validate Cline compatibility
39. Create test project examples

**Phase 9: Final Preparation (Steps 40-43)**
40. Code quality review
41. Run linter and formatter
42. Prepare GitHub repository
43. Generate package build for submission
