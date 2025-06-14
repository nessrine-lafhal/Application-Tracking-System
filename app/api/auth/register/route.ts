import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 })
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
    }

    // Simulation de vérification d'email existant
    const existingEmails = [
      "ahmed.benali@email.com",
      "fatima.mansouri@email.com",
      "mohamed.trabelsi@email.com",
      "sara.mansouri@techcorp.com",
      "youssef.ben.salem@innovate.tn",
    ]

    if (existingEmails.includes(email)) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    // Simulation de création de compte
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      userType: "candidate",
      createdAt: new Date().toISOString(),
    }

    // En production, sauvegarder en base de données
    console.log("Nouveau candidat créé:", newUser)

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
      },
    })
  } catch (error) {
    console.error("Erreur d'inscription:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
