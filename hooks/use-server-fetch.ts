import { useCallback, useState, useEffect } from "react";

// Types for the server hook
export interface ServerFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  signal?: AbortSignal;
}

export interface ServerFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

export interface ServerFetchResult<T> extends ServerFetchState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

// Base URL for your API - adjust this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Custom hook for server-side data fetching using Next.js fetch
 * This hook provides a reusable way to handle GET requests and other HTTP methods
 *
 * @param endpoint - The API endpoint to fetch from
 * @param options - Additional fetch options
 * @param dependencies - Array of dependencies to watch for changes (like React Query)
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useServerFetch<T = any>(
  endpoint: string,
  options: ServerFetchOptions = {},
  dependencies: any[] = []
): ServerFetchResult<T> {
  const [state, setState] = useState<ServerFetchState<T>>({
    data: null,
    loading: true,
    error: null,
    status: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

      const fetchOptions: RequestInit = {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        },
        cache: options.cache || "default",
        signal: options.signal
      };

      // Add body for non-GET requests
      if (options.body && options.method !== "GET") {
        fetchOptions.body = JSON.stringify(options.body);
      }

      // Add Next.js specific options
      if (options.next) {
        (fetchOptions as any).next = options.next;
      }

      const response = await fetch(url, fetchOptions);

      // Clone response to avoid "body already read" error
      const responseClone = response.clone();

      let data: T;

      // Try to parse as JSON, fallback to text
      try {
        data = await response.json();
      } catch {
        data = (await responseClone.text()) as T;
      }

      if (!response.ok) {
        throw new Error(
          data && typeof data === "object" && "message" in data
            ? (data as any).message
            : `HTTP ${response.status}: ${response.statusText}`
        );
      }

      setState({
        data,
        loading: false,
        error: null,
        status: response.status
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        status: null
      });
    }
  }, [endpoint, JSON.stringify(options), ...dependencies]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Manual data mutation (optimistic updates)
  const mutate = useCallback((newData: T) => {
    setState((prev) => ({
      ...prev,
      data: newData
    }));
  }, []);

  return {
    ...state,
    refetch,
    mutate
  };
}

/**
 * Specialized hook for GET requests with common patterns
 */
export function useServerGet<T = any>(
  endpoint: string,
  queryParams?: Record<string, any>,
  options: Omit<ServerFetchOptions, "method" | "body"> = {},
  dependencies: any[] = []
): ServerFetchResult<T> {
  // Build query string from parameters
  const buildQueryString = (params: Record<string, any>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  const queryString = queryParams ? buildQueryString(queryParams) : "";
  const fullEndpoint = `${endpoint}${queryString}`;

  return useServerFetch<T>(fullEndpoint, { ...options, method: "GET" }, dependencies);
}

/**
 * Hook for paginated data fetching
 */
export function useServerPaginated<T = any>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  additionalParams: Record<string, any> = {},
  options: Omit<ServerFetchOptions, "method" | "body"> = {},
  dependencies: any[] = []
): ServerFetchResult<{ data: T[]; pagination: any }> {
  const queryParams = {
    page,
    limit,
    ...additionalParams
  };

  return useServerGet<{ data: T[]; pagination: any }>(endpoint, queryParams, options, [
    page,
    limit,
    ...dependencies
  ]);
}

/**
 * Hook for data fetching with search functionality
 */
export function useServerSearch<T = any>(
  endpoint: string,
  searchQuery: string,
  searchField: string = "search",
  additionalParams: Record<string, any> = {},
  options: Omit<ServerFetchOptions, "method" | "body"> = {},
  dependencies: any[] = []
): ServerFetchResult<{ data: T[]; total: number }> {
  const queryParams = {
    [searchField]: searchQuery,
    ...additionalParams
  };

  return useServerGet<{ data: T[]; total: number }>(endpoint, queryParams, options, [
    searchQuery,
    ...dependencies
  ]);
}

/**
 * Hook for fetching data by ID
 */
export function useServerGetById<T = any>(
  endpoint: string,
  id: string | number,
  options: Omit<ServerFetchOptions, "method" | "body"> = {},
  dependencies: any[] = []
): ServerFetchResult<T> {
  const fullEndpoint = `${endpoint}/${id}`;

  return useServerGet<T>(fullEndpoint, undefined, options, [id, ...dependencies]);
}

/**
 * Hook for conditional fetching (only fetch when condition is true)
 */
export function useServerConditionalFetch<T = any>(
  endpoint: string,
  condition: boolean,
  options: ServerFetchOptions = {},
  dependencies: any[] = []
): ServerFetchResult<T> {
  const [shouldFetch, setShouldFetch] = useState(condition);

  useEffect(() => {
    setShouldFetch(condition);
  }, [condition]);

  const result = useServerFetch<T>(shouldFetch ? endpoint : "", options, [
    shouldFetch,
    ...dependencies
  ]);

  return {
    ...result,
    loading: condition ? result.loading : false,
    data: condition ? result.data : null
  };
}

/**
 * Hook for fetching with retry logic
 */
export function useServerFetchWithRetry<T = any>(
  endpoint: string,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  options: ServerFetchOptions = {},
  dependencies: any[] = []
): ServerFetchResult<T> {
  const [retryCount, setRetryCount] = useState(0);

  const fetchWithRetry = useCallback(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

        const fetchOptions: RequestInit = {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...options.headers
          },
          cache: options.cache || "default",
          signal: options.signal
        };

        if (options.body && options.method !== "GET") {
          fetchOptions.body = JSON.stringify(options.body);
        }

        if (options.next) {
          (fetchOptions as any).next = options.next;
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        setState({
          data,
          loading: false,
          error: null,
          status: response.status
        });

        setRetryCount(0);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          setRetryCount(attempt + 1);
        }
      }
    }

    setState({
      data: null,
      loading: false,
      error: lastError?.message || "Max retries exceeded",
      status: null
    });
  }, [endpoint, maxRetries, retryDelay, JSON.stringify(options), ...dependencies]);

  const [state, setState] = useState<ServerFetchState<T>>({
    data: null,
    loading: true,
    error: null,
    status: null
  });

  useEffect(() => {
    fetchWithRetry();
  }, [fetchWithRetry]);

  const refetch = useCallback(async () => {
    setRetryCount(0);
    await fetchWithRetry();
  }, [fetchWithRetry]);

  const mutate = useCallback((newData: T) => {
    setState((prev) => ({
      ...prev,
      data: newData
    }));
  }, []);

  return {
    ...state,
    refetch,
    mutate
  };
}

// Export all hooks
export { useServerFetch as default };
