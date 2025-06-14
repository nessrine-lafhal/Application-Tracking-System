import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// Mock implementation for the frontend
// In production, this would call the Python document authenticator
class MockDocumentProcessor {
  private documentTypes = {
    bac: ["baccalauréat", "diplôme", "académie", "mention", "lycée"],
    cin: ["carte", "identité", "nationale", "cin", "cni", "république"],
    master: ["master", "magistère", "université", "faculté", "grade"],
    doctorat: ["doctorat", "thèse", "phd", "docteur", "recherche"],
    permis: ["permis", "conduire", "transport", "véhicule", "catégorie"],
    licence: ["licence", "bachelor", "université", "grade", "formation"],
  }

  private async extractTextFromImage(imagePath: string): Promise<string> {
    // Mock OCR extraction
    // In production, this would use the Python OCR system
    const mockTexts = {
      bac: "RÉPUBLIQUE FRANÇAISE ACADÉMIE DE PARIS DIPLÔME DU BACCALAURÉAT GÉNÉRAL Série S Sciences et Technologies Délivré à Jean DUPONT Né le 15/03/2000 Mention BIEN Session 2018",
      cin: "CARTE NATIONALE D'IDENTITÉ RÉPUBLIQUE FRANÇAISE DUPONT Jean Marie Né le 15/03/1995 à PARIS Nationalité française N° 123456789012 Valable jusqu'au 15/03/2030",
      master:
        "UNIVERSITÉ DE PARIS DIPLÔME NATIONAL DE MASTER Mention Informatique Spécialité Intelligence Artificielle Délivré à Marie MARTIN Année universitaire 2022-2023 Grade de Master",
      licence:
        "UNIVERSITÉ DE LYON DIPLÔME NATIONAL DE LICENCE Mention Mathématiques Délivré à Pierre BERNARD Année universitaire 2021-2022 Grade de Licence",
      permis:
        "PERMIS DE CONDUIRE RÉPUBLIQUE FRANÇAISE MARTIN Sophie Née le 20/08/1990 Catégories B Délivré le 15/06/2010 Valable jusqu'au 15/06/2025",
      doctorat:
        "UNIVERSITÉ SORBONNE DIPLÔME DE DOCTORAT Spécialité Informatique Thèse soutenue par Dr. Antoine ROUSSEAU Directeur de thèse Prof. LAMBERT Année 2023",
    }

    // Simple classification based on filename or random selection
    const types = Object.keys(mockTexts) as Array<keyof typeof mockTexts>
    const randomType = types[Math.floor(Math.random() * types.length)]
    return mockTexts[randomType]
  }

  private classifyDocumentType(text: string): string {
    const textLower = text.toLowerCase()
    const scores: Record<string, number> = {}

    for (const [docType, keywords] of Object.entries(this.documentTypes)) {
      scores[docType] = keywords.reduce((score, keyword) => {
        return score + (textLower.includes(keyword) ? 1 : 0)
      }, 0)
    }

    const bestType = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))[0]
    return scores[bestType] > 0 ? bestType : "unknown"
  }

  private calculateAuthenticityScore(documentType: string, text: string): number {
    // Mock authenticity calculation
    const baseScore = Math.random() * 30 + 60 // 60-90 base score

    // Bonus for expected keywords
    const keywords = this.documentTypes[documentType as keyof typeof this.documentTypes] || []
    const keywordMatches = keywords.filter((keyword) => text.toLowerCase().includes(keyword)).length
    const keywordBonus = (keywordMatches / keywords.length) * 20

    // Text length bonus
    const lengthBonus = Math.min(text.length / 100, 10)

    return Math.min(baseScore + keywordBonus + lengthBonus, 100)
  }

  async processDocument(imageBuffer: Buffer, filename: string) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Save image temporarily (in production, this would be handled by the Python service)
    const uploadsDir = join(process.cwd(), "uploads", "documents")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const imagePath = join(uploadsDir, `${Date.now()}_${filename}`)
    await writeFile(imagePath, imageBuffer)

    // Extract text (mock)
    const extractedText = await this.extractTextFromImage(imagePath)

    // Classify document type
    const documentType = this.classifyDocumentType(extractedText)

    // Calculate authenticity
    const authenticityScore = this.calculateAuthenticityScore(documentType, extractedText)

    // Generate detailed results
    const results = {
      classification: {
        document_type: documentType,
        ocr_confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        text_content: extractedText.substring(0, 200) + (extractedText.length > 200 ? "..." : ""),
        metadata: {
          image_path: imagePath,
          processed_at: new Date().toISOString(),
          text_length: extractedText.length,
          layout_elements: Math.floor(Math.random() * 20) + 10,
        },
      },
      authentication: {
        is_authentic: authenticityScore >= 75,
        confidence: authenticityScore / 100,
        authenticity_score: authenticityScore,
        document_type: documentType,
        alerts: this.generateAlerts(authenticityScore, extractedText),
        similarities: {
          text: Math.random() * 0.3 + 0.6,
          layout: Math.random() * 0.3 + 0.6,
          visual: Math.random() * 0.3 + 0.5,
          global: authenticityScore / 100,
        },
        best_match: authenticityScore >= 75 ? `${documentType}_ref_001` : null,
      },
      processed_at: new Date().toISOString(),
    }

    return results
  }

  private generateAlerts(score: number, text: string): string[] {
    const alerts: string[] = []

    if (score < 75) {
      alerts.push(`Score d'authenticité faible: ${score.toFixed(1)}/100`)
    }

    if (text.length < 100) {
      alerts.push("Contenu textuel insuffisant pour une vérification complète")
    }

    if (score < 60) {
      alerts.push("Document potentiellement falsifié - vérification manuelle recommandée")
    }

    if (Math.random() < 0.3) {
      alerts.push("Qualité d'image sous-optimale - peut affecter la précision")
    }

    return alerts
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("document") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non supporté" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10MB)" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process document
    const processor = new MockDocumentProcessor()
    const results = await processor.processDocument(buffer, file.name)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: "Erreur lors du traitement du document" }, { status: 500 })
  }
}

// Add reference document endpoint
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("document") as File
    const docId = formData.get("docId") as string

    if (!file || !docId) {
      return NextResponse.json({ error: "Fichier et ID requis" }, { status: 400 })
    }

    // In production, this would add the document to the reference database
    // For now, we'll just simulate success
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Document de référence ${docId} ajouté avec succès`,
      document_type: "bac", // Mock type
    })
  } catch (error) {
    console.error("Error adding reference document:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout du document de référence" }, { status: 500 })
  }
}
