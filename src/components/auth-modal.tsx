import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AUTH_URL, saveAuth } from "@/lib/auth"
import TermsModal from "@/components/TermsModal"
import { AuthTabs } from "@/components/auth-tabs"
import { ForgotScreen, ResetScreen } from "@/components/auth-forgot-reset"

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
            <AuthTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              loginData={loginData}
              setLoginData={setLoginData}
              loginError={loginError}
              isLoading={isLoading}
              onLogin={handleLogin}
              onForgotClick={() => { setForgotEmail(loginData.email); setScreen("forgot") }}
              registerData={registerData}
              setRegisterData={setRegisterData}
              registerError={registerError}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              onOpenTerms={() => setTermsModalOpen(true)}
              onRegister={handleRegister}
            />
          )}

          {/* ══ ЭКРАН: ВВОД EMAIL ══ */}
          {screen === "forgot" && (
            <ForgotScreen
              forgotEmail={forgotEmail}
              setForgotEmail={setForgotEmail}
              forgotError={forgotError}
              isLoading={isLoading}
              onSubmit={handleForgot}
              onBack={() => setScreen("tabs")}
            />
          )}

          {/* ══ ЭКРАН: ВВОД КОДА + НОВОГО ПАРОЛЯ ══ */}
          {screen === "reset" && (
            <ResetScreen
              codeFromServer={codeFromServer}
              resetCode={resetCode}
              setResetCode={setResetCode}
              resetNewPwd={resetNewPwd}
              setResetNewPwd={setResetNewPwd}
              resetConfirm={resetConfirm}
              setResetConfirm={setResetConfirm}
              resetError={resetError}
              resetSuccess={resetSuccess}
              isLoading={isLoading}
              onSubmit={handleReset}
              onBack={() => setScreen("forgot")}
              onSuccessLogin={() => { resetAllState(); setActiveTab("login") }}
            />
          )}
        </DialogContent>
      </Dialog>
      <TermsModal open={termsModalOpen} onOpenChange={(v) => { setTermsModalOpen(v); if (!v) setTermsAccepted(true) }} />
    </>
  )
}
