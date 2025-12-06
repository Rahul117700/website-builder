import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/settings - Get platform settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return default settings
    // In a real app, these would be stored in a settings table
    const settings = {
      platform: {
        name: 'Website Builder SaaS',
        version: '1.0.0',
        maintenanceMode: false,
        registrationEnabled: true,
        maxUsersPerInstance: 1,
        defaultInstancePort: 3001
      },
      email: {
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        fromEmail: 'noreply@websitebuilder.com'
      },
      storage: {
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
      },
      security: {
        sessionTimeout: 3600, // 1 hour
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireEmailVerification: true
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/settings - Update platform settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.email !== 'i.am.rahul4550@gmail.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // In a real app, you would save these to a settings table
    // For now, just return success
    console.log('Settings updated:', body);

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
