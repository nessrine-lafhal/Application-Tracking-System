"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  CheckCircle,
  Brain,
  Users,
  Video,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Target,
} from "lucide-react"
import Link from "next/link"
import { ApplicationForm } from "@/components/application-form"
import { InterviewSection } from "@/components/interview-section"
import { DocumentUpload } from "@/components/document-upload"
import { VideoInterview } from "@/components/video-interview"
import { EmotionDashboard } from "@/components/emotion-dashboard"

const steps = [
  { id: 1, title: "Candidature", icon: FileText },
  { id: 2, title: "Matching CV", icon: Brain },
  { id: 3, title: "Entretien écrit", icon: Users },
  { id: 4, title: "Entretien vidéo", icon: Video },
  { id: 5, title: "Documents", icon: FileCheck },
  { id: 6, title: "Résultat", icon: CheckCircle },
]

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    jobId: "",
    cvFile: null,
    cvText: "",
    analysisResult: null,
    matchingScore: null,
    writtenScore: null,
    videoScore: null,
    documentsScore: null,
    finalScore: null,
  })

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ATS Intelligent</span>
          </Link>
          <Badge variant="secondary">Processus de candidature</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Postuler à une offre d'emploi</h1>
            <Badge variant="outline">
              Étape {currentStep} sur {steps.length}
            </Badge>
          </div>

          <Progress value={progress} className="mb-6" />

          {/* Steps indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                    }
                  `}
                  >
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <ApplicationForm data={applicationData} setData={setApplicationData} onNext={nextStep} />
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-blue-600" />
                  Analyse de compatibilité CV-Poste
                </CardTitle>
                <CardDescription>
                  Notre IA avancée analyse la compatibilité entre votre CV et la description du poste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Analysis Results */}
                {applicationData.analysisResult ? (
                  <div className="space-y-6">
                    {/* Main Score */}
                    <div className="text-center">
                      <div className="text-6xl font-bold text-green-600 mb-2">
                        {applicationData.analysisResult.ats_score}
                      </div>
                      <p className="text-xl text-gray-600 mb-4">Score de compatibilité sur 100</p>
                      <Badge variant="default" className="text-lg px-4 py-2">
                        {applicationData.analysisResult.ats_score >= 70 ? "Profil compatible !" : "Profil à améliorer"}
                      </Badge>
                    </div>

                    {/* Detailed Scores */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(applicationData.analysisResult.similarity_scores.bert_similarity * 100)}%
                        </div>
                        <p className="text-sm text-blue-800">Similarité sémantique</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(
                            (Object.values(applicationData.analysisResult.skill_matches).reduce(
                              (a: number, b: number) => a + b,
                              0,
                            ) /
                              Object.keys(applicationData.analysisResult.skill_matches).length) *
                              100,
                          )}
                          %
                        </div>
                        <p className="text-sm text-green-800">Matching compétences</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(applicationData.analysisResult.similarity_scores.sentence_similarity * 100)}%
                        </div>
                        <p className="text-sm text-purple-800">Analyse contextuelle</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {applicationData.analysisResult.recommendations &&
                      applicationData.analysisResult.recommendations.length > 0 && (
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">
                            💡 Recommandations pour améliorer votre profil
                          </h4>
                          <ul className="text-yellow-800 text-sm space-y-1">
                            {applicationData.analysisResult.recommendations.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Status Message */}
                    <div
                      className={`p-4 rounded-lg ${
                        applicationData.analysisResult.ats_score >= 70 ? "bg-green-50" : "bg-orange-50"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle
                          className={`h-5 w-5 mr-2 ${
                            applicationData.analysisResult.ats_score >= 70 ? "text-green-600" : "text-orange-600"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            applicationData.analysisResult.ats_score >= 70 ? "text-green-800" : "text-orange-800"
                          }`}
                        >
                          {applicationData.analysisResult.ats_score >= 70
                            ? "Félicitations ! Votre profil correspond bien à cette offre."
                            : "Votre profil présente un potentiel, mais pourrait être amélioré."}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          applicationData.analysisResult.ats_score >= 70 ? "text-green-700" : "text-orange-700"
                        }`}
                      >
                        {applicationData.analysisResult.ats_score >= 70
                          ? "Vous pouvez continuer vers l'étape suivante : l'entretien écrit automatisé."
                          : "Nous vous encourageons à continuer le processus pour démontrer vos autres qualités."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyse en cours...</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  {applicationData.analysisResult && (
                    <Button onClick={nextStep}>
                      Continuer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <InterviewSection
              onNext={nextStep}
              onPrev={prevStep}
              setScore={(score) => setApplicationData({ ...applicationData, writtenScore: score })}
            />
          )}

          {currentStep === 4 && (
            <VideoInterview
              onNext={nextStep}
              onPrev={prevStep}
              setScore={(score) => setApplicationData({ ...applicationData, videoScore: score })}
            />
          )}

          {currentStep === 5 && (
            <DocumentUpload
              onNext={nextStep}
              onPrev={prevStep}
              setScore={(score) => setApplicationData({ ...applicationData, documentsScore: score })}
            />
          )}

          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Résultat final
                </CardTitle>
                <CardDescription>Voici le résumé de votre candidature et la décision finale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Scores détaillés</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Compatibilité CV</span>
                        <Badge variant="outline">{applicationData.matchingScore || 85}/100</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Entretien écrit</span>
                        <Badge variant="outline">{applicationData.writtenScore || 78}/100</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Entretien vidéo</span>
                        <Badge variant="outline">{applicationData.videoScore || 82}/100</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Vérification documents</span>
                        <Badge variant="outline">{applicationData.documentsScore || 90}/100</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Add this after the existing scores display and before the final decision */}

                  {/* Emotion Analysis Results */}
                  {applicationData.videoScore && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-4">Analyse Émotionnelle Détaillée</h3>
                      <EmotionDashboard
                        emotionSummary={{
                          dominant_emotion: { emotion: "happy", percentage: 45.2 },
                          emotion_distribution: {
                            happy: { emotion: "happy", percentage: 45.2, count: 23, avg_confidence: 0.85 },
                            neutral: { emotion: "neutral", percentage: 32.1, count: 16, avg_confidence: 0.78 },
                            surprise: { emotion: "surprise", percentage: 12.3, count: 6, avg_confidence: 0.72 },
                            sad: { emotion: "sad", percentage: 6.2, count: 3, avg_confidence: 0.65 },
                            angry: { emotion: "angry", percentage: 2.1, count: 1, avg_confidence: 0.58 },
                            fear: { emotion: "fear", percentage: 1.5, count: 1, avg_confidence: 0.62 },
                            disgust: { emotion: "disgust", percentage: 0.6, count: 0, avg_confidence: 0.0 },
                          },
                          total_frames: 50,
                        }}
                      />
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">
                      {Math.round(
                        (applicationData.matchingScore || 85) * 0.3 +
                          (applicationData.writtenScore || 78) * 0.25 +
                          (applicationData.videoScore || 82) * 0.25 +
                          (applicationData.documentsScore || 90) * 0.2,
                      )}
                    </div>
                    <p className="text-xl text-gray-600 mb-4">Score final sur 100</p>
                    <Badge variant="default" className="text-lg px-4 py-2 mb-4">
                      Candidature présélectionnée !
                    </Badge>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Félicitations !</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Votre candidature a été présélectionnée grâce à notre analyse IA avancée. L'équipe RH vous
                        contactera prochainement pour la suite du processus.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button asChild>
                    <Link href="/">Retour à l'accueil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
