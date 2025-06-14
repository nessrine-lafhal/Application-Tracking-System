"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react"

export function AnalyticsCharts() {
  // Mock data for charts
  const monthlyData = [
    { month: "Jan", candidates: 45, preselected: 8, rejected: 32, pending: 5 },
    { month: "Fév", candidates: 52, preselected: 12, rejected: 35, pending: 5 },
    { month: "Mar", candidates: 38, preselected: 6, rejected: 28, pending: 4 },
    { month: "Avr", candidates: 61, preselected: 15, rejected: 38, pending: 8 },
    { month: "Mai", candidates: 48, preselected: 11, rejected: 31, pending: 6 },
    { month: "Juin", candidates: 56, preselected: 13, rejected: 36, pending: 7 },
  ]

  const scoreDistribution = [
    { range: "0-20", count: 5 },
    { range: "21-40", count: 12 },
    { range: "41-60", count: 28 },
    { range: "61-80", count: 45 },
    { range: "81-100", count: 32 },
  ]

  const jobPerformance = [
    { job: "Développeur Full Stack", candidates: 45, avgScore: 72, conversionRate: 18 },
    { job: "Data Scientist", candidates: 32, avgScore: 78, conversionRate: 22 },
    { job: "UX Designer", candidates: 28, avgScore: 75, conversionRate: 16 },
    { job: "Chef de projet IT", candidates: 21, avgScore: 69, conversionRate: 14 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>Nombre de candidatures et résultats par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{ width: `${(data.preselected / data.candidates) * 100}%` }}
                      ></div>
                      <div
                        className="bg-yellow-500"
                        style={{ width: `${(data.pending / data.candidates) * 100}%` }}
                      ></div>
                      <div
                        className="bg-red-500"
                        style={{ width: `${(data.rejected / data.candidates) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">{data.candidates} total</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>Présélectionnés</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                <span>En attente</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span>Rejetés</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Distribution des scores
            </CardTitle>
            <CardDescription>Répartition des candidats par tranche de score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreDistribution.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium w-16">{data.range}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`${
                          index === 0
                            ? "bg-red-500"
                            : index === 1
                              ? "bg-orange-500"
                              : index === 2
                                ? "bg-yellow-500"
                                : index === 3
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                        }`}
                        style={{ width: `${(data.count / 122) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{data.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Performance par poste
          </CardTitle>
          <CardDescription>Analyse des candidatures et taux de conversion par type de poste</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobPerformance.map((job, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{job.job}</h3>
                  <Badge variant="outline">{job.candidates} candidatures</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{job.avgScore}</div>
                    <p className="text-gray-600">Score moyen</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{job.conversionRate}%</div>
                    <p className="text-gray-600">Taux de conversion</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((job.candidates * job.conversionRate) / 100)}
                    </div>
                    <p className="text-gray-600">Présélectionnés</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Insights clés
          </CardTitle>
          <CardDescription>Analyses et recommandations basées sur les données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📈 Tendance positive</h4>
              <p className="text-blue-800 text-sm">
                Le taux de présélection a augmenté de 15% ce mois-ci grâce à l'amélioration de l'algorithme de matching
                CV-poste.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🎯 Meilleure performance</h4>
              <p className="text-green-800 text-sm">
                Les postes de Data Scientist ont le meilleur taux de conversion (22%) et le score moyen le plus élevé
                (78/100).
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Point d'attention</h4>
              <p className="text-yellow-800 text-sm">
                32% des candidats ont un score entre 61-80. Considérez ajuster les critères de présélection pour cette
                tranche.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">💡 Recommandation</h4>
              <p className="text-purple-800 text-sm">
                Optimisez les questions d'entretien écrit pour les postes de Chef de projet IT pour améliorer le taux de
                conversion.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
