import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    res.status(400).json({ 
      error: "Use React Native client to send OTP (reCAPTCHA requires browser environment)" 
    });
}
