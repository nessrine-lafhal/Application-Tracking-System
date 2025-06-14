import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pages qui nécessitent une authentification
  const protectedRoutes = ["/dashboard", "/apply"]
  const authRoutes = ["/login", "/register"]

  // Récupérer le token de session
  const sessionToken = request.cookies.get("session")?.value

  let isAuthenticated = false
  let userType = null

  if (sessionToken) {
    try {
      const sessionData = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      isAuthenticated = Date.now() < sessionData.exp
      userType = sessionData.userType
    } catch (error) {
      // Token invalide
      isAuthenticated = false
    }
  }

  // Rediriger vers login si pas authentifié et tentative d'accès à une route protégée
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Rediriger vers dashboard/apply si déjà authentifié et tentative d'accès aux pages d'auth
  if (authRoutes.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    if (userType === "recruiter") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/apply", request.url))
    }
  }

  // Vérifier les permissions par rôle
  if (pathname.startsWith("/dashboard") && isAuthenticated && userType !== "recruiter") {
    return NextResponse.redirect(new URL("/apply", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
