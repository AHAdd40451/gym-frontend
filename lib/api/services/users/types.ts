// types/models.ts
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  profileImage?: string | null;
  createdAt: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
}

// For your table component
export interface UserTableRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  profileImage: string;
  createdAt: string;
}
