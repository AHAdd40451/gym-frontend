import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    // Clear the auth cookie
    await clearAuthCookie();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
