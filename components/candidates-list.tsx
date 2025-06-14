"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Eye,
  Download,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { CVMatchingVisualization } from "@/components/cv-matching-visualization"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  score: number
  status: string
  appliedDate: string
  experience: string
  skills: string[]
}

interface CandidatesListProps {
  candidates: Candidate[]
  searchTerm?: string
  selectedJob?: string
}

export function CandidatesList({ candidates, searchTerm = "", selectedJob = "all" }: CandidatesListProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  const [showCVMatching, setShowCVMatching] = useState(false)
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null)

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJob = selectedJob === "all" || candidate.position.includes(selectedJob)
    return matchesSearch && matchesJob
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preselected":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "preselected":
        return "Présélectionné"
      case "pending":
        return "En attente"
      case "rejected":
        return "Rejeté"
      default:
        return "Inconnu"
    }
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 6) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleViewCVMatching = (candidateId: string) => {
    setCurrentCandidateId(candidateId)
    setShowCVMatching(true)
  }

  return (
    <div className="space-y-4">
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Aucun candidat ne correspond aux critères de recherche.</p>
          </CardContent>
        </Card>
      ) : (
        filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(candidate.name)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      <Badge variant={getStatusColor(candidate.status)}>{getStatusText(candidate.status)}</Badge>
                    </div>

                    <p className="text-gray-600 mb-2">{candidate.position}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Candidature: {candidate.appliedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {getScoreIcon(candidate.score)}
                      <span className="text-2xl font-bold">{candidate.score}</span>
                      <span className="text-gray-500">/10</span>
                    </div>
                    <p className="text-sm text-gray-500">Score final</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
                    >
                      {expandedCandidate === candidate.id ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Réduire
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Détails
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewCVMatching(candidate.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Matching CV
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      CV
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expandedCandidate === candidate.id && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Informations détaillées</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Expérience</h5>
                      <p className="text-sm">{candidate.experience}</p>

                      <h5 className="text-sm font-medium mt-4 mb-2">Compétences</h5>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Actions</h5>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer un email
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          Planifier un entretien
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger tous les documents
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* CV Matching Sheet */}
      <Sheet open={showCVMatching} onOpenChange={setShowCVMatching}>
        <SheetContent side="right" className="w-[90%] sm:w-[80%] md:w-[60%] lg:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Analyse de compatibilité CV</SheetTitle>
            <SheetDescription>Visualisation détaillée du matching entre le CV et le poste</SheetDescription>
          </SheetHeader>
          {currentCandidateId && <CVMatchingVisualization candidateId={currentCandidateId} />}
          <div className="mt-6 flex justify-end">
            <SheetClose asChild>
              <Button>Fermer</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
