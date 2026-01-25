/**
 * Device detection and listing tools
 */

import { platformioExecutor } from '../platformio.js';
import type { SerialDevice } from '../types.js';
import { DevicesArraySchema } from '../types.js';
import { PlatformIOError } from '../utils/errors.js';

/**
 * Lists all connected serial devices
 */
export async function listDevices(): Promise<SerialDevice[]> {
  try {
    const result = await platformioExecutor.executeWithJsonOutput(
      'device',
      ['list'],
      DevicesArraySchema,
      { timeout: 10000 }
    );

    return result;
  } catch (error) {
    // If no devices are found, PlatformIO may return an error or empty array
    // Handle gracefully by returning empty array
    if (error instanceof PlatformIOError) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('no devices') || errorMessage.includes('empty')) {
        return [];
      }
    }
    
    throw new PlatformIOError(
      `Failed to list devices: ${error}`,
      'LIST_DEVICES_FAILED'
    );
  }
}

/**
 * Finds a device by port path
 */
export async function findDeviceByPort(port: string): Promise<SerialDevice | null> {
  const devices = await listDevices();
  return devices.find(device => device.port === port) || null;
}

/**
 * Gets the first available serial device (useful for auto-detection)
 */
export async function getFirstDevice(): Promise<SerialDevice | null> {
  const devices = await listDevices();
  return devices.length > 0 ? devices[0] : null;
}

/**
 * Checks if any devices are connected
 */
export async function hasConnectedDevices(): Promise<boolean> {
  const devices = await listDevices();
  return devices.length > 0;
}

/**
 * Lists devices filtered by description (useful for finding specific board types)
 */
export async function findDevicesByDescription(searchTerm: string): Promise<SerialDevice[]> {
  const devices = await listDevices();
  const searchLower = searchTerm.toLowerCase();
  
  return devices.filter(device => 
    device.description.toLowerCase().includes(searchLower)
  );
}

/**
 * Lists devices filtered by hardware ID
 */
export async function findDevicesByHardwareId(searchTerm: string): Promise<SerialDevice[]> {
  const devices = await listDevices();
  const searchLower = searchTerm.toLowerCase();
  
  return devices.filter(device => 
    device.hwid.toLowerCase().includes(searchLower)
  );
}
