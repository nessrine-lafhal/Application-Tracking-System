import { EnhancedChatInterface } from "@/components/enhanced-chat-interface"
import { Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ATS Intelligent</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Entretien Conversationnel IA</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discutez avec notre assistant IA pour une évaluation personnalisée de votre profil professionnel
          </p>
        </div>

        <EnhancedChatInterface />

        <div className="mt-8 text-center">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Analyse CV</h3>
              <p className="text-sm text-gray-600">
                L'IA analyse votre CV par rapport à l'offre d'emploi pour calculer un score de compatibilité
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">🤖 Questions Personnalisées</h3>
              <p className="text-sm text-gray-600">
                Des questions adaptées à votre profil et au poste pour évaluer vos compétences et motivations
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Évaluation Complète</h3>
              <p className="text-sm text-gray-600">
                Un score final avec des recommandations personnalisées pour améliorer votre candidature
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
