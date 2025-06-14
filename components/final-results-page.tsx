"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Share2,
  Trophy,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Award,
  BarChart3,
  PieChart,
  Users,
  Clock,
  Mail,
  FileText,
  Lightbulb,
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react"
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
  PieChart as RechartsPieChart,
  Cell,
} from "recharts"

interface FinalResultsProps {
  candidateData?: {
    name: string
    email: string
    phone: string
    position: string
    location: string
    applicationDate: string
  }
  scores?: {
    overall: number
    technical: number
    experience: number
    interview: number
    cultural: number
    communication: number
  }
  analysis?: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    nextSteps: string[]
  }
  comparison?: {
    averageScore: number
    topPercentile: number
    similarProfiles: number
  }
}

export function FinalResultsPage({
  candidateData = {
    name: "Sophie Berrada",
    email: "sophie.berrada@email.com",
    phone: "+33 6 12 34 56 78",
    position: "Développeur Full Stack Senior",
    location: "Paris, France",
    applicationDate: "15 Décembre 2024",
  },
  scores = {
    overall: 87,
    technical: 92,
    experience: 85,
    interview: 88,
    cultural: 82,
    communication: 90,
  },
  analysis = {
    strengths: [
      "Excellente maîtrise technique des technologies modernes",
      "Expérience solide en développement full-stack",
      "Très bonnes compétences en communication",
      "Capacité d'adaptation et d'apprentissage rapide",
      "Leadership naturel et esprit d'équipe",
    ],
    weaknesses: [
      "Expérience limitée avec les architectures cloud",
      "Connaissances en DevOps à approfondir",
      "Gestion de projet à renforcer",
    ],
    recommendations: [
      "Formation complémentaire en architecture cloud (AWS/Azure)",
      "Certification en méthodologies Agile/Scrum",
      "Participation à des projets open source",
      "Mentorat junior pour développer le leadership",
    ],
    nextSteps: [
      "Entretien technique approfondi avec l'équipe",
      "Présentation d'un projet personnel",
      "Rencontre avec le manager direct",
      "Négociation des conditions",
    ],
  },
  comparison = {
    averageScore: 72,
    topPercentile: 15,
    similarProfiles: 156,
  },
}: FinalResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [animatedScores, setAnimatedScores] = useState({
    overall: 0,
    technical: 0,
    experience: 0,
    interview: 0,
    cultural: 0,
    communication: 0,
  })

  useEffect(() => {
    // Animation des scores
    const timer = setTimeout(() => {
      setAnimatedScores(scores)
    }, 500)
    return () => clearTimeout(timer)
  }, [scores])

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Trophy className="h-5 w-5" />
    if (score >= 70) return <Target className="h-5 w-5" />
    if (score >= 60) return <TrendingUp className="h-5 w-5" />
    return <AlertCircle className="h-5 w-5" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent"
    if (score >= 70) return "Très Bon"
    if (score >= 60) return "Satisfaisant"
    return "À Améliorer"
  }

  const radarData = [
    { subject: "Technique", score: scores.technical, fullMark: 100 },
    { subject: "Expérience", score: scores.experience, fullMark: 100 },
    { subject: "Entretien", score: scores.interview, fullMark: 100 },
    { subject: "Culture", score: scores.cultural, fullMark: 100 },
    { subject: "Communication", score: scores.communication, fullMark: 100 },
  ]

  const comparisonData = [
    { name: "Candidat", score: scores.overall },
    { name: "Moyenne", score: comparison.averageScore },
    { name: "Top 10%", score: 90 },
  ]

  const skillsBreakdown = [
    { name: "Frontend", value: 95, color: "#3b82f6" },
    { name: "Backend", value: 88, color: "#10b981" },
    { name: "Database", value: 82, color: "#f59e0b" },
    { name: "DevOps", value: 65, color: "#ef4444" },
  ]

  const timelineData = [
    { step: "CV Reçu", date: "15 Déc", status: "completed" },
    { step: "Pré-sélection", date: "16 Déc", status: "completed" },
    { step: "Évaluation IA", date: "17 Déc", status: "completed" },
    { step: "Entretien RH", date: "20 Déc", status: "pending" },
    { step: "Entretien Technique", date: "22 Déc", status: "pending" },
    { step: "Décision Finale", date: "24 Déc", status: "pending" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rapport d'Évaluation Final
          </h1>
          <p className="text-xl text-gray-600">Analyse complète du profil candidat</p>
        </div>

        {/* Candidate Info Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{candidateData.name}</h3>
                <p className="text-blue-100">{candidateData.position}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{candidateData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{candidateData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{candidateData.location}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Candidature: {candidateData.applicationDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Évalué parmi {comparison.similarProfiles} candidats</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${getScoreColor(scores.overall)} mb-4`}
              >
                {getScoreIcon(scores.overall)}
              </div>
              <div className="text-4xl font-bold mb-2">{animatedScores.overall}%</div>
              <div className="text-lg font-medium text-gray-600 mb-2">Score Global</div>
              <Badge variant="secondary" className={getScoreColor(scores.overall)}>
                {getScoreLabel(scores.overall)}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">Top {comparison.topPercentile}%</div>
              <div className="text-lg font-medium text-gray-600 mb-4">Classement</div>
              <div className="text-sm text-gray-500">Meilleur que {100 - comparison.topPercentile}% des candidats</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+{scores.overall - comparison.averageScore}</div>
              <div className="text-lg font-medium text-gray-600 mb-4">vs Moyenne</div>
              <div className="text-sm text-gray-500">Score moyen: {comparison.averageScore}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Compétences
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Analyse
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Comparaison
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Processus
            </TabsTrigger>
            <TabsTrigger value="frontend" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Frontend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Profil de Compétences
                  </CardTitle>
                  <CardDescription>Évaluation multidimensionnelle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Frontend Expertise */}
              <Card className="border-0 shadow-xl mt-6 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Expertise Frontend
                  </CardTitle>
                  <CardDescription>Évaluation des compétences clés en développement frontend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "Frameworks JS",
                        score: 95,
                        icon: <div className="text-2xl">⚛️</div>,
                        color: "from-blue-500 to-blue-600",
                        details: "React, Vue, Angular",
                      },
                      {
                        name: "UI/UX",
                        score: 90,
                        icon: <div className="text-2xl">🎨</div>,
                        color: "from-purple-500 to-purple-600",
                        details: "Design Systems, Figma",
                      },
                      {
                        name: "Performance",
                        score: 88,
                        icon: <div className="text-2xl">⚡</div>,
                        color: "from-amber-500 to-amber-600",
                        details: "Optimisation, Lazy loading",
                      },
                    ].map((item, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl h-32 group">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-90 group-hover:opacity-100 transition-all`}
                        />
                        <div className="absolute inset-0 p-4 text-white flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-lg">{item.name}</div>
                              <div className="text-xs opacity-90 mt-1">{item.details}</div>
                            </div>
                            {item.icon}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">Niveau</span>
                              <span className="text-xs font-bold">{item.score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/30 rounded-full">
                              <div className="h-full bg-white rounded-full" style={{ width: `${item.score}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Scores Détaillés
                  </CardTitle>
                  <CardDescription>Évaluation par catégorie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(scores)
                    .filter(([key]) => key !== "overall")
                    .map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {key === "technical"
                              ? "Technique"
                              : key === "experience"
                                ? "Expérience"
                                : key === "interview"
                                  ? "Entretien"
                                  : key === "cultural"
                                    ? "Culture"
                                    : key === "communication"
                                      ? "Communication"
                                      : key}
                          </span>
                          <span className="font-bold">{value}%</span>
                        </div>
                        <Progress value={value} className="h-3" />
                        <div className="flex justify-end">
                          <Badge variant="outline" className={getScoreColor(value)}>
                            {getScoreLabel(value)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Breakdown */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Répartition des Compétences</CardTitle>
                  <CardDescription>Analyse technique détaillée</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Tooltip />
                        <RechartsPieChart data={skillsBreakdown}>
                          {skillsBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RechartsPieChart>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {skillsBreakdown.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }} />
                        <span className="text-sm">
                          {skill.name}: {skill.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Skills */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Compétences Frontend</CardTitle>
                  <CardDescription>Technologies et frameworks maîtrisés</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "React", level: 95, icon: "⚛️", color: "bg-blue-500" },
                      { name: "Vue.js", level: 78, icon: "🟢", color: "bg-green-500" },
                      { name: "Angular", level: 65, icon: "🔴", color: "bg-red-500" },
                      { name: "Svelte", level: 72, icon: "🟠", color: "bg-orange-500" },
                    ].map((skill, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{skill.icon}</span>
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${skill.color} transition-all duration-1000`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <div className="mt-1 text-right text-sm font-semibold">{skill.level}%</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Écosystème React</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Next.js", level: 92, color: "from-black to-gray-700" },
                        { name: "Redux", level: 88, color: "from-purple-600 to-purple-400" },
                        { name: "React Query", level: 85, color: "from-red-600 to-red-400" },
                        { name: "Styled Components", level: 90, color: "from-pink-600 to-pink-400" },
                        { name: "Tailwind CSS", level: 95, color: "from-cyan-600 to-cyan-400" },
                        { name: "Material UI", level: 82, color: "from-blue-600 to-blue-400" },
                      ].map((skill, index) => (
                        <div key={index} className="relative h-24 rounded-lg overflow-hidden group">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${skill.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                          />
                          <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
                            <span className="font-medium">{skill.name}</span>
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-6 rounded-sm ${
                                      i < Math.floor(skill.level / 20) ? "bg-white" : "bg-white/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-bold">{skill.level}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Outils & Workflow</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Webpack", level: "Avancé", color: "bg-blue-100 text-blue-800" },
                        { name: "Vite", level: "Expert", color: "bg-purple-100 text-purple-800" },
                        { name: "ESLint", level: "Expert", color: "bg-indigo-100 text-indigo-800" },
                        { name: "Jest", level: "Intermédiaire", color: "bg-red-100 text-red-800" },
                        { name: "Cypress", level: "Avancé", color: "bg-green-100 text-green-800" },
                        { name: "Storybook", level: "Avancé", color: "bg-amber-100 text-amber-800" },
                        { name: "Git", level: "Expert", color: "bg-orange-100 text-orange-800" },
                        { name: "CI/CD", level: "Intermédiaire", color: "bg-cyan-100 text-cyan-800" },
                        { name: "Figma", level: "Avancé", color: "bg-pink-100 text-pink-800" },
                      ].map((tool, index) => (
                        <div
                          key={index}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${tool.color} flex items-center gap-1.5`}
                        >
                          {tool.name}
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/50 text-xs">
                            {tool.level === "Expert" ? "A+" : tool.level === "Avancé" ? "A" : "B"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Points Forts
                  </CardTitle>
                  <CardDescription>Atouts majeurs du candidat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Star className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <TrendingUp className="h-5 w-5" />
                    Axes d'Amélioration
                  </CardTitle>
                  <CardDescription>Points à développer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-0 shadow-xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Lightbulb className="h-5 w-5" />
                    Recommandations
                  </CardTitle>
                  <CardDescription>Suggestions pour le développement professionnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Comparaison avec le Marché</CardTitle>
                <CardDescription>Position du candidat par rapport aux autres profils</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Processus de Recrutement</CardTitle>
                <CardDescription>Étapes et prochaines actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineData.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          item.status === "completed"
                            ? "bg-green-500"
                            : item.status === "pending"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.step}</div>
                        <div className="text-sm text-gray-500">{item.date}</div>
                      </div>
                      <Badge variant={item.status === "completed" ? "default" : "outline"}>
                        {item.status === "completed" ? "Terminé" : "En attente"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-medium">Prochaines Étapes Recommandées</h4>
                  {analysis.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Frontend Performance */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Performance Frontend
                  </CardTitle>
                  <CardDescription>Évaluation des compétences clés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        name: "Architecture UI",
                        score: 92,
                        details: "Excellente maîtrise des patterns de conception React",
                      },
                      {
                        name: "Performance",
                        score: 88,
                        details: "Optimisation avancée du rendu et des ressources",
                      },
                      {
                        name: "Responsive Design",
                        score: 95,
                        details: "Maîtrise parfaite des interfaces adaptatives",
                      },
                      {
                        name: "Accessibilité",
                        score: 85,
                        details: "Bonne connaissance des standards WCAG",
                      },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.details}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium ${
                                item.score >= 90
                                  ? "bg-green-100 text-green-800"
                                  : item.score >= 80
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.score}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.score >= 90
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : item.score >= 80
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                  : "bg-gradient-to-r from-amber-500 to-orange-500"
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Frontend Projects */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Projets Frontend
                  </CardTitle>
                  <CardDescription>Réalisations et contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Refonte E-commerce",
                        tech: "Next.js, Redux, Tailwind",
                        impact: "Performance +45%, Conversion +12%",
                        color: "border-l-blue-500",
                      },
                      {
                        name: "Dashboard Analytics",
                        tech: "React, D3.js, Material UI",
                        impact: "Temps de chargement -60%",
                        color: "border-l-purple-500",
                      },
                      {
                        name: "Application Mobile Hybride",
                        tech: "React Native, GraphQL",
                        impact: "4.8/5 sur les stores",
                        color: "border-l-green-500",
                      },
                      {
                        name: "Système de Design",
                        tech: "Storybook, Styled Components",
                        impact: "Réduction du temps de développement de 30%",
                        color: "border-l-amber-500",
                      },
                    ].map((project, index) => (
                      <div
                        key={index}
                        className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${project.color} hover:shadow-md transition-shadow`}
                      >
                        <h4 className="font-medium">{project.name}</h4>
                        <div className="text-sm text-gray-500 mt-1">{project.tech}</div>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">{project.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Frontend Certifications */}
              <Card className="border-0 shadow-xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Certifications & Formations Frontend
                  </CardTitle>
                  <CardDescription>Qualifications et développement professionnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "React Advanced Patterns",
                        issuer: "Frontend Masters",
                        date: "Juin 2024",
                        icon: "⚛️",
                        color: "bg-gradient-to-br from-blue-500 to-blue-600",
                      },
                      {
                        name: "Performance Web",
                        issuer: "Google Developers",
                        date: "Mars 2024",
                        icon: "🚀",
                        color: "bg-gradient-to-br from-green-500 to-green-600",
                      },
                      {
                        name: "Accessibilité Numérique",
                        issuer: "W3C / edX",
                        date: "Janvier 2024",
                        icon: "♿",
                        color: "bg-gradient-to-br from-purple-500 to-purple-600",
                      },
                      {
                        name: "TypeScript Avancé",
                        issuer: "Microsoft Learn",
                        date: "Novembre 2023",
                        icon: "🔷",
                        color: "bg-gradient-to-br from-blue-600 to-indigo-600",
                      },
                      {
                        name: "Architecture Micro-Frontend",
                        issuer: "O'Reilly",
                        date: "Septembre 2023",
                        icon: "🏗️",
                        color: "bg-gradient-to-br from-amber-500 to-amber-600",
                      },
                      {
                        name: "Design System Mastery",
                        issuer: "Figma Academy",
                        date: "Juillet 2023",
                        icon: "🎨",
                        color: "bg-gradient-to-br from-pink-500 to-pink-600",
                      },
                    ].map((cert, index) => (
                      <div key={index} className="relative group">
                        <div
                          className={`absolute inset-0 rounded-xl ${cert.color} opacity-90 group-hover:opacity-100 transition-opacity`}
                        />
                        <div className="relative p-5 text-white">
                          <div className="text-3xl mb-2">{cert.icon}</div>
                          <h4 className="font-medium">{cert.name}</h4>
                          <div className="text-sm opacity-90 mt-1">{cert.issuer}</div>
                          <div className="text-xs mt-3 opacity-75">{cert.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Télécharger le Rapport PDF
          </Button>
          <Button size="lg" variant="outline">
            <Share2 className="h-5 w-5 mr-2" />
            Partager les Résultats
          </Button>
          <Button size="lg" variant="outline">
            <Mail className="h-5 w-5 mr-2" />
            Envoyer au Candidat
          </Button>
          <Button size="lg" variant="outline">
            <FileText className="h-5 w-5 mr-2" />
            Générer Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}
