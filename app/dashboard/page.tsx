"use client"

import { useState } from "react"
import { BarChart3, Shield, TrendingUp, Users, ChevronDown, Plus, FileText, Briefcase } from "lucide-react"

import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Search } from "@/components/search"
import { DocumentVerificationDashboard } from "@/components/document-verification-dashboard"
import { StatsCards } from "@/components/stats-cards"
import { CandidatesList } from "@/components/candidates-list"
import { CVMatchingDashboard } from "@/components/cv-matching-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { JobOffersList } from "@/components/job-offers-list"

const tabs = [
  { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
  { id: "candidates", label: "Candidats", icon: Users },
  { id: "jobs", label: "Offres d'emploi", icon: Briefcase },
  { id: "cv-matching", label: "Matching CV", icon: FileText },
  { id: "documents", label: "Vérification Documents", icon: Shield },
  { id: "analytics", label: "Analyses", icon: TrendingUp },
]

// Mock data for dashboard
const dashboardStats = {
  totalCandidates: 156,
  preselected: 23,
  rejected: 89,
  pending: 44,
  avgScore: 7.8,
  conversionRate: 14.7,
}

const mockCandidates = [
  {
    id: "1",
    name: "Ahmed Ben Ali",
    email: "ahmed.benali@email.com",
    phone: "+216 12 345 678",
    position: "Développeur Full Stack",
    score: 8.5,
    status: "preselected",
    appliedDate: "2024-01-15",
    experience: "3 ans",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
  },
  {
    id: "2",
    name: "Fatima Mansouri",
    email: "fatima.mansouri@email.com",
    phone: "+216 98 765 432",
    position: "Designer UX/UI",
    score: 9.2,
    status: "preselected",
    appliedDate: "2024-01-14",
    experience: "5 ans",
    skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
  },
  {
    id: "3",
    name: "Mohamed Trabelsi",
    email: "mohamed.trabelsi@email.com",
    phone: "+216 55 123 456",
    position: "Data Scientist",
    score: 7.8,
    status: "pending",
    appliedDate: "2024-01-13",
    experience: "4 ans",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
  },
  {
    id: "4",
    name: "Zeineb Hammami",
    email: "zeineb.hammami@email.com",
    phone: "+216 77 888 999",
    position: "Chef de Projet",
    score: 6.5,
    status: "rejected",
    appliedDate: "2024-01-12",
    experience: "6 ans",
    skills: ["Agile", "Scrum", "JIRA", "Leadership"],
  },
  {
    id: "5",
    name: "Omar Ben Youssef",
    email: "omar.benyoussef@email.com",
    phone: "+216 22 333 444",
    position: "Développeur Mobile",
    score: 8.1,
    status: "preselected",
    appliedDate: "2024-01-11",
    experience: "2 ans",
    skills: ["React Native", "Flutter", "iOS", "Android"],
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord Recruteur</h2>
        <p className="text-muted-foreground">Gérez vos candidatures et suivez les performances de recrutement</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <Search />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filtrer <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
            <DropdownMenuItem>Date de candidature</DropdownMenuItem>
            <DropdownMenuItem>Statut</DropdownMenuItem>
            <DropdownMenuItem>Score</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Poste</DropdownMenuItem>
            <DropdownMenuItem>Expérience</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle offre
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardStats} />

      {/* Main Content with Tabs */}
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64">
          <div className="rounded-md border">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-none p-4",
                  activeTab === tab.id ? "bg-secondary text-foreground" : "hover:bg-secondary/50",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Vue d'ensemble</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Candidatures par mois</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Candidats récents</CardTitle>
                    <p className="text-sm text-muted-foreground">{mockCandidates.length} candidats ce mois</p>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline">
                      Planifier entretien
                    </Button>
                    <Button className="w-full" variant="outline">
                      Envoyer email
                    </Button>
                    <Button className="w-full" variant="outline">
                      Générer rapport
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alertes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-orange-600">3</span> entretiens aujourd'hui
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-blue-600">12</span> nouvelles candidatures
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">5</span> documents vérifiés
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        Taux de réponse: <span className="font-medium text-green-600">87%</span>
                      </div>
                      <div className="text-sm">
                        Temps moyen: <span className="font-medium">3.2 jours</span>
                      </div>
                      <div className="text-sm">
                        Satisfaction: <span className="font-medium text-green-600">4.8/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Gestion des Candidats</h3>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Inviter candidat
                </Button>
              </div>
              <CandidatesList candidates={mockCandidates} />
            </div>
          )}

          {activeTab === "cv-matching" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Analyse de Matching CV</h3>
              </div>
              <CVMatchingDashboard />
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Vérification des Documents</h3>
              </div>
              <DocumentVerificationDashboard candidateId="1" />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Analyses et Rapports</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendances de recrutement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Développeurs</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Designers</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Scientists</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chefs de projet</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sources de candidatures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Site web</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LinkedIn</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recommandations</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Autres</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Gestion des Offres d'Emploi</h3>
              </div>
              <JobOffersList />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
