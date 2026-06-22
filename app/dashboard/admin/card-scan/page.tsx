"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development"
        ? "http://localhost:5003/api"
        : "https://gym-api.moduleminds.ltd/api");

type ScanResult = {
    success?: boolean;
    alreadyMarked?: boolean;
    message?: string;
    cardNumber?: string;
    member?: {
        id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        role?: string;
        cardNumber?: string;
        cardStatus?: string;
    };
    subscription?: {
        id?: string;
        status?: string;
        planName?: string;
        currentPeriodEnd?: string;
    };
    attendance?: {
        _id?: string;
        status?: string;
        checkInTime?: string;
        date?: string;
    };
};

export default function CardScanPage() {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [cardNumber, setCardNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [lastScanned, setLastScanned] = useState("");

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

    const focusInput = () => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    useEffect(() => {
        focusInput();
    }, []);

    const scanCard = async (value?: string) => {
        const cleanCardNumber = String(value || cardNumber).trim();

        if (!cleanCardNumber) {
            alert("Please scan or enter card number.");
            focusInput();
            return;
        }

        const token = getToken();

        if (!token) {
            alert("Admin token not found. Please login again.");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            setLastScanned(cleanCardNumber);

            const response = await fetch(`${API_BASE_URL}/attendance/card-scan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cardNumber: cleanCardNumber,
                }),
            });

            const data = await response.json();

            setResult({
                ...data,
                success: response.ok && data?.success !== false,
            });

            setCardNumber("");
            focusInput();
        } catch (error: any) {
            console.error("Card scan error:", error);

            setResult({
                success: false,
                message: error?.message || "Card scan failed.",
                cardNumber: cleanCardNumber,
            });

            setCardNumber("");
            focusInput();
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            scanCard();
        }
    };

    const getTime = (date?: string) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const getDate = (date?: string) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString();
    };

    const successBox =
        result?.success && !result?.alreadyMarked
            ? "border-green-500/40 bg-green-500/10 text-green-700"
            : result?.success && result?.alreadyMarked
                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-700"
                : "border-red-500/40 bg-red-500/10 text-red-700";

    return (
        <div className="w-full px-5 py-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-foreground">
                    Card Scan Attendance
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Swipe or scan a member card to mark attendance automatically.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-foreground">
                        Scan Membership Card
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Keep this input focused. USB barcode scanner, QR scanner, or RFID
                        reader will type the card number here and press Enter.
                    </p>

                    <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-6">
                        <label className="text-sm font-medium text-foreground">
                            Waiting for scan
                        </label>

                        <input
                            ref={inputRef}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            placeholder="Scan card or enter card number..."
                            className="mt-3 w-full rounded-xl border border-input bg-background px-5 py-4 text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                        />

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => scanCard()}
                                disabled={loading}
                                className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                            >
                                {loading ? "Scanning..." : "Submit Scan"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setCardNumber("");
                                    setResult(null);
                                    focusInput();
                                }}
                                className="rounded-lg bg-muted px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/80"
                            >
                                Reset
                            </button>
                        </div>

                        {lastScanned && (
                            <p className="mt-4 text-xs text-muted-foreground">
                                Last scanned:{" "}
                                <span className="font-mono text-foreground">{lastScanned}</span>
                            </p>
                        )}
                    </div>

                    <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold text-foreground">
                            Machine Setup Note
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Scanner should be set to keyboard mode. After scanning, it should send the Enter key automatically. If Enter is not sent automatically, the scanner will still work using the manual submit button.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-foreground">
                        Scan Result
                    </h2>

                    {!result ? (
                        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                No card scanned yet.
                            </p>
                        </div>
                    ) : (
                        <div className={`mt-6 rounded-xl border p-5 ${successBox}`}>
                            <h3 className="text-lg font-bold">
                                {result.success
                                    ? result.alreadyMarked
                                        ? "Already Marked"
                                        : "Attendance Marked"
                                    : "Access Denied"}
                            </h3>

                            <p className="mt-2 text-sm font-medium">
                                {result.message || "Scan completed."}
                            </p>

                            {result.member && (
                                <div className="mt-5 space-y-3 rounded-xl bg-background/70 p-4 text-foreground">
                                    <p className="text-sm">
                                        <strong>Member:</strong>{" "}
                                        {result.member.name ||
                                            `${result.member.firstName || ""} ${result.member.lastName || ""
                                                }`.trim() ||
                                            "N/A"}
                                    </p>

                                    <p className="break-all text-sm">
                                        <strong>Email:</strong> {result.member.email || "N/A"}
                                    </p>

                                    <p className="text-sm">
                                        <strong>Phone:</strong> {result.member.phone || "N/A"}
                                    </p>

                                    <p className="break-all text-sm">
                                        <strong>Card Number:</strong>{" "}
                                        {result.member.cardNumber || lastScanned || "N/A"}
                                    </p>

                                    <p className="text-sm capitalize">
                                        <strong>Card Status:</strong>{" "}
                                        {result.member.cardStatus || "active"}
                                    </p>
                                </div>
                            )}

                            {result.subscription && (
                                <div className="mt-4 space-y-3 rounded-xl bg-background/70 p-4 text-foreground">
                                    <p className="text-sm">
                                        <strong>Plan:</strong>{" "}
                                        {result.subscription.planName || "Membership Plan"}
                                    </p>

                                    <p className="text-sm capitalize">
                                        <strong>Subscription:</strong>{" "}
                                        {result.subscription.status || "N/A"}
                                    </p>

                                    {result.subscription.currentPeriodEnd && (
                                        <p className="text-sm">
                                            <strong>Expires:</strong>{" "}
                                            {getDate(result.subscription.currentPeriodEnd)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {result.attendance && (
                                <div className="mt-4 space-y-3 rounded-xl bg-background/70 p-4 text-foreground">
                                    <p className="text-sm capitalize">
                                        <strong>Status:</strong> {result.attendance.status}
                                    </p>

                                    {result.attendance.checkInTime && (
                                        <p className="text-sm">
                                            <strong>Check In:</strong>{" "}
                                            {getTime(result.attendance.checkInTime)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}