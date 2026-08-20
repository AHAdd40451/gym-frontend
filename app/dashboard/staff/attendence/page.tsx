'use client';
import { useState, useEffect } from "react";
import { getUsersByRole, User } from "../../../../lib/api/services/getstaff/staff";
import { runDailyAttendanceJob } from "@/lib/api/services/attendence/attendence";

const Page = () => {
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken") || "";
    setToken(authToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await getUsersByRole("staff", { page: 1, limit: 100 }, token);
        setStaffUsers(res?.data?.data?.users || []);
      } catch (err) {
        console.error(err);
        setMessage("❌ Error fetching staff");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [token]);

  //  Mark Present API Integration
  const handleMarkPresent = async (userId: string) => {
    try {
  const res = await runDailyAttendanceJob(userId, token);

  setMessage(`✅ ${res?.data?.message || "Marked present!"}`);
} catch (err) {
  console.error("❌ Error in attendance API:", err);
  setMessage("❌ Error marking present");
} finally {
  setLoading(false);
}

  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Staff Attendance</h1>

      {loading && <p>Loading...</p>}

      {staffUsers.length === 0 && !loading && <p>No staff users found.</p>}

      {staffUsers?.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between mb-2 p-2 border rounded"
        >
          <span>{user.firstName} {user.lastName}</span>

          <button
            onClick={() => handleMarkPresent(user._id)}
            disabled={loading}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Mark Present
          </button>
        </div>
      ))}

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default Page;
