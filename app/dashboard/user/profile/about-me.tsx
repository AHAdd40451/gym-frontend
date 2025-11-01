// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";

// type TransactionStatus = "pending" | "failed" | "paid";

// interface Transaction {
//   id: string;
//   product: string;
//   status: TransactionStatus;
//   date: string;
//   amount: string;
// }

// const transactions: Transaction[] = [
//   {
//     id: "#36223",
//     product: "Mock premium pack",
//     status: "pending",
//     date: "12/10/2025",
//     amount: "$39.90"
//   },
//   {
//     id: "#34283",
//     product: "Enterprise plan subscription",
//     status: "paid",
//     date: "11/13/2025",
//     amount: "$159.90"
//   },
//   {
//     id: "#32234",
//     product: "Business board pro license",
//     status: "paid",
//     date: "10/13/2025",
//     amount: "$89.90"
//   },
//   {
//     id: "#31354",
//     product: "Custom integration package",
//     status: "failed",
//     date: "09/13/2025",
//     amount: "$299.90"
//   },
//   {
//     id: "#30254",
//     product: "Developer toolkit license",
//     status: "paid",
//     date: "08/15/2025",
//     amount: "$129.90"
//   },
//   {
//     id: "#29876",
//     product: "Support package renewal",
//     status: "pending",
//     date: "07/22/2025",
//     amount: "$79.90"
//   }
// ];

// export function AboutMe() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Transaction History</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Product</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead className="text-right">Amount</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {transactions.map((transaction) => {
//               const statusMap = {
//                 pending: "warning",
//                 failed: "destructive",
//                 paid: "success"
//               } as const;

//               const statusClass = statusMap[transaction.status] ?? "secondary";

//               return (
//                 <TableRow key={transaction.id}>
//                   <TableCell>{transaction.product}</TableCell>
//                   <TableCell>
//                     <Badge variant={statusClass}>{transaction.status}</Badge>
//                   </TableCell>
//                   <TableCell>{transaction.date}</TableCell>
//                   <TableCell className="text-right font-medium">{transaction.amount}</TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getMyTransactions } from "@/lib/api/services/subcription/subcription"; // ✅ make sure path matches your folder

interface Transaction {
  _id: string;
  product?: string;
  amount: number;
  status: "pending" | "failed" | "success";
  paymentMethod?: string;
  createdAt: string;
}

export function AboutMe() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getMyTransactions();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No transactions found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const statusMap = {
                  pending: "warning",
                  failed: "destructive",
                  success: "success"
                } as const;

                const statusClass = statusMap[t.status] ?? "secondary";

                return (
                  <TableRow key={t._id}>
                    <TableCell>{t.product || t.paymentMethod || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusClass}>{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${t.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
