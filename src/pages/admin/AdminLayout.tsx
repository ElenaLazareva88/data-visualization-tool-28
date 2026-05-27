import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Icon from "@/components/ui/icon"
import { getUser, clearAuth, isAdmin, getToken, AUTH_URL } from "@/lib/auth"

const NAV = [
  { path: "/admin", label: "Дашборд", icon: "LayoutDashboard", exact: true },
  { path: "/admin/users", label: "Пользователи", icon: "Users" },
  { path: "/admin/activity", label: "Активность", icon: "Activity" },
  { path: "/admin/subscriptions", label: "Подписки", icon: "CreditCard" },
  { path: "/admin/finance", label: "Финансы", icon: "DollarSign" },
  { path: "/admin/content", label: "Контент и ИИ", icon: "Sparkles" },
  { path: "/admin/chat", label: "Чаты", icon: "MessageSquare" },
  { path: "/admin/tickets", label: "Техподдержка", icon: "LifeBuoy" },
  { path: "/admin/analytics", label: "Аналитика", icon: "BarChart3" },
  { path: "/admin/settings", label: "Настройки", icon: "Settings" },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate("/login")
    }
  }, [])

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
    navigate("/login")
  }

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path) && path !== "/admin" || (path === "/admin" && location.pathname === "/admin")

  if (!user || !isAdmin(user)) return null

  return (
    <div className="dark min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-card border-r border-border flex flex-col transition-all duration-200 flex-shrink-0 fixed h-full z-40`}>
        <div className="h-16 flex items-center px-3 border-b border-border gap-2">
          <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Shield" size={16} className="text-white" />
            </div>
            {sidebarOpen && <span className="text-white font-orbitron font-bold text-sm truncate">Admin Panel</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-white flex-shrink-0">
            <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={18} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== "/admin"
            const finalActive = item.exact ? location.pathname === "/admin" : active
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  finalActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-background hover:text-white"
                }`}
              >
                <Icon name={item.icon as "Users"} size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen ? "justify-center" : ""}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.name || user.email}</p>
                <Badge className="bg-primary/20 text-primary border-0 text-xs px-1 py-0">Владелец</Badge>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground hover:text-white hover:bg-background text-xs ${sidebarOpen ? "w-full justify-start" : "w-full justify-center"}`}
            onClick={handleLogout}
          >
            <Icon name="LogOut" size={14} className={sidebarOpen ? "mr-2" : ""} />
            {sidebarOpen && "Выйти"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${sidebarOpen ? "ml-60" : "ml-16"} transition-all duration-200`}>
        <div className="p-6 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  )
}