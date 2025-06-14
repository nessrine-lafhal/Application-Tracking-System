import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import { writeFile } from "fs/promises"
import path from "path"
import os from "os"

// Mock implementation for frontend testing
// In production, this would call the Python backend
class MockCVImageAnalyzer {
  async analyzeCVImage(imageBase64: string, jobDescription: string) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Extract image type for better mock data
    let imageType = "unknown"
    if (imageBase64.startsWith("data:image/")) {
      const match = imageBase64.match(/data:image\/([a-zA-Z0-9]+);base64,/)
      if (match && match[1]) {
        imageType = match[1]
      }
    }

    // Generate mock skill matches
    const skillCategories = ["programmation", "frameworks", "data_science", "databases", "cloud", "soft_skills"]

    const skillMatches: Record<string, number> = {}
    skillCategories.forEach((category) => {
      skillMatches[category] = Math.round((Math.random() * 60 + 40) * 100) / 100 // 40-100%
    })

    // Generate mock skills
    const programmingSkills = ["python", "javascript", "java", "c++"]
    const frameworkSkills = ["react", "angular", "django", "flask"]
    const dataSkills = ["machine learning", "tensorflow", "nlp"]
    const dbSkills = ["mysql", "mongodb", "postgresql"]
    const cloudSkills = ["aws", "docker", "kubernetes"]
    const softSkills = ["communication", "travail d'équipe", "leadership"]

    // Randomly select skills from each category
    const getRandomSubset = (arr: string[], min: number, max: number) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min
      return arr.sort(() => 0.5 - Math.random()).slice(0, count)
    }

    const skills = {
      programmation: getRandomSubset(programmingSkills, 1, 3),
      frameworks: getRandomSubset(frameworkSkills, 0, 2),
      data_science: getRandomSubset(dataSkills, 0, 2),
      databases: getRandomSubset(dbSkills, 0, 2),
      cloud: getRandomSubset(cloudSkills, 0, 2),
      soft_skills: getRandomSubset(softSkills, 1, 3),
    }

    // Generate mock education and experience
    const education = [
      "Master en Informatique, Université de Tunis, 2018-2020",
      "Licence en Génie Logiciel, École Nationale d'Ingénieurs, 2015-2018",
    ]

    const experience = [
      "Développeur Full Stack, TechCorp, 2020-Présent",
      "Stage Développeur Backend, StartupTN, 2019",
      "Projet académique: Système de recommandation basé sur ML, 2018",
    ]

    // Calculate mock scores
    const similarityScore = Math.round((Math.random() * 30 + 60) * 100) / 100 // 60-90%
    const globalScore = Math.round((Math.random() * 20 + 70) * 100) / 100 // 70-90%

    // Generate mock recommendations
    const allRecommendations = [
      "Ajouter des compétences en cloud: Azure, GCP",
      "Mentionner l'expérience avec les frameworks: Vue.js, Express",
      "Mettre en avant les soft skills: résolution de problèmes, créativité",
      "Ajouter des compétences en data science: scikit-learn, pandas",
      "Mentionner l'expérience avec les bases de données: Redis, Elasticsearch",
      "Améliorer la correspondance en ajoutant plus de mots-clés de l'offre d'emploi",
      "Quantifier vos réalisations avec des métriques et résultats concrets",
    ]

    const recommendations = getRandomSubset(allRecommendations, 2, 4)

    // Generate mock extracted text
    const extractedText = `
CURRICULUM VITAE

${Math.random() > 0.5 ? "أحمد بن علي" : "فاطمة المنصوري"}
Développeur ${Math.random() > 0.5 ? "Full Stack" : "Data Scientist"}

CONTACT
Email: ${Math.random() > 0.5 ? "ahmed.benali@email.com" : "fatima.mansouri@email.com"}
Téléphone: +216 ${Math.floor(Math.random() * 90000000) + 10000000}
Adresse: Tunis, Tunisie

COMPÉTENCES
${skills.programmation.join(", ")}
${skills.frameworks.join(", ")}
${skills.databases.join(", ")}

EXPÉRIENCE
${experience[0]}
- Développement d'applications web avec React et Node.js
- Mise en place d'une architecture microservices
- Optimisation des performances et de la sécurité

${experience[1]}
- Développement d'API RESTful
- Intégration de systèmes de paiement
- Tests unitaires et d'intégration

FORMATION
${education[0]}
${education[1]}

LANGUES
Arabe (natif), Français (courant), Anglais (professionnel)
    `.trim()

    return {
      global_score: globalScore,
      similarity_score: similarityScore,
      skill_matches: skillMatches,
      extracted_text: extractedText,
      skills: skills,
      education: education,
      experience: experience,
      recommendations: recommendations,
    }
  }
}

// Function to call Python script (for production use)
async function callPythonAnalyzer(imageBase64: string, jobDescription: string) {
  try {
    // Create temporary file for the image
    const tmpDir = os.tmpdir()
    const imagePath = path.join(tmpDir, `cv_image_${Date.now()}.txt`)

    // Write base64 image to temp file
    await writeFile(imagePath, imageBase64)

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python", ["lib/cv_image_analyzer.py", imagePath, jobDescription])

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
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`))
        } else {
          try {
            resolve(JSON.parse(result))
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${result}`))
          }
        }
      })
    })
  } catch (error) {
    console.error("Error calling Python analyzer:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, jobDescription } = await request.json()

    if (!imageBase64 || !jobDescription) {
      return NextResponse.json({ error: "Image base64 and job description are required" }, { status: 400 })
    }

    // Use mock analyzer for now
    // In production, replace with: const result = await callPythonAnalyzer(imageBase64, jobDescription)
    const analyzer = new MockCVImageAnalyzer()
    const result = await analyzer.analyzeCVImage(imageBase64, jobDescription)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing CV image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
