"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

export default function PaymentsClient() {
  const [payments, setPayments] = useState<any[]>([]);
  const [referenceId, setReferenceId] = useState<Record<string, string>>({});

  const load = async () => {
    const data = await superAdminApi.listPayments();
    setPayments(data);
  };

  useEffect(() => {
    load();
  }, []);

  const markPaid = async (id: string) => {
    await superAdminApi.markPaymentPaid(id, { referenceId: referenceId[id] || `manual_${Date.now()}` });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-muted-foreground text-sm">Central payment tracking for all gym subscriptions.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3">Gym</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t">
                    <td className="px-4 py-3">{payment.gymId?.name}</td>
                    <td className="px-4 py-3">{payment.amount} {payment.currency}</td>
                    <td className="px-4 py-3">{payment.method}</td>
                    <td className="px-4 py-3 capitalize">{payment.status}</td>
                    <td className="px-4 py-3">
                      <Input
                        value={referenceId[payment._id] || payment.referenceId || ""}
                        onChange={(e) =>
                          setReferenceId((prev) => ({ ...prev, [payment._id]: e.target.value }))
                        }
                        placeholder="Reference ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {payment.status !== "paid" ? (
                        <Button size="sm" onClick={() => markPaid(payment._id)}>Mark as Paid</Button>
                      ) : (
                        "Paid"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
