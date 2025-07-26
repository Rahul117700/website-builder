import { NextRequest, NextResponse } from 'next/server';

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate form submission data
export function validateFormData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required fields
  if (!data || typeof data !== 'object') {
    errors.push('Invalid form data');
    return { isValid: false, errors };
  }

  // Validate email if present
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate URL if present
  if (data.website && !isValidUrl(data.website)) {
    errors.push('Invalid website URL');
  }

  // Check for suspicious content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          errors.push(`Suspicious content detected in ${key}`);
          break;
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Middleware to validate request body
export function validateRequestBody(req: NextRequest): { isValid: boolean; errors: string[] } {
  try {
    const body = req.body;
    if (!body) {
      return { isValid: false, errors: ['Request body is required'] };
    }
    return { isValid: true, errors: [] };
  } catch (error) {
    return { isValid: false, errors: ['Invalid request body'] };
  }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .substring(0, 1000); // Limit length
} 