import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chatStartTime = searchParams.get('chatStartTime');

    if (!userId || !chatStartTime) {
      return NextResponse.json(
        { error: 'userId and chatStartTime are required' },
        { status: 400 }
      );
    }

    const { db } = getFirebaseAdmin();

    // Query chat documents by userId and chatStartTime
    const snapshot = await db
      .collection('chats')
      .where('userId', '==', userId)
      .where('chatStartTime', '==', chatStartTime)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'No chat found with given userId and chatStartTime' },
        { status: 404 }
      );
    }

    // Delete all matching chat documents (usually should be one)
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error: any) {
    console.error('Delete Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
