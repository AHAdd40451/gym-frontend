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
import { MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import UpdateSubCategoryModal from "./UpdateSubCategoryModal";
import DeleteSubCategoryDialog from "./DeleteSubCategoryDialog";


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

export default function SubCategoriesDataTable({ 
  data, 
  token, 
  categories 
}: SubCategoriesDataTableProps) {
  const [updateModalOpen, setUpdateModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<SubCategory | null>(null);

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
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue("categoryName")}</div>
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No SubCategories Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Update Modal */}
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

      {/* Delete Dialog */}
      {selectedSubCategory && (
        <DeleteSubCategoryDialog
          subCategoryId={selectedSubCategory._id}
          subCategoryName={selectedSubCategory.name}
          token={token}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}