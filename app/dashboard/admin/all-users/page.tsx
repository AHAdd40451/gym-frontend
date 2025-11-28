"use client";
import React, { useEffect, useState } from "react";
import { usersApi } from "@/lib/api/services/users/users";

const UsersTestPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await usersApi.getAll();
        console.log(result);
        setUsers(result.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Network error");
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
};

export default UsersTestPage;
