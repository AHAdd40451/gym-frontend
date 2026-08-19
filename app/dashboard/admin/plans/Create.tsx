"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createPlan, PlanPayload } from "@/lib/api/services/plan/plan";

// shadcn ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CreateProps = {
  onCreated?: () => void;
};

function Create({ onCreated }: CreateProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<PlanPayload>({
    name: "",
    description: "",
    priceCents: 0,
    currency: "PKR",
    billingInterval: "month",
    intervalCount: 1,
    maxCheckInsPerDay: 1,
    trialDays: 0,
    isActive: true,
  });

  // ================= CHANGE =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "priceCents" ||
        name === "intervalCount" ||
        name === "maxCheckInsPerDay" ||
        name === "trialDays"
          ? Number(value)
          : value,
    });
  };

  const getToken = () => {
    if (typeof window === "undefined") return "";

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("adminToken") ||
      ""
    );
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createPlan(
        { ...form, priceCents: Math.round(form.priceCents * 100) },
        getToken()
      );

      toast.success("Plan created successfully 🎉");

      setOpen(false); // 👈 close modal
      onCreated?.();

      // reset form
      setForm({
        name: "",
        description: "",
        priceCents: 0,
        currency: "PKR",
        billingInterval: "month",
        intervalCount: 1,
        maxCheckInsPerDay: 1,
        trialDays: 0,
        isActive: true,
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to create plan ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* ================= OPEN BUTTON ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Plan</Button>
        </DialogTrigger>

        {/* ================= MODAL ================= */}
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Plan Name"
            />

            <Input
              name="priceCents"
              value={form.priceCents}
              onChange={handleChange}
              placeholder="Price (PKR)"
            />

            <Input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />

            <Input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              placeholder="Currency"
            />

            <Input
              name="billingInterval"
              value={form.billingInterval}
              onChange={handleChange}
              placeholder="Billing Interval"
            />
<div className="flex w-full gap-2 pt-2">
  <Button
    onClick={handleSubmit}
    disabled={loading}
    className="flex-1"
  >
    {loading ? "Creating..." : "Create"}
  </Button>

  <Button
    type="button"
    variant="secondary"
    onClick={() => setOpen(false)}
    className="flex-1"
  >
    Cancel
  </Button>
</div>
            {/* <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div> */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Create;
