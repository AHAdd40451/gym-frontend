"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronDown, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getAllOrders } from "@/lib/api/services/order/order";

// Backend Order type
interface OrderItem {
  productId?: string;
  title?: string;
  price?: number;
  size?: string;
  color?: string;
  image?: string;
  quantity?: number;
}

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface BackendOrder {
  _id: string;
  guest?: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  status: "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

// UI Order type
type Order = {
  id: string;
  customerName: string;
  items: number;
  amount: number;
  email: string;
  phone: string;
  status: "processing" | "shipped" | "out-for-delivery" | "delivered" | "cancelled";
};

const statusMap: Record<string, "processing" | "shipped" | "out-for-delivery" | "delivered" | "cancelled"> = {
  "Processing": "processing",
  "Shipped": "shipped",
  "Out for Delivery": "out-for-delivery",
  "Delivered": "delivered",
  "Cancelled": "cancelled"
};

const statusBadgeMap = {
  delivered: "success",
  processing: "info",
  shipped: "warning",
  "out-for-delivery": "warning",
  cancelled: "destructive"
} as const;

// Transform backend order to UI format
function transformOrder(backendOrder: BackendOrder): Order {
  const totalItems = backendOrder.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const customerName = backendOrder.guest || 
    `${backendOrder.shippingAddress.firstName} ${backendOrder.shippingAddress.lastName}`;

  return {
    id: backendOrder._id,
    customerName,
    items: totalItems,
    amount: backendOrder.total,
    email: backendOrder.shippingAddress.email,
    phone: backendOrder.shippingAddress.phone,
    status: statusMap[backendOrder.status] || "processing"
  };
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => `#${row.getValue("id").toString().slice(-8).toUpperCase()}`,
    size: 120
  },
  {
    accessorKey: "customerName",
    header: "Customer Name"
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "phone",
    header: "Phone"
  },
  {
    accessorKey: "items",
    header: "Qty Items",
    cell: ({ row }) => `${row.getValue("items")} Items`
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${Number(row.getValue("amount")).toFixed(2)}`
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusClass = statusBadgeMap[status] ?? "default";

      return (
        <Badge variant={statusClass} className="capitalize">
          {status.replace("-", " ")}
        </Badge>
      );
    }
  }
];

export function EcommerceRecentOrdersCard() {
  const [data, setData] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Calculate statistics
  const stats = React.useMemo(() => {
    const processing = data.filter(o => o.status === "processing").length;
    const shipped = data.filter(o => o.status === "shipped").length;
    const outForDelivery = data.filter(o => o.status === "out-for-delivery").length;
    const delivered = data.filter(o => o.status === "delivered").length;
    const cancelled = data.filter(o => o.status === "cancelled").length;
    const total = data.length || 1; // Prevent division by zero

    return {
      processing: { count: processing, percentage: (processing / total) * 100 },
      inProgress: { count: shipped + outForDelivery, percentage: ((shipped + outForDelivery) / total) * 100 },
      delivered: { count: delivered, percentage: (delivered / total) * 100 },
      cancelled: { count: cancelled, percentage: (cancelled / total) * 100 }
    };
  }, [data]);

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or cookie
      const token = localStorage.getItem("authToken") || "";
      
      const response = await getAllOrders({ page: 1, limit: 100 }, token);
      
      if (Array.isArray(response)) {
        const transformedOrders = response.map(transformOrder);
        setData(transformedOrders);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 6
      }
    }
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Track Order Status</CardTitle>
            <CardDescription>Monitor and manage all customer orders</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="font-display text-2xl lg:text-3xl">{stats.processing.count}</div>
            <div className="flex gap-2">
              <div className="text-muted-foreground text-sm">Processing</div>
              <div className="flex items-center gap-0.5 text-xs text-blue-500">
                <ArrowUp className="size-3" />
                {stats.processing.percentage.toFixed(1)}%
              </div>
            </div>
            <Progress
              value={stats.processing.percentage}
              className="h-2 bg-blue-100 dark:bg-blue-950"
              indicatorColor="bg-blue-400"
            />
          </div>
          <div className="space-y-2">
            <div className="font-display text-2xl lg:text-3xl">{stats.inProgress.count}</div>
            <div className="flex gap-2">
              <div className="text-muted-foreground text-sm">In Transit</div>
              <div className="flex items-center gap-0.5 text-xs text-teal-500">
                <ArrowUp className="size-3" />
                {stats.inProgress.percentage.toFixed(1)}%
              </div>
            </div>
            <Progress
              value={stats.inProgress.percentage}
              className="h-2 bg-teal-100 dark:bg-teal-950"
              indicatorColor="bg-teal-400"
            />
          </div>
          <div className="space-y-2">
            <div className="font-display text-2xl lg:text-3xl">{stats.delivered.count}</div>
            <div className="flex gap-2">
              <div className="text-muted-foreground text-sm">Delivered</div>
              <div className="flex items-center gap-0.5 text-xs text-green-500">
                <ArrowUp className="size-3" />
                {stats.delivered.percentage.toFixed(1)}%
              </div>
            </div>
            <Progress
              value={stats.delivered.percentage}
              className="h-2 bg-green-100 dark:bg-green-950"
              indicatorColor="bg-green-400"
            />
          </div>
          <div className="space-y-2">
            <div className="font-display text-2xl lg:text-3xl">{stats.cancelled.count}</div>
            <div className="flex gap-2">
              <div className="text-muted-foreground text-sm">Cancelled</div>
              <div className="flex items-center gap-0.5 text-xs text-red-500">
                <ArrowDown className="size-3" />
                {stats.cancelled.percentage.toFixed(1)}%
              </div>
            </div>
            <Progress
              value={stats.cancelled.percentage}
              className="h-2 bg-red-100 dark:bg-red-950"
              indicatorColor="bg-red-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter by customer name..."
              value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("customerName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <RefreshCw className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}