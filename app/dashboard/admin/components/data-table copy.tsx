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
import UpdateSubCategoryModal from "./UpdateSubCategoryModal";
import DeleteSubCategoryDialog from "./DeleteSubCategoryDialog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api";

export type SubCategory = {
  id: number;
  _id: string;
  name: string;
  categoryName: string;
  categoryId: string;
  description?: string;
  createdAt: string;
};

export type Category = {
  _id: string;
  name: string;
};

interface SubCategoriesDataTableProps {
  data: SubCategory[];
  token: string | null;
  categories: Category[];
}

async function deleteSubCategoryById(subCategoryId: string, token: string | null) {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Different projects sometimes use different route names,
  // so this tries common endpoints one by one.
  const endpoints = [
    `${API_BASE_URL}/subcategories/${subCategoryId}`,
    `${API_BASE_URL}/subcategory/${subCategoryId}`,
    `${API_BASE_URL}/sub-categories/${subCategoryId}`,
  ];

  let lastMessage = "Failed to delete subcategory";

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
        lastMessage = "Failed to delete subcategory";
      }

      throw new Error(lastMessage);
    }

    return res.json().catch(() => null);
  }

  throw new Error(lastMessage);
}

export default function SubCategoriesDataTable({
  data,
  token,
  categories,
}: SubCategoriesDataTableProps) {
  const [localData, setLocalData] = React.useState<SubCategory[]>(data || []);
  const [rowSelection, setRowSelection] = React.useState({});
  const [updateModalOpen, setUpdateModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    React.useState<SubCategory | null>(null);

  const [bulkDeleteDialog, setBulkDeleteDialog] = React.useState<{
    open: boolean;
    subCategoryIds: string[];
  }>({
    open: false,
    subCategoryIds: [],
  });

  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  React.useEffect(() => {
    setLocalData(data || []);
    setRowSelection({});
  }, [data]);

  const columns: ColumnDef<SubCategory>[] = [
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
      header: "SubCategory Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("categoryName")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string;

        return desc ? (
          <div className="max-w-[200px] truncate text-sm">{desc}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => row.getValue("createdAt"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subCat = row.original;

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
                  setSelectedSubCategory(subCat);
                  setUpdateModalOpen(true);
                }}
              >
                Update
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedSubCategory(subCat);
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

  const selectedSubCategories = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedSubCategoryIds = selectedSubCategories
    .map((subCat) => subCat._id)
    .filter(Boolean);

  const openBulkDeleteDialog = () => {
    if (!selectedSubCategoryIds.length) return;

    setBulkDeleteDialog({
      open: true,
      subCategoryIds: selectedSubCategoryIds,
    });
  };

  const cancelBulkDelete = () => {
    if (isBulkDeleting) return;

    setBulkDeleteDialog({
      open: false,
      subCategoryIds: [],
    });
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteDialog.subCategoryIds.length || isBulkDeleting) return;

    try {
      setIsBulkDeleting(true);

      const results = await Promise.all(
        bulkDeleteDialog.subCategoryIds.map(async (subCategoryId) => {
          try {
            await deleteSubCategoryById(subCategoryId, token);

            return {
              subCategoryId,
              success: true,
              error: "",
            };
          } catch (error: any) {
            return {
              subCategoryId,
              success: false,
              error: error?.message || "Failed to delete subcategory",
            };
          }
        })
      );

      const successfulIds = results
        .filter((item) => item.success)
        .map((item) => item.subCategoryId);

      const failedItems = results.filter((item) => !item.success);

      if (successfulIds.length > 0) {
        const successfulIdsSet = new Set(successfulIds);

        setLocalData((prev) =>
          prev.filter((subCat) => !successfulIdsSet.has(subCat._id))
        );

        table.resetRowSelection();

        toast.success(
          `${successfulIds.length} subcategory(s) deleted successfully`
        );
      }

      if (failedItems.length > 0) {
        toast.error(`${failedItems.length} subcategory(s) failed to delete`, {
          description:
            failedItems[0]?.error ||
            "Some subcategories could not be deleted. Please try again.",
        });
      }

      setBulkDeleteDialog({
        open: false,
        subCategoryIds: [],
      });
    } catch (error: any) {
      toast.error("Failed to delete selected subcategories", {
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
        {selectedSubCategoryIds.length > 0 && (
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
                : `Delete Selected (${selectedSubCategoryIds.length})`}
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No SubCategories Found
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

      {selectedSubCategory && (
        <UpdateSubCategoryModal
          subCategoryId={selectedSubCategory._id}
          currentName={selectedSubCategory.name}
          currentCategoryId={selectedSubCategory.categoryId}
          currentDescription={selectedSubCategory.description}
          token={token}
          categories={categories}
          open={updateModalOpen}
          onOpenChange={setUpdateModalOpen}
        />
      )}

      {selectedSubCategory && (
        <DeleteSubCategoryDialog
          subCategoryId={selectedSubCategory._id}
          subCategoryName={selectedSubCategory.name}
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
            <AlertDialogTitle>Delete selected subcategories?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{bulkDeleteDialog.subCategoryIds.length}</strong> selected
              subcategory(s). This action cannot be undone.
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