import React from "react";
import { getCategories } from "@/lib/api/services/category/category";
import { getServerAuth } from "@/lib/api/services/auth/server";
import CreateCategoryModal from "../components/CreateCategoryModal";
import CategoriesDataTable from "../components/data-table";

const page = async () => {
  const { user, token } = await getServerAuth();

  // Fetch categories from API
  const categoriesResult = await getCategories({});

  const categories =
    categoriesResult?.data?.categories?.map((cat, idx) => ({
      id: idx + 1,
      _id: cat._id,
      name: cat.name,
      createdAt: cat.createdAt?.slice(0, 10) ?? ""
    })) || [];

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Categories</h1>
        <CreateCategoryModal token={token} />
      </div>

      {/* Table */}
      <CategoriesDataTable data={categories} token={token} />
    </div>
  );
};

export default page;