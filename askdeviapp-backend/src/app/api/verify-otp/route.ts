import { NextResponse } from 'next/server';
import axios from 'axios';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const otp = searchParams.get('otp');

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP with MSG91
    const otpOptions = {
      method: 'GET',
      url: 'https://control.msg91.com/api/v5/otp/verify',
      params: {
        otp,
        mobile: phoneNumber
      },
      headers: {
        authkey: MSG91_AUTH_KEY || ''
      }
    };

    const otpResponse = await axios.request(otpOptions);
    const otpData = otpResponse.data;

    if (otpData.type !== 'success') {
      throw new Error(otpData.message || 'Invalid OTP');
    }

    // Initialize Firebase Admin
    const { auth } = getFirebaseAdmin();
    const phoneNumberWithPlus = `+${phoneNumber}`;
    let userRecord;
    let exists = true;

    try {
      // Try to fetch existing user by phone number
      userRecord = await auth.getUserByPhoneNumber(phoneNumberWithPlus);
    } catch (err: any) {
      // User not found, create a new one
      // exists = false;
      userRecord = await auth.createUser({
        phoneNumber: phoneNumberWithPlus,
        displayName: `User ${phoneNumber}`
      });
    }

    //if userId is not in users document exists = false
    const { db } = getFirebaseAdmin();
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef
      .where('userId', '==', userRecord.uid)
      .get();
    if (userSnapshot.empty) {
      exists = false;
    }

    // Create custom token for client-side Firebase authentication
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      message: 'OTP verified successfully',
      userId: userRecord.uid,
      // customToken,
      exists
    });
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
