import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, domain, issue, selectedService } = body;

    // Validate required fields
    if (!name || !email || !domain || !issue) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create domain help request in database
    const helpRequest = await prisma.domainHelpRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        domain,
        issue,
        selectedService: selectedService || null,
        status: 'PENDING',
        createdAt: new Date()
      }
    });

    // Here you would typically:
    // 1. Send email notification to your support team
    // 2. Create ticket in your support system
    // 3. Send confirmation email to user
    // 4. Integrate with payment system if service was selected

    console.log('✅ [Domain Help] New request created:', {
      id: helpRequest.id,
      domain: helpRequest.domain,
      service: helpRequest.selectedService
    });

    return NextResponse.json({
      success: true,
      message: 'Your request has been submitted successfully!',
      requestId: helpRequest.id,
      estimatedResponseTime: '24 hours'
    });

  } catch (error) {
    console.error('❌ [Domain Help] Error creating request:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit request. Please try again.' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
