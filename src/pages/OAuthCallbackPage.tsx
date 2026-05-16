import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { saveAuth } from "@/lib/auth"

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const userRaw = searchParams.get("user")

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw))
        saveAuth(token, user)
        if (user.role === "owner" || user.role === "admin") {
          navigate("/admin", { replace: true })
        } else {
          navigate("/", { replace: true })
        }
      } catch {
        navigate("/login?error=oauth", { replace: true })
      }
    } else {
      navigate("/login?error=oauth", { replace: true })
    }
  }, [])

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Выполняем вход...</p>
      </div>
    </div>
  )
}
