import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"

// Mock implementation of the enhanced ATS system
class MockEnhancedATSSystem {
  async generateEnhancedATSScore(cvText: string, jobText: string) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Enhanced mock analysis with custom NER results
    const cvWords = cvText.toLowerCase().split(/\s+/)
    const jobWords = jobText.toLowerCase().split(/\s+/)

    // Enhanced skill categories
    const skillCategories = {
      programming: ["python", "javascript", "java", "typescript", "c++", "c#"],
      frameworks: ["react", "angular", "vue", "django", "flask", "spring", "express"],
      databases: ["postgresql", "mongodb", "mysql", "redis", "elasticsearch"],
      cloud: ["aws", "azure", "gcp", "docker", "kubernetes"],
      tools: ["git", "github", "jira", "jenkins", "webpack"],
      ai_ml: ["tensorflow", "pytorch", "scikit-learn", "pandas", "numpy"],
    }

    // Extract skills from text
    const extractedSkills: Record<string, string[]> = {}
    for (const [category, skills] of Object.entries(skillCategories)) {
      extractedSkills[category] = cvWords.filter((word) => skills.some((skill) => word.includes(skill)))
    }

    // Calculate enhanced skill matches
    const skillMatches: Record<string, number> = {}
    for (const [category, skills] of Object.entries(skillCategories)) {
      const jobSkills = jobWords.filter((word) => skills.some((skill) => word.includes(skill)))
      const cvSkills = extractedSkills[category]

      if (jobSkills.length > 0) {
        const intersection = cvSkills.filter((skill) =>
          jobSkills.some((jobSkill) => skill.includes(jobSkill) || jobSkill.includes(skill)),
        ).length
        skillMatches[category] = Math.round((intersection / jobSkills.length) * 100) / 100
      } else {
        skillMatches[category] = Math.random() * 0.3 + 0.2
      }
    }

    // Enhanced similarity scores
    const similarityScores = {
      bert_similarity: Math.random() * 0.3 + 0.5,
      sentence_similarity: Math.random() * 0.3 + 0.5,
      tfidf_similarity: Math.random() * 0.3 + 0.4,
      entity_similarity: Math.random() * 0.4 + 0.4,
    }

    // Calculate enhanced ATS score
    const weights = {
      bert_similarity: 0.25,
      sentence_similarity: 0.25,
      tfidf_similarity: 0.15,
      entity_similarity: 0.2,
      skill_average: 0.15,
    }

    const skillAverage = Object.values(skillMatches).reduce((a, b) => a + b, 0) / Object.values(skillMatches).length

    const atsScore =
      (similarityScores.bert_similarity * weights.bert_similarity +
        similarityScores.sentence_similarity * weights.sentence_similarity +
        similarityScores.tfidf_similarity * weights.tfidf_similarity +
        similarityScores.entity_similarity * weights.entity_similarity +
        skillAverage * weights.skill_average) *
      100

    // Enhanced entities extraction
    const cvEntities = {
      PERSON: ["أحمد بن علي", "فاطمة المنصوري"].filter(() => Math.random() > 0.5),
      SKILL: extractedSkills.programming.concat(extractedSkills.frameworks).slice(0, 5),
      ORG: ["Google", "Microsoft", "TechCorp"].filter(() => Math.random() > 0.3),
      EDUCATION: ["Master en Informatique", "Ingénieur en Informatique"],
      CERTIFICATION: ["AWS Solutions Architect", "Google Cloud Professional"].filter(() => Math.random() > 0.6),
      LANGUAGE: ["Arabe", "Français", "Anglais"],
      SOFT_SKILL: ["leadership", "communication", "travail d'équipe"].filter(() => Math.random() > 0.4),
    }

    // Experience analysis
    const experienceAnalysis = {
      years_detected: [Math.floor(Math.random() * 8) + 2],
      level_indicators: ["senior", "développeur"].filter(() => Math.random() > 0.5),
      estimated_level: Math.random() > 0.6 ? "senior" : "mid-level",
      confidence: Math.random() * 0.3 + 0.7,
    }

    // Quality score
    const qualityScore = {
      completeness: Math.random() * 0.3 + 0.7,
      technical_depth: Math.random() * 0.4 + 0.6,
      experience_clarity: experienceAnalysis.confidence,
      overall_quality: Math.random() * 0.2 + 0.75,
    }

    // Enhanced recommendations
    const allRecommendations = [
      "Ajouter des compétences cloud: Azure, GCP pour améliorer la correspondance",
      "Mentionner des projets concrets avec métriques de performance",
      "Détailler l'expérience avec les frameworks modernes: Next.js, Vue 3",
      "Ajouter des certifications techniques pertinentes au poste",
      "Quantifier les réalisations avec des chiffres et résultats mesurables",
      "Améliorer la section soft skills avec des exemples concrets",
      "Mentionner l'expérience avec les méthodologies agiles (Scrum, Kanban)",
    ]

    const recommendations = allRecommendations
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 3)

    return {
      ats_score: Math.round(atsScore * 100) / 100,
      similarity_scores: similarityScores,
      skill_matches: skillMatches,
      cv_analysis: {
        entities: cvEntities,
        experience_analysis: experienceAnalysis,
        quality_score: qualityScore,
        sentiment: {
          label: Math.random() > 0.2 ? "POSITIVE" : "NEUTRAL",
          score: Math.random() * 0.3 + 0.7,
        },
      },
      job_analysis: {
        entities: {
          SKILL: jobWords
            .filter((word) =>
              Object.values(skillCategories)
                .flat()
                .some((skill) => word.includes(skill)),
            )
            .slice(0, 6),
          ORG: ["Notre entreprise"],
          EXPERIENCE: ["3-5 ans", "senior"],
        },
        experience_requirements: {
          years_detected: [3, 5],
          level_indicators: ["senior", "expérimenté"],
          estimated_level: "senior",
          confidence: 0.8,
        },
        job_type: {
          labels: ["développement", "technique", "full-stack"],
          scores: [0.8, 0.7, 0.6],
        },
        sentiment: {
          label: "POSITIVE",
          score: 0.85,
        },
      },
      recommendations: recommendations,
    }
  }
}

// Function to call Python enhanced analyzer (for production)
async function callEnhancedPythonAnalyzer(cvText: string, jobText: string) {
  try {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python", [
        "lib/enhanced_ats_system.py",
        JSON.stringify({ cv_text: cvText, job_text: jobText }),
      ])

      let result = ""
      let errorOutput = ""

      pythonProcess.stdout.on("data", (data) => {
        result += data.toString()
      })

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString()
      })

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Enhanced Python process exited with code ${code}: ${errorOutput}`))
        } else {
          try {
            resolve(JSON.parse(result))
          } catch (e) {
            reject(new Error(`Failed to parse enhanced Python output: ${result}`))
          }
        }
      })
    })
  } catch (error) {
    console.error("Error calling enhanced Python analyzer:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cvText, jobText } = await request.json()

    if (!cvText || !jobText) {
      return NextResponse.json(
        {
          error: "CV text and job text are required",
        },
        { status: 400 },
      )
    }

    // Use enhanced mock analyzer for now
    // In production, replace with: const result = await callEnhancedPythonAnalyzer(cvText, jobText)
    const analyzer = new MockEnhancedATSSystem()
    const result = await analyzer.generateEnhancedATSScore(cvText, jobText)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in enhanced CV analysis:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
