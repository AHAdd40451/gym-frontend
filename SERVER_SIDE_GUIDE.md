# Server-Side Data Fetching Guide

This guide shows how to implement server-side data fetching in Next.js App Router and pass data as props to components.

## 🎯 **What We Built**

### 1. **Server-Side API Functions** (`lib/api/server.ts`)

- Generic `serverFetch` function for all API calls
- Type-safe functions for each endpoint
- Error handling and response formatting
- Query string building utilities

### 2. **Reusable Components** (`components/dashboard/`)

- `ProductList.tsx` - Displays products with loading/error states
- `OrderList.tsx` - Shows orders with status and actions
- `DashboardStats.tsx` - Dashboard overview cards

### 3. **Server-Side Pages** (`app/dashboard/`)

- `page.tsx` - Main dashboard with all data
- `orders/page.tsx` - Orders management with filters
- `products/page.tsx` - Products management with categories
- `analytics/page.tsx` - Analytics dashboard with date ranges

## 🚀 **Key Features**

✅ **Server-Side Rendering** - Data fetched on server, passed as props  
✅ **Type Safety** - Full TypeScript support  
✅ **Error Handling** - Graceful error states  
✅ **Loading States** - Proper loading indicators  
✅ **Filtering & Pagination** - URL-based state management  
✅ **Parallel Fetching** - Multiple API calls in parallel  
✅ **SEO Friendly** - Server-rendered content

## 📝 **Usage Examples**

### Basic Server-Side Fetching

```tsx
// app/dashboard/page.tsx
import { getProducts, getOrders } from "@/lib/api/server";
import { ProductList } from "@/components/dashboard/ProductList";

export default async function DashboardPage() {
  // Fetch data on server
  const [productsResult, ordersResult] = await Promise.all([getProducts(), getOrders(1, 10)]);

  return (
    <div>
      <ProductList products={productsResult.data?.products || []} error={productsResult.error} />
    </div>
  );
}
```

### With Search Parameters

```tsx
// app/dashboard/orders/page.tsx
interface OrdersPageProps {
  searchParams: {
    page?: string;
    status?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const page = parseInt(searchParams.page || "1");
  const status = searchParams.status;

  const ordersResult = await getOrders(page, 10, undefined, status);

  return <OrderList orders={ordersResult.data?.data || []} error={ordersResult.error} />;
}
```

### Component with Props

```tsx
// components/dashboard/ProductList.tsx
interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function ProductList({ products, loading, error }: ProductListProps) {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
```

## 🔧 **Server-Side API Functions**

### Generic Fetch Function

```typescript
// lib/api/server.ts
async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "default",
      ...options
    });

    if (!response.ok) {
      return {
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 0
    };
  }
}
```

### Specific API Functions

```typescript
// Product functions
export async function getProducts(category?: string) {
  const queryParams = category ? { category } : {};
  const queryString = buildQueryString(queryParams);
  return serverFetch<ProductResponse>(`/products${queryString}`);
}

// Order functions
export async function getOrders(page = 1, limit = 10, userId?: string) {
  const queryParams = { page, limit, ...(userId && { userId }) };
  const queryString = buildQueryString(queryParams);
  return serverFetch<OrderResponse>(`/orders${queryString}`);
}

// Dashboard functions
export async function getDashboardStats() {
  return serverFetch<DashboardStats>("/dashboard/stats");
}
```

## 🎨 **Component Patterns**

### Loading States

```tsx
export function MyComponent({ data, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg text-gray-500">No data found</div>
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Error Handling

```tsx
// In your page component
const result = await getProducts();

if (result.error) {
  return <div>Error: {result.error}</div>;
}

return <ProductList products={result.data?.products || []} />;
```

## 🔄 **Data Flow**

1. **Server Component** fetches data using `getProducts()`
2. **API Function** calls `serverFetch()` with endpoint
3. **Server Fetch** makes HTTP request to backend
4. **Response** is returned with `{ data, error, status }`
5. **Component** receives data as props
6. **UI** renders with proper loading/error states

## 📊 **Advanced Patterns**

### Parallel Data Fetching

```tsx
export default async function DashboardPage() {
  // Fetch multiple endpoints in parallel
  const [products, orders, stats, users] = await Promise.all([
    getProducts(),
    getOrders(1, 10),
    getDashboardStats(),
    getUsers(1, 5)
  ]);

  return (
    <div>
      <DashboardStats stats={stats.data} error={stats.error} />
      <ProductList products={products.data?.products || []} />
      <OrderList orders={orders.data?.data || []} />
    </div>
  );
}
```

### Conditional Fetching

```tsx
export default async function ProductPage({ searchParams }: Props) {
  // Only fetch if category is provided
  const category = searchParams.category;
  const productsResult = category
    ? await getProducts(category)
    : { data: null, error: null, status: 0 };

  return <ProductList products={productsResult.data?.products || []} />;
}
```

### Caching

```tsx
// In server.ts
const response = await fetch(url, {
  cache: "force-cache", // Cache for static data
  next: { revalidate: 3600 } // Revalidate every hour
});
```

## 🚀 **Benefits of This Approach**

1. **SEO Friendly** - Content is server-rendered
2. **Fast Initial Load** - Data is ready when page loads
3. **Type Safe** - Full TypeScript support
4. **Error Resilient** - Graceful error handling
5. **Reusable** - Components accept props
6. **Maintainable** - Clear separation of concerns
7. **Scalable** - Easy to add new endpoints

## 🔧 **Environment Setup**

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📁 **File Structure**

```
app/
├── dashboard/
│   ├── page.tsx              # Main dashboard
│   ├── orders/page.tsx       # Orders management
│   ├── products/page.tsx     # Products management
│   └── analytics/page.tsx    # Analytics dashboard

components/
└── dashboard/
    ├── ProductList.tsx       # Product display component
    ├── OrderList.tsx         # Order display component
    └── DashboardStats.tsx    # Stats display component

lib/
└── api/
    └── server.ts             # Server-side API functions
```

This implementation provides a robust, scalable solution for server-side data fetching in Next.js with proper error handling, type safety, and reusable components.
