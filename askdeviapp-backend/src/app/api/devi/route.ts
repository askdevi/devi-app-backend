import { NextRequest, NextResponse } from 'next/server';
import { getAstrologicalReading } from '@/lib/gpt';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { db } = getFirebaseAdmin();

    const body = await request.json();
    const { prompt, messages, userId, chatStartTime } = body;

    if (!prompt || !messages || !userId || !chatStartTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const chatStartTimeDate = new Date(Number(chatStartTime)).toISOString();

    const chatsRef = db.collection('chats');

    let query = chatsRef.where('userId', '==', userId);
    query = query.where('chatStartTime', '==', chatStartTime);

    const querySnapshot = await query.get();

    let chatDocRef;

    if (querySnapshot.empty) {
      chatDocRef = chatsRef.doc();
      await chatDocRef.set({
        userId,
        messages,
        chatStartTime,
        createdAt: chatStartTimeDate,
        lastUpdated: chatStartTimeDate,
        isActive : true,
        endReason : "auto",
        saveCount : 0,
      });
    } else {
      chatDocRef = querySnapshot.docs[0].ref;
    }

    const gptResponse = await getAstrologicalReading(prompt, messages, userId);

    // gptResponse.part is any array of strings. join them to make answer string.
    const answer = gptResponse.parts.join("\n");


    // Update the chat document with the new message of both user(prompt) and assistant
    await chatDocRef.update({
      messages: FieldValue.arrayUnion({
        role: "user",
        content: prompt,
        id: Date.now().toString(),
      },
      {
        role : "assistant",
        content : answer,
        id: Date.now().toString(),
      }),
      lastUpdated: new Date().toISOString(),
      saveCount: FieldValue.increment(1),
    });

    // Return the GPT split response and parts
    return NextResponse.json({
      splitResponse: gptResponse.splitResponse,
      parts: gptResponse.parts,
    });

  } catch (error) {
    console.error('Devi API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
