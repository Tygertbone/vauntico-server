/**
 * Input validation and sanitization utilities
 */

import path from 'path';
import { access, constants } from 'fs/promises';

/**
 * Validates a board ID to prevent command injection and ensure valid format
 * Board IDs should contain only alphanumeric characters, hyphens, and underscores
 */
export function validateBoardId(boardId: string): boolean {
  if (!boardId || typeof boardId !== 'string') {
    return false;
  }

  // Board IDs should be reasonable length (3-50 chars)
  if (boardId.length < 2 || boardId.length > 50) {
    return false;
  }

  // Only allow alphanumeric, hyphen, underscore, and dot
  const validPattern = /^[a-zA-Z0-9_\-\.]+$/;
  return validPattern.test(boardId);
}

/**
 * Validates and normalizes a project path
 * Returns the absolute path if valid
 * Throws an error if the path is invalid or potentially unsafe
 */
export function validateProjectPath(projectPath: string): string {
  if (!projectPath || typeof projectPath !== 'string') {
    throw new Error('Project path is required and must be a string');
  }

  // Remove any potentially dangerous characters
  const sanitized = projectPath.trim();

  // Resolve to absolute path
  const absolutePath = path.resolve(sanitized);

  // Prevent path traversal attacks by ensuring no suspicious patterns
  const normalizedPath = path.normalize(absolutePath);
  
  // Check for suspicious patterns
  if (normalizedPath.includes('..') || normalizedPath !== absolutePath) {
    throw new Error('Invalid project path: path traversal detected');
  }

  return absolutePath;
}

/**
 * Checks if a directory exists and is writable
 */
export async function checkDirectoryWritable(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a directory exists
 */
export async function checkDirectoryExists(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes general string input to prevent command injection
 * Removes or escapes potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove control characters and other dangerous characters
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[;&|`$()]/g, '') // Remove shell special characters
    .trim();
}

/**
 * Validates a serial port path
 * Different formats for different operating systems
 */
export function validateSerialPort(port: string): boolean {
  if (!port || typeof port !== 'string') {
    return false;
  }

  // Unix/Linux/macOS patterns: /dev/ttyUSB0, /dev/ttyACM0, /dev/cu.usbserial-*
  const unixPattern = /^\/dev\/(tty(USB|ACM|S)\d+|cu\.[a-zA-Z0-9_\-\.]+)$/;
  
  // Windows patterns: COM1, COM10, etc.
  const windowsPattern = /^COM\d{1,3}$/;

  return unixPattern.test(port) || windowsPattern.test(port);
}

/**
 * Validates a library name
 * Library names can contain alphanumeric, spaces, hyphens, and underscores
 */
export function validateLibraryName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Library names should be reasonable length
  if (name.length < 1 || name.length > 100) {
    return false;
  }

  // Allow alphanumeric, spaces, hyphens, underscores, and dots
  // Also allow @ for scoped packages and numbers for IDs
  const validPattern = /^[a-zA-Z0-9_\-\.\s@]+$/;
  return validPattern.test(name);
}

/**
 * Validates a framework name
 */
export function validateFramework(framework: string): boolean {
  if (!framework || typeof framework !== 'string') {
    return false;
  }

  // Framework names should be lowercase alphanumeric with optional hyphens
  const validPattern = /^[a-z0-9\-]+$/;
  return validPattern.test(framework) && framework.length > 0 && framework.length <= 30;
}

/**
 * Validates an environment name from platformio.ini
 */
export function validateEnvironmentName(env: string): boolean {
  if (!env || typeof env !== 'string') {
    return false;
  }

  // Environment names are alphanumeric with underscores and hyphens
  const validPattern = /^[a-zA-Z0-9_\-]+$/;
  return validPattern.test(env) && env.length > 0 && env.length <= 50;
}

/**
 * Validates a version string
 * Can be semantic version (1.2.3) or ranges (^1.0.0, ~2.1.0)
 */
export function validateVersion(version: string): boolean {
  if (!version || typeof version !== 'string') {
    return false;
  }

  // Semantic version with optional prefix (^, ~, >, <, >=, <=, =)
  const validPattern = /^[\^~><=]*\d+(\.\d+){0,2}([a-zA-Z0-9\-\+\.]*)?$/;
  return validPattern.test(version) && version.length <= 50;
}

/**
 * Validates a baud rate
 * Common baud rates: 9600, 19200, 38400, 57600, 115200, etc.
 */
export function validateBaudRate(baud: number): boolean {
  if (!baud || typeof baud !== 'number' || !Number.isInteger(baud)) {
    return false;
  }

  // Common baud rates
  const validBaudRates = [
    300, 1200, 2400, 4800, 9600, 14400, 19200, 28800,
    38400, 57600, 115200, 230400, 460800, 921600
  ];

  return validBaudRates.includes(baud) || (baud > 0 && baud <= 2000000);
}

/**
 * Validates that a string doesn't contain null bytes or other dangerous content
 */
export function isTextSafe(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  // Check for null bytes and other control characters that shouldn't be in normal text
  return !text.includes('\0') && !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text);
}

/**
 * Sanitizes an object's string values to prevent injection attacks
 */
export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
