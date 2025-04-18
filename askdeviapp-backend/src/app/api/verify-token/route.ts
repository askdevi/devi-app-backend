import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/lib/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userRecord = await adminAuth.getUser(decodedToken.uid);
    
    return res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        exists: true, // Add your custom logic here
        redirect: req.query.redirect || null
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
