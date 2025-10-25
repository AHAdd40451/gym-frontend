import React from "react";

// Types
interface Order {
  _id: string;
  userId: string;
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function OrderList({ orders, loading, error, onRefresh }: OrderListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading orders...</div>
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

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg text-gray-500">No orders found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order._id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500">User ID: {order.userId}</p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}>
                  {order.status.toUpperCase()}
                </span>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Products:</h4>
              <div className="space-y-2">
                {order.products.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">${item.product.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-500">
                        ${(item.product.price * item.quantity)?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                {order.updatedAt !== order.createdAt && (
                  <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                View Details
              </button>
              {order.status === "pending" && (
                <button className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                  Mark Complete
                </button>
              )}
              {order.status === "pending" && (
                <button className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
