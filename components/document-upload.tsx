"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  GraduationCap,
  StampIcon as Passport,
} from "lucide-react"

const documentTypes = [
  {
    id: "cin",
    name: "Carte d'identité",
    icon: CreditCard,
    required: true,
    description: "Carte nationale d'identité française",
  },
  {
    id: "diploma",
    name: "Diplôme",
    icon: GraduationCap,
    required: true,
    description: "Diplôme de formation (Bac, Master, etc.)",
  },
  {
    id: "passport",
    name: "Passeport",
    icon: Passport,
    required: false,
    description: "Passeport français ou européen",
  },
  {
    id: "cv",
    name: "CV détaillé",
    icon: FileText,
    required: false,
    description: "Version complète de votre CV",
  },
]

interface DocumentUploadProps {
  onNext: () => void
  onPrev: () => void
  setScore: (score: number) => void
}

export function DocumentUpload({ onNext, onPrev, setScore }: DocumentUploadProps) {
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: File }>({})
  const [verificationResults, setVerificationResults] = useState<{ [key: string]: any }>({})
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadedDocs((prev) => ({ ...prev, [docType]: file }))

    try {
      const formData = new FormData()
      formData.append("document", file)

      const response = await fetch("/api/document-verification", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la vérification")
      }

      const results = await response.json()

      // Calculate final score based on authenticity and OCR confidence
      const finalScore = Math.round(
        results.authentication.authenticity_score * 0.8 + results.classification.ocr_confidence * 100 * 0.2,
      )

      setVerificationResults((prev) => ({
        ...prev,
        [docType]: {
          score: finalScore,
          details: results,
        },
      }))
    } catch (error) {
      console.error("Erreur de vérification:", error)
      setVerificationResults((prev) => ({
        ...prev,
        [docType]: {
          score: 0,
          error: "Erreur lors de la vérification",
        },
      }))
    }
  }

  const removeDocument = (docType: string) => {
    setUploadedDocs((prev) => {
      const newDocs = { ...prev }
      delete newDocs[docType]
      return newDocs
    })
    setVerificationResults((prev) => {
      const newResults = { ...prev }
      delete newResults[docType]
      return newResults
    })
  }

  const completeVerification = () => {
    setIsVerifying(true)

    setTimeout(() => {
      const avgScore =
        Object.values(verificationResults).reduce((a, b) => a + b.score, 0) / Object.values(verificationResults).length
      setScore(avgScore)
      setIsCompleted(true)

      setTimeout(() => {
        onNext()
      }, 3000)
    }, 3000)
  }

  const requiredDocsUploaded = documentTypes.filter((doc) => doc.required).every((doc) => uploadedDocs[doc.id])

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
            Vérification des documents terminée
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Finalisation de l'analyse...</p>
          <p className="text-sm text-gray-500">Redirection automatique vers les résultats</p>
        </CardContent>
      </Card>
    )
  }

  if (isVerifying) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="h-6 w-6 mr-2 text-blue-600" />
            Vérification finale en cours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Analyse approfondie des documents...</p>
            <p className="text-sm text-gray-500">Vérification de l'authenticité et de la conformité</p>
          </div>

          <div className="space-y-3">
            {Object.entries(uploadedDocs).map(([docType, file]) => {
              const docInfo = documentTypes.find((d) => d.id === docType)
              const score = verificationResults[docType]

              return (
                <div key={docType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {docInfo && <docInfo.icon className="h-5 w-5 text-gray-600" />}
                    <div>
                      <p className="font-medium">{docInfo?.name}</p>
                      <p className="text-sm text-gray-600">{file.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {score ? (
                      <Badge variant={score.score >= 80 ? "default" : score.score >= 60 ? "secondary" : "destructive"}>
                        {score.score}/100
                      </Badge>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCheck className="h-6 w-6 mr-2 text-blue-600" />
          Vérification des documents officiels
        </CardTitle>
        <CardDescription>
          Téléchargez vos documents officiels pour vérification d'authenticité. Les documents requis sont marqués d'un
          astérisque (*).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {documentTypes.map((docType) => {
            const Icon = docType.icon
            const isUploaded = uploadedDocs[docType.id]
            const score = verificationResults[docType.id]

            return (
              <div key={docType.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="font-medium flex items-center">
                        {docType.name}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      <p className="text-sm text-gray-600">{docType.description}</p>
                    </div>
                  </div>

                  {isUploaded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(docType.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  )}
                </div>

                {!isUploaded ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Glissez-déposez votre {docType.name.toLowerCase()} ici</p>
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor={`upload-${docType.id}`} className="cursor-pointer">
                        Parcourir
                      </label>
                    </Button>
                    <input
                      id={`upload-${docType.id}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(docType.id, file)
                      }}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">{isUploaded.name}</p>
                          <p className="text-sm text-green-600">Document téléchargé avec succès</p>
                        </div>
                      </div>

                      {score ? (
                        <div className="text-right">
                          <div className="space-y-2">
                            <Badge
                              variant={score.score >= 80 ? "default" : score.score >= 60 ? "secondary" : "destructive"}
                              className="mb-1"
                            >
                              {score.score}/100
                            </Badge>

                            {score.details && (
                              <div className="text-xs space-y-1">
                                <p className="text-gray-600">Type: {score.details.classification.document_type}</p>
                                <p className="text-gray-600">
                                  OCR: {(score.details.classification.ocr_confidence * 100).toFixed(0)}%
                                </p>
                                {score.details.authentication.is_authentic ? (
                                  <p className="text-green-600 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Authentique
                                  </p>
                                ) : (
                                  <p className="text-red-600 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Suspect
                                  </p>
                                )}

                                {score.details.authentication.alerts.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-amber-600">Alertes:</p>
                                    {score.details.authentication.alerts.slice(0, 2).map((alert, idx) => (
                                      <p key={idx} className="text-xs text-amber-600">
                                        • {alert}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Vérification...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {Object.keys(uploadedDocs).length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Processus de vérification</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Extraction et analyse du texte (OCR)</li>
              <li>• Vérification de la mise en page et des éléments de sécurité</li>
              <li>• Contrôle de cohérence des informations</li>
              <li>• Détection de modifications ou falsifications</li>
            </ul>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <Button
            onClick={completeVerification}
            disabled={!requiredDocsUploaded || Object.keys(verificationResults).length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Finaliser la vérification
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {!requiredDocsUploaded && (
          <div className="flex items-center space-x-2 text-amber-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Veuillez télécharger tous les documents requis (*) pour continuer</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
