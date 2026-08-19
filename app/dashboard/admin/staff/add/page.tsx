"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://gym.coderivals.ltd/api";

type Credentials = {
  email: string;
  password: string;
  role: string;
};

export default function AddAdminStaffPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });

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

  const getStoredUser = () => {
    if (typeof window === "undefined") return null;

    const keys = ["user", "authUser", "adminUser", "currentUser"];

    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);
        return parsed?.user || parsed?.state?.user || parsed;
      } catch {
        continue;
      }
    }

    return null;
  };

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      alert("First name is required.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required.");
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

    const token = getToken();

    if (!token) {
      alert("Admin token not found. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password.trim(),
          role: formData.role,
        }),
      });

      const res = await response.json();

      console.log("CREATE ADMIN STAFF RESPONSE:", res);

      if (!response.ok || res?.success === false) {
        alert(res?.message || "Account could not be created.");
        return;
      }

      const newCredentials = getCredentialsFromResponse(res);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
      });

      if (newCredentials) {
        setCredentials(newCredentials);
        return;
      }

      alert("Account created, but credentials were not returned.");
    } catch (error: any) {
      console.error("Create admin/staff error:", error);
      alert(error?.message || "Account could not be created.");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;

    const text = `Email: ${credentials.email}
Password: ${credentials.password}
Role: ${credentials.role}`;

    await navigator.clipboard.writeText(text);
    alert("Credentials copied.");
  };

  const closeModal = () => {
    setCredentials(null);
    router.push("/dashboard/admin/all-users");
    router.refresh();
  };

  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin);

  const cardClass =
    "rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm";

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60";

  const labelClass = "text-sm font-medium text-foreground";
  const helpTextClass = "text-sm leading-6 text-muted-foreground";

  return (
    <div className="w-full px-5 py-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Add Admin / Staff
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create login credentials for gym admins or staff.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/all-users")}
              className="rounded-lg bg-muted px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className={cardClass}>
            <h2 className="mb-8 text-xl font-semibold text-foreground">
              Account Details
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
                    This email will be used for login.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClass}>Password</label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter login password"
                    className={inputClass}
                    required
                  />
                  <p className={helpTextClass}>
                    Admin will share this password with the account owner.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="staff">Staff</option>
                    {isSuperAdmin && <option value="admin">Admin</option>}
                  </select>
                  <p className={helpTextClass}>
                    Only super admin can create another admin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="mb-5 text-xl font-semibold text-foreground">
              Permission Rules
            </h2>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Super Admin can create admin and staff accounts.</p>
              <p>Normal Admin can create staff accounts only.</p>
              <p>Staff cannot create users or admins.</p>
              <p>All created accounts are attached to the same gym.</p>
            </div>
          </div>
        </div>
      </form>

      {credentials && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground">
              Account Created
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Copy these credentials and share them with the new account owner.
            </p>

            <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm break-all">
                <strong>Email:</strong> {credentials.email}
              </p>

              <p className="text-sm">
                <strong>Password:</strong> {credentials.password}
              </p>

              <p className="text-sm capitalize">
                <strong>Role:</strong> {credentials.role}
              </p>
            </div>

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
                onClick={closeModal}
                className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}