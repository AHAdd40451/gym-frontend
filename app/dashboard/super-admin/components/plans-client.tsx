"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { superAdminApi } from "@/lib/api/services/super-admin/super-admin";

const initialPlan = {
  name: "",
  monthlyPrice: 79,
  yearlyPrice: 790,
  memberLimit: 500,
  staffLimit: 20,
  features: "Members, Staff, Attendance",
};

export default function PlansClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState<any>(initialPlan);

  const load = async () => {
    const data = await superAdminApi.listPlans();
    setPlans(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await superAdminApi.createPlan({
      ...form,
      features: String(form.features)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setForm(initialPlan);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Platform Plans</h1>
        <p className="text-muted-foreground text-sm">Manage product pricing tiers without touching gym-level overrides.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Plan</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {Object.keys(initialPlan).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">{key}</label>
              <Input value={form[key]} onChange={(e) => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="md:col-span-2">
            <Button onClick={submit}>Create Plan</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing Plans</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {plans.map((plan) => (
            <div key={plan._id} className="rounded-lg border p-4">
              <p className="font-medium">{plan.name}</p>
              <p className="text-muted-foreground text-sm">
                ${plan.monthlyPrice}/mo • ${plan.yearlyPrice}/yr • Members {plan.memberLimit} • Staff {plan.staffLimit}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
