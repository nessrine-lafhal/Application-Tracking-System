"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle, FileText, Eye, BarChart3 } from "lucide-react"

interface DocumentVerificationResult {
  id: string
  filename: string
  documentType: string
  authenticityScore: number
  isAuthentic: boolean
  ocrConfidence: number
  alerts: string[]
  similarities: {
    text: number
    layout: number
    visual: number
    global: number
  }
  processedAt: string
  textContent: string
}

interface DocumentVerificationDashboardProps {
  candidateId: string
}

export function DocumentVerificationDashboard({ candidateId }: DocumentVerificationDashboardProps) {
  const [documents, setDocuments] = useState<DocumentVerificationResult[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentVerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockDocuments: DocumentVerificationResult[] = [
      {
        id: "doc_1",
        filename: "carte_identite.jpg",
        documentType: "cin",
        authenticityScore: 92,
        isAuthentic: true,
        ocrConfidence: 0.95,
        alerts: [],
        similarities: {
          text: 0.88,
          layout: 0.91,
          visual: 0.85,
          global: 0.89,
        },
        processedAt: new Date().toISOString(),
        textContent: "CARTE NATIONALE D'IDENTITÉ RÉPUBLIQUE FRANÇAISE...",
      },
      {
        id: "doc_2",
        filename: "diplome_master.pdf",
        documentType: "master",
        authenticityScore: 78,
        isAuthentic: true,
        ocrConfidence: 0.87,
        alerts: ["Qualité d'image sous-optimale"],
        similarities: {
          text: 0.82,
          layout: 0.79,
          visual: 0.75,
          global: 0.78,
        },
        processedAt: new Date().toISOString(),
        textContent: "UNIVERSITÉ DE PARIS DIPLÔME NATIONAL DE MASTER...",
      },
      {
        id: "doc_3",
        filename: "permis_conduire.jpg",
        documentType: "permis",
        authenticityScore: 45,
        isAuthentic: false,
        ocrConfidence: 0.62,
        alerts: [
          "Score d'authenticité faible: 45.0/100",
          "Document potentiellement falsifié",
          "Vérification manuelle recommandée",
        ],
        similarities: {
          text: 0.45,
          layout: 0.38,
          visual: 0.52,
          global: 0.45,
        },
        processedAt: new Date().toISOString(),
        textContent: "PERMIS DE CONDUIRE RÉPUBLIQUE FRANÇAISE...",
      },
    ]

    setTimeout(() => {
      setDocuments(mockDocuments)
      setIsLoading(false)
    }, 1000)
  }, [candidateId])

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cin: "Carte d'identité",
      bac: "Diplôme du Baccalauréat",
      master: "Diplôme de Master",
      licence: "Diplôme de Licence",
      doctorat: "Diplôme de Doctorat",
      permis: "Permis de conduire",
    }
    return labels[type] || type
  }

  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getAuthenticityBadge = (isAuthentic: boolean, score: number) => {
    if (isAuthentic) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Authentique
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Suspect
        </Badge>
      )
    }
  }

  const overallScore =
    documents.length > 0
      ? Math.round(documents.reduce((sum, doc) => sum + doc.authenticityScore, 0) / documents.length)
      : 0

  const authenticDocuments = documents.filter((doc) => doc.isAuthentic).length
  const suspiciousDocuments = documents.filter((doc) => !doc.isAuthentic).length

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Vérification des documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement des résultats...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score global</p>
                <p className={`text-2xl font-bold ${getAuthenticityColor(overallScore)}`}>{overallScore}/100</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents vérifiés</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Authentiques</p>
                <p className="text-2xl font-bold text-green-600">{authenticDocuments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspects</p>
                <p className="text-2xl font-bold text-red-600">{suspiciousDocuments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents analysés</CardTitle>
          <CardDescription>Résultats détaillés de la vérification d'authenticité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-medium">{doc.filename}</h3>
                        <p className="text-sm text-gray-600">{getDocumentTypeLabel(doc.documentType)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Score d'authenticité</p>
                        <p className={`font-medium ${getAuthenticityColor(doc.authenticityScore)}`}>
                          {doc.authenticityScore}/100
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Confiance OCR</p>
                        <p className="font-medium">{Math.round(doc.ocrConfidence * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Statut</p>
                        {getAuthenticityBadge(doc.isAuthentic, doc.authenticityScore)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Traité le</p>
                        <p className="text-sm">{new Date(doc.processedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {doc.alerts.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <p className="text-sm font-medium text-yellow-800">Alertes:</p>
                        <ul className="text-sm text-yellow-700 mt-1">
                          {doc.alerts.slice(0, 2).map((alert, idx) => (
                            <li key={idx}>• {alert}</li>
                          ))}
                          {doc.alerts.length > 2 && <li>• ... et {doc.alerts.length - 2} autre(s)</li>}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Modal */}
      {selectedDocument && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analyse détaillée - {selectedDocument.filename}</span>
              <Button variant="ghost" onClick={() => setSelectedDocument(null)}>
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Similarity Scores */}
            <div>
              <h4 className="font-medium mb-3">Scores de similarité</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Similarité textuelle</span>
                    <span>{Math.round(selectedDocument.similarities.text * 100)}%</span>
                  </div>
                  <Progress value={selectedDocument.similarities.text * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Similarité de mise en page</span>
                    <span>{Math.round(selectedDocument.similarities.layout * 100)}%</span>
                  </div>
                  <Progress value={selectedDocument.similarities.layout * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Similarité visuelle</span>
                    <span>{Math.round(selectedDocument.similarities.visual * 100)}%</span>
                  </div>
                  <Progress value={selectedDocument.similarities.visual * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score global</span>
                    <span>{Math.round(selectedDocument.similarities.global * 100)}%</span>
                  </div>
                  <Progress value={selectedDocument.similarities.global * 100} className="h-2" />
                </div>
              </div>
            </div>

            {/* Extracted Text */}
            <div>
              <h4 className="font-medium mb-3">Texte extrait</h4>
              <div className="bg-gray-50 p-3 rounded border text-sm">{selectedDocument.textContent}</div>
            </div>

            {/* Alerts */}
            {selectedDocument.alerts.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Alertes de sécurité</h4>
                <div className="space-y-2">
                  {selectedDocument.alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
