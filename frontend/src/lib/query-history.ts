import { DateRange } from '@/components/query-builder/DateFilter';

export interface QueryConfig {
  metrics: string[];
  dimensions?: string[];
  filters?: any[];
  orderBy?: any[];
  limit?: number;
}

export interface SavedQuery {
  id: number;
  name: string;
  config: QueryConfig;
  dateRange: DateRange;
  createdAt: string;
}

const STORAGE_KEY = 'savedQueries';
const MAX_QUERIES = 100;

/**
 * Get all saved queries from localStorage
 */
export function getSavedQueries(): SavedQuery[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const queries = JSON.parse(stored) as SavedQuery[];
    // Sort by creation date (newest first)
    return queries.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error loading saved queries:', error);
    return [];
  }
}

/**
 * Save a new query to localStorage
 */
export function saveQuery(
  name: string,
  config: QueryConfig,
  dateRange: DateRange
): SavedQuery {
  const queries = getSavedQueries();

  // Check limit
  if (queries.length >= MAX_QUERIES) {
    // Remove oldest query
    queries.pop();
  }

  const newQuery: SavedQuery = {
    id: Date.now(),
    name,
    config,
    dateRange,
    createdAt: new Date().toISOString(),
  };

  queries.unshift(newQuery);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));

  return newQuery;
}

/**
 * Delete a query by ID
 */
export function deleteQuery(id: number): boolean {
  try {
    const queries = getSavedQueries();
    const filtered = queries.filter(q => q.id !== id);

    if (filtered.length === queries.length) {
      return false; // Query not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting query:', error);
    return false;
  }
}

/**
 * Rename a query
 */
export function renameQuery(id: number, newName: string): boolean {
  try {
    const queries = getSavedQueries();
    const query = queries.find(q => q.id === id);

    if (!query) return false;

    query.name = newName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    return true;
  } catch (error) {
    console.error('Error renaming query:', error);
    return false;
  }
}

/**
 * Get query by ID
 */
export function getQueryById(id: number): SavedQuery | null {
  const queries = getSavedQueries();
  return queries.find(q => q.id === id) || null;
}

/**
 * Clear all saved queries
 */
export function clearAllQueries(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export queries as JSON
 */
export function exportQueries(): string {
  const queries = getSavedQueries();
  return JSON.stringify(queries, null, 2);
}

/**
 * Import queries from JSON
 */
export function importQueries(jsonString: string): boolean {
  try {
    const queries = JSON.parse(jsonString) as SavedQuery[];

    // Validate structure
    if (!Array.isArray(queries)) return false;

    const valid = queries.every(q =>
      q.id && q.name && q.config && q.dateRange && q.createdAt
    );

    if (!valid) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    return true;
  } catch (error) {
    console.error('Error importing queries:', error);
    return false;
  }
}
