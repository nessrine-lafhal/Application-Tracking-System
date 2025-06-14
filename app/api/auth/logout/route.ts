import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Supprimer le cookie de session
    const cookieStore = await cookies()
    cookieStore.delete("session")

    return NextResponse.json({
      success: true,
      message: "Déconnexion réussie",
    })
  } catch (error) {
    console.error("Erreur de déconnexion:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
