/**
 * Query Parameters Utility
 * Handles parsing, validation, and manipulation of query parameters
 */

export interface QueryParamConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'date';
  required?: boolean;
  default?: any;
  validate?: (value: any) => boolean;
  transform?: (value: any) => any;
}

export interface ParsedQueryParams {
  [key: string]: any;
}

export interface QueryParamValidationResult {
  isValid: boolean;
  errors: string[];
  params: ParsedQueryParams;
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(
  query: Record<string, any>,
  config: QueryParamConfig[]
): QueryParamValidationResult {
  const result: QueryParamValidationResult = {
    isValid: true,
    errors: [],
    params: {}
  };

  // Process each configured parameter
  for (const paramConfig of config) {
    const { name, type, required, default: defaultValue, validate, transform } = paramConfig;
    const rawValue = query[name];

    // Check if required parameter is missing
    if (required && (rawValue === undefined || rawValue === null || rawValue === '')) {
      result.isValid = false;
      result.errors.push(`Missing required parameter: ${name}`);
      continue;
    }

    // Use default value if parameter is missing and not required
    let value = rawValue;
    if (value === undefined || value === null || value === '') {
      if (defaultValue !== undefined) {
        value = defaultValue;
      } else if (!required) {
        continue; // Skip optional parameters with no value
      }
    }

    // Parse value based on type
    try {
      switch (type) {
        case 'string':
          value = String(value);
          break;
        case 'number':
          value = Number(value);
          if (isNaN(value)) {
            throw new Error(`Invalid number: ${rawValue}`);
          }
          break;
        case 'boolean':
          if (typeof value === 'string') {
            value = value.toLowerCase() === 'true' || value === '1';
          } else {
            value = Boolean(value);
          }
          break;
        case 'array':
          if (typeof value === 'string') {
            value = value.split(',').map(item => item.trim());
          } else if (!Array.isArray(value)) {
            value = [value];
          }
          break;
        case 'date':
          value = new Date(value);
          if (isNaN(value.getTime())) {
            throw new Error(`Invalid date: ${rawValue}`);
          }
          break;
      }

      // Apply custom transformation
      if (transform) {
        value = transform(value);
      }

      // Validate value
      if (validate && !validate(value)) {
        result.isValid = false;
        result.errors.push(`Invalid value for parameter ${name}: ${value}`);
        continue;
      }

      result.params[name] = value;
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Failed to parse parameter ${name}: ${error.message}`);
    }
  }

  return result;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const queryParts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        queryParts.push(`${key}=${value.join(',')}`);
      } else if (value instanceof Date) {
        queryParts.push(`${key}=${value.toISOString()}`);
      } else {
        queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
  }

  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
}

/**
 * Extract pagination parameters
 */
export function extractPaginationParams(query: Record<string, any>): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Extract sorting parameters
 */
export function extractSortingParams(query: Record<string, any>): {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} {
  const sortBy = query.sortBy || query.sort_by;
  const sortOrder = (query.sortOrder || query.sort_order || 'desc').toLowerCase();

  return {
    sortBy: sortBy ? String(sortBy) : undefined,
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc'
  };
}

/**
 * Extract filter parameters
 */
export function extractFilterParams(
  query: Record<string, any>,
  allowedFilters: string[]
): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const filter of allowedFilters) {
    if (query[filter] !== undefined) {
      filters[filter] = query[filter];
    }
  }

  return filters;
}

/**
 * Validate common query parameters
 */
export const commonQueryValidators = {
  positiveInteger: (value: any) => Number.isInteger(value) && value > 0,
  nonNegativeInteger: (value: any) => Number.isInteger(value) && value >= 0,
  email: (value: any) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  uuid: (value: any) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  dateString: (value: any) => typeof value === 'string' && !isNaN(Date.parse(value)),
  inList: (allowedValues: any[]) => (value: any) => allowedValues.includes(value)
};

/**
 * Sanitize string parameters to prevent injection
 */
export function sanitizeString(value: string, options: {
  maxLength?: number;
  allowedChars?: RegExp;
  trim?: boolean;
} = {}): string {
  let sanitized = value;

  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  if (options.allowedChars) {
    sanitized = sanitized.replace(new RegExp(`[^${options.allowedChars.source}]`, 'g'), '');
  }

  return sanitized;
}