"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  Brain,
  FileText,
  Users,
  Shield,
  BarChart3,
  MessageSquare,
  Video,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.userType === "recruiter") {
        router.push("/dashboard")
      } else {
        router.push("/apply")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ATS Intelligence</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push("/login")}>
              Se connecter
            </Button>
            <Button onClick={() => router.push("/register")}>Créer un compte</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="mr-1 h-3 w-3" />
            Powered by AI
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Révolutionnez votre processus de recrutement
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plateforme ATS intelligente avec analyse de CV par IA, entretiens vidéo automatisés et vérification de
            documents avancée.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => router.push("/register")}>
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
              Voir la démo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités avancées</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Notre plateforme combine intelligence artificielle et interface intuitive pour optimiser chaque étape du
            recrutement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>Analyse CV Intelligente</CardTitle>
              <CardDescription>
                Extraction automatique d'informations, scoring de compatibilité et recommandations personnalisées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  OCR et NLP avancés
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Matching automatique
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Support multilingue
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Video className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Entretiens Vidéo IA</CardTitle>
              <CardDescription>
                Analyse des émotions, évaluation automatique et feedback détaillé pour chaque candidat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Détection d'émotions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Scoring automatique
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Rapports détaillés
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Vérification Documents</CardTitle>
              <CardDescription>
                Authentification avancée des documents avec détection de fraude et scoring de confiance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Détection de fraude
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Scoring d'authenticité
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Conformité bancaire
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Chatbot Rasa</CardTitle>
              <CardDescription>
                Assistant conversationnel intelligent pour guider candidats et recruteurs dans leurs démarches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  NLU avancé
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Actions personnalisées
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Support 24/7
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-red-500 mb-2" />
              <CardTitle>Analytics Avancés</CardTitle>
              <CardDescription>
                Tableaux de bord interactifs avec métriques en temps réel et insights prédictifs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Métriques temps réel
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Prédictions IA
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Rapports personnalisés
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-indigo-500 mb-2" />
              <CardTitle>Gestion Collaborative</CardTitle>
              <CardDescription>
                Workflow collaboratif avec notifications, commentaires et suivi en temps réel des candidatures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Workflow personnalisé
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Notifications smart
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Suivi en temps réel
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre recrutement ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les entreprises qui ont déjà révolutionné leur processus de recrutement avec notre IA.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary" onClick={() => router.push("/register")}>
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Planifier une démo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="font-semibold">ATS Intelligence</span>
          </div>
          <p>&copy; 2024 ATS Intelligence. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
