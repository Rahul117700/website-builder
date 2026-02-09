import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const contactEntry = await prisma.contactForm.create({
            data: {
                name,
                email,
                subject,
                message,
            },
        });

        return NextResponse.json(
            { message: 'Message sent successfully!', id: contactEntry.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Contact form submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit form' },
            { status: 500 }
        );
    }
}
