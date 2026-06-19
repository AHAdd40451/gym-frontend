"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { getSubscriptionPlans } from "@/lib/api/services/subcription/subcription";
import type { PlanOption } from "@/lib/api/services/subcription/subcription";
import MembershipCard from "@/components/membership/MembershipCard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5003/api";

type Credentials = {
  email: string;
  password: string;
  role?: string;
};

type CardTemplate = {
  cardTitle?: string;
  gymName?: string;
  logoUrl?: string;
  footerText?: string;

  layout?: string;

  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;

  backgroundType?: "color" | "image";
  backgroundColor?: string;
  backgroundImageUrl?: string;

  showMemberName?: boolean;
  showPlanName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCardNumber?: boolean;
  showQrCode?: boolean;
  showBarcode?: boolean;
};

type CreatedMemberCard = {
  memberName?: string;
  planName?: string;
  phone?: string;
  email?: string;
  cardNumber?: string;
};

const defaultCardTemplate: CardTemplate = {
  cardTitle: "Membership Card",
  gymName: "Your Gym Name",
  logoUrl: "",
  footerText: "Valid only for registered member",

  layout: "classic",

  primaryColor: "#111827",
  secondaryColor: "#f59e0b",
  textColor: "#ffffff",

  backgroundType: "color",
  backgroundColor: "#111827",
  backgroundImageUrl: "",

  showMemberName: true,
  showPlanName: true,
  showPhone: true,
  showEmail: true,
  showCardNumber: true,
  showQrCode: true,
  showBarcode: false,
};

export default function AddSubscriptionPage() {
  const router = useRouter();

  const membershipCardRef = useRef<HTMLDivElement | null>(null);

  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [cardTemplate, setCardTemplate] =
    useState<CardTemplate>(defaultCardTemplate);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    planId: "",
    amount: "",
    startDate: "",
    endDate: "",
    paymentStatus: "paid",
  });

  const [loading, setLoading] = useState(false);
  const [cardActionLoading, setCardActionLoading] = useState(false);
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

  const fetchCardTemplate = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/card-template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await response.json();

      if (response.ok && res?.success && res?.data) {
        setCardTemplate({
          ...defaultCardTemplate,
          ...res.data,
        });
      }
    } catch (error) {
      console.error("Error fetching card template:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchCardTemplate();
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

  const getSelectedPlanName = (planId: string) => {
    const selectedPlan = plans.find((plan) => (plan._id || plan.id) === planId);

    return selectedPlan?.name || "Membership Plan";
  };

  const getSafeFileName = (name?: string) => {
    return (name || "membership")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const captureMembershipCard = async () => {
    if (!membershipCardRef.current) {
      alert("Membership card not found.");
      return null;
    }

    const imageUrl = await toPng(membershipCardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "transparent",
    });

    return imageUrl;
  };

  const downloadMembershipCard = async () => {
    try {
      setCardActionLoading(true);

      const imageUrl = await captureMembershipCard();

      if (!imageUrl) return;

      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${getSafeFileName(
        createdMemberCard?.memberName
      )}-card.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download card error:", error);
      alert("Card download failed.");
    } finally {
      setCardActionLoading(false);
    }
  };

  const printMembershipCard = async () => {
    try {
      setCardActionLoading(true);

      const imageUrl = await captureMembershipCard();

      if (!imageUrl) return;

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow popups to print the card.");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Membership Card</title>
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
                font-family: Arial, sans-serif;
              }

              img {
                max-width: 420px;
                width: 100%;
                height: auto;
              }

              @media print {
                body {
                  margin: 0;
                }

                img {
                  max-width: 420px;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" />
            <script>
              window.onload = function () {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Print card error:", error);
      alert("Card print failed.");
    } finally {
      setCardActionLoading(false);
    }
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
          amount: Number(formData.amount),
          currency: "USD",
          startDate: convertDateToLocalNoonISO(formData.startDate),
          endDate: convertDateToLocalNoonISO(formData.endDate),
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
      });

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        planId: "",
        amount: "",
        startDate: "",
        endDate: "",
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
Card Number: ${createdMemberCard?.cardNumber || ""}`;

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
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter member login password"
                    className={inputClass}
                    required
                  />

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

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
                </div>

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

              <div>
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Membership Card
                </h3>

                <div ref={membershipCardRef}>
                  <MembershipCard
                    template={cardTemplate}
                    member={{
                      memberName: createdMemberCard?.memberName,
                      planName: createdMemberCard?.planName,
                      phone: createdMemberCard?.phone,
                      email: createdMemberCard?.email,
                      cardNumber: createdMemberCard?.cardNumber,
                    }}
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={printMembershipCard}
                    disabled={cardActionLoading}
                    className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/80 disabled:opacity-60"
                  >
                    {cardActionLoading ? "Please wait..." : "Print Card"}
                  </button>

                  <button
                    type="button"
                    onClick={downloadMembershipCard}
                    disabled={cardActionLoading}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {cardActionLoading ? "Please wait..." : "Download Card"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}