/**
 * Library management tools
 */

import { platformioExecutor } from '../platformio.js';
import type { LibraryInfo, LibraryInstallResult } from '../types.js';
import { LibrariesArraySchema } from '../types.js';
import { validateLibraryName, validateVersion, validateProjectPath } from '../utils/validation.js';
import { LibraryError, PlatformIOError } from '../utils/errors.js';

/**
 * Searches for libraries in the PlatformIO registry
 */
export async function searchLibraries(query: string, limit?: number): Promise<LibraryInfo[]> {
  if (!query || query.trim().length === 0) {
    throw new LibraryError('Search query is required');
  }

  try {
    const result = await platformioExecutor.executeWithJsonOutput(
      'lib',
      ['search', query.trim()],
      LibrariesArraySchema,
      { timeout: 30000 }
    );

    // Apply limit if specified
    if (limit && limit > 0) {
      return result.slice(0, limit);
    }

    return result;
  } catch (error) {
    throw new LibraryError(
      `Failed to search libraries with query '${query}': ${error}`,
      { query }
    );
  }
}

/**
 * Installs a library (globally or to a specific project)
 */
export async function installLibrary(
  libraryName: string,
  options?: {
    projectDir?: string;
    version?: string;
  }
): Promise<LibraryInstallResult> {
  if (!validateLibraryName(libraryName)) {
    throw new LibraryError(`Invalid library name: ${libraryName}`, { libraryName });
  }

  if (options?.version && !validateVersion(options.version)) {
    throw new LibraryError(`Invalid version format: ${options.version}`, { version: options.version });
  }

  try {
    const args: string[] = ['lib', 'install'];

    // Build library specification with optional version
    let librarySpec = libraryName;
    if (options?.version) {
      librarySpec = `${libraryName}@${options.version}`;
    }
    args.push(librarySpec);

    // Add project directory if specified (installs locally)
    const execOptions: { cwd?: string; timeout?: number } = { timeout: 120000 };
    if (options?.projectDir) {
      const validatedPath = validateProjectPath(options.projectDir);
      execOptions.cwd = validatedPath;
    }

    const result = await platformioExecutor.execute('lib', ['install', librarySpec], execOptions);

    if (result.exitCode !== 0) {
      throw new LibraryError(
        `Failed to install library '${librarySpec}': ${result.stderr}`,
        { library: librarySpec, stderr: result.stderr }
      );
    }

    return {
      success: true,
      library: libraryName,
      message: `Successfully installed ${librarySpec}${options?.projectDir ? ' to project' : ' globally'}`,
    };
  } catch (error) {
    if (error instanceof LibraryError) {
      throw error;
    }
    throw new LibraryError(
      `Failed to install library '${libraryName}': ${error}`,
      { libraryName, options }
    );
  }
}

/**
 * Lists installed libraries (globally or for a specific project)
 */
export async function listInstalledLibraries(projectDir?: string): Promise<LibraryInfo[]> {
  try {
    const execOptions: { cwd?: string; timeout?: number } = { timeout: 30000 };
    if (projectDir) {
      const validatedPath = validateProjectPath(projectDir);
      execOptions.cwd = validatedPath;
    }

    const result = await platformioExecutor.executeWithJsonOutput(
      'lib',
      ['list'],
      LibrariesArraySchema,
      execOptions
    );

    return result;
  } catch (error) {
    // If no libraries are installed, return empty array
    if (error instanceof PlatformIOError) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('no libraries') || errorMessage.includes('empty')) {
        return [];
      }
    }

    throw new LibraryError(
      `Failed to list installed libraries${projectDir ? ` for project at ${projectDir}` : ''}: ${error}`,
      { projectDir }
    );
  }
}

/**
 * Uninstalls a library (globally or from a specific project)
 */
export async function uninstallLibrary(
  libraryName: string,
  projectDir?: string
): Promise<{ success: boolean; message: string }> {
  if (!validateLibraryName(libraryName)) {
    throw new LibraryError(`Invalid library name: ${libraryName}`, { libraryName });
  }

  try {
    const execOptions: { cwd?: string; timeout?: number } = { timeout: 60000 };
    if (projectDir) {
      const validatedPath = validateProjectPath(projectDir);
      execOptions.cwd = validatedPath;
    }

    const result = await platformioExecutor.execute('lib', ['uninstall', libraryName], execOptions);

    if (result.exitCode !== 0) {
      throw new LibraryError(
        `Failed to uninstall library '${libraryName}': ${result.stderr}`,
        { library: libraryName, stderr: result.stderr }
      );
    }

    return {
      success: true,
      message: `Successfully uninstalled ${libraryName}${projectDir ? ' from project' : ' globally'}`,
    };
  } catch (error) {
    if (error instanceof LibraryError) {
      throw error;
    }
    throw new LibraryError(
      `Failed to uninstall library '${libraryName}': ${error}`,
      { libraryName, projectDir }
    );
  }
}

/**
 * Updates installed libraries (globally or for a specific project)
 */
export async function updateLibraries(projectDir?: string): Promise<{ success: boolean; message: string }> {
  try {
    const execOptions: { cwd?: string; timeout?: number } = { timeout: 180000 };
    if (projectDir) {
      const validatedPath = validateProjectPath(projectDir);
      execOptions.cwd = validatedPath;
    }

    const result = await platformioExecutor.execute('lib', ['update'], execOptions);

    if (result.exitCode !== 0) {
      throw new LibraryError(
        `Failed to update libraries: ${result.stderr}`,
        { stderr: result.stderr }
      );
    }

    return {
      success: true,
      message: `Successfully updated libraries${projectDir ? ' for project' : ' globally'}`,
    };
  } catch (error) {
    if (error instanceof LibraryError) {
      throw error;
    }
    throw new LibraryError(
      `Failed to update libraries: ${error}`,
      { projectDir }
    );
  }
}

/**
 * Gets information about a specific library
 */
export async function getLibraryInfo(libraryNameOrId: string): Promise<LibraryInfo | null> {
  try {
    const results = await searchLibraries(libraryNameOrId, 50);
    
    // Try to find exact match first
    const exactMatch = results.find(lib => 
      lib.name.toLowerCase() === libraryNameOrId.toLowerCase() ||
      lib.id.toString() === libraryNameOrId
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Return first result if available
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw new LibraryError(
      `Failed to get library info for '${libraryNameOrId}': ${error}`,
      { library: libraryNameOrId }
    );
  }
}
