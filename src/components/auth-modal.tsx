import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { AUTH_URL, saveAuth } from "@/lib/auth"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "register"
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const navigate = useNavigate()
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setIsLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || "Неверный email или пароль")
        return
      }
      saveAuth(data.token, data.user)
      onOpenChange(false)
      if (data.user.role === "owner" || data.user.role === "admin") {
        navigate("/admin")
      }
    } catch {
      setLoginError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")
    if (registerData.password !== registerData.confirm) {
      setRegisterError("Пароли не совпадают")
      return
    }
    if (registerData.password.length < 6) {
      setRegisterError("Пароль должен быть не менее 6 символов")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          name: registerData.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegisterError(data.error || "Ошибка регистрации")
        return
      }
      saveAuth(data.token, data.user)
      onOpenChange(false)
    } catch {
      setRegisterError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border text-white max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-center font-orbitron text-xl text-white">
            AI<span className="text-red-500"> Studio</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Форма входа и регистрации в AI Studio
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "login" | "register"); setLoginError(""); setRegisterError("") }} className="mt-2">
          <TabsList className="w-full bg-background border border-border">
            <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              Регистрация
            </TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                <Input
                  type="email"
                  placeholder="example@mail.ru"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <Icon name="AlertCircle" size={14} />
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Входим...</>
                ) : "Войти"}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-4">
              Нет аккаунта?{" "}
              <button className="text-primary hover:underline" onClick={() => setActiveTab("register")}>
                Зарегистрироваться
              </button>
            </p>
          </TabsContent>

          {/* Register */}
          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Имя</Label>
                <Input
                  type="text"
                  placeholder="Ваше имя"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                <Input
                  type="email"
                  placeholder="example@mail.ru"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Пароль</Label>
                <Input
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Подтвердите пароль</Label>
                <Input
                  type="password"
                  placeholder="Повторите пароль"
                  value={registerData.confirm}
                  onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              {registerError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <Icon name="AlertCircle" size={14} />
                  {registerError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white mt-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Создаём аккаунт...</>
                ) : "Зарегистрироваться"}
              </Button>
            </form>

            <div className="mt-3 pt-3 border-t border-border text-center">
              <p className="text-muted-foreground text-xs">
                Уже есть аккаунт?{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => setActiveTab("login")}>
                  Войти
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
