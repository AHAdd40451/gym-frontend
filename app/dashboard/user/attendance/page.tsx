"use client";

import React, { useEffect, useState } from "react";
import Graph from "./Graph";

type StoredUser = {
  id?: string;
  _id?: string;
};

const Page = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");

    if (userStr) {
      try {
        const user: StoredUser = JSON.parse(userStr);

        // ✅ handle both id and _id
        const userId = user._id || user.id;

        if (userId) {
          setCurrentUser({ id: userId });
        }
      } catch (error) {
        console.error("Invalid user in localStorage");
      }
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!currentUser?.id) {
    return <div className="text-red-500">User not logged in</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Graph currentUser={currentUser} />
    </div>
  );
};

export default Page;
