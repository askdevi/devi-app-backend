import { NextResponse } from 'next/server';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: Request) {
  const { verificationId, code } = await request.json();

  if (!verificationId || !code) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Use Firebase Authentication to verify OTP
    const confirmationResult = await signInWithPhoneNumber(auth, verificationId, code);

    return NextResponse.json({
      success: true,
      userId: confirmationResult.user.uid,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid verification code' },
      { status: 400 }
    );
  }
}
