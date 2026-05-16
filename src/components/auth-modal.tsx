import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Icon from "@/components/ui/icon"
import { AUTH_URL, saveAuth } from "@/lib/auth"
import TermsModal from "@/components/TermsModal"

const YANDEX_AUTH_URL = `${AUTH_URL}/yandex`

function YandexButton() {
  return (
    <a
      href={YANDEX_AUTH_URL}
      className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-[#FC3F1D] hover:bg-[#e8381a] text-white text-sm font-medium py-2 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.706 2H11.13C7.645 2 5.5 3.887 5.5 7.04c0 2.74 1.3 4.257 3.747 5.832L5.5 22h3.47l3.882-9.558-.117-.073C10.64 10.95 9.47 9.8 9.47 7.24c0-1.83 1.077-2.89 3.16-2.89h1.076V22H17V2h-3.294z" fill="white"/>
      </svg>
      Войти через Яндекс
    </a>
  )
}

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "register"
}

type Screen = "tabs" | "forgot" | "reset"

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const navigate = useNavigate()

  // Экраны: tabs (вход/регистрация), forgot (ввод email), reset (ввод кода + нового пароля)
  const [screen, setScreen] = useState<Screen>("tabs")
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Вход
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")

  // Регистрация
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" })
  const [registerError, setRegisterError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)

  // Восстановление пароля
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [resetNewPwd, setResetNewPwd] = useState("")
  const [resetConfirm, setResetConfirm] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  // Код показываем пользователю прямо в интерфейсе (нет email-сервиса)
  const [codeFromServer, setCodeFromServer] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  const resetAllState = () => {
    setScreen("tabs")
    setLoginData({ email: "", password: "" })
    setLoginError("")
    setRegisterData({ name: "", email: "", password: "", confirm: "" })
    setRegisterError("")
    setTermsAccepted(false)
    setForgotEmail("")
    setForgotError("")
    setResetCode("")
    setResetNewPwd("")
    setResetConfirm("")
    setResetError("")
    setResetSuccess(false)
    setCodeFromServer("")
  }

  const handleOpenChange = (val: boolean) => {
    if (!val) resetAllState()
    onOpenChange(val)
  }

  const handleTabChange = (v: string) => {
    setActiveTab(v as "login" | "register")
    setLoginError("")
    setRegisterError("")
  }

  // ── Вход ──────────────────────────────────────────────
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
      if (!res.ok) { setLoginError(data.error || "Неверный email или пароль"); return }
      saveAuth(data.token, data.user)
      handleOpenChange(false)
      if (data.user.role === "owner" || data.user.role === "admin") navigate("/admin")
    } catch (err) {
      console.error("Login error:", err)
      setLoginError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Регистрация ────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")
    if (!termsAccepted) { setRegisterError("Необходимо принять пользовательское соглашение"); return }
    if (registerData.password !== registerData.confirm) { setRegisterError("Пароли не совпадают"); return }
    if (registerData.password.length < 6) { setRegisterError("Пароль должен быть не менее 6 символов"); return }
    setIsLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerData.email, password: registerData.password, name: registerData.name }),
      })
      const data = await res.json()
      if (!res.ok) { setRegisterError(data.error || "Ошибка регистрации"); return }
      saveAuth(data.token, data.user)
      handleOpenChange(false)
    } catch (err) {
      console.error("Register error:", err)
      setRegisterError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Запрос кода сброса ────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError("")
    setIsLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setForgotError(data.error || "Ошибка"); return }
      // Код приходит в ответе (email-сервис не подключён)
      if (data.code) setCodeFromServer(data.code)
      setScreen("reset")
    } catch {
      setForgotError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Применение нового пароля ──────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    if (resetNewPwd !== resetConfirm) { setResetError("Пароли не совпадают"); return }
    if (resetNewPwd.length < 6) { setResetError("Пароль должен быть не менее 6 символов"); return }
    setIsLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: resetCode, new_password: resetNewPwd }),
      })
      const data = await res.json()
      if (!res.ok) { setResetError(data.error || "Ошибка сброса пароля"); return }
      setResetSuccess(true)
    } catch {
      setResetError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  const ErrorBox = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      <Icon name="AlertCircle" size={14} />
      {text}
    </div>
  )

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border border-border text-white max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-center font-orbitron text-xl text-white">
            AI<span className="text-red-500"> Studio</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Форма входа и регистрации в AI Studio
          </DialogDescription>
        </DialogHeader>

        {/* ══ ЭКРАН: ВХОД / РЕГИСТРАЦИЯ ══ */}
        {screen === "tabs" && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2">
            <TabsList className="w-full bg-background border border-border">
              <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
                Вход
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
                Регистрация
              </TabsTrigger>
            </TabsList>

            {/* Вход */}
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                  <Input
                    type="email"
                    placeholder="example@mail.ru"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-white border-border text-black placeholder:text-gray-400"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-muted-foreground text-sm">Пароль</Label>
                    <button
                      type="button"
                      className="text-primary text-xs hover:underline"
                      onClick={() => { setForgotEmail(loginData.email); setScreen("forgot") }}
                    >
                      Забыли пароль?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-white border-border text-black placeholder:text-gray-400"
                    required
                  />
                </div>
                {loginError && <ErrorBox text={loginError} />}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                  {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Входим...</> : "Войти"}
                </Button>
              </form>
              <div className="mt-4 space-y-2">
                <div className="relative flex items-center gap-2">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-muted-foreground text-xs">или войти через</span>
                  <div className="flex-1 border-t border-border" />
                </div>
                <YandexButton />
              </div>
              <p className="text-center text-muted-foreground text-sm mt-4">
                Нет аккаунта?{" "}
                <button className="text-primary hover:underline" onClick={() => setActiveTab("register")}>
                  Зарегистрироваться
                </button>
              </p>
            </TabsContent>

            {/* Регистрация */}
            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-sm mb-1.5 block">Имя</Label>
                  <Input
                    type="text"
                    placeholder="Ваше имя"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="bg-white border-border text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                  <Input
                    type="email"
                    placeholder="example@mail.ru"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-white border-border text-black placeholder:text-gray-400"
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
                    className="bg-white border-border text-black placeholder:text-gray-400"
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
                    className="bg-white border-border text-black placeholder:text-gray-400"
                    required
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer group pt-1">
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={(v) => setTermsAccepted(!!v)}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Я ознакомился и принимаю{" "}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-primary hover:underline"
                    >
                      Пользовательское соглашение
                    </button>
                    {" "}и{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/privacy")}
                      className="text-primary hover:underline"
                    >
                      Политику конфиденциальности
                    </button>
                  </span>
                </label>
                {registerError && <ErrorBox text={registerError} />}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-1" disabled={isLoading || !termsAccepted}>
                  {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Создаём аккаунт...</> : "Зарегистрироваться"}
                </Button>
              </form>
              <div className="mt-4 space-y-2">
                <div className="relative flex items-center gap-2">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-muted-foreground text-xs">или войти через</span>
                  <div className="flex-1 border-t border-border" />
                </div>
                <YandexButton />
              </div>
              <div className="mt-3 pt-3 border-t border-border text-center">
                <p className="text-muted-foreground text-xs">
                  Уже есть аккаунт?{" "}
                  <button type="button" className="text-primary hover:underline" onClick={() => setActiveTab("login")}>Войти</button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* ══ ЭКРАН: ВВОД EMAIL ══ */}
        {screen === "forgot" && (
          <div className="mt-2">
            <button
              className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-white mb-4 transition-colors"
              onClick={() => setScreen("tabs")}
            >
              <Icon name="ChevronLeft" size={14} />
              Назад
            </button>
            <p className="text-white font-medium mb-1">Восстановление пароля</p>
            <p className="text-muted-foreground text-sm mb-4">
              Введите email — мы пришлём код для сброса пароля.
            </p>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                <Input
                  type="email"
                  placeholder="example@mail.ru"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-white border-border text-black placeholder:text-gray-400"
                  required
                  autoFocus
                />
              </div>
              {forgotError && <ErrorBox text={forgotError} />}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</> : "Получить код"}
              </Button>
            </form>
          </div>
        )}

        {/* ══ ЭКРАН: ВВОД КОДА + НОВОГО ПАРОЛЯ ══ */}
        {screen === "reset" && (
          <div className="mt-2">
            {!resetSuccess ? (
              <>
                <button
                  className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-white mb-4 transition-colors"
                  onClick={() => setScreen("forgot")}
                >
                  <Icon name="ChevronLeft" size={14} />
                  Назад
                </button>
                <p className="text-white font-medium mb-1">Введите код и новый пароль</p>

                {codeFromServer && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-4">
                    <p className="text-yellow-400 text-xs mb-1 flex items-center gap-1.5">
                      <Icon name="Info" size={12} />
                      Email-уведомления не настроены — используйте код ниже:
                    </p>
                    <p className="text-yellow-300 font-mono text-2xl font-bold tracking-widest text-center">{codeFromServer}</p>
                    <p className="text-yellow-500 text-xs text-center mt-1">Действует 30 минут</p>
                  </div>
                )}

                <form onSubmit={handleReset} className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Код подтверждения</Label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="bg-white border-border text-black placeholder:text-gray-400 font-mono text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                      autoFocus={!codeFromServer}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Новый пароль</Label>
                    <Input
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={resetNewPwd}
                      onChange={(e) => setResetNewPwd(e.target.value)}
                      className="bg-white border-border text-black placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Подтвердите пароль</Label>
                    <Input
                      type="password"
                      placeholder="Повторите пароль"
                      value={resetConfirm}
                      onChange={(e) => setResetConfirm(e.target.value)}
                      className="bg-white border-border text-black placeholder:text-gray-400"
                      required
                    />
                  </div>
                  {resetError && <ErrorBox text={resetError} />}
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
                    {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Сохраняем...</> : "Сохранить новый пароль"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <Icon name="CheckCircle" size={28} className="text-green-400" />
                </div>
                <p className="text-white font-medium text-lg mb-1">Пароль изменён!</p>
                <p className="text-muted-foreground text-sm mb-5">Теперь войдите с новым паролем</p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => { resetAllState(); setActiveTab("login") }}
                >
                  Войти
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    <TermsModal open={termsModalOpen} onOpenChange={(v) => { setTermsModalOpen(v); if (!v) setTermsAccepted(true) }} />
    </>
  )
}