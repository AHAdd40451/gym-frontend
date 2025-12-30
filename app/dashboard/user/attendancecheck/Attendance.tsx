// "use client";

// import React, { useEffect, useState } from "react";
// import { runDailyAttendanceJob } from "../../../../lib/api/services/attendence/attendence";

// const Attendance = () => {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [alreadyMarked, setAlreadyMarked] = useState(false);

//   // 🔹 Page load par check (localStorage se)
//   useEffect(() => {
//     const today = new Date().toDateString();
//     const markedDate = localStorage.getItem("attendanceMarkedDate");

//     if (markedDate === today) {
//       setAlreadyMarked(true);
//       setMessage("✅ Aaj ki attendance already marked hai");
//     }
//   }, []);

//   const handleAttendance = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setMessage("");

//       const user = localStorage.getItem("currentUser");
//       if (!user) {
//         throw new Error("User not logged in");
//       }

//       const userId = JSON.parse(user).id;

//       const res = await runDailyAttendanceJob(userId);

//       // ✅ Success
//       setMessage(res.message || "Attendance marked successfully");
//       setAlreadyMarked(true);

//       // 🔹 Aaj ki date save kar lo
//       localStorage.setItem(
//         "attendanceMarkedDate",
//         new Date().toDateString()
//       );
//     } catch (err: any) {
//       // 🔴 Agar backend bole already marked
//       if (err?.message?.toLowerCase().includes("already")) {
//         setAlreadyMarked(true);
//         setMessage("✅ Aaj ki attendance already marked hai");
//       } else {
//         setError(err?.message || "Something went wrong");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[70vh] flex items-center justify-center">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
//         <h2 className="text-xl font-bold mb-2">Daily Attendance</h2>
//         <p className="text-sm text-gray-500 mb-6">
//           Apni aaj ki attendance yahan mark karein
//         </p>

//         {/* ✅ Already Marked UI */}
//         {alreadyMarked ? (
//           <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md">
//             {message || "Attendance already marked"}
//           </div>
//         ) : (
//           <button
//             onClick={handleAttendance}
//             disabled={loading}
//             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
//           >
//             {loading ? "Marking Attendance..." : "Mark Attendance"}
//           </button>
//         )}

//         {/* 🔴 Error */}
//         {error && (
//           <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Attendance;
"use client";

import React, { useState } from "react";
import { runDailyAttendanceJob } from "../../../../lib/api/services/attendence/attendence";

type AttendanceResponse = {
  success?: boolean;
  uccess?: boolean; // backend typo handling
  message?: string;
};

const Attendance = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  const handleAttendance = async () => {
  setLoading(true);
  setError("");
  setMessage("");

  try {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) throw new Error("User not logged in");

    const userId = JSON.parse(userStr)?.id;
    if (!userId) throw new Error("Invalid user");

    const response = await runDailyAttendanceJob(userId);

    // ✅ FIX: normalize once
    const res =
      typeof response === "object" &&
      "success" in response
        ? response
        : response?.data;

    console.log("FINAL RES 👉", res);

    if (!res || typeof res !== "object") {
      throw new Error("Invalid response");
    }

    if (res.success === true) {
      setMessage(res.message || "Attendance marked successfully");
      setAlreadyMarked(true);
      return;
    }

    if (
      res.message &&
      res.message.toLowerCase().includes("already")
    ) {
      setMessage("✅ Aaj ki attendance already marked hai");
      setAlreadyMarked(true);
      return;
    }

    setError(res.message || "Something went wrong");
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Something went wrong");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-yellow-50 to-yellow-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 text-center border-2 border-yellow-400">
        <h2 className="text-2xl font-extrabold mb-2 text-yellow-600">
          Daily Attendance
        </h2>
        <p className="text-sm text-yellow-800 mb-6">
          Apni aaj ki attendance yahan mark karein
        </p>

        {alreadyMarked ? (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-md border border-yellow-400 font-medium">
            {message}
          </div>
        ) : (
          <button
            onClick={handleAttendance}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Marking Attendance..." : "Mark Attendance"}
          </button>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Attendance;
