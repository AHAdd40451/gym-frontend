"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import Fuse from "fuse.js";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import aiSphereAnimation from "../ai-sphere-animation.json";

import {
  Input,
  PromptInputActions,
  PromptInputTextarea
} from "@/components/ui/custom/prompt/input";
import { Button } from "@/components/ui/button";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";

// APIs
import { getAllUsers } from "@/lib/api/services/users/users";
import { getAllSubscriptions } from "@/lib/api/services/subcription/subcription";
import { getAttendanceByUserId } from "@/lib/api/services/attendence/attendence";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  routes?: string[];
};

type QueryResult = {
  text: string;
  routes: string[];
};

const ROUTES = {
  overview: "/dashboard/admin",
  allUsers: "/dashboard/admin/all-users",
  allSubscriptions: "/dashboard/admin/all-sub",
  attendance: "/dashboard/admin/attendance",
  plans: "/dashboard/admin/plans",
  notifications: "/dashboard/admin/notifications"
};

const SUGGESTIONS = [
  "Show member summary",
  "Show active subscriptions",
  "Show membership plans",
  "Show renewals due",
  "Was Ahmed present on 20/04/2026?"
];

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function extractName(text: string) {
  return text
    .toLowerCase()
    .replace(
      /search|find|show|open|get|member|members|user|users|profile|details|detail|data|information|info|with|by|email|phone|please|for|of|the/gi,
      ""
    )
    .replace(/[?.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAttendanceQuery(text: string) {
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

  let cleanText = text.replace(dateMatch?.[0] || "");

  cleanText = cleanText
    .replace(
      /attendance|present|absent|was|is|marked|check|status|member|user|date|on|for|please|did|come|visited|visit|today/gi,
      ""
    )
    .replace(/[?.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    name: cleanText,
    date: dateMatch ? dateMatch[0] : ""
  };
}

function normalizeSubscriptionsResponse(res: any) {
  const payload = res?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.subscriptions)) return payload.subscriptions;
  if (Array.isArray(payload?.data?.subscriptions)) {
    return payload.data.subscriptions;
  }
  if (Array.isArray(payload?.data?.data)) return payload.data.data;

  return [];
}

function getPlanNameFromSubscription(sub: any) {
  return (
    sub?.plan?.name ||
    sub?.plan?.title ||
    sub?.planName ||
    "Membership Plan"
  );
}

function formatDate(value: string | Date) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function detectIntent(text: string) {
  const t = text.toLowerCase();

  const hasDate =
    /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(t) ||
    /\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/.test(t);

  if (
    t.includes("renew") ||
    t.includes("renewal") ||
    t.includes("due") ||
    t.includes("expire") ||
    t.includes("expired") ||
    t.includes("expiring")
  ) {
    return "renewals";
  }

  if (
    t.includes("attendance") ||
    t.includes("present") ||
    t.includes("absent") ||
    t.includes("visited") ||
    t.includes("check in") ||
    t.includes("check-in") ||
    hasDate
  ) {
    return "attendance";
  }

  if (
    t.includes("search") ||
    t.includes("find") ||
    t.includes("profile") ||
    t.includes("detail") ||
    t.includes("details") ||
    t.includes("data")
  ) {
    return "user_search";
  }

  if (
    t.includes("plan") ||
    t.includes("plans") ||
    t.includes("package") ||
    t.includes("packages") ||
    t.includes("pricing")
  ) {
    return "plans";
  }

  if (
    t.includes("subscription") ||
    t.includes("subscriptions") ||
    t.includes("membership") ||
    t.includes("memberships") ||
    t.includes("active subscription")
  ) {
    return "subscriptions";
  }

  if (
    t.includes("user") ||
    t.includes("users") ||
    t.includes("member") ||
    t.includes("members") ||
    t.includes("admin") ||
    t.includes("staff")
  ) {
    return "users";
  }

  if (
    t.includes("revenue") ||
    t.includes("report") ||
    t.includes("reports") ||
    t.includes("dashboard") ||
    t.includes("overview")
  ) {
    return "reports";
  }

  return null;
}

export default function AIChatInterface() {
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }

      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const getUsersList = async (token: string) => {
    const res = await getAllUsers({ page: 1, limit: 100 }, token);
    return res?.data?.data?.users || res?.data?.users || [];
  };

  const getSubscriptionsList = async (token: string) => {
    const res = await getAllSubscriptions({}, token);
    return normalizeSubscriptionsResponse(res);
  };

  const runQuery = async (
    intent: string | null,
    rawPrompt: string
  ): Promise<QueryResult> => {
    const token = getToken();

    if (!token) {
      return {
        text: "Authentication token is missing. Please log in again.",
        routes: []
      };
    }

    try {
      switch (intent) {
        case "users": {
          const users = await getUsersList(token);

          const admins = users.filter((u: any) => u.role === "admin").length;
          const staff = users.filter((u: any) => u.role === "staff").length;
          const members = users.filter((u: any) => u.role === "user").length;
          const activeUsers = users.filter(
            (u: any) => String(u.status || "").toLowerCase() === "active"
          ).length;

          return {
            text: `Member Summary

Admins: ${admins}
Staff: ${staff}
Members: ${members}
Active Users: ${activeUsers}
Total Users: ${users.length}`,
            routes: [ROUTES.allUsers]
          };
        }

        case "subscriptions": {
          const subscriptions = await getSubscriptionsList(token);

          const active = subscriptions.filter((s: any) =>
            ["active", "trialing"].includes(
              String(s.status || "").toLowerCase()
            )
          ).length;

          const pending = subscriptions.filter(
            (s: any) => String(s.status || "").toLowerCase() === "pending"
          ).length;

          const canceled = subscriptions.filter(
            (s: any) => String(s.status || "").toLowerCase() === "canceled"
          ).length;

          const pastDue = subscriptions.filter((s: any) =>
            ["past_due", "unpaid"].includes(
              String(s.status || "").toLowerCase()
            )
          ).length;

          return {
            text: `Subscription Summary

Active: ${active}
Pending: ${pending}
Canceled: ${canceled}
Past Due / Unpaid: ${pastDue}
Total Subscriptions: ${subscriptions.length}`,
            routes: [ROUTES.allSubscriptions]
          };
        }

        case "plans": {
          const subscriptions = await getSubscriptionsList(token);

          const planMap = new Map<string, number>();

          subscriptions.forEach((sub: any) => {
            const planName = getPlanNameFromSubscription(sub);
            planMap.set(planName, (planMap.get(planName) || 0) + 1);
          });

          if (!planMap.size) {
            return {
              text: "No plan data found from current subscriptions. Open the plans page to manage membership plans.",
              routes: [ROUTES.plans]
            };
          }

          const planLines = Array.from(planMap.entries())
            .map(
              ([planName, count], index) =>
                `${index + 1}. ${planName}: ${count}`
            )
            .join("\n");

          return {
            text: `Membership Plans

${planLines}`,
            routes: [ROUTES.plans, ROUTES.allSubscriptions]
          };
        }

        case "renewals": {
          const subscriptions = await getSubscriptionsList(token);

          const now = new Date();
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(now.getDate() + 7);

          const dueSoon = subscriptions.filter((sub: any) => {
            if (!sub.currentPeriodEnd) return false;

            const endDate = new Date(sub.currentPeriodEnd);
            return endDate >= now && endDate <= sevenDaysFromNow;
          });

          const expired = subscriptions.filter((sub: any) => {
            if (!sub.currentPeriodEnd) return false;

            const endDate = new Date(sub.currentPeriodEnd);
            return endDate < now;
          });

          const dueSoonList = dueSoon
            .slice(0, 5)
            .map((sub: any, index: number) => {
              const memberName =
                `${sub.user?.firstName || ""} ${
                  sub.user?.lastName || ""
                }`.trim() ||
                sub.memberName ||
                "Member";

              return `${index + 1}. ${memberName} - ${getPlanNameFromSubscription(
                sub
              )} - expires ${formatDate(sub.currentPeriodEnd)}`;
            })
            .join("\n");

          return {
            text: `Renewal Summary

Due in next 7 days: ${dueSoon.length}
Expired: ${expired.length}

${dueSoonList || "No renewals due in the next 7 days."}`,
            routes: [ROUTES.overview, ROUTES.allSubscriptions]
          };
        }

        case "attendance": {
          const { name, date } = extractAttendanceQuery(rawPrompt);

          if (!name || !date) {
            return {
              text: `Please include member name and date.

Example:
Was Ahmed present on 20/04/2026?`,
              routes: [ROUTES.attendance]
            };
          }

          const users = await getUsersList(token);

          const fuse = new Fuse(users, {
            keys: ["firstName", "lastName", "email", "phone"],
            threshold: 0.4,
            ignoreLocation: true
          });

          const results = fuse.search(name);

          if (!results.length) {
            return {
              text: `No member found for "${name}".`,
              routes: [ROUTES.allUsers]
            };
          }

          if (results.length > 1) {
            return {
              text:
                `Found ${results.length} similar members:\n\n` +
                results
                  .slice(0, 5)
                  .map(
                    (r: any, i: number) =>
                      `${i + 1}. ${r.item.firstName} ${r.item.lastName} (${r.item.email})`
                  )
                  .join("\n"),
              routes: [ROUTES.allUsers]
            };
          }

          const user = results[0].item;

          const attendanceRes = await getAttendanceByUserId(users._id, token);

          const attendanceRecords =
            attendanceRes?.data?.attendance ||
            attendanceRes?.data?.data?.attendance ||
            [];

          const inputMatch = date.match(
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/
          );

          if (!inputMatch) {
            return {
              text: "Invalid date format. Please use a format like 20/04/2026.",
              routes: [ROUTES.attendance]
            };
          }

          const inputDay = Number(inputMatch[1]);
          const inputMonth = Number(inputMatch[2]);
          const inputYear =
            inputMatch[3].length === 2
              ? Number(`20${inputMatch[3]}`)
              : Number(inputMatch[3]);

          const record = attendanceRecords.find((r: any) => {
            const d = new Date(r.date);

            return (
              d.getDate() === inputDay &&
              d.getMonth() + 1 === inputMonth &&
              d.getFullYear() === inputYear
            );
          });

          const formattedDate = `${inputDay
            .toString()
            .padStart(2, "0")}/${inputMonth
            .toString()
            .padStart(2, "0")}/${inputYear}`;

          const fullName =
            `${users.firstName || ""} ${users.lastName || ""}`.trim() ||
            "Member";

          if (!record) {
            return {
              text: `${fullName} was not marked on ${formattedDate}.`,
              routes: [ROUTES.attendance, `${ROUTES.allUsers}/${users._id}`]
            };
          }

          return {
            text: `${fullName} was marked as ${record.status} on ${formattedDate}.`,
            routes: [ROUTES.attendance, `${ROUTES.allUsers}/${users._id}`]
          };
        }

        case "user_search": {
          const name = extractName(rawPrompt);

          if (!name) {
            return {
              text: `Please write a member name.

Example:
Find Ahmed`,
              routes: [ROUTES.allUsers]
            };
          }

          const users = await getUsersList(token);

          const fuse = new Fuse(users, {
            keys: ["firstName", "lastName", "email", "phone"],
            threshold: 0.4,
            ignoreLocation: true
          });

          const results = fuse.search(name);

          if (!results.length) {
            return {
              text: `No member found for "${name}".`,
              routes: [ROUTES.allUsers]
            };
          }

          if (results.length > 1) {
            return {
              text:
                `Found ${results.length} matching members:\n\n` +
                results
                  .slice(0, 5)
                  .map(
                    (r: any, i: number) =>
                      `${i + 1}. ${r.item.firstName} ${r.item.lastName} (${r.item.email})`
                  )
                  .join("\n"),
              routes: [ROUTES.allUsers]
            };
          }

          const user = results[0].item;

          const fullName =
            `${users.firstName || ""} ${users.lastName || ""}`.trim() ||
            "Member";

          return {
            text: `Member Found

Name: ${fullName}
Email: ${users.email || "N/A"}
Phone: ${users.phone || "N/A"}
Role: ${users.role || "N/A"}
Status: ${users.status || "N/A"}

Subscription:
Type: ${users.subscription?.type || "N/A"}
Status: ${users.subscription?.status || "N/A"}
Plan: ${users.subscription?.plan?.name || "N/A"}`,
            routes: [`${ROUTES.allUsers}/${users._id}`]
          };
        }

        case "reports": {
          return {
            text: `Gym Reports

You can review:
- Active members
- Today's check-ins
- Monthly revenue
- Renewals due
- Plan distribution
- Attendance trends`,
            routes: [ROUTES.overview]
          };
        }

        default:
          return {
            text: `I could not understand that request.

You can ask me about:
- Members
- Subscriptions
- Membership plans
- Attendance
- Card scans
- Renewals
- Gym reports`,
            routes: []
          };
      }
    } catch (err: any) {
      console.error("AI chat query error:", err);

      return {
        text: err?.message || "Server error. Please try again.",
        routes: []
      };
    }
  };

  const stopStreaming = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    setIsStreaming(false);
  };

  const streamResponse = async () => {
    if (isStreaming || !prompt.trim()) return;

    setIsStreaming(true);

    const currentPrompt = prompt.trim();
    const userId = Date.now();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: currentPrompt }
    ]);

    setPrompt("");

    const intent = detectIntent(currentPrompt);
    const result = await runQuery(intent, currentPrompt);

    const assistantId = userId + 1;

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" }
    ]);

    let i = 0;
    let text = "";

    streamIntervalRef.current = setInterval(() => {
      if (i < result.text.length) {
        text += result.text[i];

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: text, routes: result.routes }
              : m
          )
        );

        i++;
      } else {
        stopStreaming();
      }
    }, 10);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] w-full max-w-4xl flex-col">
      {messages.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mx-auto w-56">
            <Lottie animationData={aiSphereAnimation} loop autoplay />
          </div>

          <h1 className="mt-4 text-2xl font-medium">
            How can I assist with your gym today?
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Ask about members, subscriptions, plans, attendance,
            renewals, and reports.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPrompt(item)}
                className="rounded-full border px-4 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {msg.content}
                </pre>

               
              </div>
            </div>
          ))}

          {isStreaming && <PromptLoader />}

          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="shrink-0 border-t bg-background p-3">
        <Input value={prompt} onValueChange={setPrompt} onSubmit={streamResponse}>
          <PromptInputTextarea placeholder="Ask about members, subscriptions, plans, attendance..." />

          <PromptInputActions>
            <Button
              type="button"
              onClick={isStreaming ? stopStreaming : streamResponse}
            >
              {isStreaming ? <SquareIcon /> : <ArrowUpIcon />}
            </Button>
          </PromptInputActions>
        </Input>
      </div>
    </div>
  );
}