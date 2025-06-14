"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Video, ArrowRight, ArrowLeft, Play, Square, Camera, Mic, MicOff, Brain } from "lucide-react"

const videoQuestions = [
  "Présentez-vous en quelques mots et expliquez pourquoi vous êtes intéressé par ce poste.",
  "Décrivez votre plus grande réussite professionnelle et ce que vous en avez appris.",
  "Comment gérez-vous le stress et la pression au travail ?",
  "Où vous voyez-vous dans 5 ans et comment ce poste s'inscrit dans vos objectifs ?",
]

const emotionColors = {
  happy: "text-green-600 bg-green-100",
  neutral: "text-gray-600 bg-gray-100",
  sad: "text-blue-600 bg-blue-100",
  angry: "text-red-600 bg-red-100",
  surprise: "text-yellow-600 bg-yellow-100",
  fear: "text-purple-600 bg-purple-100",
  disgust: "text-orange-600 bg-orange-100",
}

const emotionEmojis = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  surprise: "😲",
  fear: "😨",
  disgust: "🤢",
}

interface VideoInterviewProps {
  onNext: () => void
  onPrev: () => void
  setScore: (score: number) => void
}

export function VideoInterview({ onNext, onPrev, setScore }: VideoInterviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [recordedQuestions, setRecordedQuestions] = useState<boolean[]>(new Array(videoQuestions.length).fill(false))
  const [isMuted, setIsMuted] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<{ emotion: string; confidence: number }>({
    emotion: "neutral",
    confidence: 0.8,
  })
  const [emotionHistory, setEmotionHistory] = useState<
    Array<{ emotion: string; confidence: number; timestamp: number }>
  >([])
  const [emotionScores, setEmotionScores] = useState<Record<string, number>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Start emotion analysis
      startEmotionAnalysis()
    } catch (error) {
      console.error("Erreur d'accès à la caméra:", error)
    }
  }

  const startEmotionAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }

    analysisIntervalRef.current = setInterval(() => {
      captureAndAnalyzeFrame()
    }, 1000) // Analyze every second
  }

  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      // Send to emotion detection API
      const response = await fetch("/api/emotion-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "analyze_frame",
          imageData: imageData,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (result.face_detected) {
          const [emotion, confidence] = result.final_prediction

          setCurrentEmotion({ emotion, confidence })
          setEmotionScores(result.emotion_scores)

          // Add to history
          setEmotionHistory((prev) =>
            [
              ...prev,
              {
                emotion,
                confidence,
                timestamp: Date.now(),
              },
            ].slice(-100),
          ) // Keep last 100 entries
        }
      }
    } catch (error) {
      console.error("Error analyzing frame:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [isAnalyzing])

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

  const completeInterview = async () => {
    // Get emotion summary
    try {
      const response = await fetch("/api/emotion-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_summary",
        }),
      })

      if (response.ok) {
        const summary = await response.json()

        // Calculate score based on emotion analysis
        const emotionScore = calculateEmotionScore(summary)
        setScore(emotionScore)

        setIsCompleted(true)
        cleanup()

        setTimeout(() => {
          onNext()
        }, 3000)
      }
    } catch (error) {
      console.error("Error getting emotion summary:", error)
      // Fallback score
      setScore(75)
      setIsCompleted(true)
      setTimeout(() => onNext(), 3000)
    }
  }

  const calculateEmotionScore = (summary: any) => {
    const distribution = summary.emotion_distribution

    // Positive emotions contribute positively
    const positiveScore =
      (distribution.happy?.percentage || 0) * 1.0 +
      (distribution.neutral?.percentage || 0) * 0.8 +
      (distribution.surprise?.percentage || 0) * 0.6

    // Negative emotions reduce score
    const negativeScore =
      (distribution.sad?.percentage || 0) * 0.3 +
      (distribution.angry?.percentage || 0) * 0.2 +
      (distribution.fear?.percentage || 0) * 0.3 +
      (distribution.disgust?.percentage || 0) * 0.2

    // Base score calculation
    let score = positiveScore - negativeScore

    // Normalize to 0-100 range
    score = Math.max(0, Math.min(100, score))

    // Add bonus for consistency (high confidence)
    const avgConfidence =
      Object.values(distribution).reduce((sum: number, emotion: any) => sum + (emotion.avg_confidence || 0), 0) /
      Object.keys(distribution).length

    score += avgConfidence * 10 // Up to 10 bonus points

    return Math.round(Math.min(score, 100))
  }

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-6 w-6 mr-2 text-green-600" />
            Entretien vidéo terminé
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Analyse des émotions et évaluation en cours...</p>
          <p className="text-sm text-gray-500">Redirection automatique vers l'étape suivante</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="h-6 w-6 mr-2 text-blue-600" />
          Entretien vidéo avec analyse des émotions IA
        </CardTitle>
        <CardDescription>
          Répondez aux questions en vidéo. Notre IA analysera vos expressions faciales et votre comportement en temps
          réel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay muted={isMuted} className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              {/* Emotion overlay */}
              <div className="absolute top-4 left-4 space-y-2">
                <Badge className={`${emotionColors[currentEmotion.emotion as keyof typeof emotionColors]} border-0`}>
                  <Brain className="h-3 w-3 mr-1" />
                  {emotionEmojis[currentEmotion.emotion as keyof typeof emotionEmojis]} {currentEmotion.emotion}
                </Badge>
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Confiance: {(currentEmotion.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">Enregistrement...</span>
                </div>
              )}

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                <Button size="sm" variant={isMuted ? "destructive" : "secondary"} onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {!isRecording ? (
                  <Button
                    size="sm"
                    onClick={startRecording}
                    disabled={recordedQuestions[currentQuestion]}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                ) : (
                  <Button size="sm" onClick={stopRecording} variant="secondary">
                    <Square className="h-4 w-4 mr-2" />
                    Arrêter
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Camera className="h-4 w-4" />
              <span>Assurez-vous que votre visage est bien visible pour l'analyse des émotions</span>
            </div>
          </div>

          {/* Question and Emotion Analysis Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Question {currentQuestion + 1} sur {videoQuestions.length}
              </Badge>
              <div className="text-sm text-gray-500">
                {recordedQuestions.filter(Boolean).length} / {videoQuestions.length} enregistrées
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Question {currentQuestion + 1}</h3>
              <p className="text-purple-800">{videoQuestions[currentQuestion]}</p>
            </div>

            {/* Real-time Emotion Analysis */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Analyse émotionnelle en temps réel
              </h4>

              <div className="space-y-2">
                {Object.entries(emotionScores).map(([emotion, score]) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      {emotionEmojis[emotion as keyof typeof emotionEmojis]} {emotion}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress value={score * 100} className="w-16 h-2" />
                      <span className="text-xs text-gray-600 w-8">{(score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Conseils pour l'enregistrement :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Regardez directement la caméra</li>
                <li>• Parlez clairement et à un rythme normal</li>
                <li>• Restez naturel et authentique</li>
                <li>• Maintenez une expression positive</li>
              </ul>
            </div>

            {recordedQuestions[currentQuestion] && (
              <div className="p-3 bg-green-50 rounded-lg flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700 text-sm">Question enregistrée avec succès</span>
              </div>
            )}
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
            {currentQuestion < videoQuestions.length - 1 ? (
              <Button onClick={nextQuestion} disabled={!recordedQuestions[currentQuestion]}>
                Question suivante
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={completeInterview}
                disabled={!recordedQuestions.every(Boolean)}
                className="bg-green-600 hover:bg-green-700"
              >
                Terminer l'entretien
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex space-x-1">
          {videoQuestions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index === currentQuestion ? "bg-purple-600" : recordedQuestions[index] ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
