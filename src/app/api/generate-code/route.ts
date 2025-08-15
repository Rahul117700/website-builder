import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Handle both JSON and FormData (for image uploads)
  let prompt, mode, currentCode, selectedCode, isPartialUpdate, imageFile;
  const contentType = req.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // Handle FormData (with image)
    const formData = await req.formData();
    prompt = formData.get('prompt') as string;
    mode = formData.get('mode') as string;
    currentCode = formData.get('currentCode') as string;
    selectedCode = formData.get('selectedCode') as string;
    isPartialUpdate = formData.get('isPartialUpdate') === 'true';
    imageFile = formData.get('image') as File | null;
  } else {
    // Handle JSON (without image)
    const body = await req.json();
    ({ prompt, mode, currentCode, selectedCode, isPartialUpdate } = body);
  }

  // Validate and sanitize input
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
  }

  if (prompt.length > 1000) {
    return NextResponse.json({ error: 'Prompt too long (max 1000 characters)' }, { status: 400 });
  }

  const sanitizedPrompt = sanitizeInput(prompt);

  // Default prompts that are always included
  const defaultPrompts = `
    IMPORTANT REQUIREMENTS:
    - Always use Material UI, Bootstrap, GSAP, and Three.js libraries
    - Implement smooth in and out animations for all components
    - Make the code fully responsive for all devices (mobile, tablet, desktop)
    - Use modern CSS with flexbox/grid for responsive design
    - Include hover effects and transitions
    - Ensure accessibility standards are met
    - Use semantic HTML structure
    - Optimize for performance
    ${imageFile ? '- If an image is provided, analyze it and incorporate its design elements, colors, layout, or content into the generated code' : ''}
  `;

  let systemMessage = '';
  let userPrompt = '';

    if (isPartialUpdate && selectedCode) {
    // For partial code updates
    systemMessage = `
      You are a coding assistant for a website builder.
      The user has selected a specific part of their code and wants to update it.
      IMPORTANT: Return ONLY the updated code that should replace the selected code.
      Do NOT return the entire file or multiple code blocks.
      Do NOT include explanations, comments, or code block markers.
      Return ONLY the replacement code as plain text.
      The response should be the exact code that will replace the selected text.
      ${defaultPrompts}
    `;
    userPrompt = `REPLACE this selected code: "${selectedCode}" 
Based on this request: ${sanitizedPrompt}

IMPORTANT: 
- Return ONLY the replacement code that should replace the selected text exactly
- Do NOT add extra HTML tags or modify the structure beyond what was selected
- If the selected code contains content within tags (like text inside <title>), only change that content
- Maintain the same format and structure as the selected code
- Do NOT add to or concatenate with the existing code
- Return the exact replacement for the selected portion only`;
  } else if (currentCode) {
    // For full page updates with current code context
    systemMessage = `
      You are a coding assistant for a website builder. 
      The user wants to update their existing code. Use the current code as reference and improve it.
      Return three separate code blocks: 
      1. HTML (inside <html>...</html>), 
      2. CSS (inside <style>...</style>), 
      3. JavaScript (inside <script>...</script>).
      Do not include explanations, only the code blocks.
      ${defaultPrompts}
    `;
    userPrompt = `Current code: ${currentCode}\n\nUser request: ${sanitizedPrompt}`;
  } else {
    // For new code generation
    systemMessage = `
      You are a coding assistant for a website builder. 
      When the user asks for a feature, return three separate code blocks: 
      1. HTML (inside <html>...</html>), 
      2. CSS (inside <style>...</style>), 
      3. JavaScript (inside <script>...</script>).
      Do not include explanations, only the code blocks.
      ${defaultPrompts}
    `;
    userPrompt = sanitizedPrompt;
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  // Prepare the request body
  const parts: any[] = [{ text: systemMessage + '\n\n' + userPrompt }];
  
  // Add image if provided
  if (imageFile) {
    try {
      const imageBuffer = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      parts.push({
        inline_data: {
          mime_type: imageFile.type,
          data: base64Image
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 400 });
    }
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        { parts }
      ]
    }),
  });

  const data = await response.json();
  const code = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return NextResponse.json({ code });
}
