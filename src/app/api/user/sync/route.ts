import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      // Create user if they don't exist
      const hashedPassword = await bcrypt.hash('temp_password_' + Date.now(), 12);

      user = await prisma.user.create({
        data: {
          name: session.user.name || 'User',
          email: session.user.email,
          password: hashedPassword,
          role: 'USER',
          emailVerified: new Date(),
          image: session.user.image
        }
      });

      console.log('✅ Created new user in database:', user.email);
    } else {
      console.log('✅ User already exists in database:', user.email);
    }

    // Update session with correct user ID
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
