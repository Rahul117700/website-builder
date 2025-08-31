import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock API keys data
    // In the future, this would query actual API keys from the database
    const mockApiKeys = [
      {
        id: '1',
        name: 'Production API Key',
        key: 'sk_live_1234567890abcdef',
        permissions: ['read', 'write', 'delete'],
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      },
      {
        id: '2',
        name: 'Development API Key',
        key: 'sk_test_0987654321fedcba',
        permissions: ['read', 'write'],
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
      }
    ];

    return NextResponse.json(mockApiKeys);

  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, permissions } = await req.json();

    // For now, return a mock created API key
    // In the future, this would create an actual API key in the database
    const newApiKey = {
      id: Date.now().toString(),
      name: name || 'New API Key',
      key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: permissions || ['read'],
      lastUsed: null,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newApiKey, { status: 201 });

  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
