import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  const userData = await request.json();

  if (!userData.userId || !userData.phoneNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await setDoc(doc(db, 'users', userData.userId), {
      ...userData,
      tokens: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
