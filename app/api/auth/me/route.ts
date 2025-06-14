import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    try {
      // Décoder le token de session
      const sessionData = JSON.parse(Buffer.from(sessionToken, "base64").toString())

      // Vérifier l'expiration
      if (Date.now() > sessionData.exp) {
        return NextResponse.json({ error: "Session expirée" }, { status: 401 })
      }

      return NextResponse.json({
        user: {
          id: sessionData.userId,
          name: sessionData.name,
          email: sessionData.email,
          userType: sessionData.userType,
        },
      })
    } catch (decodeError) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erreur vérification session:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
