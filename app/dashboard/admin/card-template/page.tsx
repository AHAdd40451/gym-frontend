"use client";

import { useEffect, useState } from "react";
import MembershipCard from "@/components/membership/MembershipCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api";

const defaultTemplate = {
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

export default function CardTemplatePage() {
  const [template, setTemplate] = useState<any>(defaultTemplate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const fetchTemplate = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const res = await fetch(`${API_URL}/card-template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data?.success && data?.data) {
        setTemplate({
          ...defaultTemplate,
          ...data.data,
        });
      }
    } catch (error) {
      console.error("Fetch card template error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      setSaving(true);

      const token = getToken();

      const res = await fetch(`${API_URL}/card-template`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(template),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert(data?.message || "Failed to save card template");
        return;
      }

      alert("Card design saved successfully");

      setTemplate({
        ...defaultTemplate,
        ...data.data,
      });
    } catch (error) {
      console.error("Save card template error:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setTemplate((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading card design...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Membership Card Design</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize how your gym membership cards will look.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings */}
        <div className="space-y-4 rounded-xl border bg-background p-5">
          <h2 className="text-lg font-semibold">Card Settings</h2>

          <div>
            <label className="text-sm font-medium">Gym Name</label>
            <input
              value={template.gymName}
              onChange={(e) => updateField("gymName", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="FitLife Gym"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Card Title</label>
            <input
              value={template.cardTitle}
              onChange={(e) => updateField("cardTitle", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Membership Card"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Logo URL</label>
            <input
              value={template.logoUrl}
              onChange={(e) => updateField("logoUrl", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Footer Text</label>
            <input
              value={template.footerText}
              onChange={(e) => updateField("footerText", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Valid only for registered member"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Background Type</label>
            <select
              value={template.backgroundType}
              onChange={(e) => updateField("backgroundType", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="color">Color</option>
              <option value="image">Image</option>
            </select>
          </div>

          {template.backgroundType === "image" && (
            <div>
              <label className="text-sm font-medium">Background Image URL</label>
              <input
                value={template.backgroundImageUrl}
                onChange={(e) =>
                  updateField("backgroundImageUrl", e.target.value)
                }
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Background</label>
              <input
                type="color"
                value={template.backgroundColor}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Primary</label>
              <input
                type="color"
                value={template.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Text</label>
              <input
                type="color"
                value={template.textColor}
                onChange={(e) => updateField("textColor", e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["showMemberName", "Member Name"],
              ["showPlanName", "Plan Name"],
              ["showPhone", "Phone"],
              ["showEmail", "Email"],
              ["showCardNumber", "Card Number"],
              ["showQrCode", "QR Code"],
              ["showBarcode", "Barcode"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={Boolean(template[key])}
                  onChange={(e) => updateField(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={saveTemplate}
            disabled={saving}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Card Design"}
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-xl border bg-background p-5">
          <h2 className="mb-4 text-lg font-semibold">Live Preview</h2>

          <MembershipCard
            template={template}
            member={{
              memberName: "Ahmed Khan",
              planName: "Monthly Plan",
              phone: "0300-1234567",
              email: "member@email.com",
              cardNumber: "GYM-123456-ABCD",
            }}
          />
        </div>
      </div>
    </div>
  );
}