/**
 * Serial monitor tools
 */

import type { MonitorResult } from '../types.js';
import { validateSerialPort, validateBaudRate, validateProjectPath } from '../utils/validation.js';
import { PlatformIOError } from '../utils/errors.js';

/**
 * Provides information and command for starting a serial monitor
 * Note: The actual monitor is interactive and can't run in the background,
 * so we return instructions for the user
 */
export async function startMonitor(
  port?: string,
  baud?: number,
  projectDir?: string
): Promise<MonitorResult> {
  // Validate inputs
  if (port && !validateSerialPort(port)) {
    throw new PlatformIOError(`Invalid serial port: ${port}`, 'INVALID_PORT', { port });
  }

  if (baud && !validateBaudRate(baud)) {
    throw new PlatformIOError(`Invalid baud rate: ${baud}`, 'INVALID_BAUD', { baud });
  }

  if (projectDir) {
    try {
      validateProjectPath(projectDir);
    } catch (error) {
      throw new PlatformIOError(`Invalid project directory: ${error}`, 'INVALID_PATH', { projectDir });
    }
  }

  // Build the command
  let command = 'pio device monitor';

  if (port) {
    command += ` --port ${port}`;
  }

  if (baud) {
    command += ` --baud ${baud}`;
  }

  if (projectDir) {
    command = `cd ${projectDir} && ${command}`;
  }

  const message = 
    'Serial monitor requires interactive terminal access. ' +
    'Please run the following command in your terminal:\n\n' +
    `  ${command}\n\n` +
    'Press Ctrl+C to exit the monitor.\n\n' +
    'Note: If port and baud rate are not specified, PlatformIO will auto-detect them ' +
    'from your platformio.ini configuration.';

  return {
    success: true,
    message,
    command,
  };
}

/**
 * Gets the monitor command string for a project
 */
export function getMonitorCommand(
  port?: string,
  baud?: number,
  projectDir?: string
): string {
  let command = 'pio device monitor';

  if (port) {
    command += ` --port ${port}`;
  }

  if (baud) {
    command += ` --baud ${baud}`;
  }

  if (projectDir) {
    command = `cd ${projectDir} && ${command}`;
  }

  return command;
}

/**
 * Gets monitor command with custom filters
 */
export function getMonitorCommandWithFilters(options: {
  port?: string;
  baud?: number;
  projectDir?: string;
  filters?: string[];
  echo?: boolean;
  eol?: 'CR' | 'LF' | 'CRLF';
}): string {
  let command = 'pio device monitor';

  if (options.port) {
    command += ` --port ${options.port}`;
  }

  if (options.baud) {
    command += ` --baud ${options.baud}`;
  }

  if (options.echo !== undefined) {
    command += ` --echo`;
  }

  if (options.eol) {
    command += ` --eol ${options.eol}`;
  }

  if (options.filters && options.filters.length > 0) {
    for (const filter of options.filters) {
      command += ` --filter ${filter}`;
    }
  }

  if (options.projectDir) {
    command = `cd ${options.projectDir} && ${command}`;
  }

  return command;
}

/**
 * Provides instructions for using the raw monitor mode
 */
export function getRawMonitorInstructions(port: string, baud: number): MonitorResult {
  if (!validateSerialPort(port)) {
    throw new PlatformIOError(`Invalid serial port: ${port}`, 'INVALID_PORT', { port });
  }

  if (!validateBaudRate(baud)) {
    throw new PlatformIOError(`Invalid baud rate: ${baud}`, 'INVALID_BAUD', { baud });
  }

  const command = `pio device monitor --port ${port} --baud ${baud} --raw`;

  const message = 
    'Raw monitor mode provides unfiltered serial output.\n' +
    'Run the following command in your terminal:\n\n' +
    `  ${command}\n\n` +
    'Press Ctrl+C to exit the monitor.';

  return {
    success: true,
    message,
    command,
  };
}
