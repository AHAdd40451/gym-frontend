"use client";

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

interface Transaction {
  stripePaymentIntentId: string | null;
  amount: number | null;
  currency: string;
  status: "pending" | "failed" | "paid" | "succeced";
  createdAt: string;
}

interface Subscription {
  plan: { name: string };
  status: string;
  startDate: string;
  endDate: string;
  transactions: Transaction[];
}

interface AboutMeProps {
  subscriptions: Subscription[];
}

export function AboutMe({ subscriptions }: AboutMeProps) {
  // Flatten all transactions from subscriptions
  const allTransactions = subscriptions.flatMap(sub => 
    sub.transactions.map((tx, index) => ({
      ...tx,
      product: sub.plan.name,
      id: `${sub.plan.name}-${index}` // unique key
    }))
  );

  const statusMap = {
    pending: "warning",
    failed: "destructive",
    paid: "success",
    succeced: "success"
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {allTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No transactions found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.product}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[tx.status] ?? "secondary"} className="capitalize">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.amount ? `${tx.currency} ${tx.amount}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
