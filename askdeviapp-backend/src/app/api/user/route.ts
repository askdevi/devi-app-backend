import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return NextResponse.json({
        exists: true,
        userData: userDoc.data(),
      });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { error: 'Failed to check user existence' },
      { status: 500 }
    );
  }
}
