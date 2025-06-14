import { type NextRequest, NextResponse } from "next/server"

// Mock implementation of the ATS system for the frontend
// In production, this would call the Python backend
class MockATSSystem {
  async generateATSScore(cvText: string, jobText: string) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis based on text content
    const cvWords = cvText.toLowerCase().split(/\s+/)
    const jobWords = jobText.toLowerCase().split(/\s+/)

    // Simple keyword matching for demo
    const techKeywords = ["python", "javascript", "react", "node", "sql", "aws", "docker", "git"]
    const cvTechSkills = cvWords.filter((word) => techKeywords.includes(word))
    const jobTechSkills = jobWords.filter((word) => techKeywords.includes(word))

    // Calculate mock scores
    const skillMatch =
      jobTechSkills.length > 0
        ? cvTechSkills.filter((skill) => jobTechSkills.includes(skill)).length / jobTechSkills.length
        : 0

    const baseScore = Math.random() * 30 + 50 // Random base score between 50-80
    const skillBonus = skillMatch * 20 // Up to 20 points for skill matching
    const lengthBonus = Math.min((cvText.length / 1000) * 5, 10) // Up to 10 points for CV length

    const finalScore = Math.min(baseScore + skillBonus + lengthBonus, 100)

    return {
      ats_score: Math.round(finalScore * 100) / 100,
      similarity_scores: {
        bert_similarity: Math.random() * 0.3 + 0.4,
        sentence_similarity: Math.random() * 0.3 + 0.4,
        tfidf_similarity: Math.random() * 0.3 + 0.3,
      },
      skill_matches: {
        languages: Math.random() * 0.5 + 0.3,
        frameworks: Math.random() * 0.4 + 0.2,
        databases: Math.random() * 0.6 + 0.2,
        cloud: Math.random() * 0.3 + 0.1,
        tools: Math.random() * 0.7 + 0.2,
      },
      cv_analysis: {
        entities: {
          PERSON: ["Jean Dupont"],
          ORG: ["TechCorp", "Google"],
          TECHNOLOGIES: cvTechSkills,
        },
        skills: {
          languages: cvWords.filter((w) => ["python", "javascript", "java"].includes(w)),
          frameworks: cvWords.filter((w) => ["react", "django", "flask"].includes(w)),
          databases: cvWords.filter((w) => ["postgresql", "mongodb", "mysql"].includes(w)),
        },
        sentiment: {
          label: Math.random() > 0.3 ? "POSITIVE" : "NEUTRAL",
          score: Math.random() * 0.3 + 0.7,
        },
      },
      job_analysis: {
        entities: {
          ORG: ["Notre entreprise"],
          TECHNOLOGIES: jobTechSkills,
        },
        skills: {
          languages: jobWords.filter((w) => ["python", "javascript", "java"].includes(w)),
          frameworks: jobWords.filter((w) => ["react", "django", "flask"].includes(w)),
          databases: jobWords.filter((w) => ["postgresql", "mongodb", "mysql"].includes(w)),
        },
        sentiment: {
          label: "POSITIVE",
          score: 0.8,
        },
        experience_level: {
          labels: ["junior", "mid-level", "senior"],
          scores: [0.2, 0.5, 0.3],
        },
      },
      recommendations: [
        "Ajouter plus de détails sur vos projets récents",
        "Mentionner votre expérience avec les méthodologies agiles",
        "Inclure des certifications techniques pertinentes",
        "Quantifier vos réalisations avec des métriques",
      ],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cvText, jobText } = await request.json()

    if (!cvText || !jobText) {
      return NextResponse.json({ error: "CV text and job text are required" }, { status: 400 })
    }

    // Initialize mock ATS system
    const ats = new MockATSSystem()

    // Generate ATS score
    const result = await ats.generateATSScore(cvText, jobText)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing CV:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
