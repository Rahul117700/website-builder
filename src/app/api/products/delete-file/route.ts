import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Only delete if it's a local file (starts with /uploads/)
    if (fileUrl.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', fileUrl);
        
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log('File deleted successfully:', filePath);
        } else {
          console.warn('File not found:', filePath);
        }
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete file from storage', details: deleteError instanceof Error ? deleteError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } else {
      // For S3 or external URLs, we might need different logic
      console.log('Skipping deletion for non-local file:', fileUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete-file API:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

