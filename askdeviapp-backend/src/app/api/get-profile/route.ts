import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();

    const docRef = db.doc(`users/${userId}`);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = docSnap.data();

    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Exclude sensitive or unwanted fields
    const filteredUserData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate,
      birthTime: userData.birthTime,
      gender: userData.gender,
      preferredLanguage: userData.preferredLanguage,
      relationshipStatus: userData.relationshipStatus,
      occupation: userData.occupation,
      birthPlace: userData.birthPlace,
      tokens: userData?.tokens || 0,
      timeEnd: userData?.timeEnd ? userData.timeEnd.toDate() : new Date()
    };

    return NextResponse.json({
      message: 'Profile fetched successfully',
      user: filteredUserData
    });
  } catch (error: any) {
    console.error('Get Profile API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
