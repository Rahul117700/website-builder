import { NextRequest, NextResponse } from 'next/server';

// Function to generate reliable image URLs based on keywords
function generateImageUrl(keywords: string, width = 800, height = 600): string {
  const cleanKeywords = keywords
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') 
    .replace(/\s+/g, ' ') 
    .split(' ')
    .filter(word => word.length > 2) 
    .slice(0, 2) 
    .join('%20');
  
  // Use Picsum Photos (more reliable than Unsplash source)
  const seed = cleanKeywords || 'business';
  
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Function to extract keywords from image description
function extractImageKeywords(description: string): string {
  const stopWords = ['image', 'photo', 'picture', 'background', 'for', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'from', 'with', 'by'];
  
  const keywords = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3) 
    .join(' ');
    
  return keywords || 'modern business';
}

export async function POST(req: NextRequest) {
  const { htmlCode, cssCode } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!htmlCode || typeof htmlCode !== 'string') {
    return NextResponse.json({ error: 'Invalid HTML code' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  try {
    // Step 1: Analyze HTML for image requirements
    const analyzeResponse = await fetch(`${req.url.split('/api')[0]}/api/analyze-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ htmlCode })
    });

    const analyzeData = await analyzeResponse.json();
    
    if (!analyzeData.imagesWithUrls || analyzeData.imagesWithUrls.length === 0) {
      return NextResponse.json({ 
        html: htmlCode, 
        css: cssCode, 
        js: '',
        message: 'No images needed for this website'
      });
    }

    // Step 2: Create image links object from automatic URLs
    const imageLinks: { [key: string]: string } = {};
    analyzeData.imagesWithUrls.forEach((item: any, index: number) => {
      // Ensure unique images by adding index to the seed
      const keywords = extractImageKeywords(item.description);
      const uniqueImageUrl = generateImageUrl(keywords + index);
      imageLinks[item.description] = uniqueImageUrl;
    });

    // Step 3: Apply images using AI
    const imageLinksString = Object.entries(imageLinks)
      .map(([desc, url]) => `- ${desc}: ${url}`)
      .join('\n');

    const systemMessage = `
      You are an AI assistant that integrates provided image links into existing HTML and CSS code.
      Your goal is to replace placeholder images or add new image elements where appropriate, using the provided URLs.
      Ensure the images are responsive, have appropriate alt text, and are styled correctly using CSS (e.g., background-image for hero sections, img tags for content).
      If the image is for a background, use CSS. If it's a content image, use an <img> tag.
      Return three separate code blocks:
      1. HTML (inside <html>...</html>),
      2. CSS (inside <style>...</style>),
      3. JavaScript (inside <script>...</script>).
      Do not include explanations, only the code blocks.
      Prioritize using Material UI, Bootstrap, GSAP, and Three.js for any new components or styling.
      Ensure smooth in and out animations for all components.
      Make the code fully responsive for all devices (mobile, tablet, desktop).
    `;

    const userPrompt = `
      Current HTML:
      \`\`\`html
      ${htmlCode}
      \`\`\`

      Current CSS:
      \`\`\`css
      ${cssCode || ''}
      \`\`\`

      Use the following image links to enhance the website:
      ${imageLinksString}

      Integrate these images into the HTML and CSS automatically.
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: systemMessage + '\n\n' + userPrompt }] }
        ]
      }),
    });

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract code blocks
    const htmlMatch = textResponse.match(/```html[\r\n]+([\s\S]*?)```/i);
    const cssMatch = textResponse.match(/```css[\r\n]+([\s\S]*?)```/i);
    const jsMatch = textResponse.match(/```js[\r\n]+([\s\S]*?)```/i) || textResponse.match(/```javascript[\r\n]+([\s\S]*?)```/i);

    const newHtml = htmlMatch ? htmlMatch[1].trim() : htmlCode;
    const newCss = cssMatch ? cssMatch[1].trim() : cssCode || '';
    const newJs = jsMatch ? jsMatch[1].trim() : '';

    return NextResponse.json({ 
      html: newHtml, 
      css: newCss, 
      js: newJs,
      appliedImages: analyzeData.imagesWithUrls
    });

  } catch (error) {
    console.error('Error auto-applying images:', error);
    return NextResponse.json({ error: 'Failed to auto-apply images' }, { status: 500 });
  }
}