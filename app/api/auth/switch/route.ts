import { NextRequest, NextResponse } from 'next/server';
import { setAuthData } from '@/lib/api/services/auth/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, token } = body;

    if (!user || !token) {
      return NextResponse.json(
        { success: false, message: 'User and token are required' },
        { status: 400 }
      );
    }

    // Update server-side cookies
    await setAuthData(user, token);

    return NextResponse.json({ success: true, message: 'Account switched successfully' });
  } catch (error: any) {
    console.error('Switch account error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to switch account' },
      { status: 500 }
    );
  }
}

