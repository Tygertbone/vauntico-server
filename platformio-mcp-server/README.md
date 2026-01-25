<p align="center">
  <img src="Cline-PlatformIO-MCP-Server-Logo.png" alt="PlatformIO MCP Server Logo" width="200"/>
</p>

# PlatformIO MCP Server

A board-agnostic Model Context Protocol (MCP) server for [PlatformIO](https://platformio.org) embedded development. This server enables AI agents like [Cline](https://github.com/cline/cline) to interact with PlatformIO's comprehensive ecosystem of **1,000+ development boards** across **30+ platforms**.

## Features

- **🔌 Universal Board Support**: Works with any board supported by PlatformIO (ESP32, Arduino, STM32, nRF52, RP2040, and many more)
- **🛠️ Complete Development Workflow**: Initialize projects, build firmware, upload to devices, and monitor serial output
- **📚 Library Management**: Search, install, and manage libraries from the PlatformIO registry
- **🎯 Device Discovery**: Automatically detect connected development boards
- **⚡ Board-Agnostic Architecture**: No hardcoded board configurations - supports all PlatformIO platforms out of the box

## Supported Platforms

PlatformIO supports 30+ embedded platforms including:

- **Espressif**: ESP32, ESP8266
- **Arduino**: Uno, Mega, Nano, Due
- **STMicroelectronics**: STM32, STM8
- **Nordic**: nRF51, nRF52
- **Raspberry Pi**: RP2040 (Pico)
- **Teensy**: All Teensy boards
- **Atmel**: AVR, SAM, megaAVR
- **NXP**: i.MX RT, LPC
- **Microchip**: PIC32
- **TI**: MSP430, TIVA
- **RISC-V**: SiFive, GAP
- And many more!

## Prerequisites

- **Node.js** >= 18.0.0
- **PlatformIO Core CLI**: Install from https://platformio.org/install/cli

### Installing PlatformIO CLI

```bash
# Using pip (recommended)
pip install platformio

# Or using Homebrew (macOS)
brew install platformio

# Verify installation
pio --version
```

## Installation

```bash
# Clone or download this repository
git clone https://github.com/yourusername/platformio-mcp-server.git
cd platformio-mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

## MCP Tools

The server exposes 11 MCP tools for comprehensive embedded development:

### Board Discovery

#### `list_boards`
Lists all available PlatformIO boards with optional filtering.

**Parameters:**
- `filter` (optional): Filter by platform, framework, or MCU (e.g., "esp32", "arduino", "stm32")

**Example:**
```json
{
  "filter": "esp32"
}
```

#### `get_board_info`
Gets detailed information about a specific board.

**Parameters:**
- `boardId` (required): Board ID (e.g., "esp32dev", "uno", "nucleo_f401re")

**Example:**
```json
{
  "boardId": "esp32dev"
}
```

### Device Management

#### `list_devices`
Lists all connected serial devices for firmware upload and monitoring.

**Parameters:** None

### Project Operations

#### `init_project`
Initializes a new PlatformIO project with specified board and framework.

**Parameters:**
- `board` (required): Board ID
- `framework` (optional): Framework (e.g., "arduino", "espidf", "mbed")
- `projectDir` (required): Project directory path
- `platformOptions` (optional): Additional platform options

**Example:**
```json
{
  "board": "esp32dev",
  "framework": "arduino",
  "projectDir": "/path/to/my-project"
}
```

#### `build_project`
Compiles the project and generates firmware binary.

**Parameters:**
- `projectDir` (required): Path to project directory
- `environment` (optional): Specific environment from platformio.ini

**Example:**
```json
{
  "projectDir": "/path/to/my-project"
}
```

#### `clean_project`
Removes build artifacts from the project.

**Parameters:**
- `projectDir` (required): Path to project directory

#### `upload_firmware`
Uploads compiled firmware to a connected device.

**Parameters:**
- `projectDir` (required): Path to project directory
- `port` (optional): Upload port (auto-detected if not specified)
- `environment` (optional): Specific environment from platformio.ini

**Example:**
```json
{
  "projectDir": "/path/to/my-project",
  "port": "/dev/ttyUSB0"
}
```

#### `start_monitor`
Provides instructions and command for starting serial monitor.

**Parameters:**
- `port` (optional): Serial port
- `baud` (optional): Baud rate (e.g., 115200)
- `projectDir` (optional): Project directory

### Library Management

#### `search_libraries`
Searches the PlatformIO library registry.

**Parameters:**
- `query` (required): Search query
- `limit` (optional): Maximum results (default: 20)

**Example:**
```json
{
  "query": "wifi",
  "limit": 10
}
```

#### `install_library`
Installs a library from the PlatformIO registry.

**Parameters:**
- `library` (required): Library name or ID
- `projectDir` (optional): Project directory (installs globally if not specified)
- `version` (optional): Specific version (e.g., "1.0.0")

**Example:**
```json
{
  "library": "ArduinoJson",
  "projectDir": "/path/to/my-project",
  "version": "^6.21.0"
}
```

#### `list_installed_libraries`
Lists installed libraries (globally or for a project).

**Parameters:**
- `projectDir` (optional): Project directory (lists global libraries if not specified)

## Usage with Cline

1. **Install the server** following the installation instructions above

2. **Configure Cline** to use this MCP server (add to your Cline configuration)

3. **Start developing!** Use natural language to interact with PlatformIO:
   - "List all ESP32 boards"
   - "Create a new project for Arduino Uno"
   - "Build my project at /path/to/project"
   - "Upload firmware to my ESP32"
   - "Search for WiFi libraries"

## Development

```bash
# Development mode with auto-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
platformio-mcp/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── types.ts              # TypeScript type definitions
│   ├── platformio.ts         # PlatformIO CLI wrapper
│   ├── tools/                # MCP tool implementations
│   │   ├── boards.ts         # Board discovery tools
│   │   ├── devices.ts        # Device listing tools
│   │   ├── projects.ts       # Project initialization
│   │   ├── build.ts          # Build operations
│   │   ├── upload.ts         # Firmware upload
│   │   ├── monitor.ts        # Serial monitor
│   │   └── libraries.ts      # Library management
│   └── utils/                # Utility functions
│       ├── validation.ts     # Input validation
│       └── errors.ts         # Error handling
├── tests/                    # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Example Workflows

### Create and Upload ESP32 Project

```typescript
// 1. List ESP32 boards
await listBoards("esp32");

// 2. Initialize project
await initProject({
  board: "esp32dev",
  framework: "arduino",
  projectDir: "/path/to/esp32-blink"
});

// 3. Build project
await buildProject("/path/to/esp32-blink");

// 4. Upload firmware
await uploadFirmware("/path/to/esp32-blink");

// 5. Start serial monitor
await startMonitor();
```

### Search and Install Libraries

```typescript
// Search for libraries
const libraries = await searchLibraries("ArduinoJson", 10);

// Install library to project
await installLibrary("ArduinoJson", {
  projectDir: "/path/to/my-project",
  version: "^6.21.0"
});
```

## Troubleshooting

### PlatformIO Not Found

If you get "PlatformIO CLI not found" errors:

1. Install PlatformIO: `pip install platformio`
2. Verify installation: `pio --version`
3. Ensure `pio` or `platformio` is in your system PATH

### Board Not Found

- Check board ID spelling (case-sensitive)
- List available boards: `pio boards`
- Search at https://docs.platformio.org/en/latest/boards/

### Upload Failures

- Ensure device is connected and powered
- Check USB cable and drivers
- Verify correct port (use `list_devices` tool)
- Try resetting the device
- Close other programs using the serial port

### Build Errors

- Check source code for syntax errors
- Ensure required libraries are installed
- Verify platformio.ini configuration
- Try cleaning: `pio run -t clean`

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- **PlatformIO**: https://platformio.org
- **PlatformIO Boards**: https://docs.platformio.org/en/latest/boards/
- **PlatformIO Libraries**: https://registry.platformio.org
- **Model Context Protocol**: https://modelcontextprotocol.io
- **Cline**: https://github.com/cline/cline

## Support

For issues and questions:
- Open an issue on GitHub
- Check PlatformIO documentation: https://docs.platformio.org
- Join PlatformIO community: https://community.platformio.org
