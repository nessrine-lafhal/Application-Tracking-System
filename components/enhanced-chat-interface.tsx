"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Send, Bot, User, Loader2, BarChart3, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  quickReplies?: string[]
}

interface Visualization {
  type: string
  data: any
}

interface ChatInterfaceProps {
  onClose?: () => void
}

export function EnhancedChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "🤖 Bonjour ! Je suis **ATS Assistant**, votre conseiller IA spécialisé en recrutement.\n\n✨ Je vais analyser votre profil en 3 étapes :\n• 📄 Analyse de votre CV\n• 🎯 Matching avec l'offre d'emploi\n• 💬 Questions personnalisées\n\nCommençons cette aventure ensemble !",
      sender: "bot",
      timestamp: new Date(),
      quickReplies: ["🚀 Commencer l'évaluation", "ℹ️ En savoir plus", "🎯 Voir un exemple"],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps] = useState(3)
  const [score, setScore] = useState(0)
  const [visualizations, setVisualizations] = useState<Visualization[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [activeTab, setActiveTab] = useState("chat")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Update step if provided
      if (data.step === "collecting_cv") setCurrentStep(1)
      else if (data.step === "collecting_job") setCurrentStep(2)
      else if (data.step === "interview") setCurrentStep(3)
      else if (data.step === "completed") {
        toast({
          title: "Évaluation terminée",
          description: "Votre rapport est prêt !",
        })
      }

      // Update score if in final results
      if (data.visualizations) {
        const finalResults = data.visualizations.find((v: any) => v.type === "final_results")
        if (finalResults) {
          setScore(finalResults.data.finalScore)
        }
        setVisualizations(data.visualizations)
      }

      // Update analytics
      if (data.analytics) {
        setAnalytics(data.analytics)
      }

      // Add typing indicator
      if (data.typing) {
        const typingIndicator: Message = {
          id: `typing_${Date.now()}`,
          text: "...",
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, typingIndicator])

        // Simulate typing delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Remove typing indicator
        setMessages((prev) => prev.filter((msg) => msg.id !== typingIndicator.id))
      }

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
        quickReplies: data.quickReplies,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  const formatMessageText = (text: string) => {
    // Convert markdown-like formatting to JSX
    const lines = text.split("\n")
    return lines.map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={index} className="font-bold text-lg mb-2">
            {line.slice(2, -2)}
          </div>
        )
      }
      if (line.startsWith("• ")) {
        return (
          <div key={index} className="ml-4 mb-1">
            {line}
          </div>
        )
      }
      if (line.includes("🟢") || line.includes("🟡") || line.includes("🔴")) {
        return (
          <div key={index} className="font-medium text-base mb-2 p-2 bg-gray-50 rounded">
            {line}
          </div>
        )
      }
      if (line.trim() === "") {
        return <br key={index} />
      }
      return (
        <div key={index} className="mb-1">
          {line}
        </div>
      )
    })
  }

  const renderVisualization = (visualization: Visualization) => {
    switch (visualization.type) {
      case "cv_analysis":
        return (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-3">Analyse de CV</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  outerRadius={90}
                  data={Object.entries(visualization.data.categories).map(([key, value]) => ({
                    category: key,
                    value: Array.isArray(value) ? value.length : 0,
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar name="Compétences" dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Complétude du CV</span>
                <span>{visualization.data.completeness}%</span>
              </div>
              <Progress value={visualization.data.completeness} className="h-2" />
            </div>
          </div>
        )

      case "matching_results":
        return (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-3">Résultats de Matching</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{visualization.data.overallScore}%</div>
                <div className="text-sm text-gray-600">Score Global</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{visualization.data.skillsMatch}%</div>
                <div className="text-sm text-gray-600">Compétences</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{visualization.data.experienceMatch}%</div>
                <div className="text-sm text-gray-600">Expérience</div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Compétences", value: visualization.data.skillsMatch },
                    { name: "Expérience", value: visualization.data.experienceMatch },
                    { name: "Niveau", value: visualization.data.levelMatch },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case "final_results":
        return (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-3">Résultats Finaux</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{visualization.data.finalScore}%</div>
                <div className="text-sm text-gray-600">Score Final</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-600">{visualization.data.interviewScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Score Entretien</div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Points forts</h4>
              <ul className="list-disc pl-5 mb-4">
                {visualization.data.strengths.map((strength: string, i: number) => (
                  <li key={i} className="text-sm">
                    {strength}
                  </li>
                ))}
              </ul>
              <h4 className="font-medium mb-2">Axes d'amélioration</h4>
              <ul className="list-disc pl-5">
                {visualization.data.improvements.map((improvement: string, i: number) => (
                  <li key={i} className="text-sm">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )

      case "step_indicator":
        return (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Étape {visualization.data.current}/{visualization.data.total}: {visualization.data.title}
              </span>
              <span>{Math.round((visualization.data.current / visualization.data.total) * 100)}%</span>
            </div>
            <Progress value={(visualization.data.current / visualization.data.total) * 100} className="h-2" />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assistant ATS Intelligent</h1>
          <p className="text-gray-600">Évaluation de candidature avec IA conversationnelle</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="chat" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Visualisations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Assistant ATS
                    </CardTitle>
                    <CardDescription>Répondez aux questions pour obtenir une évaluation complète</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div
                      className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg"
                      ref={scrollAreaRef}
                    >
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.sender === "bot" ? (
                                <Bot className="h-4 w-4 text-blue-600" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                              <span className="text-xs opacity-70">
                                {message.sender === "bot" ? "Assistant IA" : "Vous"}
                              </span>
                              <span className="text-xs opacity-70 ml-auto">
                                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            <div className="text-sm">
                              {message.text === "..." ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.4s" }}
                                  ></div>
                                </div>
                              ) : (
                                formatMessageText(message.text)
                              )}
                            </div>

                            {/* Quick Replies */}
                            {message.sender === "bot" && message.quickReplies && message.quickReplies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {message.quickReplies.map((reply, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickReply(reply)}
                                    className="text-xs bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                                    disabled={isLoading}
                                  >
                                    {reply}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isLoading && !messages.some((m) => m.text === "...") && (
                        <div className="flex justify-start">
                          <div className="bg-white rounded-lg p-3 border shadow-sm">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-blue-600" />
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.4s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Tapez votre message..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <Card className="h-[600px] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Visualisations et Analyses
                    </CardTitle>
                    <CardDescription>Graphiques détaillés de votre évaluation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {visualizations.length > 0 ? (
                      visualizations
                        .filter((v) => !["step_indicator", "interview_progress"].includes(v.type))
                        .map((visualization, index) => <div key={index}>{renderVisualization(visualization)}</div>)
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Les visualisations apparaîtront ici au fur et à mesure de votre évaluation.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Progress Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Étape</span>
                      <span>
                        {currentStep}/{totalSteps}
                      </span>
                    </div>
                    <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      <div
                        className={`text-xs text-center ${currentStep >= 1 ? "text-blue-600 font-medium" : "text-gray-400"}`}
                      >
                        Analyse CV
                      </div>
                      <div
                        className={`text-xs text-center ${currentStep >= 2 ? "text-blue-600 font-medium" : "text-gray-400"}`}
                      >
                        Matching
                      </div>
                      <div
                        className={`text-xs text-center ${currentStep >= 3 ? "text-blue-600 font-medium" : "text-gray-400"}`}
                      >
                        Entretien
                      </div>
                    </div>
                  </div>

                  {score > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Score Actuel</span>
                        <span>{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <Badge
                        variant={score >= 70 ? "default" : score >= 50 ? "outline" : "destructive"}
                        className="mt-2"
                      >
                        {score >= 80
                          ? "Excellent"
                          : score >= 70
                            ? "Qualifié"
                            : score >= 50
                              ? "À considérer"
                              : "À améliorer"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critères d'Évaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Matching technique (50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Expérience professionnelle (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Performance entretien (20%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Facteurs comportementaux</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mb-1" />
                    <div className="text-2xl font-bold">
                      {analytics.sessionDuration ? Math.round(analytics.sessionDuration / 1000 / 60) : 0}
                    </div>
                    <div className="text-xs text-gray-500">minutes</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600 mb-1" />
                    <div className="text-2xl font-bold">{analytics.totalMessages || messages.length}</div>
                    <div className="text-xs text-gray-500">messages</div>
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
