"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Briefcase } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>, userType: "candidate" | "recruiter") => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          userType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirection selon le type d'utilisateur
        if (userType === "candidate") {
          router.push("/apply")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.error || "Erreur de connexion")
      }
    } catch (error) {
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connexion à votre compte</h2>
          <p className="mt-2 text-sm text-gray-600">Accédez à votre espace personnel</p>
        </div>

        <Tabs defaultValue="candidate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidate" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Candidat
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Recruteur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidate">
            <Card>
              <CardHeader>
                <CardTitle>Espace Candidat</CardTitle>
                <CardDescription>Connectez-vous pour postuler aux offres d'emploi</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleLogin(e, "candidate")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidate-email">Email</Label>
                    <Input
                      id="candidate-email"
                      name="email"
                      type="email"
                      placeholder="ahmed.benali@email.com"
                      required
                      defaultValue="ahmed.benali@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidate-password">Mot de passe</Label>
                    <Input id="candidate-password" name="password" type="password" required defaultValue="demo123" />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Pas encore de compte ?{" "}
                    <Button variant="link" className="p-0" onClick={() => router.push("/register")}>
                      Créer un compte
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recruiter">
            <Card>
              <CardHeader>
                <CardTitle>Espace Recruteur</CardTitle>
                <CardDescription>Accédez au tableau de bord de recrutement</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleLogin(e, "recruiter")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recruiter-email">Email</Label>
                    <Input
                      id="recruiter-email"
                      name="email"
                      type="email"
                      placeholder="sara.mansouri@techcorp.com"
                      required
                      defaultValue="sara.mansouri@techcorp.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recruiter-password">Mot de passe</Label>
                    <Input
                      id="recruiter-password"
                      name="password"
                      type="password"
                      required
                      defaultValue="recruiter123"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Comptes de démonstration disponibles avec les identifiants pré-remplis
          </p>
        </div>
      </div>
    </div>
  )
}
