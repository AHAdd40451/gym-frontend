"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSubscriptionPlans } from "@/lib/api/services/subcription/subcription";
import type { PlanOption } from "@/lib/api/services/subcription/subcription";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api";

type Credentials = {
  email: string;
  password: string;
  role?: string;
};

type CreatedMemberCard = {
  memberName?: string;
  planName?: string;
  phone?: string;
  email?: string;
  cardNumber?: string;
  biometricId?: string;
};

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function AddSubscriptionPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    planId: "",
    amount: "",
    registrationCharges: "",
    startDate: getTodayDateString(),
    paymentStatus: "paid",
  });

  const totalAmount =
    (Number(formData.amount) || 0) + (Number(formData.registrationCharges) || 0);

  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [createdMessage, setCreatedMessage] = useState("");
  const [createdMemberCard, setCreatedMemberCard] =
    useState<CreatedMemberCard | null>(null);

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

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let password = "";

    for (let i = 0; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
  };

  const handleGeneratePassword = () => {
    setFormData((prev) => ({ ...prev, password: generatePassword() }));
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

  const getCredentialsFromResponse = (res: any): Credentials | null => {
    const possible =
      res?.data?.credentials ||
      res?.credentials ||
      res?.data?.data?.credentials ||
      null;

    if (possible?.email && possible?.password) {
      return possible;
    }

    return null;
  };

  const getCardNumberFromResponse = (res: any) => {
    return (
      res?.cardNumber ||
      res?.data?.cardNumber ||
      res?.card?.cardNumber ||
      res?.data?.card?.cardNumber ||
      res?.user?.cardNumber ||
      res?.data?.user?.cardNumber ||
      res?.data?.data?.user?.cardNumber ||
      res?.subscription?.metadata?.cardNumber ||
      res?.data?.subscription?.metadata?.cardNumber ||
      res?.data?.data?.subscription?.metadata?.cardNumber ||
      ""
    );
  };

  const getBiometricIdFromResponse = (res: any) => {
    return (
      res?.biometricId ||
      res?.data?.biometricId ||
      res?.user?.biometricId ||
      res?.data?.user?.biometricId ||
      res?.data?.data?.user?.biometricId ||
      ""
    );
  };

  const getSelectedPlanName = (planId: string) => {
    const selectedPlan = plans.find((plan) => (plan._id || plan.id) === planId);

    return selectedPlan?.name || "Membership Plan";
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

    if (!formData.email.trim()) {
      alert("Email address is required for member login.");
      return;
    }

    if (!formData.password.trim()) {
      alert("Password is required.");
      return;
    }

    if (formData.password.trim().length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (!formData.planId) {
      alert("Please select a subscription plan.");
      return;
    }

    if (totalAmount <= 0) {
      alert("Please enter a valid plan or registration amount.");
      return;
    }

    if (!formData.startDate) {
      alert("Start date is required.");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Admin token was not found. Please log in again.");
      return;
    }

    const memberName = `${formData.firstName.trim()} ${formData.lastName.trim()}`
      .trim()
      .replace(/\s+/g, " ");

    const memberPhone = formData.phone.trim();
    const memberEmail = formData.email.trim();
    const selectedPlanName = getSelectedPlanName(formData.planId);

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/subscriptions/walk-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: memberPhone,
          email: memberEmail,
          password: formData.password.trim(),
          planId: formData.planId,
          amount: totalAmount,
          registrationCharges: Number(formData.registrationCharges) || 0,
          currency: "PKR",
          startDate: convertDateToLocalNoonISO(formData.startDate),
          paymentStatus: formData.paymentStatus as "paid" | "pending",
        }),
      });

      const res = await response.json();

      console.log("RAW CREATE SUBSCRIPTION RESPONSE:", res);

      if (!response.ok || res?.success === false) {
        alert(res?.message || res?.error || "Subscription could not be added.");
        return;
      }

      const newCredentials = getCredentialsFromResponse(res);
      const cardNumber = getCardNumberFromResponse(res);
      const biometricId = getBiometricIdFromResponse(res);

      setCreatedMessage(
        res?.message ||
          res?.data?.message ||
          "Subscription created successfully."
      );

      setCreatedMemberCard({
        memberName,
        planName: selectedPlanName,
        phone: memberPhone,
        email: memberEmail,
        cardNumber: cardNumber || "Card number not returned",
        biometricId: biometricId || undefined,
      });

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        planId: "",
        amount: "",
        registrationCharges: "",
        startDate: getTodayDateString(),
        paymentStatus: "paid",
      });

      if (newCredentials) {
        setCredentials(newCredentials);
        return;
      }

      console.error("Credentials missing in raw response:", res);

      alert(
        "Subscription created, but credentials were not returned from backend."
      );

      router.push("/dashboard/admin/all-sub");
      router.refresh();
    } catch (error: any) {
      console.error("Error adding subscription:", error);
      alert(error?.message || "Subscription could not be added.");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;

    const text = `Email: ${credentials.email}
Password: ${credentials.password}
Role: ${credentials.role || "user"}
Card Number: ${createdMemberCard?.cardNumber || ""}
Biometric ID: ${createdMemberCard?.biometricId || ""}`;

    await navigator.clipboard.writeText(text);
    alert("Credentials copied.");
  };

  const closeCredentialsModal = () => {
    setCredentials(null);
    setCreatedMemberCard(null);
    router.push("/dashboard/admin/all-sub");
    router.refresh();
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
                    required
                  />

                  <p className={helpTextClass}>
                    This email will be used by the member to login.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>Login Password</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter or auto-generate a password"
                      className={inputClass}
                      required
                    />

                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="shrink-0 rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/80"
                    >
                      Auto Generate
                    </button>
                  </div>

                  <p className={helpTextClass}>
                    Admin will share this password with the member.
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
                  Defaults to today. Change it if the subscription should start later.
                </p>
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
                  <label className={labelClass}>Plan Charges</label>

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
                    Auto-filled from the selected plan. You can adjust it if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Registration Charges</label>

                  <input
                    type="number"
                    name="registrationCharges"
                    value={formData.registrationCharges}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={inputClass}
                  />

                  <p className={helpTextClass}>
                    Optional one-time charge added on top of the plan price.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-5">
                  <span className="text-sm font-medium text-foreground">
                    Total Amount
                  </span>

                  <span className="text-lg font-semibold text-foreground">
                    {totalAmount.toLocaleString()} PKR
                  </span>
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

      {credentials && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Member Account Created
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {createdMessage}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Login Credentials
              </h3>

              <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                <p className="break-all text-sm">
                  <strong>Email:</strong> {credentials.email}
                </p>

                <p className="text-sm">
                  <strong>Password:</strong> {credentials.password}
                </p>

                <p className="text-sm capitalize">
                  <strong>Role:</strong> {credentials.role || "user"}
                </p>

                <p className="break-all text-sm">
                  <strong>Card Number:</strong>{" "}
                  {createdMemberCard?.cardNumber || "Not available"}
                </p>

                <p className="break-all text-sm">
                  <strong>Biometric ID:</strong>{" "}
                  {createdMemberCard?.biometricId || "Not available"}
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Use this Biometric ID as the PIN when enrolling this member's
                fingerprint on the scanner.
              </p>

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Copy these credentials and share them with the member. After
                closing this modal, you will be redirected back to all
                subscriptions.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Copy Credentials
                </button>

                <button
                  type="button"
                  onClick={closeCredentialsModal}
                  className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}