"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Video,
  ArrowRight,
  ArrowLeft,
  Play,
  Square,
  Mic,
  MicOff,
  Brain,
  Zap,
  Heart,
  Smile,
  Frown,
  Meh,
  Settings,
  RotateCcw,
} from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface VideoInterviewProps {
  onNext: () => void
  onPrev: () => void
  setScore: (score: number) => void
}

export function ModernVideoInterview({ onNext, onPrev, setScore }: VideoInterviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [recordedQuestions, setRecordedQuestions] = useState<boolean[]>(new Array(5).fill(false))
  const [isMuted, setIsMuted] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<{ emotion: string; confidence: number }>({
    emotion: "neutral",
    confidence: 0.8,
  })
  const [emotionHistory, setEmotionHistory] = useState<
    Array<{ emotion: string; confidence: number; timestamp: number; score: number }>
  >([])
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    clarity: 85,
    engagement: 78,
    confidence: 82,
    pace: 75,
  })
  const [questionScores, setQuestionScores] = useState<number[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const videoQuestions = [
    {
      id: 1,
      question: "Présentez-vous en quelques mots et expliquez pourquoi vous êtes intéressé par ce poste.",
      category: "Présentation",
      expectedDuration: 120,
    },
    {
      id: 2,
      question: "Décrivez votre plus grande réussite professionnelle et ce que vous en avez appris.",
      category: "Expérience",
      expectedDuration: 180,
    },
    {
      id: 3,
      question: "Comment gérez-vous le stress et la pression au travail ?",
      category: "Soft Skills",
      expectedDuration: 150,
    },
    {
      id: 4,
      question: "Parlez-moi d'un défi technique complexe que vous avez résolu récemment.",
      category: "Technique",
      expectedDuration: 200,
    },
    {
      id: 5,
      question: "Où vous voyez-vous dans 5 ans et comment ce poste s'inscrit dans vos objectifs ?",
      category: "Motivation",
      expectedDuration: 160,
    },
  ]

  const emotionIcons = {
    happy: { icon: Smile, color: "text-green-500", bg: "bg-green-100" },
    neutral: { icon: Meh, color: "text-gray-500", bg: "bg-gray-100" },
    confident: { icon: Zap, color: "text-blue-500", bg: "bg-blue-100" },
    engaged: { icon: Heart, color: "text-red-500", bg: "bg-red-100" },
    focused: { icon: Brain, color: "text-purple-500", bg: "bg-purple-100" },
    sad: { icon: Frown, color: "text-amber-500", bg: "bg-amber-100" },
  }

  useEffect(() => {
    startCamera()
    return () => cleanup()
  }, [])

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      startEmotionAnalysis()
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error)
    }
  }

  const startEmotionAnalysis = () => {
    setInterval(() => {
      // Simulate emotion analysis
      const emotions = ["happy", "neutral", "confident", "engaged", "focused"]
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      const confidence = 0.7 + Math.random() * 0.3
      const score = 70 + Math.random() * 30

      setCurrentEmotion({ emotion: randomEmotion, confidence })
      setEmotionHistory((prev) =>
        [...prev, { emotion: randomEmotion, confidence, timestamp: Date.now(), score }].slice(-50),
      )

      // Update real-time metrics
      setRealTimeMetrics({
        clarity: Math.max(60, Math.min(100, 85 + (Math.random() - 0.5) * 20)),
        engagement: Math.max(60, Math.min(100, 78 + (Math.random() - 0.5) * 25)),
        confidence: Math.max(60, Math.min(100, 82 + (Math.random() - 0.5) * 18)),
        pace: Math.max(60, Math.min(100, 75 + (Math.random() - 0.5) * 22)),
      })
    }, 2000)
  }

  const startRecording = () => {
    setIsRecording(true)
    // Simulate recording for 30 seconds
    setTimeout(() => {
      stopRecording()
    }, 30000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    const newRecorded = [...recordedQuestions]
    newRecorded[currentQuestion] = true
    setRecordedQuestions(newRecorded)

    // Generate question score
    const score = 70 + Math.random() * 30
    setQuestionScores((prev) => {
      const newScores = [...prev]
      newScores[currentQuestion] = score
      return newScores
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < videoQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const completeInterview = () => {
    const averageScore = questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length
    setScore(Math.round(averageScore))
    setIsCompleted(true)
    cleanup()
    setTimeout(() => onNext(), 3000)
  }

  const currentEmotionIcon = emotionIcons[currentEmotion.emotion as keyof typeof emotionIcons] || emotionIcons.neutral

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-green-600">Entretien Vidéo Terminé</CardTitle>
              <CardDescription className="text-lg">Analyse des performances en cours...</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
              <p className="text-gray-600 mb-4 text-lg">Traitement de l'analyse comportementale et émotionnelle...</p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {questionScores.length > 0
                      ? Math.round(questionScores.reduce((a, b) => a + b, 0) / questionScores.length)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Score Moyen</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{emotionHistory.length}</div>
                  <div className="text-sm text-gray-600">Points d'Analyse</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{videoQuestions.length}</div>
                  <div className="text-sm text-gray-600">Questions Complétées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Entretien Vidéo Intelligent
          </h1>
          <p className="text-gray-600">Analyse comportementale et émotionnelle en temps réel avec IA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Video Card */}
            <Card className="shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  Question {currentQuestion + 1} sur {videoQuestions.length}
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {videoQuestions[currentQuestion].category} • Durée recommandée:{" "}
                  {Math.floor(videoQuestions[currentQuestion].expectedDuration / 60)}:
                  {(videoQuestions[currentQuestion].expectedDuration % 60).toString().padStart(2, "0")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-gray-900 aspect-video">
                  <video ref={videoRef} autoPlay muted={isMuted} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Emotion Overlay */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-full ${currentEmotionIcon.bg} backdrop-blur-sm border border-white/20`}
                    >
                      <currentEmotionIcon.icon className={`h-4 w-4 ${currentEmotionIcon.color}`} />
                      <span className="text-sm font-medium capitalize">{currentEmotion.emotion}</span>
                      <Badge variant="outline" className="text-xs">
                        {(currentEmotion.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                        Enregistrement...
                      </span>
                    </div>
                  )}

                  {/* Real-time Metrics */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <div className="grid grid-cols-4 gap-3 text-white text-xs">
                        <div className="text-center">
                          <div className="font-medium">{realTimeMetrics.clarity}%</div>
                          <div className="opacity-70">Clarté</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{realTimeMetrics.engagement}%</div>
                          <div className="opacity-70">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{realTimeMetrics.confidence}%</div>
                          <div className="opacity-70">Confiance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{realTimeMetrics.pace}%</div>
                          <div className="opacity-70">Rythme</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={isMuted ? "destructive" : "secondary"}
                      onClick={() => setIsMuted(!isMuted)}
                      className="rounded-full"
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>

                    {!isRecording ? (
                      <Button
                        size="lg"
                        onClick={startRecording}
                        disabled={recordedQuestions[currentQuestion]}
                        className="bg-red-600 hover:bg-red-700 rounded-full px-6"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Enregistrer
                      </Button>
                    ) : (
                      <Button size="lg" onClick={stopRecording} variant="secondary" className="rounded-full px-6">
                        <Square className="h-5 w-5 mr-2" />
                        Arrêter
                      </Button>
                    )}

                    <Button size="sm" variant="secondary" className="rounded-full">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
                <Badge variant="outline">{videoQuestions[currentQuestion].category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed mb-4">{videoQuestions[currentQuestion].question}</p>
                {recordedQuestions[currentQuestion] && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">Question enregistrée avec succès</span>
                    {questionScores[currentQuestion] && (
                      <Badge className="ml-auto bg-green-600">
                        Score: {Math.round(questionScores[currentQuestion])}%
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="progress">Progression</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progression de l'Entretien</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Questions Complétées</span>
                          <span>
                            {recordedQuestions.filter(Boolean).length}/{videoQuestions.length}
                          </span>
                        </div>
                        <Progress value={(recordedQuestions.filter(Boolean).length / videoQuestions.length) * 100} />
                      </div>

                      {questionScores.length > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Score Moyen</span>
                            <span>
                              {Math.round(questionScores.reduce((a, b) => a + b, 0) / questionScores.length)}%
                            </span>
                          </div>
                          <Progress
                            value={questionScores.reduce((a, b) => a + b, 0) / questionScores.length}
                            className="h-3"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-2">
                      {videoQuestions.map((q, index) => (
                        <div
                          key={q.id}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            index === currentQuestion
                              ? "bg-blue-100 border border-blue-300"
                              : recordedQuestions[index]
                                ? "bg-green-50"
                                : "bg-gray-50"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            Q{index + 1}: {q.category}
                          </span>
                          {recordedQuestions[index] && (
                            <Badge variant="outline" className="text-xs">
                              {questionScores[index] ? `${Math.round(questionScores[index])}%` : "✓"}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analyse Émotionnelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={emotionHistory.slice(-20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis domain={[0, 100]} />
                          <Tooltip
                            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                            formatter={(value: any) => [`${value.toFixed(1)}%`, "Score"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métriques Temps Réel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(realTimeMetrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{key}</span>
                            <span className="font-medium">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onPrev} size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Retour
                    </Button>
                    {currentQuestion > 0 && (
                      <Button variant="outline" onClick={prevQuestion} size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {currentQuestion < videoQuestions.length - 1 ? (
                      <Button onClick={nextQuestion} disabled={!recordedQuestions[currentQuestion]} size="sm">
                        Suivant
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={completeInterview}
                        disabled={!recordedQuestions.every(Boolean)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Terminer
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
