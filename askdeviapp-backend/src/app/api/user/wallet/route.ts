import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore" // Import Firestore modular functions

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]
    
    // Verify the ID token using Firebase REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error.message || "Token verification failed")
    }

    const userId = data.users[0].localId

    // Get user data from Firestore using modular API
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    // Existence check is now a method call, not a property
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    return NextResponse.json({
      tokens: userData?.tokens || 0,
      remainingTime: userData?.remainingTime || "0h 0m"
    })

  } catch (error) {
    console.error("Error fetching wallet data:", error)
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 })
  }
}
