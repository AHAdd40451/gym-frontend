
"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { getMyTransactions } from "@/lib/api/services/subcription/subcription";

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

  // ⭐ Wrap fetch function in useCallback
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ Initial load
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ⭐ Listen for user switch / auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('🔄 User switched, refreshing transactions...');
      fetchTransactions();
    };

    // Listen to auth-changed event
    window.addEventListener('auth-changed', handleAuthChange);
    
    // Also listen to storage event for cross-tab changes
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [fetchTransactions]);

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
                {/* <TableHead>Type</TableHead> */}
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
                    {/* <TableCell>{t.product || t.paymentMethod || "—"}</TableCell> */}
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