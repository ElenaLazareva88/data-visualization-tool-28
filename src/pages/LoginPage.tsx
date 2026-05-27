import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import { AUTH_URL, saveAuth } from "@/lib/auth"

const YANDEX_AUTH_URL = `${AUTH_URL}/yandex`
const VK_AUTH_URL = `${AUTH_URL}/vk`

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Ошибка входа")
        return
      }
      saveAuth(data.token, data.user)
      if (data.user.role === "owner" || data.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    } catch {
      setError("Ошибка подключения к серверу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <h1 className="font-orbitron text-2xl font-bold text-white">
            AI<span className="text-red-500"> Studio</span>
          </h1>
        </Link>

        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl text-center">Вход в систему</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                <Input
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Пароль</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <Icon name="AlertCircle" size={14} />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Входим...</>
                ) : "Войти"}
              </Button>
            </form>

            <div className="mt-4 space-y-2">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-muted-foreground text-xs">или</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <a
                href={YANDEX_AUTH_URL}
                className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-[#FC3F1D] hover:bg-[#e8381a] text-white text-sm font-medium py-2 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.706 2H11.13C7.645 2 5.5 3.887 5.5 7.04c0 2.74 1.3 4.257 3.747 5.832L5.5 22h3.47l3.882-9.558-.117-.073C10.64 10.95 9.47 9.8 9.47 7.24c0-1.83 1.077-2.89 3.16-2.89h1.076V22H17V2h-3.294z" fill="white"/>
                </svg>
                Войти через Яндекс
              </a>
              <a
                href={VK_AUTH_URL}
                className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-[#0077FF] hover:bg-[#0066dd] text-white text-sm font-medium py-2 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.366 1.26 2.182 1.817.616.42 1.084.328 1.084.328l2.18-.03s1.137-.071.598-1.223c-.044-.093-.313-.66-1.61-1.867-1.36-1.265-1.178-1.06.46-3.246.999-1.33 1.398-2.142 1.272-2.49-.12-.332-.855-.244-.855-.244l-2.455.015s-.182-.025-.317.056c-.132.079-.217.264-.217.264s-.386 1.026-.9 1.899c-1.085 1.843-1.52 1.94-1.698 1.825-.413-.267-.31-1.074-.31-1.646 0-1.79.271-2.535-.528-2.727-.265-.064-.46-.107-1.137-.114-.87-.009-1.605.003-2.02.207-.277.135-.49.437-.36.454.161.021.525.098.719.362.25.341.241 1.107.241 1.107s.144 2.108-.335 2.372c-.329.18-.78-.187-1.748-1.86-.497-.858-.872-1.808-.872-1.808s-.072-.178-.202-.274c-.156-.115-.375-.151-.375-.151l-2.33.015s-.35.01-.479.163c-.114.136-.009.417-.009.417s1.826 4.271 3.893 6.422c1.896 1.976 4.047 1.846 4.047 1.846h.976z" fill="white"/>
                </svg>
                Войти через ВКонтакте
              </a>
            </div>
            <div className="mt-4 pt-4 border-t border-border text-center">
              <Link to="/" className="text-muted-foreground text-sm hover:text-white transition-colors">
                ← Вернуться на сайт
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}