import { serverFetch, buildQueryString } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

// ===== Types aligned with backend User model =====
export type UserStatus = "Active" | "Inactive" | "Suspended";
export type UserRole = "Admin" | "Staff" | "Member" | "User";

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

// ===== 1) Get All Users (Admin/Staff) =====
export async function getAllUsers(
  params: PaginationParams = {},
  token: string
) {
  const { page = 1, limit = 10, sort = "-createdAt", search } = params;
  const queryString = buildQueryString({ page, limit, sort, search });

  return serverFetch<{
    users: User[];
    pagination: { total: number; page: number; pages: number };
  }>(`${API_ENDPOINTS.USERS.BASE}${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ===== 2) Get Single User by ID =====
export async function getUserById(id: string, token: string) {
  return serverFetch<{ user: User }>(
    `${API_ENDPOINTS.USERS.BASE}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// ===== 3) Create User (Admin Only) =====
export async function createUser(
  userData: Partial<User>,
  token: string
) {
  return serverFetch<{ message: string; user: User }>(
    API_ENDPOINTS.USERS.BASE,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }
  );
}

// ===== 4) Update User =====
export async function updateUser(
  id: string,
  data: Partial<User>,
  token: string
) {
  return serverFetch<{ message: string; user: User }>(
    `${API_ENDPOINTS.USERS.BASE}/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
}

// ===== 5) Delete User =====
export async function deleteUser(id: string, token: string) {
  return serverFetch<{ message: string }>(
    `${API_ENDPOINTS.USERS.BASE}/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// ===== 6) Update User Status =====
export async function updateUserStatus(
  id: string,
  status: UserStatus,
  token: string
) {
  return serverFetch<{ message: string; user: User }>(
    `${API_ENDPOINTS.USERS.BASE}/${id}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
}

// ===== 7) Get Users by Role =====
// export async function getUsersByRole(
//   role: UserRole,
//   params: PaginationParams = {},
//   token: string
// ) {
//   const { page = 1, limit = 10, sort = "-createdAt" } = params;
//   const queryString = buildQueryString({ page, limit, sort });

//   return serverFetch<{
//     users: User[];
//     pagination: { total: number; page: number; pages: number };
//   }>(
//     `${API_ENDPOINTS.USERS.BY_ROLE}/${role}${queryString}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
// }
export async function getUsersByRole(
  role: UserRole,
  params: PaginationParams = {},
  token?: string
) {
  // ✅ Step 1: Token validate karo
  const authToken = token || localStorage.getItem("authToken");
  if (!authToken) {
    throw new Error("Access denied. No token provided.");
  }

  // ✅ Step 2: Pagination defaults
  const { page = 1, limit = 10, sort = "-createdAt" } = params;
  const queryString = buildQueryString({ page, limit, sort });

  // ✅ Step 3: API call with merged headers
  return serverFetch<{
    users: User[];
    pagination: { total: number; page: number; pages: number };
  }>(
    `${API_ENDPOINTS.USERS.BY_ROLE}/${role}${queryString}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
}

