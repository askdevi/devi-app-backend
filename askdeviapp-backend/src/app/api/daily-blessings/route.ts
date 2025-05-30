import { NextRequest, NextResponse } from 'next/server';
import { getDailyBlessings } from '@/lib/getDailyBlessings';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // get from dailyBlessings collection
    const { db } = getFirebaseAdmin();
    const blessingsRef = db.collection('dailyBlessings');
    const blessingsSnapshot = await blessingsRef
      .where('userId', '==', userId)
      .get();

    let blessingsData;
    if (blessingsSnapshot.empty) {
      blessingsData = await getDailyBlessings(userId);
      //update in dailyBlessings collection
      await blessingsRef.add({
        ...blessingsData,
      });
    }
    else if (blessingsSnapshot.docs[0].data().date == new Date().toDateString()) {
      blessingsData = blessingsSnapshot.docs[0].data();      
    }
    else{
      blessingsData = await getDailyBlessings(userId); 
      //update in dailyBlessings collection in the same document
      await blessingsRef.doc(blessingsSnapshot.docs[0].id).update({
        ...blessingsData,
      });
    }

    // "userId" is in the blessingsData, but we don't need to send it to the client

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