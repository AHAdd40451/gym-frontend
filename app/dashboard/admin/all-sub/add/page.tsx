"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createWalkInSubscription as createCustomerSubscription,
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
  const convertDateToLocalNoonISO = (dateValue: string) => {
    const [year, month, day] = dateValue.split("-").map(Number);
    const localNoonDate = new Date(year, month - 1, day, 12, 0, 0, 0);

    return localNoonDate.toISOString();
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      alert("First name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    if (!formData.planId) {
      alert("Please select a subscription plan.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!formData.startDate) {
      alert("Start date is required.");
      return;
    }

    if (!formData.endDate) {
      alert("End date is required.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before the start date.");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Admin token was not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const res = await createCustomerSubscription(
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          planId: formData.planId,
          amount: Number(formData.amount),
          currency: "USD",
          startDate: convertDateToLocalNoonISO(formData.startDate),
          endDate: convertDateToLocalNoonISO(formData.endDate),
          paymentStatus: formData.paymentStatus as "paid" | "pending",
        },
        token
      );

      if (res?.success === false || res?.error) {
        alert(res?.message || res?.error || "Subscription could not be added.");
        return;
      }

      router.push("/dashboard/admin/all-sub");
      router.refresh();
    } catch (error: any) {
      console.error("Error adding subscription:", error);
      alert(error?.message || "Subscription could not be added.");
    } finally {
      setLoading(false);
    }
  };

  const cardClass =
    "rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm";

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass = "text-sm font-medium text-foreground";
  const helpTextClass = "text-sm leading-6 text-muted-foreground";

  return (
    <div className="w-full px-5 py-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-foreground">
            Add Subscription
          </h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/all-sub")}
              className="rounded-lg bg-muted px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={loading || plansLoading}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className={cardClass}>
            <h2 className="mb-8 text-xl font-semibold text-foreground">
              Customer Details
            </h2>

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>First Name</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputClass}
                    required
                  />
                  <p className={helpTextClass}>
                    Add the customer's phone number for contact and records.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={inputClass}
                  />
                  <p className={helpTextClass}>
                    Email is optional, but useful for account records.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Subscription Plan</label>
                <select
                  name="planId"
                  value={formData.planId}
                  onChange={handleChange}
                  className={inputClass}
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
                  <p className="text-sm text-destructive">
                    No plans found. Please check the Plans API response.
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                  <p className={helpTextClass}>
                    Select the date when the subscription should start.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                  <p className={helpTextClass}>
                    Select the date when the subscription should expire.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className={cardClass}>
              <h2 className="mb-8 text-xl font-semibold text-foreground">
                Pricing
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={inputClass}
                    required
                  />
                  <p className={helpTextClass}>
                    This amount will be saved with the subscription payment.
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-border pt-5">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="h-5 w-5 rounded border-input accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Manual payment
                  </span>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className="mb-8 text-xl font-semibold text-foreground">
                Payment Status
              </h2>

              <div className="space-y-2">
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>

                <p className={helpTextClass}>
                  Selecting Paid will activate the subscription immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}