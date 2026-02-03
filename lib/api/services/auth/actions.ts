'use server';

import { redirect } from 'next/navigation';
import { setAuthData, clearAuthCookie } from './server';
import type { LoginCredentials, RegisterData } from '../../../types/models';

// export async function loginAction(credentials: LoginCredentials) {
//   let response;
//   let data;
  
//   try {
//     // Call your backend API directly from server
//     response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(credentials),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       redirect(`/login?error=${encodeURIComponent(errorData.message || 'Login failed')}`);
//     }

//     data = await response.json();
//     console.log('Server login response:', data);
//   } catch (error: any) {
//     console.error('API call failed:', error);
//     redirect(`/login?error=${encodeURIComponent('Network error. Please try again.')}`);
//   }
  
//   if (data.success && data.data && data.data.user && data.data.token) {
//     // Store both user data and token in cookies
//     await setAuthData(data.data.user, data.data.token);
    
//     // Redirect based on user role
//     const redirectUrl = getDashboardUrl(data.data.user.role);
//     redirect(redirectUrl);
//   } else {
//     redirect(`/login?error=${encodeURIComponent(data.message || 'Login failed')}`);
//   }
// }
export async function loginAction(credentials: LoginCredentials) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // ✅ Store in cookies for server-side persistence
    await setAuthData(data.data.user, data.data.token);

    // ✅ Return data to client
    return {
      success: true,
      user: data.data.user,
      token: data.data.token,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
}

export async function registerAction(userData: RegisterData) {
  let response;
  let data;
  
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      redirect(`/register?error=${encodeURIComponent(errorData.message || 'Registration failed')}`);
    }

    data = await response.json();
    console.log('Server register response:', data);
  } catch (error: any) {
    console.error('API call failed:', error);
    redirect(`/register?error=${encodeURIComponent('Network error. Please try again.')}`);
  }
  
  if (data.success && data.data && data.data.user && data.data.token) {
    // Store both user data and token in cookies
    await setAuthData(data.data.user, data.data.token);
    
    const redirectUrl = getDashboardUrl(data.data.user.role);
    redirect(redirectUrl);
  } else {
    redirect(`/register?error=${encodeURIComponent(data.message || 'Registration failed')}`);
  }
}

// export async function logoutAction() {
//   try {
//     // Call logout API if needed
//     await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (error) {
//     console.error('Logout API call failed:', error);
//   }
  
//   // Always clear the cookie
//   await clearAuthCookie();
//   redirect('/login');
// }
export async function logoutAction() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout API call failed:", error);
  }

  // ⭐ Clear localStorage on logout
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-user");
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("auth-changed"));
  }

  await clearAuthCookie();
  redirect("/login");
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin/ecommerce';
    case 'staff':
      return '/dashboard/staff/members';
    case 'user':
      return '/dashboard/user';
    default:
      return '/dashboard/user';
  }
}
