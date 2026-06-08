"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UpdateCategoryModal from "./UpdateCategoryModal";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api";

export type Category = {
  id: number;
  _id: string;
  name: string;
  createdAt: string;
};

interface CategoriesDataTableProps {
  data: Category[];
  token: string | null;
}

async function deleteCategoryById(categoryId: string, token: string | null) {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const endpoints = [
    `${API_BASE_URL}/categories/${categoryId}`,
    `${API_BASE_URL}/category/${categoryId}`,
  ];

  let lastMessage = "Failed to delete category";

  for (const endpoint of endpoints) {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers,
    });

    if (res.status === 404) {
      try {
        const errorData = await res.json();
        lastMessage = errorData?.message || lastMessage;
      } catch {
        lastMessage = "Delete route not found";
      }

      continue;
    }

    if (!res.ok) {
      try {
        const errorData = await res.json();
        lastMessage = errorData?.message || lastMessage;
      } catch {
        lastMessage = "Failed to delete category";
      }

      throw new Error(lastMessage);
    }

    return res.json().catch(() => null);
  }

  throw new Error(lastMessage);
}

export default function CategoriesDataTable({
  data,
  token,
}: CategoriesDataTableProps) {
  const [localData, setLocalData] = React.useState<Category[]>(data || []);
  const [rowSelection, setRowSelection] = React.useState({});
  const [updateModalOpen, setUpdateModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  const [bulkDeleteDialog, setBulkDeleteDialog] = React.useState<{
    open: boolean;
    categoryIds: string[];
  }>({
    open: false,
    categoryIds: [],
  });

  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  React.useEffect(() => {
    setLocalData(data || []);
    setRowSelection({});
  }, [data]);

  const columns: ColumnDef<Category>[] = [
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
    },
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => <>#{row.getValue("id")}</>,
    },
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => row.getValue("createdAt"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const cat = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCategory(cat);
                  setUpdateModalOpen(true);
                }}
              >
                Update
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedCategory(cat);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: localData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  const selectedCategories = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedCategoryIds = selectedCategories
    .map((cat) => cat._id)
    .filter(Boolean);

  const openBulkDeleteDialog = () => {
    if (!selectedCategoryIds.length) return;

    setBulkDeleteDialog({
      open: true,
      categoryIds: selectedCategoryIds,
    });
  };

  const cancelBulkDelete = () => {
    if (isBulkDeleting) return;

    setBulkDeleteDialog({
      open: false,
      categoryIds: [],
    });
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteDialog.categoryIds.length || isBulkDeleting) return;

    try {
      setIsBulkDeleting(true);

      const results = await Promise.all(
        bulkDeleteDialog.categoryIds.map(async (categoryId) => {
          try {
            await deleteCategoryById(categoryId, token);

            return {
              categoryId,
              success: true,
              error: "",
            };
          } catch (error: any) {
            return {
              categoryId,
              success: false,
              error: error?.message || "Failed to delete category",
            };
          }
        })
      );

      const successfulIds = results
        .filter((item) => item.success)
        .map((item) => item.categoryId);

      const failedItems = results.filter((item) => !item.success);

      if (successfulIds.length > 0) {
        const successfulIdsSet = new Set(successfulIds);

        setLocalData((prev) =>
          prev.filter((cat) => !successfulIdsSet.has(cat._id))
        );

        table.resetRowSelection();

        toast.success(`${successfulIds.length} category(s) deleted successfully`);
      }

      if (failedItems.length > 0) {
        toast.error(`${failedItems.length} category(s) failed to delete`, {
          description:
            failedItems[0]?.error ||
            "Some categories could not be deleted. Please try again.",
        });
      }

      setBulkDeleteDialog({
        open: false,
        categoryIds: [],
      });
    } catch (error: any) {
      toast.error("Failed to delete selected categories", {
        description:
          error?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {selectedCategoryIds.length > 0 && (
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
                : `Delete Selected (${selectedCategoryIds.length})`}
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No Categories Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-muted-foreground text-sm">
          {table.getSelectedRowModel().rows.length} of{" "}
          {table.getRowModel().rows.length} row(s) selected.
        </div>
      </div>

      {selectedCategory && (
        <UpdateCategoryModal
          categoryId={selectedCategory._id}
          currentName={selectedCategory.name}
          token={token}
          open={updateModalOpen}
          onOpenChange={setUpdateModalOpen}
        />
      )}

      {selectedCategory && (
        <DeleteCategoryDialog
          categoryId={selectedCategory._id}
          categoryName={selectedCategory.name}
          token={token}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}

      <AlertDialog
        open={bulkDeleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !isBulkDeleting) {
            cancelBulkDelete();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected categories?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{bulkDeleteDialog.categoryIds.length}</strong> selected
              category(s). This action cannot be undone.
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
    </>
  );
}