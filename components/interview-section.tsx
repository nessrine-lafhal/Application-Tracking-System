"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight, ArrowLeft, Clock, CheckCircle } from "lucide-react"

const mockQuestions = [
  "Pouvez-vous décrire votre expérience avec React et les technologies frontend modernes ?",
  "Comment gérez-vous les projets complexes avec des délais serrés ?",
  "Décrivez une situation difficile que vous avez rencontrée dans votre travail précédent et comment vous l'avez résolue.",
  "Quelles sont vos principales forces et comment peuvent-elles bénéficier à notre équipe ?",
]

interface InterviewSectionProps {
  onNext: () => void
  onPrev: () => void
  setScore: (score: number) => void
}

export function InterviewSection({ onNext, onPrev, setScore }: InterviewSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(mockQuestions.length).fill(""))
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitInterview = () => {
    // Simulate scoring
    const score = Math.floor(Math.random() * 20) + 70 // Score between 70-90
    setScore(score)
    setIsCompleted(true)

    setTimeout(() => {
      onNext()
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
            Entretien écrit terminé
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Évaluation de vos réponses en cours...</p>
          <p className="text-sm text-gray-500">Redirection automatique vers l'étape suivante</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Entretien écrit automatisé
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{formatTime(timeLeft)}</span>
          </div>
        </CardTitle>
        <CardDescription>
          Répondez aux questions suivantes. Prenez votre temps pour donner des réponses détaillées et pertinentes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            Question {currentQuestion + 1} sur {mockQuestions.length}
          </Badge>
          <div className="text-sm text-gray-500">
            {answers.filter((a) => a.trim().length > 0).length} / {mockQuestions.length} réponses complétées
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Question {currentQuestion + 1}</h3>
            <p className="text-blue-800">{mockQuestions[currentQuestion]}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Votre réponse</label>
            <Textarea
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Tapez votre réponse ici..."
              className="min-h-[150px]"
            />
            <p className="text-xs text-gray-500">{answers[currentQuestion].length} caractères</p>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onPrev}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            {currentQuestion > 0 && (
              <Button variant="outline" onClick={prevQuestion}>
                Question précédente
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {currentQuestion < mockQuestions.length - 1 ? (
              <Button onClick={nextQuestion} disabled={!answers[currentQuestion].trim()}>
                Question suivante
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={submitInterview}
                disabled={answers.some((a) => !a.trim())}
                className="bg-green-600 hover:bg-green-700"
              >
                Terminer l'entretien
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-1">
          {mockQuestions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index === currentQuestion ? "bg-blue-600" : answers[index].trim() ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
