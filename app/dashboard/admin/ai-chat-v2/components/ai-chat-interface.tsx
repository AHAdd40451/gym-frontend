"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Lottie from "lottie-react";
import aiSphereAnimation from "../ai-sphere-animation.json";
import Fuse from "fuse.js";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { usersApi } from "@/lib/api/services/users/users";
import {
  Input,
  PromptInputActions,
  PromptInputTextarea
} from "@/components/ui/custom/prompt/input";

import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import {
  Message,
  MessageContent
} from "@/components/ui/custom/prompt/message";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";

// APIs
import { getAllUsers } from "@/lib/api/services/users/users";
import { getAllSubscriptions } from "@/lib/api/services/subcription/subcription";
import { getAllProducts } from "@/lib/api/services/product/product";
import { getAttendanceByUserId } from "@/lib/api/services/attendence/attendence";

export default function AIChatInterface() {
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<
    { id: number; role: string; content: string; routes?: string[] }[]
  >([]);

  // ================= TOKEN =================
  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  };

  const extractName = (text: string) => {
    return text
      .toLowerCase()
      .replace(
        /search|find|user|data|ka|ki|ke|nikaal|nikal|nikalo|do|de|please|batao/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();
  };
  // ================= CLEAN PARSER =================
  const extractAttendanceQuery = (text: string) => {
    // 1. extract date first
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);

    // 2. remove date from text
    let cleanText = text.replace(dateMatch?.[0] || "", "");

    // 3. remove keywords
    cleanText = cleanText
      .replace(/attendance|present|absent|tha|thi|kya|check|batao|ko aya tha|ko aya|hai/gi, "")
      .replace(/\/+/g, " ")     // remove //
      .replace(/\s+/g, " ")     // multiple spaces fix
      .trim();

    return {
      name: cleanText,
      date: dateMatch ? dateMatch[0] : ""
    };
  };
  // ================= INTENT =================
  const detectIntent = (text: string) => {
    const t = text.toLowerCase();

    const hasDate =
      /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(t) ||
      /\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/.test(t);

    if (
      t.includes("attendance") ||
      t.includes("present") ||
      t.includes("absent") ||
      t.includes("aya") ||
      t.includes("gaya") ||
      hasDate
    ) {
      return "attendance";
    }

    if (t.includes("user") || t.includes("admin") || t.includes("staff"))
      return "users";

    if (t.includes("subscription") || t.includes("plan"))
      return "subscriptions";

    if (t.includes("product") || t.includes("shop"))
      return "products";

    if (
      t.includes("search") ||
      t.includes("find") ||
      t.includes("data") ||
      t.includes("user")
    ) {
      return "user_search";
    }
    return null;
  };

  // ================= API =================
  const runQuery = async (intent: string | null, rawPrompt: string) => {
    const token = getToken();
    if (!token) return { text: "❌ Token missing", routes: [] };

    try {
      switch (intent) {

        // ---------- USERS ----------
        case "users": {
          const res = await getAllUsers({ page: 1, limit: 100 }, token);
          const users = res?.data?.data?.users || [];

          const admin = users.filter((u: any) => u.role === "admin").length;
          const staff = users.filter((u: any) => u.role === "staff").length;
          const normal = users.filter((u: any) => u.role === "user").length;

          return {
            text: `👥 Users\nAdmin: ${admin}\nStaff: ${staff}\nUsers: ${normal}`,
            routes: ["/dashboard/admin/all-users"]
          };
        }

        // ---------- SUBS ----------
        case "subscriptions": {
          const res = await getAllSubscriptions({}, token);
          const subs = res?.data?.data || res?.data || [];

          const active = subs.filter(
            (s: any) => s.status?.toLowerCase() === "active"
          ).length;

          return {
            text: `💳 Active Subscriptions: ${active}`,
            routes: ["/dashboard/admin/all-sub"]
          };
        }

        // ---------- PRODUCTS ----------
        case "products": {
          const res = await getAllProducts({}, token);
          const products = res?.data?.products || [];

          return {
            text: `🛒 Products: ${products.length}`,
            routes: ["/dashboard/admin/product-list"]
          };
        }

        // ---------- ATTENDANCE (FIXED) ----------
        case "attendance": {
          const token = getToken();

          const { name, date } = extractAttendanceQuery(prompt);

          if (!name || !date) {
            return {
              text: "❌ Please write like: 'babar 20/04/2026' or 'babar 20-04-2026'",
              routes: []
            };
          }

          // =========================
          // 1. GET USERS
          // =========================
          const usersRes = await getAllUsers({ page: 1, limit: 100 }, token);
          const users = usersRes?.data?.data?.users || [];

          // const user = users.find((u: any) => {
          //   const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
          //   return fullName.includes(name.toLowerCase());
          // });
const fuse = new Fuse(users, {
  keys: ["firstName", "lastName", "email"],
  threshold: 0.4,
  ignoreLocation: true
});

const results = fuse.search(name);

if (!results.length) {
  return {
    text: `❌ No user found for "${name}"`,
    routes: ["/dashboard/users"]
  };
}

if (results.length > 1) {
  return {
    text:
      `🔍 Found ${results.length} similar users:\n\n` +
      results
        .slice(0, 5)
        .map(
          (r: any, i: number) =>
            `${i + 1}. ${r.item.firstName} ${r.item.lastName} (${r.item.email})`
        )
        .join("\n"),
    routes: ["/dashboard/admin/all-users"]
  };
}

const user = results[0].item;
          if (!user) {
            return {
              text: `❌ User "${name}" not found`,
              routes: ["/dashboard/users"]
            };
          }

          // =========================
          // 2. GET ATTENDANCE
          // =========================
          const res = await getAttendanceByUserId(user._id, token);

          const attendanceRecords =
            res?.data?.attendance || res?.data?.data?.attendance || [];

          // =========================
          // 3. FIXED DATE PARSER (IMPORTANT)
          // =========================
          const inputMatch = date.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);

          if (!inputMatch) {
            return {
              text: "❌ Invalid date format. Use like 20/04/2026",
              routes: []
            };
          }

          const inputDay = Number(inputMatch[1]);
          const inputMonth = Number(inputMatch[2]);
          const inputYear = Number(inputMatch[3]);

          const record = attendanceRecords.find((r: any) => {
            const d = new Date(r.date);

            const dbDay = d.getDate();
            const dbMonth = d.getMonth() + 1;
            const dbYear = d.getFullYear();

            return (
              dbDay === inputDay &&
              dbMonth === inputMonth &&
              dbYear === inputYear
            );
          });

          // =========================
          // 4. RESPONSE
          // =========================
          const formattedDate = `${inputDay.toString().padStart(2, "0")}/${inputMonth
            .toString()
            .padStart(2, "0")}/${inputYear}`;

          if (!record) {
            return {
              text: `❌ ${user.firstName} was NOT marked on ${formattedDate}`,
              routes: ["/dashboard/attendance"]
            };
          }

          return {
            text: `✅ ${user.firstName} was ${record.status} on ${formattedDate}`,
            routes: [
              "/dashboard/attendance",
              `/dashboard/users/${user._id}`
            ]
          };
        }
        case "user_search": {
          try {
            console.log("🟡 RAW PROMPT:", rawPrompt);

            const name = extractName(rawPrompt);
            console.log("🟢 EXTRACTED NAME:", name);

            if (!name) {
              return {
                text: "❌ Please write user name. Example: 'babar ka data nikal do'",
                routes: []
              };
            }

            const res = await usersApi.searchByName(name);

            console.log("🟣 API RESPONSE:", res);

            if (!res?.success) {
              console.log("🔴 API FAILED:", res);
              return {
                text: `❌ ${res?.message || "No users found"}`,
                routes: []
              };
            }

            // ✅ FIXED HERE
            const users = res?.data?.users || [];

            console.log("🔵 FINAL USERS ARRAY:", users);

            if (!users.length) {
              console.log("🔴 NO USERS FOUND AFTER PARSING");
              return {
                text: `❌ No user found for "${name}"`,
                routes: []
              };
            }

            if (users.length > 1) {
              return {
                text:
                  `🔍 Found ${users.length} users:\n\n` +
                  users
                    .map(
                      (u: any, i: number) =>
                        `${i + 1}. ${u.firstName} ${u.lastName} (${u.email})`
                    )
                    .join("\n"),
                routes: ["/dashboard/admin/all-users"]
              };
            }

            const user = users[0];

            return {
              text: `👤 User Found

🧑 Name: ${user.firstName} ${user.lastName}
📧 Email: ${user.email}
📱 Phone: ${user.phone || "N/A"}
🎭 Role: ${user.role}
📌 Status: ${user.status}

💳 Subscription:
Type: ${user.subscription?.type || "N/A"}
Status: ${user.subscription?.status || "N/A"}
Plan: ${user.subscription?.plan?.name || "N/A"}
Price: ${user.subscription?.plan?.priceCents || 0} ${user.subscription?.plan?.currency || ""}`,

              routes: [`/dashboard/users/${user._id}`]
            };

          } catch (err: any) {
            console.log("❌ SEARCH ERROR:", err);

            return {
              text: err?.message || "⚠️ Search failed",
              routes: []
            };
          }
        }
        //         case "user_search": {
        //   try {
        //     const name = extractName(rawPrompt);

        //     if (!name) {
        //       return {
        //         text: "❌ Please write user name. Example: 'babar ka data nikal do'",
        //         routes: []
        //       };
        //     }

        //     const res = await usersApi.searchByName(name);

        //     // ✅ HANDLE API RESPONSE PROPERLY
        //     if (!res?.success) {
        //       return {
        //         text: `❌ ${res?.message || "No users found"}`,
        //         routes: []
        //       };
        //     }

        //     const users = res?.data || [];

        //     if (!users.length) {
        //       return {
        //         text: `❌ No user found for "${name}"`,
        //         routes: []
        //       };
        //     }

        //     // multiple users
        //     if (users.length > 1) {
        //       return {
        //         text:
        //           `🔍 Found ${users.length} users:\n\n` +
        //           users
        //             .map(
        //               (u: any, i: number) =>
        //                 `${i + 1}. ${u.firstName} ${u.lastName} (${u.email})`
        //             )
        //             .join("\n"),
        //         routes: ["/dashboard/admin/all-users"]
        //       };
        //     }

        //     // single user
        //     const user = users[0];

        //     return {
        //       text: `👤 User Found:

        // Name: ${user.firstName} ${user.lastName}
        // Email: ${user.email}
        // Role: ${user.role}
        // Status: ${user.status}`,
        //       routes: [`/dashboard/users/${user._id}`]
        //     };
        //   } catch (err: any) {
        //     console.log("SEARCH ERROR:", err);

        //     return {
        //       text: err?.message || "⚠️ Search failed",
        //       routes: []
        //     };
        //   }
        // }
        default:
          return {
            text: " Samaj nhi aya ❌ Ask Me About: users, subscriptions, products, attendance",
            routes: []
          };
      }
    } catch (err) {
      console.log(err);
      return { text: "⚠️ Server error", routes: [] };
    }

  };

  // ================= STREAM =================
  const streamResponse = async () => {
    if (isStreaming || !prompt.trim()) return;

    setIsStreaming(true);

    const userId = Date.now();

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: prompt }
    ]);

    const intent = detectIntent(prompt);
    const result = await runQuery(intent, prompt);

    setPrompt("");

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
        clearInterval(streamIntervalRef.current!);
        setIsStreaming(false);
      }
    }, 10);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center">

      {/* EMPTY STATE */}
      {messages.length === 0 && (
        <div className="text-center mt-20">
          <div className="w-72 mx-auto">
            <Lottie animationData={aiSphereAnimation} loop autoplay />
          </div>
          <h1 className="text-2xl font-medium mt-4">
            How can I assist you today?
          </h1>
        </div>
      )}

      {/* CHAT */}
      <ChatContainer className="w-full flex-1 space-y-4">

        {messages.map((msg) => (
          <Message
            key={msg.id}
            className={msg.role === "user" ? "justify-end" : "justify-start"}
          >
            <MessageContent className="p-3 rounded-xl bg-muted">
              <pre className="whitespace-pre-wrap">{msg.content}</pre>

              {msg.routes?.map((r, i) => (
                <Link key={i} href={r} className="text-blue-500 underline block mt-2">
                  Open →
                </Link>
              ))}
            </MessageContent>
          </Message>
        ))}

        {isStreaming && <PromptLoader />}
      </ChatContainer>

      {/* INPUT */}
      <div className="w-full p-3">
        <Input value={prompt} onValueChange={setPrompt} onSubmit={streamResponse}>
          <PromptInputTextarea placeholder="Ask anything..." />

          <PromptInputActions>
            <Button onClick={streamResponse}>
              {isStreaming ? <SquareIcon /> : <ArrowUpIcon />}
            </Button>
          </PromptInputActions>
        </Input>
      </div>
    </div>
  );
}