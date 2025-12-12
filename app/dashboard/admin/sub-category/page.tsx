import React from "react";
import { getSubCategories } from "@/lib/api/services/subcategory/subcategory";
import { getCategories } from "@/lib/api/services/category/category";
import { getServerAuth } from "@/lib/api/services/auth/server";
import CreateSubCategoryModal from "../components/CreateSubCategories";
import SubCategoriesDataTable from "../components/data-table copy";

const page = async () => {
  const { user, token } = await getServerAuth();

  // Fetch subcategories and categories
  const subCategoriesResult = await getSubCategories({});
  const categoriesResult = await getCategories({});

  const subCategories =
    subCategoriesResult?.data?.map((subCat, idx) => ({
      id: idx + 1,
      _id: subCat._id,
      name: subCat.name,
      categoryName: typeof subCat.category === 'object' ? subCat.category.name : '',
      categoryId: typeof subCat.category === 'object' ? subCat.category._id : subCat.category,
      description: subCat.description || "",
      createdAt: subCat.createdAt?.slice(0, 10) ?? ""
    })) || [];

  const categories = categoriesResult?.data?.categories || [];

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Sub Categories</h1>
        <CreateSubCategoryModal token={token} categories={categories} />
      </div>

      {/* Table */}
      <SubCategoriesDataTable data={subCategories} token={token} categories={categories} />
    </div>
  );
};

export default page;