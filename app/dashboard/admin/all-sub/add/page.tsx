"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createWalkInSubscription,
  getSubscriptionPlans,
} from "@/lib/api/services/subcription/subcription";
import type { PlanOption } from "@/lib/api/services/subcription/subcription";

export default function AddSubscriptionPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    planId: "",
    amount: "",
    startDate: "",
    endDate: "",
    paymentStatus: "paid",
  });

  const [loading, setLoading] = useState(false);

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

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);

      const token = getToken();
      const data = await getSubscriptionPlans(token);

      console.log("Plans dropdown data:", data);

      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "planId") {
      const selectedPlan = plans.find(
        (plan) => (plan._id || plan.id) === value
      );

      setFormData({
        ...formData,
        planId: value,
        amount: selectedPlan?.priceCents
          ? String(selectedPlan.priceCents / 100)
          : selectedPlan?.price
          ? String(selectedPlan.price)
          : formData.amount,
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      alert("First name required hai");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Phone required hai");
      return;
    }

    if (!formData.planId) {
      alert("Plan select karo");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Amount valid enter karo");
      return;
    }

    if (!formData.startDate) {
      alert("Start date required hai");
      return;
    }

    if (!formData.endDate) {
      alert("End date required hai");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date start date se pehle nahi ho sakti");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Admin token nahi mila. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const res = await createWalkInSubscription(
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          planId: formData.planId,
          amount: Number(formData.amount),
          currency: "USD",
          startDate: formData.startDate,
          endDate: formData.endDate,
          paymentStatus: formData.paymentStatus as "paid" | "pending",
        },
        token
      );

      console.log("Walk-in subscription response:", res);

      if (res?.success === false || res?.error) {
        alert(res?.message || res?.error || "Subscription add nahi hui");
        return;
      }

      router.push("/dashboard/admin/all-sub");
      router.refresh();
    } catch (error: any) {
      console.error("Error adding subscription:", error);
      alert(error?.message || "Subscription add nahi hui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Add Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Walk-in customer ki subscription add karein.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/admin/all-sub")}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email optional"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Plan</label>
            <select
              name="planId"
              value={formData.planId}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
              disabled={plansLoading}
            >
              <option value="">
                {plansLoading ? "Loading plans..." : "Select plan"}
              </option>

              {plans.map((plan) => {
                const planId = plan._id || plan.id;

                if (!planId) return null;

                return (
                  <option key={planId} value={planId}>
                    {plan.name}
                  </option>
                );
              })}
            </select>

            {!plansLoading && plans.length === 0 && (
              <p className="text-xs text-red-500">
                Plans nahi mile. Console mein Plans API response check karo.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Payment Status</label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || plansLoading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Subscription"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/all-sub")}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}