"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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
import { ArrowUpDown, Columns, FilterIcon, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gym.coderivals.ltd/api";

export type Order = {
  id: number;
  _id: string;
  product_name: string;
  image: string;
  customer: Customer;
  price?: string;
  status:
    | "active"
    | "transportation"
    | "pending"
    | "processing"
    | "shipped"
    | "out for delivery"
    | "completed"
    | "delivered"
    | "cancel"
    | "confirmed"
    | "cancelled";
  date?: string;
  type?: string;
};

export type Customer = {
  name?: string;
  email?: string;
};

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const directToken =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("adminToken");

  if (directToken) return directToken;

  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    return (
      currentUser?.token ||
      currentUser?.accessToken ||
      currentUser?.authToken ||
      ""
    );
  } catch {
    return "";
  }
}

async function deleteOrderById(orderId: string) {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "DELETE",
    headers
  });

  if (!res.ok) {
    let message = "Failed to delete order";

    try {
      const errorData = await res.json();
      message = errorData?.message || message;
    } catch {
      // ignore json parse error
    }

    throw new Error(message);
  }

  return res.json().catch(() => null);
}

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <Link
          href={`/dashboard/admin/orders/${order._id}`}
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          #{row.getValue("id")}
        </Link>
      );
    }
  },
  {
    accessorKey: "product_name",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <Image
          src={row.original.image}
          width={40}
          height={40}
          className="size-10 rounded-md object-cover lg:size-12"
          unoptimized
          alt={row.getValue("product_name")}
        />
        {row.getValue("product_name")}
      </div>
    )
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => row.getValue("price")
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;

      return (
        <div className="space-y-1">
          <div className="font-semibold">{customer.name}</div>
          <div className="text-muted-foreground">{customer.email}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => row.getValue("date")
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("type")}</div>
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status || "pending";

      const statusMap = {
        processing: "warning",
        shipped: "default",
        "out for delivery": "default",
        delivered: "success",
        completed: "success",
        cancelled: "destructive",
        cancel: "destructive",
        pending: "secondary",
        active: "secondary",
        transportation: "secondary",
        confirmed: "secondary"
      } as const;

      const statusClass =
        statusMap[status.toLowerCase() as keyof typeof statusMap] ?? "secondary";

      return (
        <div>
          <Badge variant={statusClass} className="capitalize">
            {status.replaceAll("-", " ")}
          </Badge>
        </div>
      );
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="text-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/orders/${order._id}`}>
                  Order Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  }
];

export default function OrdersDataTable({ data }: { data: Order[] }) {
  const [tableData, setTableData] = React.useState<Order[]>(data || []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [deletingSelected, setDeletingSelected] = React.useState(false);

  const [deleteSelectedDialog, setDeleteSelectedDialog] = React.useState<{
    open: boolean;
    orderIds: string[];
  }>({
    open: false,
    orderIds: []
  });

  React.useEffect(() => {
    setTableData(data || []);
    setRowSelection({});
  }, [data]);

  const table = useReactTable({
    data: tableData,
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
    }
  });

  const selectedOrderIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id || String(row.original.id))
    .filter(Boolean);

  const openDeleteSelectedOrdersDialog = () => {
    if (!selectedOrderIds.length) return;

    setDeleteSelectedDialog({
      open: true,
      orderIds: selectedOrderIds.map(String)
    });
  };

  const cancelDeleteSelectedOrders = () => {
    if (deletingSelected) return;

    setDeleteSelectedDialog({
      open: false,
      orderIds: []
    });
  };

  const confirmDeleteSelectedOrders = async () => {
    if (!deleteSelectedDialog.orderIds.length || deletingSelected) return;

    try {
      setDeletingSelected(true);

      await Promise.all(
        deleteSelectedDialog.orderIds.map((orderId) =>
          deleteOrderById(String(orderId))
        )
      );

      const selectedIdsSet = new Set(deleteSelectedDialog.orderIds.map(String));

      setTableData((prev) =>
        prev.filter((order) => {
          const orderId = order._id || String(order.id);
          return !selectedIdsSet.has(String(orderId));
        })
      );

      table.resetRowSelection();

      toast.success(
        `${deleteSelectedDialog.orderIds.length} order(s) deleted successfully`
      );

      setDeleteSelectedDialog({
        open: false,
        orderIds: []
      });
    } catch (error: any) {
      console.error("Failed to delete selected orders:", error);
      toast.error(error?.message || "Failed to delete selected orders");
    } finally {
      setDeletingSelected(false);
    }
  };

  const statuses = [
    {
      value: "pending",
      label: "Pending"
    },
    {
      value: "completed",
      label: "Completed"
    },
    {
      value: "shipped",
      label: "Shipped"
    },
    {
      value: "delivered",
      label: "Delivered"
    }
  ];

  const categories = [
    {
      value: "beauty",
      label: "Beauty"
    },
    {
      value: "technology",
      label: "Technology"
    },
    {
      value: "toys",
      label: "Toys"
    },
    {
      value: "food",
      label: "Food"
    },
    {
      value: "home-appliances",
      label: "Home Appliances"
    }
  ];

  const Filters = () => {
    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <span />
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0">
            <Command>
              <CommandInput placeholder="Status" className="h-9" />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {statuses.map((status) => (
                    <CommandItem key={status.value} value={status.value}>
                      <div className="flex items-center space-x-3 py-1">
                        <Checkbox id={status.value} />
                        <label
                          htmlFor={status.value}
                          className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {status.label}
                        </label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <span />
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0">
            <Command>
              <CommandInput placeholder="Category" className="h-9" />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-3 py-1">
                        <Checkbox id={category.value} />
                        <label
                          htmlFor={category.value}
                          className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.label}
                        </label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            placeholder="Search orders..."
            value={(table.getColumn("product_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("product_name")?.setFilterValue(event.target.value)
            }
            className="md:max-w-sm"
          />

          <div className="hidden gap-2 md:flex">
            <Filters />
          </div>

          <div className="inline md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-4">
                <div className="grid space-y-2">
                  <Filters />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="ms-auto flex flex-col items-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span className="hidden lg:inline">Columns</span> <Columns />
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
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedOrderIds.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deletingSelected}
                onClick={openDeleteSelectedOrdersDialog}
              >
                {deletingSelected
                  ? "Deleting..."
                  : `Delete Selected (${selectedOrderIds.length})`}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
                {table.getRowModel().rows?.length ? (
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
                      No results.
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
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog
        open={deleteSelectedDialog.open}
        onOpenChange={(open) => {
          if (!open && !deletingSelected) {
            cancelDeleteSelectedOrders();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected orders?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteSelectedDialog.orderIds.length}</strong> selected
              order(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeleteSelectedOrders}
              disabled={deletingSelected}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDeleteSelectedOrders}
              disabled={deletingSelected}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingSelected ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Selected"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}