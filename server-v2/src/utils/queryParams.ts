/**
 * Utility functions for normalizing Express query parameters
 */

/**
 * Normalizes query parameters that can be either string or string[] to a single string
 * @param param - The query parameter to normalize (can be string, string[], undefined, or null)
 * @returns A normalized string representation
 */
export function normalizeQueryParam(param: unknown): string {
  if (Array.isArray(param)) {
    return param.map(String).join(",");
  }
  return String(param ?? "");
}
