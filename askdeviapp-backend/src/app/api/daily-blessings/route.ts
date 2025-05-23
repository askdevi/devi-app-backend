import { NextRequest, NextResponse } from 'next/server';
import { getDailyBlessings } from '@/lib/getDailyBlessings';

export async function GET(request: NextRequest) {
  try {

    // Get userId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // If no userId provided, use the authenticated user's ID
    const targetUserId = userId

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get daily blessings data
    const blessingsData = await getDailyBlessings(targetUserId);

    // Return the data
    return NextResponse.json(blessingsData);
  } catch (error: any) {
    console.error('Daily Blessings API Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Failed to retrieve daily blessings', details: error.message },
      { status: 500 }
    );
  }
} 