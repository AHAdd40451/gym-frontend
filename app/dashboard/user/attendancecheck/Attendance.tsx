"use client";

import React, { useState } from "react";
import { createAttendance } from "@/lib/api/services/attendence/attendence";
import { Toaster, toast } from "sonner";

const ManualAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false); 

  const handleManualAttendance = async () => {
    setLoading(true);

    try {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) throw new Error("User not logged in");

      const userId = JSON.parse(userStr)?.id;
      if (!userId) throw new Error("Invalid user");

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const status: "present" | "absent" = "present";

      const res = await createAttendance(userId, today, status);

      // ✅ Show toast from Sonner
      if (res?.data?.message) {
        toast.success(res.data.message);
        setAlreadyMarked(true); // ✅ disable button
      } else if (res?.error) {
        toast.error(res.error);
        // ✅ disable button if already marked
        if (res.error.toLowerCase().includes("already")) setAlreadyMarked(true);
      } else {
        toast(res ? JSON.stringify(res) : "Attendance response received");
      }
    } catch (err: any) {
      if (err?.error) {
        toast.error(err.error);
        if (err.error.toLowerCase().includes("already")) setAlreadyMarked(true);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
      <Toaster position="top-center" /> {/* ✅ Sonner toaster */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 text-center border">
        <h2 className="text-2xl font-bold mb-4">Manual Attendance</h2>
        <p className="text-sm text-gray-600 mb-6">
          Apni attendance manually mark karein
        </p>

        <button
          onClick={handleManualAttendance}
          disabled={loading || alreadyMarked} // ✅ disable if already marked
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
        >
          {loading ? "Processing..." : alreadyMarked ? "Attendance Marked" : "Create Attendance"}
        </button>
      </div>
    </div>
  );
};

export default ManualAttendance;
