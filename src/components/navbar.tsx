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
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}>
          {initials}
        </div>
        <span className="text-white/80 text-sm hidden xl:block max-w-[120px] truncate">
          {user.name || user.email}
        </span>
        <Icon name="ChevronDown" size={14} className="text-white/40" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 glass border border-white/10 rounded-xl py-1 min-w-[180px] shadow-xl z-50">
          <div className="px-4 py-2 border-b border-white/[0.06]">
            <p className="text-white text-sm font-medium truncate">{user.name || "Пользователь"}</p>
            <p className="text-white/40 text-xs truncate">{user.email}</p>
          </div>
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
            onClick={() => { setOpen(false); navigate("/profile") }}
          >
            <Icon name="User" size={14} className="text-violet-400" />
            Мой профиль
          </button>
          {isAdmin(user) && (
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
              onClick={() => { setOpen(false); navigate("/admin") }}
            >
              <Icon name="Shield" size={14} className="text-violet-400" />
              Панель администратора
            </button>
          )}
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
            onClick={() => { setOpen(false); navigate("/pricing") }}
          >
            <Icon name="CreditCard" size={14} className="text-violet-400" />
            Моя подписка
          </button>
          <div className="border-t border-white/[0.06] mt-1 pt-1">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
  const [scrolled, setScrolled] = useState(false)
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

  useEffect(() => {
    const sync = () => setUser(getUser())
    window.addEventListener("storage", sync)
    sync()
    return () => window.removeEventListener("storage", sync)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
      <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        scrolled
          ? "glass border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-orbitron text-xl font-bold">
                <span className="text-white">ИИ</span>
                <span className="gradient-text"> Кира</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-5">
              {/* Tools dropdown */}
              <div className="relative">
                <button
                  className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-1 text-sm"
                  onMouseEnter={openTools}
                  onMouseLeave={closeTools}
                >
                  Инструменты
                  <Icon name="ChevronDown" size={14} />
                </button>
                {toolsOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 glass border border-white/10 rounded-xl py-2 min-w-[180px] shadow-xl"
                    onMouseEnter={openTools}
                    onMouseLeave={closeTools}
                  >
                    {TOOLS.map((t) => (
                      <Link
                        key={t.path}
                        to={t.path}
                        className="flex items-center gap-2.5 px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors text-sm"
                      >
                        <Icon name={t.icon as "Music"} size={14} className="text-violet-400" />
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
                  className={`text-sm transition-colors duration-200 ${
                    location.pathname === l.path
                      ? "text-violet-300"
                      : "text-white/60 hover:text-white"
                  }`}
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
                    className="text-white/60 hover:text-white hover:bg-white/[0.06] text-sm"
                    onClick={openLogin}
                  >
                    Войти
                  </Button>
                  <Button
                    className="text-white text-sm rounded-xl px-4 py-2"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}
                    onClick={openRegister}
                  >
                    Регистрация
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Icon name={isOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden glass border-t border-white/[0.06]">
            <div className="px-4 py-4 space-y-1">
              <div className="pb-2 mb-2 border-b border-white/[0.06]">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2 px-3">Инструменты</p>
                {TOOLS.map((t) => (
                  <Link
                    key={t.path}
                    to={t.path}
                    className="flex items-center gap-2.5 px-3 py-2 text-white/60 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon name={t.icon as "Music"} size={14} className="text-violet-400" />
                    {t.label}
                  </Link>
                ))}
              </div>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === l.path
                      ? "text-violet-300 bg-violet-500/10"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                {user ? (
                  <div className="px-3 py-2 text-white/70 text-sm">{user.name || user.email}</div>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full text-white/60 hover:text-white justify-start" onClick={() => { openLogin(); setIsOpen(false) }}>Войти</Button>
                    <Button className="w-full text-white rounded-xl" style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} onClick={() => { openRegister(); setIsOpen(false) }}>Регистрация</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authOpen} onOpenChange={handleAuthClose} defaultTab={authTab} />
    </>
  )
}
