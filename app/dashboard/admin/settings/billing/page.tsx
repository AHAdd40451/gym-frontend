"use client";

import { useEffect, useState } from "react";
import { Edit2, Plus, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/api/services/auth/context";
import apiClient from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/constants/constants";

type TransactionStatus = "pending" | "succeeded" | "processing" | "requires_payment_method" | "canceled";
type SubscriptionStatus = "pending" | "active" | "trialing" | "past_due" | "canceled" | "unpaid";

interface Transaction {
  _id?: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
}

interface Subscription {
  plan: {
    _id?: string;
    name: string;
  };
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  transactions?: Transaction[];
}

interface UserWithSubscriptions {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  };
  subscriptions: Subscription[];
}

export default function Page() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserWithSubscriptions | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Fetch all billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!userId) {
        toast.error("User not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user with subscriptions (includes transactions inside each subscription)
        const response = await apiClient.get(
          API_ENDPOINTS.SUBSCRIPTIONS.USER_DETAILS(userId)
        );

        setData(response.data);

        // Extract all transactions from all subscriptions
        const transactions: Transaction[] = [];
        response.data?.subscriptions?.forEach((sub: Subscription) => {
          if (sub.transactions && sub.transactions.length > 0) {
            transactions.push(...sub.transactions);
          }
        });

        setAllTransactions(transactions);

      } catch (error: any) {
        console.error("Failed to load billing data:", error);
        if (error.response?.status === 404) {
          toast.error("No billing data found");
        } else {
          toast.error("Failed to load billing information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [userId]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null, currency: string = "USD") => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  // Get active subscription
  const activeSubscription = data?.subscriptions?.find(
    sub => sub.status === "active" || sub.status === "trialing"
  );

  // Get next payment date
  const getNextPaymentDate = () => {
    if (!activeSubscription?.endDate) return "N/A";
    return formatDate(activeSubscription.endDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Billing Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            {activeSubscription ? (
              <>
                Billing for <span className="font-medium">{activeSubscription.plan.name}</span>
                {" | "}
                Next payment on <span className="font-medium">{getNextPaymentDate()}</span>
                {activeSubscription.transactions && activeSubscription.transactions.length > 0 && (
                  <>
                    {" for "}
                    <span className="font-medium">
                      {formatCurrency(
                        activeSubscription.transactions[activeSubscription.transactions.length - 1]?.amount,
                        activeSubscription.transactions[activeSubscription.transactions.length - 1]?.currency
                      )}
                    </span>
                  </>
                )}
              </>
            ) : (
              "No active subscription"
            )}
          </CardDescription>
          <CardAction>
            <Button onClick={() => toast.info("Change plan feature coming soon")}>
              {activeSubscription ? "Change plan" : "Subscribe now"}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Subscription Details Card */}
      {data?.subscriptions && data.subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.subscriptions.map((sub, index) => {
              const statusMap = {
                pending: "warning",
                active: "success",
                trialing: "info",
                past_due: "destructive",
                canceled: "secondary",
                unpaid: "destructive"
              } as const;

              const statusVariant = statusMap[sub.status] || "secondary";

              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{sub.plan.name}</div>
                      <Badge variant={statusVariant}>{sub.status}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Started: {formatDate(sub.startDate)}
                      {" • "}
                      Ends: {formatDate(sub.endDate)}
                    </p>
                  </div>
                  {sub.status === "active" && (
                    <Button 
                      variant="outline"
                      onClick={() => toast.info("Cancel subscription feature coming soon")}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Payment Method Card - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Payment methods will be managed through Stripe
            </p>
            <Button 
              variant="outline"
              onClick={() => toast.info("Stripe integration coming soon")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add payment method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {allTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions.map((transaction, index) => {
                  const statusMap = {
                    pending: "warning",
                    succeeded: "success",
                    processing: "info",
                    requires_payment_method: "destructive",
                    canceled: "secondary"
                  } as const;

                  const statusVariant = statusMap[transaction.status] || "secondary";

                  return (
                    <TableRow key={transaction._id || index}>
                      <TableCell className="font-medium">
                        {transaction.stripePaymentIntentId 
                          ? `${transaction.stripePaymentIntentId.slice(0, 10)}...`
                          : `#${index + 1}`
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell className="uppercase">
                        {transaction.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.info("Invoice download coming soon")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}