"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator)) {
      console.log("Service Worker not supported in this browser.");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        console.log("PWA Service Worker registered:", registration.scope);
      } catch (error) {
        console.error("PWA Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}