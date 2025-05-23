import { NextResponse } from 'next/server';
import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const options = {
      method: 'POST',
      url: 'https://control.msg91.com/api/v5/otp',
      params: {
        template_id: '6819053ad6fc050a676c6672',
        mobile: phoneNumber,
        authkey: MSG91_AUTH_KEY || '',
        otp_expiry: '60' // OTP expires in 60 minutes
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.request(options);
    
    if (response.data.type === 'success') {
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        requestId: response.data.request_id 
      });
    } else {
      throw new Error(response.data.message || 'Failed to send OTP');
    }

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send OTP' 
    }, { status: 500 });
  }
} 