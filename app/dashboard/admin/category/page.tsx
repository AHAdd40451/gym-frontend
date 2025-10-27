// import React from 'react'
// import { OrderList } from '@/components/dashboard/OrderList'
// import OrdersDataTable from '../../(auth)/pages/orders/data-table'

// const page = () => {

//     //     {
//     //       _id: "order_1",
//     //       userId: "user_001",
//     //       products: [
//     //         {
//     //           product: {
//     //             _id: "p1",
//     //             name: "Mass Gainer",
//     //             price: 3000,
//     //           },
//     //           quantity: 1,
//     //         },
//     //       ],
//     //       totalAmount: 3000,
//     //       status: "pending",
//     //       createdAt: new Date().toISOString(),
//     //       updatedAt: new Date().toISOString(),
//     //     },
//     //     {
//     //       _id: "order_2",
//     //       userId: "user_002",
//     //       products: [
//     //         {
//     //           product: {
//     //             _id: "p2",
//     //             name: "Creatine",
//     //             price: 8000,
//     //           },
//     //           quantity: 2,
//     //         },
//     //       ],
//     //       totalAmount: 16000,
//     //       status: "completed",
//     //       createdAt: new Date().toISOString(),
//     //       updatedAt: new Date().toISOString(),
//     //     },
//     //   ];
      
    
//   return (
//     <div> 
         
//          {/* <OrdersDataTable >  */}
//          </div>
//   )
// }

// export default page
import React from "react";
import OrdersDataTable from "../../(auth)/pages/orders/data-table";

const Page = () => {
  const ordersData = [
    {
      id: 1,
      product_name: "Mass Gainer",
      image: "/mass-gainer.jpg",
      customer: { name: "John Doe", email: "john@example.com" },
      price: "3000 PKR",
      status: "pending",
      date: "2025-10-20",
      type: "Fitness",
    },
    {
      id: 2,
      product_name: "Creatine Powder",
      image: "/creatine.jpg",
      customer: { name: "Emma Watson", email: "emma@example.com" },
      price: "8000 PKR",
      status: "completed",
      date: "2025-10-21",
      type: "Supplement",
    },
    {
      id: 3,
      product_name: "Whey Protein",
      image: "/whey.jpg",
      customer: { name: "Michael Scott", email: "michael@dundermifflen.com" },
      price: "12000 PKR",
      status: "active",
      date: "2025-10-25",
      type: "Fitness",
    }
  ];

  return (
    <div className="p-4">
      <OrdersDataTable data={ordersData} />
    </div>
  );
};

export default Page;
