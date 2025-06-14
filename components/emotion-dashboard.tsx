"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Users, Target } from "lucide-react"

interface EmotionData {
  emotion: string
  percentage: number
  count: number
  avg_confidence: number
}

interface EmotionDashboardProps {
  emotionSummary: {
    dominant_emotion: { emotion: string; percentage: number }
    emotion_distribution: Record<string, EmotionData>
    total_frames: number
  }
}

const emotionColors = {
  happy: "bg-green-500",
  neutral: "bg-gray-500",
  sad: "bg-blue-500",
  angry: "bg-red-500",
  surprise: "bg-yellow-500",
  fear: "bg-purple-500",
  disgust: "bg-orange-500",
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

export function EmotionDashboard({ emotionSummary }: EmotionDashboardProps) {
  const { dominant_emotion, emotion_distribution, total_frames } = emotionSummary

  // Calculate overall emotional score
  const emotionalScore = Math.round(
    (emotion_distribution.happy?.percentage || 0) * 1.0 +
      (emotion_distribution.neutral?.percentage || 0) * 0.8 +
      (emotion_distribution.surprise?.percentage || 0) * 0.6 -
      (emotion_distribution.sad?.percentage || 0) * 0.3 -
      (emotion_distribution.angry?.percentage || 0) * 0.5 -
      (emotion_distribution.fear?.percentage || 0) * 0.4,
  )

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Émotionnel</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{emotionalScore}/100</div>
            <p className="text-xs text-muted-foreground">Basé sur l'analyse faciale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Émotion Dominante</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {emotionEmojis[dominant_emotion.emotion as keyof typeof emotionEmojis]}
              <span className="ml-2 capitalize">{dominant_emotion.emotion}</span>
            </div>
            <p className="text-xs text-muted-foreground">{dominant_emotion.percentage.toFixed(1)}% du temps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frames Analysées</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_frames}</div>
            <p className="text-xs text-muted-foreground">Images traitées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stabilité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(emotion_distribution)
                .reduce((sum, emotion) => sum + emotion.avg_confidence, 0)
                .toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Confiance moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            Distribution des Émotions
          </CardTitle>
          <CardDescription>Analyse détaillée des expressions faciales détectées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(emotion_distribution)
              .sort(([, a], [, b]) => b.percentage - a.percentage)
              .map(([emotion, data]) => (
                <div key={emotion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{emotionEmojis[emotion as keyof typeof emotionEmojis]}</span>
                      <span className="font-medium capitalize">{emotion}</span>
                      <Badge variant="outline" className="text-xs">
                        {data.count} fois
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{data.percentage.toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">(conf: {(data.avg_confidence * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={data.percentage} className="flex-1" />
                    <div className={`w-3 h-3 rounded-full ${emotionColors[emotion as keyof typeof emotionColors]}`} />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights et Recommandations</CardTitle>
          <CardDescription>Analyse comportementale basée sur les expressions faciales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-900">Points Positifs</h4>
              <div className="space-y-2 text-sm">
                {emotion_distribution.happy?.percentage > 30 && (
                  <div className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Expression positive dominante ({emotion_distribution.happy.percentage.toFixed(1)}%)
                  </div>
                )}
                {emotion_distribution.neutral?.percentage > 40 && (
                  <div className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Maintien d'une expression neutre et professionnelle
                  </div>
                )}
                {Object.values(emotion_distribution).reduce((sum, e) => sum + e.avg_confidence, 0) > 0.7 && (
                  <div className="flex items-center text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Expressions faciales claires et détectables
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-orange-900">Points d'Amélioration</h4>
              <div className="space-y-2 text-sm">
                {emotion_distribution.sad?.percentage > 20 && (
                  <div className="flex items-center text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Expressions de tristesse détectées ({emotion_distribution.sad.percentage.toFixed(1)}%)
                  </div>
                )}
                {emotion_distribution.fear?.percentage > 15 && (
                  <div className="flex items-center text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Signes de stress ou d'anxiété observés
                  </div>
                )}
                {emotion_distribution.angry?.percentage > 10 && (
                  <div className="flex items-center text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Expressions de frustration détectées
                  </div>
                )}
                {Object.values(emotion_distribution).reduce((sum, e) => sum + e.avg_confidence, 0) < 0.6 && (
                  <div className="flex items-center text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    Améliorer la visibilité du visage pour l'analyse
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
