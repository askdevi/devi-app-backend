import { NextResponse } from 'next/server';
import { getAstrologicalReading } from '@/lib/gpt';

export async function POST(request: Request) {
  try {
    const { prompt, messages, userId } = await request.json();

    if (!prompt || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await getAstrologicalReading(prompt, messages, userId);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in devi API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}