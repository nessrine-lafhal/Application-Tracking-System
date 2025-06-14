"use client"

import { useState } from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Award, Briefcase, GraduationCap, Code, Clock } from "lucide-react"

interface CVMatchingVisualizationProps {
  candidateId: string
  jobId?: string
}

export function CVMatchingVisualization({ candidateId, jobId }: CVMatchingVisualizationProps) {
  const [selectedJob, setSelectedJob] = useState(jobId || "job1")

  // Mock data for CV matching
  const mockCandidateData = {
    id: candidateId,
    name: "أحمد بن علي",
    email: "ahmed.benali@email.com",
    overallMatch: 85,
    jobs: {
      job1: {
        title: "Développeur Full Stack",
        overallMatch: 85,
        skillsMatch: 88,
        experienceMatch: 75,
        educationMatch: 90,
        skillsData: [
          { skill: "React", candidate: 90, required: 80 },
          { skill: "Node.js", candidate: 85, required: 90 },
          { skill: "TypeScript", candidate: 75, required: 70 },
          { skill: "MongoDB", candidate: 80, required: 60 },
          { skill: "GraphQL", candidate: 60, required: 80 },
          { skill: "Docker", candidate: 50, required: 70 },
        ],
        radarData: [
          { subject: "Compétences techniques", candidate: 88, job: 100, fullMark: 100 },
          { subject: "Expérience", candidate: 75, job: 100, fullMark: 100 },
          { subject: "Formation", candidate: 90, job: 100, fullMark: 100 },
          { subject: "Soft skills", candidate: 82, job: 100, fullMark: 100 },
          { subject: "Langues", candidate: 95, job: 100, fullMark: 100 },
          { subject: "Certifications", candidate: 70, job: 100, fullMark: 100 },
        ],
        keywordMatches: [
          { keyword: "React", match: true },
          { keyword: "Node.js", match: true },
          { keyword: "TypeScript", match: true },
          { keyword: "MongoDB", match: true },
          { keyword: "GraphQL", match: false },
          { keyword: "Docker", match: false },
          { keyword: "CI/CD", match: false },
          { keyword: "AWS", match: true },
        ],
        experienceData: [
          { name: "0-1 an", candidate: 0, required: 0 },
          { name: "1-3 ans", candidate: 100, required: 100 },
          { name: "3-5 ans", candidate: 0, required: 0 },
          { name: "5+ ans", candidate: 0, required: 0 },
        ],
      },
      job2: {
        title: "Développeur Frontend",
        overallMatch: 92,
        skillsMatch: 95,
        experienceMatch: 85,
        educationMatch: 90,
        skillsData: [
          { skill: "React", candidate: 90, required: 90 },
          { skill: "Vue.js", candidate: 70, required: 60 },
          { skill: "CSS/SASS", candidate: 85, required: 80 },
          { skill: "JavaScript", candidate: 95, required: 90 },
          { skill: "TypeScript", candidate: 75, required: 70 },
          { skill: "Responsive Design", candidate: 90, required: 85 },
        ],
        radarData: [
          { subject: "Compétences techniques", candidate: 95, job: 100, fullMark: 100 },
          { subject: "Expérience", candidate: 85, job: 100, fullMark: 100 },
          { subject: "Formation", candidate: 90, job: 100, fullMark: 100 },
          { subject: "Soft skills", candidate: 82, job: 100, fullMark: 100 },
          { subject: "Langues", candidate: 95, job: 100, fullMark: 100 },
          { subject: "Certifications", candidate: 80, job: 100, fullMark: 100 },
        ],
        keywordMatches: [
          { keyword: "React", match: true },
          { keyword: "Vue.js", match: true },
          { keyword: "CSS/SASS", match: true },
          { keyword: "JavaScript", match: true },
          { keyword: "TypeScript", match: true },
          { keyword: "Responsive Design", match: true },
          { keyword: "UI/UX", match: false },
          { keyword: "Testing", match: true },
        ],
        experienceData: [
          { name: "0-1 an", candidate: 0, required: 0 },
          { name: "1-3 ans", candidate: 100, required: 100 },
          { name: "3-5 ans", candidate: 0, required: 0 },
          { name: "5+ ans", candidate: 0, required: 0 },
        ],
      },
      job3: {
        title: "Data Scientist",
        overallMatch: 65,
        skillsMatch: 60,
        experienceMatch: 70,
        educationMatch: 80,
        skillsData: [
          { skill: "Python", candidate: 70, required: 90 },
          { skill: "Machine Learning", candidate: 60, required: 85 },
          { skill: "SQL", candidate: 75, required: 80 },
          { skill: "TensorFlow", candidate: 50, required: 75 },
          { skill: "Data Visualization", candidate: 65, required: 70 },
          { skill: "Statistics", candidate: 55, required: 80 },
        ],
        radarData: [
          { subject: "Compétences techniques", candidate: 60, job: 100, fullMark: 100 },
          { subject: "Expérience", candidate: 70, job: 100, fullMark: 100 },
          { subject: "Formation", candidate: 80, job: 100, fullMark: 100 },
          { subject: "Soft skills", candidate: 82, job: 100, fullMark: 100 },
          { subject: "Langues", candidate: 95, job: 100, fullMark: 100 },
          { subject: "Certifications", candidate: 50, job: 100, fullMark: 100 },
        ],
        keywordMatches: [
          { keyword: "Python", match: true },
          { keyword: "Machine Learning", match: false },
          { keyword: "SQL", match: true },
          { keyword: "TensorFlow", match: false },
          { keyword: "Data Visualization", match: true },
          { keyword: "Statistics", match: false },
          { keyword: "Big Data", match: false },
          { keyword: "R", match: false },
        ],
        experienceData: [
          { name: "0-1 an", candidate: 100, required: 0 },
          { name: "1-3 ans", candidate: 0, required: 100 },
          { name: "3-5 ans", candidate: 0, required: 0 },
          { name: "5+ ans", candidate: 0, required: 0 },
        ],
      },
    },
  }

  const jobData = mockCandidateData.jobs[selectedJob]
  const matchColor =
    jobData.overallMatch >= 80 ? "text-green-600" : jobData.overallMatch >= 60 ? "text-amber-600" : "text-red-600"

  return (
    <div className="space-y-6">
      {/* Header with overall match score */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Compatibilité CV</CardTitle>
              <CardDescription>
                Analyse de compatibilité pour <span className="font-medium">{mockCandidateData.name}</span>
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold flex items-center">
                <span className={matchColor}>{jobData.overallMatch}%</span>
                {jobData.overallMatch >= 80 ? (
                  <CheckCircle className="ml-2 h-8 w-8 text-green-600" />
                ) : jobData.overallMatch >= 60 ? (
                  <AlertCircle className="ml-2 h-8 w-8 text-amber-600" />
                ) : (
                  <XCircle className="ml-2 h-8 w-8 text-red-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Score de compatibilité</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <div className="flex items-center mb-1">
                <Code className="h-5 w-5 mr-1 text-blue-600" />
                <span className="font-medium">Compétences</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{jobData.skillsMatch}%</div>
              <Progress value={jobData.skillsMatch} className="h-2 mt-1" />
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <div className="flex items-center mb-1">
                <Briefcase className="h-5 w-5 mr-1 text-purple-600" />
                <span className="font-medium">Expérience</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{jobData.experienceMatch}%</div>
              <Progress value={jobData.experienceMatch} className="h-2 mt-1" />
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
              <div className="flex items-center mb-1">
                <GraduationCap className="h-5 w-5 mr-1 text-green-600" />
                <span className="font-medium">Formation</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{jobData.educationMatch}%</div>
              <Progress value={jobData.educationMatch} className="h-2 mt-1" />
            </div>
          </div>

          {/* Job selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-medium mt-1">Poste:</span>
            {Object.entries(mockCandidateData.jobs).map(([id, job]) => (
              <Button
                key={id}
                variant={selectedJob === id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedJob(id)}
              >
                {job.title}
                <Badge variant="outline" className="ml-2">
                  {job.overallMatch}%
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed visualizations */}
      <Tabs defaultValue="radar" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="radar">Profil global</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
          <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
          <TabsTrigger value="experience">Expérience</TabsTrigger>
        </TabsList>

        {/* Radar Chart */}
        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil de compatibilité</CardTitle>
              <CardDescription>Analyse multidimensionnelle de la compatibilité avec le poste</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={jobData.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Candidat"
                    dataKey="candidate"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Poste"
                    dataKey="job"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary) / 0.3)"
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Bar Chart */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des compétences</CardTitle>
              <CardDescription>Comparaison entre les compétences du candidat et les exigences du poste</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobData.skillsData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="candidate" name="Candidat" fill="hsl(var(--primary))" />
                  <Bar dataKey="required" name="Requis" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Matching */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correspondance des mots-clés</CardTitle>
              <CardDescription>Mots-clés trouvés dans le CV par rapport aux exigences du poste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobData.keywordMatches.map((item, index) => (
                  <Badge
                    key={index}
                    variant={item.match ? "default" : "outline"}
                    className={item.match ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"}
                  >
                    {item.keyword}
                    {item.match && <CheckCircle className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-400 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Points forts
                  </h4>
                  <ul className="space-y-1 text-sm text-green-800 dark:text-green-300">
                    <li>• Excellente maîtrise de React et JavaScript</li>
                    <li>• Bonne expérience en développement frontend</li>
                    <li>• Connaissance solide des bases de données MongoDB</li>
                    <li>• Compétences en TypeScript conformes aux exigences</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <h4 className="font-medium text-amber-900 dark:text-amber-400 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Points à améliorer
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-300">
                    <li>• Expérience limitée avec GraphQL</li>
                    <li>• Connaissances Docker insuffisantes</li>
                    <li>• Manque d'expérience en CI/CD</li>
                    <li>• Certifications techniques supplémentaires recommandées</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Matching */}
        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de l'expérience</CardTitle>
              <CardDescription>Comparaison entre l'expérience du candidat et les exigences du poste</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobData.experienceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="candidate" name="Candidat" fill="hsl(var(--primary))" />
                  <Bar dataKey="required" name="Requis" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  <div>
                    <p className="font-medium">Expérience totale: 3 ans</p>
                    <p className="text-sm text-muted-foreground">Expérience requise: 1-3 ans</p>
                  </div>
                  <Badge className="ml-auto" variant="outline">
                    Compatible
                  </Badge>
                </div>

                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-600" />
                  <div>
                    <p className="font-medium">Niveau de séniorité: Intermédiaire</p>
                    <p className="text-sm text-muted-foreground">Niveau requis: Intermédiaire</p>
                  </div>
                  <Badge className="ml-auto" variant="outline">
                    Compatible
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
