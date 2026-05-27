import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthModal } from "@/components/auth-modal"
import { getUser, clearAuth, isAdmin, getToken, AUTH_URL, type User } from "@/lib/auth"

const TOOLS = [
  { label: "Музыка", path: "/music", icon: "Music" },
  { label: "Видео", path: "/video", icon: "Video" },
  { label: "Фото", path: "/photo", icon: "Image" },
  { label: "Тексты", path: "/text", icon: "FileText" },
  { label: "Джинглы", path: "/jingle", icon: "Radio" },
  { label: "Пригласительные", path: "/invite", icon: "Mail" },
  { label: "Логотипы", path: "/logo", icon: "Hexagon" },
]

const NAV_LINKS = [
  { label: "Сообщество", path: "/community" },
  { label: "Коллаборации", path: "/collab" },
  { label: "Обучение", path: "/learn" },
  { label: "Чат", path: "/chat" },
  { label: "Тарифы", path: "/pricing" },
  { label: "Поддержка", path: "/support" },
]

function UserAvatar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const initials = (user.name || user.email).charAt(0).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>
        <span className="text-white text-sm hidden xl:block max-w-[120px] truncate">
          {user.name || user.email}
        </span>
        <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-black/98 border border-red-500/20 rounded-lg py-1 min-w-[180px] shadow-xl z-50">
          <div className="px-4 py-2 border-b border-red-500/20">
            <p className="text-white text-sm font-medium truncate">{user.name || "Пользователь"}</p>
            <p className="text-muted-foreground text-xs truncate">{user.email}</p>
          </div>
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:text-red-500 hover:bg-red-500/10 transition-colors"
            onClick={() => { setOpen(false); navigate("/profile") }}
          >
            <Icon name="User" size={14} className="text-red-500" />
            Мой профиль
          </button>
          {isAdmin(user) && (
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:text-red-500 hover:bg-red-500/10 transition-colors"
              onClick={() => { setOpen(false); navigate("/admin") }}
            >
              <Icon name="Shield" size={14} className="text-red-500" />
              Панель администратора
            </button>
          )}
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:text-red-500 hover:bg-red-500/10 transition-colors"
            onClick={() => { setOpen(false); navigate("/pricing") }}
          >
            <Icon name="CreditCard" size={14} className="text-red-500" />
            Моя подписка
          </button>
          <div className="border-t border-red-500/20 mt-1 pt-1">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={onLogout}
            >
              <Icon name="LogOut" size={14} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openTools = useCallback(() => {
    if (toolsCloseTimer.current) clearTimeout(toolsCloseTimer.current)
    setToolsOpen(true)
  }, [])

  const closeTools = useCallback(() => {
    toolsCloseTimer.current = setTimeout(() => setToolsOpen(false), 150)
  }, [])
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "register">("login")
  const [user, setUser] = useState<User | null>(getUser())
  const location = useLocation()
  const navigate = useNavigate()

  // Обновляем состояние пользователя при изменении localStorage
  useEffect(() => {
    const sync = () => setUser(getUser())
    window.addEventListener("storage", sync)
    // Также проверяем при каждом изменении пути
    sync()
    return () => window.removeEventListener("storage", sync)
  }, [location.pathname])

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true) }
  const openRegister = () => { setAuthTab("register"); setAuthOpen(true) }

  const handleLogout = async () => {
    const token = getToken()
    if (token) {
      fetch(AUTH_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      }).catch(() => {})
    }
    clearAuth()
    setUser(null)
    navigate("/")
  }

  const handleAuthClose = (open: boolean) => {
    setAuthOpen(open)
    if (!open) setUser(getUser())
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-orbitron text-xl font-bold text-white">
                AI<span className="text-red-500"> Studio</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-5">
              {/* Tools dropdown */}
              <div className="relative">
                <button
                  className="font-geist text-white hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
                  onMouseEnter={openTools}
                  onMouseLeave={closeTools}
                >
                  Инструменты
                  <Icon name="ChevronDown" size={14} />
                </button>
                {toolsOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 bg-black/98 border border-red-500/20 rounded-lg py-2 min-w-[160px] shadow-xl"
                    onMouseEnter={openTools}
                    onMouseLeave={closeTools}
                  >
                    {TOOLS.map((t) => (
                      <Link
                        key={t.path}
                        to={t.path}
                        className="flex items-center gap-2 px-4 py-2 text-white hover:text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                      >
                        <Icon name={t.icon as "Music"} size={14} className="text-red-500" />
                        {t.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {NAV_LINKS.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`font-geist text-sm transition-colors duration-200 ${location.pathname === l.path ? "text-red-500" : "text-white hover:text-red-500"}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* CTA / User */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <UserAvatar user={user} onLogout={handleLogout} />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-white hover:text-red-500 font-geist"
                    onClick={openLogin}
                  >
                    Войти
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white font-geist border-0"
                    onClick={openRegister}
                  >
                    Начать бесплатно
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-red-500 transition-colors duration-200"
              >
                <Icon name={isOpen ? "X" : "Menu"} size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-black/98 border-t border-red-500/20">
                <p className="px-3 py-1 text-red-500 text-xs font-semibold uppercase tracking-wider">Инструменты</p>
                {TOOLS.map((t) => (
                  <Link
                    key={t.path}
                    to={t.path}
                    className="flex items-center gap-2 px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon name={t.icon as "Music"} size={14} className="text-red-500" />
                    {t.label}
                  </Link>
                ))}
                <div className="border-t border-red-500/20 mt-2 pt-2">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      className="block px-3 py-2 font-geist text-white hover:text-red-500 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-red-500/20 mt-2">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate">{user.name || "Пользователь"}</p>
                          <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin(user) && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:text-red-500"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon name="Shield" size={14} className="text-red-500" />
                          Панель администратора
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        className="w-full border-border text-white font-geist bg-transparent"
                        onClick={() => { handleLogout(); setIsOpen(false) }}
                      >
                        <Icon name="LogOut" size={14} className="mr-2" />
                        Выйти
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full border-border text-white font-geist bg-transparent"
                        onClick={() => { openLogin(); setIsOpen(false) }}
                      >
                        Войти
                      </Button>
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-geist border-0"
                        onClick={() => { openRegister(); setIsOpen(false) }}
                      >
                        Начать бесплатно
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={handleAuthClose} defaultTab={authTab} />
    </>
  )
}