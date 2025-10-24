'use server';

import { redirect } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const response = await authApi.login({ email, password });
    
    // Store auth data in store (this won't work in server action, need client-side)
    // You'll need to handle this differently
    
    // Redirect based on role
    switch (role) {
      case 'admin':
        redirect('/dashboard/admin');
      case 'staff':
        redirect('/dashboard/staff');
      case 'user':
        redirect('/dashboard/user');
      default:
        redirect('/dashboard/user');
    }
  } catch (error) {
    // Handle error - you might want to redirect to login with error
    redirect('/login?error=Invalid credentials');
  }
}
