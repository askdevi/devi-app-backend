import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { getBirthChart } from '@/lib/astrology/birthchart';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      phoneNumber,
      firstName,
      lastName,
      birthDate,
      birthTime,
      birthPlace,
      gender,
      preferredLanguage,
      relationshipStatus,
      occupation
    } = body;

    // Basic validation
    if (
      !userId ||
      !phoneNumber ||
      !firstName ||
      !lastName ||
      !birthDate ||
      !birthTime ||
      !birthPlace?.latitude ||
      !birthPlace?.longitude
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate birth chart
    const birthChartDetails = await getBirthChart({
      date: birthDate,
      time: birthTime,
      location: {
        latitude: birthPlace.latitude,
        longitude: birthPlace.longitude
      }
    });

    // Initialize Firebase Admin
    const { db } = getFirebaseAdmin();
    const { FieldValue } = await import('firebase-admin/firestore');

    // Prepare user data
    const userData = {
      userId,
      phoneNumber,
      firstName,
      lastName,
      birthDate,
      birthTime,
      birthPlace,
      gender: gender || null,
      preferredLanguage: preferredLanguage || null,
      relationshipStatus: relationshipStatus || null,
      occupation: occupation || null,
      birthChart: birthChartDetails,
      tokens: 3,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    // Write to Firestore
    await db.doc(`users/${userId}`).set(userData);

    return NextResponse.json({
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to register user' }, { status: 500 });
  }
}
