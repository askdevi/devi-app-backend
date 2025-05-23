import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { db } = getFirebaseAdmin();

    // Run the deletion process in background (non-blocking)
    (async () => {
      const snapshot = await db
        .collection('users')
        .where('userId', '==', userId)
        .get();

      if (snapshot.empty) return;

      const deletePromises = snapshot.docs.map(async (doc) => {
        const userDocRef = doc.ref;

        // Delete user doc
        await userDocRef.delete();

        // Delete associated chats
        const chatsSnapshot = await db
          .collection('chats')
          .where('userId', '==', userId)
          .get();
        await Promise.all(chatsSnapshot.docs.map(chatDoc => chatDoc.ref.delete()));

        // Delete dailyBlessings
        const blessingsSnapshot = await db
          .collection('dailyBlessings')
          .where('userId', '==', userId)
          .get();
        await Promise.all(blessingsSnapshot.docs.map(b => b.ref.delete()));

        // Delete relationships
        const relationshipsSnapshot = await db
          .collection('relationships')
          .where('userId', '==', userId)
          .get();
        await Promise.all(relationshipsSnapshot.docs.map(r => r.ref.delete()));
      });

      await Promise.all(deletePromises);
    })();

    // Return response immediately
    return NextResponse.json({ message: 'Deletion initiated in background' });

  } catch (error: any) {
    console.error('Delete User API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate deletion' },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from 'next/server';
// import { getFirebaseAdmin } from '@/lib/firebase-admin';

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get('userId');

//     if (!userId) {
//       return NextResponse.json(
//         { error: 'userId is required' },
//         { status: 400 }
//       );
//     }

//     const { db } = getFirebaseAdmin();

//     // Query user documents by userId
//     const snapshot = await db
//       .collection('users')
//       .where('userId', '==', userId)
//       .get();

//     if (snapshot.empty) {
//       return NextResponse.json(
//         { error: 'No user found with given userId' },
//         { status: 404 }
//       );
//     }

//     // Delete all matching user documents from all collections
//     const deletePromises = snapshot.docs.map(async (doc) => {
//       const userDocRef = doc.ref;
//       const userId = doc.id;

//       // Delete user document
//       await userDocRef.delete();

//       // Delete associated chats
//       const chatsSnapshot = await db
//         .collection('chats')
//         .where('userId', '==', userId)
//         .get();
//       const deleteChatPromises = chatsSnapshot.docs.map(chatDoc => chatDoc.ref.delete());
//       await Promise.all(deleteChatPromises);

//       //Delete associated dailyBlessings
//         const dailyBlessingsSnapshot = await db
//             .collection('dailyBlessings')
//             .where('userId', '==', userId)
//             .get();
//         const deleteDailyBlessingsPromises = dailyBlessingsSnapshot.docs.map(dailyBlessingDoc => dailyBlessingDoc.ref.delete());
//         await Promise.all(deleteDailyBlessingsPromises);

//         //Delete associated relationships
//         const relationshipsSnapshot = await db
//             .collection('relationships')
//             .where('userId', '==', userId)
//             .get();
//         const deleteRelationshipsPromises = relationshipsSnapshot.docs.map(relationshipDoc => relationshipDoc.ref.delete());
//         await Promise.all(deleteRelationshipsPromises);
//     });

//     await Promise.all(deletePromises);

//     return NextResponse.json({ message: 'User deleted successfully' });
//   } catch (error: any) {
//     console.error('Delete User API error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to delete user' },
//       { status: 500 }
//     );
//   }
// }