"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, ArrowRight, Loader2 } from "lucide-react"

const mockJobs = [
  {
    id: "1",
    title: "Développeur Full Stack",
    company: "TechCorp",
    description: `Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe dynamique.

Responsabilités:
- Développer des applications web avec React et Node.js
- Concevoir et implémenter des APIs REST
- Travailler avec des bases de données PostgreSQL
- Collaborer avec l'équipe UX/UI pour créer des interfaces utilisateur intuitives
- Participer aux revues de code et aux méthodologies agiles

Exigences:
- 3+ années d'expérience en développement web
- Maîtrise de JavaScript, React, Node.js
- Expérience avec PostgreSQL et MongoDB
- Connaissance de Git, Docker, et AWS
- Excellentes compétences en communication
- Capacité à travailler en équipe agile`,
  },
  {
    id: "2",
    title: "Data Scientist",
    company: "DataLab",
    description: `Rejoignez notre équipe de data science pour analyser des données complexes et créer des modèles prédictifs.

Responsabilités:
- Analyser de grandes quantités de données
- Développer des modèles de machine learning
- Créer des visualisations de données avec Python
- Collaborer avec les équipes produit pour définir les KPIs
- Présenter les résultats aux parties prenantes

Exigences:
- Master en Data Science, Statistiques ou domaine connexe
- Expertise en Python, pandas, scikit-learn, TensorFlow
- Expérience avec SQL et bases de données NoSQL
- Connaissance de Tableau ou Power BI
- Compétences en statistiques et machine learning
- Capacité à communiquer des insights complexes`,
  },
  {
    id: "3",
    title: "UX Designer",
    company: "DesignStudio",
    description: `Créez des expériences utilisateur exceptionnelles pour nos produits digitaux.

Responsabilités:
- Concevoir des wireframes et prototypes
- Réaliser des tests utilisateurs
- Créer des design systems cohérents
- Collaborer avec les développeurs pour l'implémentation
- Analyser les métriques d'usage et optimiser l'UX

Exigences:
- 2+ années d'expérience en UX Design
- Maîtrise de Figma, Sketch, Adobe Creative Suite
- Expérience en recherche utilisateur et tests d'usabilité
- Connaissance des principes d'accessibilité web
- Portfolio démontrant des projets UX réussis
- Excellentes compétences en présentation`,
  },
  {
    id: "4",
    title: "Chef de projet IT",
    company: "InnovateTech",
    description: `Dirigez des projets technologiques complexes et coordonnez les équipes de développement.

Responsabilités:
- Planifier et gérer des projets IT de A à Z
- Coordonner les équipes techniques et fonctionnelles
- Suivre les budgets et les délais
- Gérer les risques et les problèmes
- Communiquer avec les parties prenantes

Exigences:
- 5+ années d'expérience en gestion de projet IT
- Certification PMP ou équivalent souhaitée
- Expérience avec les méthodologies agiles (Scrum, Kanban)
- Maîtrise des outils de gestion de projet (Jira, Confluence)
- Excellentes compétences en leadership et communication
- Capacité à gérer plusieurs projets simultanément`,
  },
]

interface ApplicationFormProps {
  data: any
  setData: (data: any) => void
  onNext: () => void
}

export function ApplicationForm({ data, setData, onNext }: ApplicationFormProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = async (file: File) => {
    setData({ ...data, cvFile: file })

    // Extract text from file (simplified for demo)
    const text = await extractTextFromFile(file)
    setData({ ...data, cvFile: file, cvText: text })
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simplified text extraction for demo
    // In production, you'd use proper PDF/DOCX parsing libraries
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Mock CV text for demo
        const mockCVText = `
Jean Dupont
Développeur Full Stack

Expérience professionnelle:
• 3 ans d'expérience en développement web avec JavaScript et Python
• Maîtrise de React, Node.js, et Express
• Travail avec bases de données PostgreSQL et MongoDB
• Utilisation quotidienne de Git, Docker, et déploiement sur AWS
• Expérience en équipe agile avec méthodologie Scrum

Compétences techniques:
• Langages: JavaScript, Python, HTML, CSS, SQL
• Frameworks: React, Node.js, Express, Django
• Bases de données: PostgreSQL, MongoDB, Redis
• Outils: Git, Docker, AWS, Jenkins, Jira
• Méthodologies: Agile, Scrum, TDD

Formation:
• Master en Informatique - Université Paris Diderot (2020)
• Certification AWS Solutions Architect (2022)

Projets récents:
• Développement d'une application e-commerce avec React et Node.js
• Création d'une API REST pour gestion de données clients
• Mise en place d'un pipeline CI/CD avec Jenkins et Docker
        `
        resolve(mockCVText.trim())
      }
      reader.readAsText(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (data.name && data.email && data.jobId && data.cvFile) {
      setIsAnalyzing(true)

      try {
        // Get job description
        const selectedJob = mockJobs.find((job) => job.id === data.jobId)
        const jobDescription = selectedJob?.description || ""

        // Call ATS analysis API
        const response = await fetch("/api/analyze-cv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cvText: data.cvText,
            jobText: jobDescription,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to analyze CV")
        }

        const analysisResult = await response.json()

        // Store analysis result
        setData({
          ...data,
          analysisResult,
          matchingScore: analysisResult.ats_score,
        })

        onNext()
      } catch (error) {
        console.error("Error analyzing CV:", error)
        // For demo purposes, continue with mock data
        setData({
          ...data,
          matchingScore: Math.floor(Math.random() * 30) + 70,
        })
        onNext()
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const selectedJob = mockJobs.find((job) => job.id === data.jobId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-6 w-6 mr-2 text-blue-600" />
          Informations de candidature
        </CardTitle>
        <CardDescription>Remplissez vos informations personnelles et téléchargez votre CV</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Votre nom complet"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="votre.email@exemple.com"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job">Poste souhaité *</Label>
              <Select value={data.jobId} onValueChange={(value) => setData({ ...data, jobId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un poste" />
                </SelectTrigger>
                <SelectContent>
                  {mockJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Description Preview */}
          {selectedJob && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Aperçu du poste sélectionné</h4>
              <p className="text-blue-800 text-sm mb-2">
                <strong>{selectedJob.title}</strong> chez {selectedJob.company}
              </p>
              <p className="text-blue-700 text-sm line-clamp-3">{selectedJob.description.substring(0, 200)}...</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>CV (PDF ou Word) *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Glissez-déposez votre CV ici</p>
              <p className="text-gray-500 mb-4">ou</p>
              <Button type="button" variant="outline" asChild>
                <label htmlFor="cv-upload" className="cursor-pointer">
                  Parcourir les fichiers
                </label>
              </Button>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {data.cvFile && (
                <div className="mt-4">
                  <p className="text-sm text-green-600">✓ {data.cvFile.name} sélectionné</p>
                  <p className="text-xs text-gray-500 mt-1">Le CV sera analysé automatiquement par notre IA</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!data.name || !data.email || !data.jobId || !data.cvFile || isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  Analyser et continuer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
