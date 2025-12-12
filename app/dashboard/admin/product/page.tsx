// app/dashboard/admin/product/create/page.tsx
import React from 'react'
import { getServerAuth } from "@/lib/api/services/auth/server";
import AddProductForm from '../components/add-product-form';

const page = async () => {
  const { user, token } = await getServerAuth();

  return (
    <div>
      <AddProductForm token={token} />
    </div>
  )
}

export default page