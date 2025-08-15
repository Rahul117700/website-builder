import { NextRequest, NextResponse } from 'next/server';

// Function to generate reliable image URLs based on keywords
function generateImageUrl(keywords: string, width = 800, height = 600): string {
  // Clean and format keywords
  const cleanKeywords = keywords
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .split(' ')
    .filter(word => word.length > 2) // Filter out short words
    .slice(0, 2) // Take only first 2 relevant keywords
    .join('%20'); // URL encode spaces
  
  // Use Picsum Photos (more reliable than Unsplash source)
  // Generate a seed based on keywords for consistent images
  const seed = cleanKeywords || 'business';
  
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Function to extract keywords from image description
function extractImageKeywords(description: string): string {
  // Remove common words and extract meaningful keywords
  const stopWords = ['image', 'photo', 'picture', 'background', 'for', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'from', 'with', 'by'];
  
  const keywords = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3) // Take only first 3 meaningful keywords
    .join(' ');
    
  return keywords || 'modern business';
}

export async function POST(req: NextRequest) {
  const { htmlCode } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  // Validate input
  if (!htmlCode || typeof htmlCode !== 'string') {
    return NextResponse.json({ error: 'Invalid HTML code' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  const systemMessage = `
    You are an AI assistant that analyzes HTML code to identify specific and unique image requirements.
    Look at the HTML code and identify what types of images would be needed to make this website complete.
    
    IMPORTANT: Each image description must be UNIQUE and SPECIFIC to avoid duplicates.
    Analyze the HTML structure and content to provide contextually relevant image suggestions.
    
    Guidelines:
    - Be very specific about each image's purpose and location
    - Include section names, content context, or specific elements when possible
    - Avoid generic terms - be descriptive and unique
    - Consider the actual content and structure of the HTML
    
    Good examples:
    ["Main hero banner background image", "Company logo for header navigation", "About us team photo", "Services section illustration", "Contact page background pattern"]
    
    Bad examples (too generic/duplicate):
    ["Image 1", "Image 2", "Background Image", "Background Image"]
    
    Only suggest images that would actually improve the website based on the HTML structure.
    Limit to maximum 6 images to avoid overwhelming the user.
    
    Return ONLY the JSON array, no explanations.
  `;

  const userPrompt = `Analyze this HTML code carefully and suggest SPECIFIC and UNIQUE images needed. 
  Look at section names, headings, content context, and HTML structure to provide contextually relevant suggestions.
  Each image description should be unique and specific to its intended location/purpose.
  
  HTML Code:
  ${htmlCode}`;

  try {
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
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to parse the AI response as JSON
    try {
      const images = JSON.parse(aiResponse.trim());
      if (Array.isArray(images)) {
        // Ensure uniqueness and filter out duplicates
        const uniqueImages = (images as string[]).filter((img: string, index: number, arr: string[]) => 
          arr.findIndex((item: string) => item.toLowerCase().trim() === img.toLowerCase().trim()) === index
        );
        
        // Generate automatic image links for each description
        const imagesWithUrls = uniqueImages.map((description, index) => {
          const keywords = extractImageKeywords(description);
          const imageUrl = generateImageUrl(keywords + index); // Add index for uniqueness
          return {
            description,
            url: imageUrl,
            keywords
          };
        });
        
        return NextResponse.json({ 
          images: uniqueImages, // Keep original format for backward compatibility
          imagesWithUrls // New format with automatic URLs
        });
      }
    } catch {
      // If parsing fails, try to extract from the response
      const imageMatch = aiResponse.match(/\[([\s\S]*?)\]/);
      if (imageMatch) {
        try {
          const images = JSON.parse(imageMatch[0]);
          // Ensure uniqueness
          const uniqueImages = (images as string[]).filter((img: string, index: number, arr: string[]) => 
            arr.findIndex((item: string) => item.toLowerCase().trim() === img.toLowerCase().trim()) === index
          );
          
          // Generate automatic image links
          const imagesWithUrls = uniqueImages.map((description, index) => {
            const keywords = extractImageKeywords(description);
            const imageUrl = generateImageUrl(keywords + index); // Add index for uniqueness
            return {
              description,
              url: imageUrl,
              keywords
            };
          });
          
          return NextResponse.json({ 
            images: uniqueImages,
            imagesWithUrls
          });
        } catch {
          // Fallback: extract quoted strings
          const quotedImages = aiResponse.match(/"([^"]+)"/g);
          if (quotedImages) {
            const images = quotedImages.map((img: string) => img.replace(/"/g, ''));
            // Ensure uniqueness
            const uniqueImages = (images as string[]).filter((img: string, index: number, arr: string[]) => 
              arr.findIndex((item: string) => item.toLowerCase().trim() === img.toLowerCase().trim()) === index
            );
            
            // Generate automatic image links
            const imagesWithUrls = uniqueImages.map((description, index) => {
              const keywords = extractImageKeywords(description);
              const imageUrl = generateImageUrl(keywords + index); // Add index for uniqueness
              return {
                description,
                url: imageUrl,
                keywords
              };
            });
            
            return NextResponse.json({ 
              images: uniqueImages,
              imagesWithUrls
            });
          }
        }
      }
    }
    
    return NextResponse.json({ images: [] });
  } catch (error) {
    console.error('Error analyzing images:', error);
    return NextResponse.json({ error: 'Failed to analyze images' }, { status: 500 });
  }
}