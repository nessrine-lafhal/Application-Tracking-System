"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CVMatchingVisualization } from "@/components/cv-matching-visualization"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Search, Filter, Download, Users, FileText, BarChart3 } from "lucide-react"

// Mock data for the dashboard
const mockJobs = [
  { id: "job1", title: "Développeur Full Stack" },
  { id: "job2", title: "Développeur Frontend" },
  { id: "job3", title: "Data Scientist" },
]

const mockCandidates = [
  { id: "1", name: "أحمد بن علي", score: 85, status: "preselected" },
  { id: "2", name: "فاطمة المنصوري", score: 92, status: "preselected" },
  { id: "3", name: "محمد الطرابلسي", score: 65, status: "pending" },
  { id: "4", name: "زينب الحمامي", score: 45, status: "rejected" },
  { id: "5", name: "عمر بن يوسف", score: 78, status: "pending" },
]

const matchingDistribution = [
  { name: "Excellente (80-100%)", value: 2, color: "#22c55e" },
  { name: "Bonne (60-79%)", value: 1, color: "#eab308" },
  { name: "Moyenne (40-59%)", value: 1, color: "#f97316" },
  { name: "Faible (0-39%)", value: 1, color: "#ef4444" },
]

const skillsGapData = [
  { name: "React", required: 90, available: 85, gap: 5 },
  { name: "Node.js", required: 85, available: 80, gap: 5 },
  { name: "TypeScript", required: 80, available: 75, gap: 5 },
  { name: "MongoDB", required: 75, available: 80, gap: -5 },
  { name: "GraphQL", required: 70, available: 50, gap: 20 },
  { name: "Docker", required: 65, available: 40, gap: 25 },
]

export function CVMatchingDashboard() {
  const [selectedJob, setSelectedJob] = useState("job1")
  const [selectedCandidate, setSelectedCandidate] = useState("1")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCandidates = mockCandidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <Label htmlFor="job-select">Poste</Label>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger id="job-select">
                <SelectValue placeholder="Sélectionner un poste" />
              </SelectTrigger>
              <SelectContent>
                {mockJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <Label htmlFor="search-candidates">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-candidates"
                placeholder="Rechercher un candidat..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="h-4 w-4 mr-2" />
            Candidats
          </TabsTrigger>
          <TabsTrigger value="detailed">
            <FileText className="h-4 w-4 mr-2" />
            Analyse détaillée
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution des matchings</CardTitle>
                <CardDescription>Répartition des candidats par niveau de compatibilité</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={matchingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {matchingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skills Gap Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse des écarts de compétences</CardTitle>
                <CardDescription>Écarts entre les compétences requises et disponibles</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsGapData} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="required" name="Requis" fill="hsl(var(--primary))" />
                    <Bar dataKey="available" name="Disponible" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Candidats évalués</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCandidates.length}</div>
                <p className="text-xs text-muted-foreground">+2 depuis la semaine dernière</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground">+5% depuis la semaine dernière</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux de présélection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">40%</div>
                <p className="text-xs text-muted-foreground">+10% depuis la semaine dernière</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Compétence la plus rare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Docker</div>
                <p className="text-xs text-muted-foreground">25% d'écart avec les besoins</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidats pour {mockJobs.find((job) => job.id === selectedJob)?.title}</CardTitle>
              <CardDescription>Classement des candidats par score de compatibilité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCandidates.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Aucun candidat trouvé</p>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted transition-colors ${selectedCandidate === candidate.id ? "border-primary" : ""}`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {mockJobs.find((job) => job.id === selectedJob)?.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p
                            className={`text-lg font-bold ${
                              candidate.score >= 80
                                ? "text-green-600"
                                : candidate.score >= 60
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {candidate.score}%
                          </p>
                          <p className="text-xs text-muted-foreground">Score de matching</p>
                        </div>
                        <Badge
                          variant={
                            candidate.status === "preselected"
                              ? "default"
                              : candidate.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {candidate.status === "preselected"
                            ? "Présélectionné"
                            : candidate.status === "pending"
                              ? "En attente"
                              : "Rejeté"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Analysis Tab */}
        <TabsContent value="detailed" className="space-y-4">
          {selectedCandidate ? (
            <CVMatchingVisualization candidateId={selectedCandidate} jobId={selectedJob} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Veuillez sélectionner un candidat pour voir l'analyse détaillée</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
