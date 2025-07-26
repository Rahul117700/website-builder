import { NextRequest, NextResponse } from 'next/server';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  // Handle known errors
  if (error instanceof CustomError) {
    return NextResponse.json(
      { 
        error: error.message,
        status: 'error'
      }, 
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      { 
        error: 'A record with this information already exists',
        status: 'error'
      }, 
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { 
        error: 'Record not found',
        status: 'error'
      }, 
      { status: 404 }
    );
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: error.message,
        status: 'error'
      }, 
      { status: 400 }
    );
  }

  // Handle authentication errors
  if (error.message?.includes('Unauthorized') || error.statusCode === 401) {
    return NextResponse.json(
      { 
        error: 'Authentication required',
        status: 'error'
      }, 
      { status: 401 }
    );
  }

  // Handle rate limiting errors
  if (error.message?.includes('Too many requests')) {
    return NextResponse.json(
      { 
        error: 'Too many requests, please try again later',
        status: 'error'
      }, 
      { status: 429 }
    );
  }

  // Default error response
  return NextResponse.json(
    { 
      error: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : error.message,
      status: 'error'
    }, 
    { status: 500 }
  );
}

export function withErrorHandler(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Common error messages
export const ErrorMessages = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_FAILED: 'Please check your input and try again',
  SERVER_ERROR: 'Something went wrong on our end',
  RATE_LIMITED: 'Too many requests, please try again later',
  INVALID_INPUT: 'Invalid input provided',
} as const; 