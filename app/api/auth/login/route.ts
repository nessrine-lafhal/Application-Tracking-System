import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Base de données mock des utilisateurs
const users = {
  candidates: [
    {
      id: "1",
      name: "أحمد بن علي",
      email: "ahmed.benali@email.com",
      password: "demo123",
      phone: "+216 20 123 456",
      userType: "candidate",
    },
    {
      id: "2",
      name: "فاطمة المنصوري",
      email: "fatima.mansouri@email.com",
      password: "demo123",
      phone: "+216 25 789 012",
      userType: "candidate",
    },
    {
      id: "3",
      name: "محمد الطرابلسي",
      email: "mohamed.trabelsi@email.com",
      password: "demo123",
      phone: "+216 22 345 678",
      userType: "candidate",
    },
  ],
  recruiters: [
    {
      id: "4",
      name: "سارة المنصوري",
      email: "sara.mansouri@techcorp.com",
      password: "recruiter123",
      company: "TechCorp Tunisia",
      userType: "recruiter",
    },
    {
      id: "5",
      name: "يوسف بن سالم",
      email: "youssef.ben.salem@innovate.tn",
      password: "recruiter123",
      company: "Innovate Solutions",
      userType: "recruiter",
    },
  ],
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Email, mot de passe et type d'utilisateur requis" }, { status: 400 })
    }

    // Recherche de l'utilisateur selon le type
    const userList = userType === "candidate" ? users.candidates : users.recruiters
    const user = userList.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Création du token de session (simple pour la démo)
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
      }),
    ).toString("base64")

    // Configuration du cookie de session
    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    })
  } catch (error) {
    console.error("Erreur de connexion:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
