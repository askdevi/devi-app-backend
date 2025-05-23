import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();

    // Fetch chats for the user without requiring a composite index
    const snapshot = await db
      .collection('chats')
      .where('userId', '==', userId)
      .get();

    // Map and sort on server side by createdAt descending
    const chats = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          createdAt: data.createdAt,
          lastUpdated: data.updatedAt,
          chatStartTime: data.chatStartTime,
          messages: data.messages || []
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error('Chat History API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
