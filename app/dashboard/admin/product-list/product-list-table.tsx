"use client";

import Link from "next/link";
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
import { ArrowUpDown, MoreHorizontal, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
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
import { Product } from "@/lib/api/services/product/product";
import { deleteProductAction } from "./actions";
import { EditProductDialog } from "./edit-product-dialog";

const getProductStatus = (stock: { quantity: number; inStock: boolean }) => {
  if (!stock.inStock || stock.quantity === 0) return "out-of-stock";
  if (stock.quantity < 20) return "low-stock";
  return "active";
};

const getCategoryName = (category: string | { _id: string; name: string }): string => {
  if (typeof category === "string") return category;
  return category?.name || "Unknown";
};

type ProductActionsProps = {
  row: any;
  onDelete: (productId: string, productName: string) => void;
  onEdit: (product: Product) => void;
};

const ProductActions = ({ row, onDelete, onEdit }: ProductActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/dashboard/admin/product-list/${row.original._id}`}>
            View details
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original._id)}>
          Copy ID
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600"
          onClick={() => onDelete(row.original._id, row.original.name)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createColumns = (
  onDelete: (productId: string, productName: string) => void,
  onEdit: (product: Product) => void
): ColumnDef<Product>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <figure className="overflow-hidden rounded-lg border">
          <Image
            src={row.original.image || "/images/placeholder-product.jpg"}
            width={48}
            height={48}
            unoptimized
            alt={row.original.name}
            className="object-cover"
          />
        </figure>

        <div className="capitalize">{row.getValue("name")}</div>
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
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <span>${price.toLocaleString()}</span>;
    }
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.getValue("category");
      return <div className="capitalize">{getCategoryName(category as any)}</div>;
    }
  },
  {
    accessorKey: "stock",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stock = row.getValue("stock") as { quantity: number; inStock: boolean };
      return <span>{stock.quantity}</span>;
    }
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div className="max-w-xs truncate">{description}</div>;
    }
  },
  {
    id: "status",
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
      const stock = row.original.stock as { quantity: number; inStock: boolean };
      const status = getProductStatus(stock);

      const statusMap = {
        active: "success",
        "low-stock": "warning",
        "out-of-stock": "destructive"
      } as const;

      const statusClass = statusMap[status as keyof typeof statusMap] ?? "default";

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
    cell: ({ row }) => (
      <ProductActions row={row} onDelete={onDelete} onEdit={onEdit} />
    )
  }
];

interface Category {
  _id: string;
  name: string;
}

interface ProductListTableProps {
  products: Product[];
  categories: Category[];
}

export default function ProductListTable({
  products,
  categories
}: ProductListTableProps) {
  const [localProducts, setLocalProducts] = React.useState(products || []);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({
    open: false,
    productId: "",
    productName: ""
  });

  const [bulkDeleteDialog, setBulkDeleteDialog] = React.useState<{
    open: boolean;
    productIds: string[];
    productNames: string[];
  }>({
    open: false,
    productIds: [],
    productNames: []
  });

  const [editDialog, setEditDialog] = React.useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null
  });

  React.useEffect(() => {
    setLocalProducts(products || []);
    setRowSelection({});
  }, [products]);

  const handleDeleteProduct = React.useCallback(
    (productId: string, productName: string) => {
      setDeleteDialog({
        open: true,
        productId,
        productName
      });
    },
    []
  );

  const handleEditProduct = React.useCallback((product: Product) => {
    setEditDialog({
      open: true,
      product
    });
  }, []);

  const handleEditSuccess = React.useCallback((updatedProduct: Product) => {
    setLocalProducts((prev) =>
      prev.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!deleteDialog.productId) return;

    setIsDeleting(true);

    try {
      const result = await deleteProductAction(deleteDialog.productId);

      if (!result.success) {
        toast.error("Failed to delete product", {
          description: result.error || "An error occurred while deleting the product."
        });
      } else {
        toast.success("Product deleted successfully", {
          description: `${deleteDialog.productName} has been removed from your product list.`
        });

        setLocalProducts((prev) =>
          prev.filter((product) => product._id !== deleteDialog.productId)
        );

        setRowSelection({});
      }
    } catch (error: any) {
      toast.error("Failed to delete product", {
        description: error.message || "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({
        open: false,
        productId: "",
        productName: ""
      });
    }
  }, [deleteDialog]);

  const cancelDelete = React.useCallback(() => {
    setDeleteDialog({
      open: false,
      productId: "",
      productName: ""
    });
  }, []);

  const cancelBulkDelete = React.useCallback(() => {
    setBulkDeleteDialog({
      open: false,
      productIds: [],
      productNames: []
    });
  }, []);

  const columns = React.useMemo(
    () => createColumns(handleDeleteProduct, handleEditProduct),
    [handleDeleteProduct, handleEditProduct]
  );

  const table = useReactTable({
    data: localProducts,
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

  const selectedProducts = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedProductIds = selectedProducts
    .map((product) => product._id)
    .filter(Boolean);

  const openBulkDeleteDialog = React.useCallback(() => {
    if (!selectedProductIds.length) return;

    setBulkDeleteDialog({
      open: true,
      productIds: selectedProductIds,
      productNames: selectedProducts.map((product) => product.name)
    });
  }, [selectedProductIds, selectedProducts]);

  const confirmBulkDelete = React.useCallback(async () => {
    if (!bulkDeleteDialog.productIds.length) return;

    setIsBulkDeleting(true);

    try {
      const results = await Promise.all(
        bulkDeleteDialog.productIds.map(async (productId) => {
          const result = await deleteProductAction(productId);

          return {
            productId,
            result
          };
        })
      );

      const successfulIds = results
        .filter((item) => item.result.success)
        .map((item) => item.productId);

      const failedItems = results.filter((item) => !item.result.success);

      if (successfulIds.length > 0) {
        const successfulIdsSet = new Set(successfulIds);

        setLocalProducts((prev) =>
          prev.filter((product) => !successfulIdsSet.has(product._id))
        );

        setRowSelection({});

        toast.success(`${successfulIds.length} product(s) deleted successfully`);
      }

      if (failedItems.length > 0) {
        toast.error(`${failedItems.length} product(s) failed to delete`, {
          description:
            failedItems[0]?.result?.error ||
            "Some products could not be deleted. Please try again."
        });
      }
    } catch (error: any) {
      toast.error("Failed to delete selected products", {
        description: error.message || "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteDialog({
        open: false,
        productIds: [],
        productNames: []
      });
    }
  }, [bulkDeleteDialog]);

  return (
    <>
      <div className="w-full space-y-4">
        {selectedProductIds.length > 0 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isBulkDeleting}
              onClick={openBulkDeleteDialog}
            >
              {isBulkDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedProductIds.length})`}
            </Button>
          </div>
        )}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No products found.
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

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !isDeleting && !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteDialog.productName}</strong> from your product
              list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialog.open}
        onOpenChange={(open) => !isBulkDeleting && !open && cancelBulkDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected products?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{bulkDeleteDialog.productIds.length}</strong> selected
              product(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelBulkDelete}
              disabled={isBulkDeleting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isBulkDeleting ? (
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

      {editDialog.product && (
        <EditProductDialog
          open={editDialog.open}
          onOpenChange={(open) =>
            setEditDialog({
              open,
              product: null
            })
          }
          product={editDialog.product}
          categories={categories}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}