import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
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

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    const { db } = getFirebaseAdmin();
    const { FieldValue } = await import('firebase-admin/firestore');

    // Collect only provided fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (birthTime !== undefined) updateData.birthTime = birthTime;
    if (birthPlace?.latitude !== undefined && birthPlace?.longitude !== undefined) {
      updateData.birthPlace = birthPlace;
    }
    if (gender !== undefined) updateData.gender = gender;
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
    if (relationshipStatus !== undefined) updateData.relationshipStatus = relationshipStatus;
    if (occupation !== undefined) updateData.occupation = occupation;

    updateData.updatedAt = FieldValue.serverTimestamp();

    // Update Firestore
    await db.doc(`users/${userId}`).update(updateData);

    return NextResponse.json({
      message: 'Profile updated successfully',
      status: 200
    });
  } catch (error: any) {
    console.error('Update Profile API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
