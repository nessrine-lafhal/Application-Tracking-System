"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Brain,
  Zap,
  Star,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react"

interface CVMatchingProps {
  candidateData: any
  jobData: any
  onNext: () => void
  onPrev: () => void
}

export function EnhancedCVMatching({ candidateData, jobData, onNext, onPrev }: CVMatchingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  const finalScore = 87
  const skillsMatch = 92
  const experienceMatch = 78
  const educationMatch = 95

  useEffect(() => {
    // Animate score counter
    const timer = setInterval(() => {
      setAnimatedScore((prev) => {
        if (prev < finalScore) {
          return prev + 1
        }
        clearInterval(timer)
        return finalScore
      })
    }, 30)

    return () => clearInterval(timer)
  }, [finalScore])

  const skillsData = [
    { skill: "React", candidate: 95, required: 90, gap: 5, category: "Frontend" },
    { skill: "Node.js", candidate: 88, required: 85, gap: 3, category: "Backend" },
    { skill: "TypeScript", candidate: 82, required: 80, gap: 2, category: "Language" },
    { skill: "MongoDB", candidate: 75, required: 70, gap: 5, category: "Database" },
    { skill: "GraphQL", candidate: 65, required: 80, gap: -15, category: "API" },
    { skill: "Docker", candidate: 60, required: 75, gap: -15, category: "DevOps" },
    { skill: "AWS", candidate: 70, required: 65, gap: 5, category: "Cloud" },
    { skill: "Jest", candidate: 80, required: 70, gap: 10, category: "Testing" },
  ]

  const radarData = [
    { subject: "Frontend", candidate: 92, required: 85, fullMark: 100 },
    { subject: "Backend", candidate: 85, required: 80, fullMark: 100 },
    { subject: "Database", candidate: 75, required: 70, fullMark: 100 },
    { subject: "DevOps", candidate: 60, required: 75, fullMark: 100 },
    { subject: "Testing", candidate: 80, required: 70, fullMark: 100 },
    { subject: "Cloud", candidate: 70, required: 65, fullMark: 100 },
  ]

  const experienceData = [
    { year: "2020", candidate: 1, required: 0 },
    { year: "2021", candidate: 2, required: 1 },
    { year: "2022", candidate: 3, required: 2 },
    { year: "2023", candidate: 4, required: 3 },
    { year: "2024", candidate: 5, required: 4 },
  ]

  const categoryDistribution = [
    { name: "Compétences acquises", value: 75, color: "#10b981" },
    { name: "Compétences manquantes", value: 25, color: "#f59e0b" },
  ]

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#f97316"]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 60) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analyse de Compatibilité CV
              </h1>
              <p className="text-gray-600 mt-2">
                Évaluation intelligente pour <span className="font-semibold text-blue-600">أحمد بن علي</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card
              className={`${getScoreBg(finalScore)} border-2 transform hover:scale-105 transition-all duration-300`}
            >
              <CardContent className="p-6 text-center">
                <div className="relative">
                  <div className="text-5xl font-bold mb-2">
                    <span className={getScoreColor(finalScore)}>{animatedScore}%</span>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    {finalScore >= 80 ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : finalScore >= 60 ? (
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Score Global</p>
                <Badge
                  variant={finalScore >= 80 ? "default" : finalScore >= 60 ? "secondary" : "destructive"}
                  className="mt-2"
                >
                  {finalScore >= 80 ? "Excellent Match" : finalScore >= 60 ? "Bon Match" : "Match Faible"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200 border-2 transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600 mb-1">{skillsMatch}%</div>
                <p className="text-sm font-medium text-gray-700">Compétences</p>
                <Progress value={skillsMatch} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 border-2 transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600 mb-1">{experienceMatch}%</div>
                <p className="text-sm font-medium text-gray-700">Expérience</p>
                <Progress value={experienceMatch} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200 border-2 transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600 mb-1">{educationMatch}%</div>
                <p className="text-sm font-medium text-gray-700">Formation</p>
                <Progress value={educationMatch} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Compétences
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Profil Global
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expérience
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recommandations
            </TabsTrigger>
          </TabsList>

          {/* Skills Analysis */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Analyse Détaillée des Compétences</CardTitle>
                  <CardDescription>Comparaison candidat vs exigences du poste</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillsData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="skill" type="category" width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="candidate" name="Candidat" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="required" name="Requis" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Répartition par Catégorie</CardTitle>
                  <CardDescription>Distribution des compétences acquises</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Skills Grid */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Matrice des Compétences</CardTitle>
                <CardDescription>Cliquez sur une compétence pour voir les détails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {skillsData.map((skill, index) => (
                    <div
                      key={skill.skill}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedSkill === skill.skill
                          ? "border-blue-500 bg-blue-50"
                          : skill.gap >= 0
                            ? "border-green-200 bg-green-50 hover:border-green-300"
                            : "border-red-200 bg-red-50 hover:border-red-300"
                      }`}
                      onClick={() => setSelectedSkill(skill.skill)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{skill.skill}</span>
                        {skill.gap >= 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Candidat</span>
                          <span className="font-medium">{skill.candidate}%</span>
                        </div>
                        <Progress value={skill.candidate} className="h-1" />
                        <div className="flex justify-between text-xs">
                          <span>Requis</span>
                          <span className="font-medium">{skill.required}%</span>
                        </div>
                        <Progress value={skill.required} className="h-1 opacity-50" />
                      </div>
                      <Badge variant={skill.gap >= 0 ? "default" : "destructive"} className="mt-2 text-xs" size="sm">
                        {skill.gap >= 0 ? `+${skill.gap}` : skill.gap}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Radar Chart */}
          <TabsContent value="radar" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Profil de Compétences Global</CardTitle>
                <CardDescription>Vue d'ensemble multidimensionnelle</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="80%" data={radarData}>
                    <PolarGrid gridType="polygon" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#374151", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                    <Radar
                      name="Candidat"
                      dataKey="candidate"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                    <Radar
                      name="Requis"
                      dataKey="required"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Timeline */}
          <TabsContent value="experience" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Évolution de l'Expérience</CardTitle>
                <CardDescription>Progression dans le temps vs exigences</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={experienceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="candidate"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                      name="Expérience Candidat"
                    />
                    <Line
                      type="monotone"
                      dataKey="required"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      name="Expérience Requise"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Points Forts Identifiés
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Expertise Frontend Exceptionnelle</p>
                        <p className="text-sm text-gray-600">
                          Maîtrise avancée de React (95%) et TypeScript (82%) dépassant les exigences
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Solide Expérience Backend</p>
                        <p className="text-sm text-gray-600">
                          Compétences Node.js (88%) et MongoDB (75%) bien alignées avec le poste
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Approche Qualité</p>
                        <p className="text-sm text-gray-600">
                          Excellente maîtrise des tests (Jest 80%) montrant un souci de qualité
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-amber-200">
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Axes d'Amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Compétences DevOps à Renforcer</p>
                        <p className="text-sm text-gray-600">
                          Docker (60%) et connaissances cloud à développer pour le poste
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">GraphQL à Approfondir</p>
                        <p className="text-sm text-gray-600">
                          Niveau actuel (65%) en dessous des attentes (80%) pour ce poste
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Expérience Cloud Limitée</p>
                        <p className="text-sm text-gray-600">
                          AWS (70%) correct mais pourrait être renforcé pour les projets futurs
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recommandations Personnalisées
                </CardTitle>
                <CardDescription>Suggestions basées sur l'analyse IA pour optimiser le matching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3">Formation Recommandée</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Formation Docker & Kubernetes
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Certification AWS Solutions Architect
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        GraphQL Advanced Concepts
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3">Décision de Recrutement</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Candidat Recommandé</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Score global de 87% indiquant une excellente compatibilité avec le poste.
                      </p>
                      <Badge className="bg-green-600">Procéder à l'entretien</Badge>
                    </div>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-3">Plan d'Intégration</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        Mentorat DevOps (3 mois)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        Projet GraphQL pilote
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        Formation cloud interne
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Étape Précédente
          </Button>
          <Button onClick={onNext} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
            Continuer vers l'Entretien
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
