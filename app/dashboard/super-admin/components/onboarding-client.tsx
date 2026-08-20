"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

const initialState = {
  gymName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  planId: "",
  billingCycle: "month",
  basePrice: 79,
  agreedPrice: 79,
  discount: 0,
  trialDays: 30,
  customTrialEndDate: "",
  paymentMethod: "Invoice Later",
  paymentStatus: "pending",
  notes: "",
  signupSource: "admin_created",
};

export default function OnboardingClient() {
  const [form, setForm] = useState<any>(initialState);
  const [plans, setPlans] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    superAdminApi.listPlans().then(setPlans).catch(() => {});
  }, []);

  const submit = async () => {
    const res = await superAdminApi.createGym(form);
    setMessage(res?.message || "Gym created");
    setForm(initialState);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manual Onboarding</h1>
        <p className="text-muted-foreground text-sm">Create a gym, owner account, and subscription in one flow.</p>
      </div>

      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <Card>
        <CardHeader><CardTitle>Add New Gym</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            ["gymName", "Gym name"],
            ["ownerName", "Owner name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["address", "Address"],
            ["city", "City"],
            ["basePrice", "Base price"],
            ["agreedPrice", "Agreed price"],
            ["discount", "Discount"],
            ["trialDays", "Trial days"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{label}</label>
              <Input
                value={form[key]}
                onChange={(e) => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Plan</label>
            <select
              value={form.planId}
              onChange={(e) => setForm((prev: any) => ({ ...prev, planId: e.target.value }))}
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Custom plan</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>{plan.name}</option>
              ))}
            </select>
          </div>

          {[
            ["billingCycle", ["month", "year"]],
            ["paymentMethod", ["Cash", "Bank Transfer", "JazzCash", "Easypaisa", "Online Payment", "Invoice Later"]],
            ["paymentStatus", ["pending", "paid", "failed"]],
            ["signupSource", ["self_serve", "sales_assisted", "admin_created"]],
          ].map(([key, options]: any) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{key}</label>
              <select
                value={form[key]}
                onChange={(e) => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              >
                {options.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev: any) => ({ ...prev, notes: e.target.value }))}
              className="border-input bg-background min-h-28 w-full rounded-md border p-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <Button onClick={submit}>Create Gym</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
