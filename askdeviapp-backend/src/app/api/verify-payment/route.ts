import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { signInWithCustomToken } from "firebase/auth"
import { db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const userCredential = await signInWithCustomToken(auth, token)
    const userId = userCredential.user.uid

    const { razorpay_payment_id, tokensBought, timeDuration, amountPaid } = await request.json()
    
    if (!razorpay_payment_id) {
      return NextResponse.json({ error: "Invalid payment data" }, { status: 400 })
    }

    const userRef = db.collection("users").doc(userId)
    const transactionRef = db.collection("transactions").doc()

    if (tokensBought > 0) {
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef)
        const currentTokens = userDoc.data()?.tokens || 0
        
        transaction.update(userRef, {
          tokens: currentTokens + tokensBought,
          updatedAt: new Date(),
        })
        
        transaction.set(transactionRef, {
          userId,
          paymentId: razorpay_payment_id,
          amount: amountPaid,
          tokensBought,
          createdAt: new Date(),
          status: "completed",
        })
      })
    } 
    else if (timeDuration) {
      let durationMs = 0
      switch(timeDuration) {
        case "10 Minutes": durationMs = 600000; break;
        case "1 Hour": durationMs = 3600000; break;
        case "1 Day": durationMs = 86400000; break;
      }

      const now = new Date()
      let expiresAt = new Date(now.getTime() + durationMs)

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef)
        const userData = userDoc.data() || {}
        
        if (userData.timePackage?.expiresAt?.toDate() > now) {
          expiresAt = new Date(userData.timePackage.expiresAt.toDate().getTime() + durationMs)
        }

        transaction.update(userRef, {
          timePackage: {
            name: timeDuration,
            purchasedAt: now,
            expiresAt: expiresAt,
          },
          updatedAt: now,
        })
        
        transaction.set(transactionRef, {
          userId,
          paymentId: razorpay_payment_id,
          amount: amountPaid,
          timeDuration,
          createdAt: now,
          status: "completed",
        })
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
