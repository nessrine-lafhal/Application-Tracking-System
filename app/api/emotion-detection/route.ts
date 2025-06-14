import { type NextRequest, NextResponse } from "next/server"

// Mock implementation for emotion detection
// In production, this would call the Python emotion detection service
class MockEmotionDetector {
  private emotions = ["happy", "neutral", "sad", "angry", "surprise", "fear", "disgust"]
  private emotionHistory: Array<{ emotion: string; confidence: number; timestamp: number }> = []

  async analyzeFrame(imageData: string) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Mock emotion detection with realistic patterns
    const randomEmotion = this.emotions[Math.floor(Math.random() * this.emotions.length)]
    const confidence = Math.random() * 0.4 + 0.6 // 0.6 to 1.0

    // Add some logic to make emotions more realistic
    let detectedEmotion = randomEmotion
    let detectedConfidence = confidence

    // Simulate more neutral/happy emotions during interviews
    if (Math.random() > 0.7) {
      detectedEmotion = Math.random() > 0.5 ? "neutral" : "happy"
      detectedConfidence = Math.random() * 0.3 + 0.7
    }

    // Store in history
    this.emotionHistory.push({
      emotion: detectedEmotion,
      confidence: detectedConfidence,
      timestamp: Date.now(),
    })

    // Keep only last 50 entries
    if (this.emotionHistory.length > 50) {
      this.emotionHistory = this.emotionHistory.slice(-50)
    }

    // Generate detailed scores for all emotions
    const emotionScores: Record<string, number> = {}
    this.emotions.forEach((emotion) => {
      if (emotion === detectedEmotion) {
        emotionScores[emotion] = detectedConfidence
      } else {
        emotionScores[emotion] = Math.random() * 0.3
      }
    })

    return {
      face_detected: true,
      final_prediction: [detectedEmotion, detectedConfidence],
      emotion_scores: emotionScores,
      cnn_prediction: [detectedEmotion, detectedConfidence * 0.9],
      landmark_prediction: [detectedEmotion, detectedConfidence * 1.1],
      timestamp: Date.now(),
    }
  }

  getEmotionSummary() {
    if (this.emotionHistory.length === 0) {
      return {
        dominant_emotion: { emotion: "neutral", percentage: 100 },
        emotion_distribution: { neutral: { count: 0, percentage: 100, avg_confidence: 0.8 } },
      }
    }

    // Calculate emotion distribution
    const emotionCounts: Record<string, number> = {}
    const emotionConfidences: Record<string, number[]> = {}

    this.emotions.forEach((emotion) => {
      emotionCounts[emotion] = 0
      emotionConfidences[emotion] = []
    })

    this.emotionHistory.forEach((entry) => {
      emotionCounts[entry.emotion]++
      emotionConfidences[entry.emotion].push(entry.confidence)
    })

    const total = this.emotionHistory.length
    const emotionDistribution: Record<string, any> = {}

    this.emotions.forEach((emotion) => {
      const count = emotionCounts[emotion]
      const percentage = (count / total) * 100
      const avgConfidence =
        emotionConfidences[emotion].length > 0
          ? emotionConfidences[emotion].reduce((a, b) => a + b, 0) / emotionConfidences[emotion].length
          : 0

      emotionDistribution[emotion] = {
        count,
        percentage: Math.round(percentage * 100) / 100,
        avg_confidence: Math.round(avgConfidence * 1000) / 1000,
      }
    })

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) =>
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b,
    )

    return {
      dominant_emotion: {
        emotion: dominantEmotion[0],
        percentage: emotionDistribution[dominantEmotion[0]].percentage,
      },
      emotion_distribution: emotionDistribution,
      total_frames: total,
    }
  }

  clearHistory() {
    this.emotionHistory = []
  }
}

const emotionDetector = new MockEmotionDetector()

export async function POST(request: NextRequest) {
  try {
    const { action, imageData, sessionId } = await request.json()

    switch (action) {
      case "analyze_frame":
        if (!imageData) {
          return NextResponse.json({ error: "Image data is required" }, { status: 400 })
        }

        const result = await emotionDetector.analyzeFrame(imageData)
        return NextResponse.json(result)

      case "get_summary":
        const summary = emotionDetector.getEmotionSummary()
        return NextResponse.json(summary)

      case "clear_session":
        emotionDetector.clearHistory()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in emotion detection API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
