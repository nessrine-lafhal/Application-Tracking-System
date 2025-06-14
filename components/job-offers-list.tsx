"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Users, Eye, Calendar, Building, Search, Filter, Plus } from "lucide-react"
import { jobOffers, type JobOffer } from "@/lib/job-offers-data"
import { cn } from "@/lib/utils"

interface JobOffersListProps {
  onSelectJob?: (job: JobOffer) => void
  selectedJobId?: string
}

export function JobOffersList({ onSelectJob, selectedJobId }: JobOffersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")

  const filteredJobs = jobOffers.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || job.department === departmentFilter
    const matchesType = typeFilter === "all" || job.type === typeFilter
    const matchesExperience = experienceFilter === "all" || job.experience.includes(experienceFilter)

    return matchesSearch && matchesDepartment && matchesType && matchesExperience
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CDI":
        return "bg-blue-100 text-blue-800"
      case "CDD":
        return "bg-purple-100 text-purple-800"
      case "Freelance":
        return "bg-orange-100 text-orange-800"
      case "Stage":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Offres d'emploi</h2>
          <p className="text-muted-foreground">{filteredJobs.length} offres disponibles</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle offre
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            <SelectItem value="Technologie">Technologie</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Data & IA">Data & IA</SelectItem>
            <SelectItem value="Management">Management</SelectItem>
            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
            <SelectItem value="Sécurité">Sécurité</SelectItem>
            <SelectItem value="Produit">Produit</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Type de contrat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="CDI">CDI</SelectItem>
            <SelectItem value="CDD">CDD</SelectItem>
            <SelectItem value="Freelance">Freelance</SelectItem>
            <SelectItem value="Stage">Stage</SelectItem>
          </SelectContent>
        </Select>

        <Select value={experienceFilter} onValueChange={setExperienceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Expérience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute expérience</SelectItem>
            <SelectItem value="0-2">0-2 ans</SelectItem>
            <SelectItem value="2-4">2-4 ans</SelectItem>
            <SelectItem value="3-5">3-5 ans</SelectItem>
            <SelectItem value="4-6">4-6 ans</SelectItem>
            <SelectItem value="5+">5+ ans</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Plus de filtres
        </Button>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedJobId === job.id && "ring-2 ring-primary",
            )}
            onClick={() => onSelectJob?.(job)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status === "active" ? "Actif" : job.status === "closed" ? "Fermé" : "Brouillon"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.experience}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold text-green-600">
                    {job.salary.min} - {job.salary.max} {job.salary.currency}/{job.salary.period}
                  </div>
                  <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skills.required.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.required.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills.required.length - 5} autres
                  </Badge>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {job.applicationsCount} candidatures
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {job.viewsCount} vues
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Publié le {new Date(job.postedDate).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="text-orange-600">Expire le {new Date(job.deadline).toLocaleDateString("fr-FR")}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              Aucune offre d'emploi ne correspond à vos critères de recherche.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
