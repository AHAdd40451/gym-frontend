import React from "react";

// Types
interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  ingredients?: string;
  servingSize?: string;
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function ProductList({ products, loading, error, onRefresh }: ProductListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-red-800">Error: {error}</div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg text-gray-500">No products found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products ({products.length})</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Refresh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={product.image || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="h-48 w-full rounded object-cover"
                />
              </div>

              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                {product.name}
              </h3>

              <p className="mb-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">${product.price}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>

              <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
                  {product.category.name}
                </span>
                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>

              {product.ingredients && (
                <div className="mb-2 text-xs text-gray-500">
                  <strong>Ingredients:</strong> {product.ingredients}
                </div>
              )}

              {product.servingSize && (
                <div className="mb-3 text-xs text-gray-500">
                  <strong>Serving Size:</strong> {product.servingSize}
                </div>
              )}

              <button className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
