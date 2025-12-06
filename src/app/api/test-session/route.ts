import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Test Session API called ===');
    const session = await getServerSession(authOptions);
    console.log('Session in test API:', session);
    
    return NextResponse.json({
      session: session,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      hasRole: !!session?.user?.role,
      userRole: session?.user?.role,
      userEmail: session?.user?.email
    });
  } catch (error) {
    console.error('Error in test session API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
