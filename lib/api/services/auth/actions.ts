'use server';

import { redirect } from 'next/navigation';
import { setAuthData, clearAuthCookie, getServerAuth } from './server';
import type { LoginCredentials, RegisterData } from '../../../types/models';

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

    await setAuthData(data.data.user, data.data.token);

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
    await setAuthData(data.data.user, data.data.token);

    const redirectUrl = getDashboardUrl(data.data.user);
    redirect(redirectUrl);
  } else {
    redirect(`/register?error=${encodeURIComponent(data.message || 'Registration failed')}`);
  }
}

export async function logoutAction() {
  try {
    const { token } = await getServerAuth();

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  await clearAuthCookie();
  redirect('/login');
}

function getDashboardUrl(user: {
  role?: string;
  isSuperAdmin?: boolean;
  staffType?: string | null;
}): string {
  switch (user?.role) {
    case 'admin':
      return user?.isSuperAdmin ? '/dashboard/super-admin' : '/dashboard/admin/ecommerce';
    case 'staff':
      return user?.staffType === 'operator'
        ? '/dashboard/admin/ecommerce'
        : '/dashboard/staff/workouts';
    case 'user':
      return '/dashboard/user';
    default:
      return '/dashboard/user';
  }
}
