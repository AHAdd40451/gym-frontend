

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";


// export async function serverFetch<T>(
//   endpoint: string,
//   options: RequestInit = {},
//   token?: string
// ): Promise<{ data: T | null; error: string | null; status: number }> {
//   try {
//     const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

//     // ✅ Merge headers safely
//     const mergedHeaders = {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };

//     const response = await fetch(url, {
//       ...options,
//       headers: mergedHeaders,
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       return {
//         data: null,
//         error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
//         status: response.status,
//       };
//     }

//     const data = await response.json();
//     return { data, error: null, status: response.status };
//   } catch (error) {
//     return {
//       data: null,
//       error: error instanceof Error ? error.message : "An unknown error occurred",
//       status: 0,
//     };
//   }
// }


// // Build query string from parameters
// export function buildQueryString(params: Record<string, any>): string {
//   const searchParams = new URLSearchParams();

//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       if (Array.isArray(value)) {
//         value.forEach((item) => searchParams.append(key, item));
//       } else {
//         searchParams.append(key, String(value));
//       }
//     }
//   });

//   const queryString = searchParams.toString();
//   return queryString ? `?${queryString}` : "";
// }
// Server-side API functions for Next.js App Router
// These functions run on the server and can be used in Server Components

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Generic server-side fetch function
// export async function serverFetch<T>(
//   endpoint: string,
//   options: RequestInit = {},
//   token?: string
// ): Promise<{ data: T | null; error: string | null; status: number }> {
//   try {
//     const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

//     console.log(options.headers, "options");
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...(options.headers || {}),
//         Authorization: token ? `Bearer ${token}` : ""
//       }
//     });

//     if (!response.ok) {
//       return {
//         data: null,
//         error: `HTTP ${response.status}: ${response.statusText}`,
//         status: response.status
//       };
//     }

//     const data = await response.json();
//     return {
//       data,
//       error: null,
//       status: response.status
//     };
//   } catch (error) {
//     return {
//       data: null,
//       error: error instanceof Error ? error.message : "An unknown error occurred",
//       status: 0
//     };
//   }
// }
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    // ✅ Merge headers safely
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }
    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      status: 0,
    };
  }
}
// Build query string from parameters
export function buildQueryString(params: Record<string, any>): string {
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
}