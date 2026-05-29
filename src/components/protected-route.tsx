import { useState, useEffect, type ReactNode } from "react"
import { getUser } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState(getUser())
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (!u) setAuthOpen(true)
  }, [])

  const handleAuthClose = (open: boolean) => {
    setAuthOpen(open)
    const u = getUser()
    setUser(u)
    if (!open && !u) {
      // Если закрыли без входа — показываем заглушку
    }
  }

  if (user) return <>{children}</>

  return (
    <>
      {/* Заглушка — красивый экран "только для участников" */}
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Фоновые огни */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          {/* Иконка замка */}
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <svg className="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-orbitron">
            Только для участников
          </h2>
          <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8">
            Этот раздел доступен только зарегистрированным пользователям. Войди или создай аккаунт — это бесплатно.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setAuthOpen(true)}
              className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 0 30px rgba(239,68,68,0.3)",
              }}
            >
              Войти в аккаунт
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="px-7 py-3 rounded-xl font-semibold text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={handleAuthClose} defaultTab="login" />
    </>
  )
}
