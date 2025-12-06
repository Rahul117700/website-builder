import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, type } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let systemPrompt = '';

        switch (type) {
            case 'description':
                systemPrompt = 'Write a compelling, sales-oriented product description for the following product. Keep it under 500 characters, use emojis occasionally, and focus on benefits.';
                break;
            case 'headline':
                systemPrompt = 'Write a catchy, high-converting headline for a sales funnel about:';
                break;
            case 'bio':
                systemPrompt = 'Write a professional yet approachable seller bio for a creator selling digital products. Context:';
                break;
            default:
                systemPrompt = 'Help me write content for:';
        }

        const result = await model.generateContent(`${systemPrompt} ${prompt}`);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text.trim() });
    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
