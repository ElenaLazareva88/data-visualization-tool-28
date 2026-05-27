import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { AUTH_URL, getToken, getUser, saveAuth, clearAuth, type User } from "@/lib/auth"

const TYPE_ICONS: Record<string, string> = {
  music: "Music",
  jingle: "Radio",
  video: "Video",
  photo: "Image",
  text: "FileText",
}

const TYPE_COLORS: Record<string, string> = {
  music: "text-purple-400",
  jingle: "text-yellow-400",
  video: "text-blue-400",
  photo: "text-green-400",
  text: "text-orange-400",
}

const SUB_COLORS: Record<string, string> = {
  free: "bg-zinc-700 text-zinc-300",
  starter: "bg-blue-900/60 text-blue-300",
  pro: "bg-purple-900/60 text-purple-300",
  business: "bg-red-900/60 text-red-300",
}

interface ProfileData {
  id: number
  email: string
  name: string
  role: string
  subscription: string
  subscription_label: string
  subscription_expires_at: string | null
  created_at: string
  generation_counts: Record<string, number>
}

interface GenerationItem {
  id: number
  type: string
  type_label: string
  title: string
  prompt: string
  result_url: string
  preview_url: string
  duration: number | null
  status: string
  created_at: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [history, setHistory] = useState<GenerationItem[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyFilter, setHistoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Форма профиля
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Форма пароля
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Аватар (локальный preview)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const token = getToken()

  useEffect(() => {
    if (!token) { navigate("/"); return }
    loadProfile()
  }, [])

  useEffect(() => {
    if (activeTab === "history") loadHistory(historyFilter)
  }, [activeTab, historyFilter])

  const loadProfile = async () => {
    setLoading(true)
    const res = await fetch(`${AUTH_URL}?action=profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    if (res.status === 401) { clearAuth(); navigate("/"); return }
    const data = await res.json()
    setProfile(data)
    setEditName(data.name || "")
    setEditEmail(data.email || "")
    setLoading(false)
  }

  const loadHistory = async (type: string) => {
    setHistoryLoading(true)
    const params = type !== "all" ? `&type=${type}` : ""
    const res = await fetch(`${AUTH_URL}?action=history${params}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    const data = await res.json()
    setHistory(data.items || [])
    setHistoryTotal(data.total || 0)
    setHistoryLoading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)
    const res = await fetch(AUTH_URL, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "profile", name: editName, email: editEmail }),
    })
    const data = await res.json()
    if (res.ok) {
      const user = getUser()
      if (user) saveAuth(token!, { ...user, name: data.name, email: data.email })
      setProfile(prev => prev ? { ...prev, name: data.name, email: data.email } : prev)
      setProfileMsg({ ok: true, text: "Профиль обновлён" })
    } else {
      setProfileMsg({ ok: false, text: data.error || "Ошибка сохранения" })
    }
    setProfileSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMsg(null)
    if (newPwd !== confirmPwd) { setPwdMsg({ ok: false, text: "Новые пароли не совпадают" }); return }
    setPwdSaving(true)
    const res = await fetch(AUTH_URL, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "password", current_password: currentPwd, new_password: newPwd }),
    })
    const data = await res.json()
    if (res.ok) {
      setPwdMsg({ ok: true, text: "Пароль изменён" })
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    } else {
      setPwdMsg({ ok: false, text: data.error || "Ошибка" })
    }
    setPwdSaving(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const formatDate = (str: string) => {
    try { return new Date(str).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) }
    catch { return str }
  }

  const totalGenerations = profile ? Object.values(profile.generation_counts).reduce((a, b) => a + b, 0) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return null

  const initials = (profile.name || profile.email).charAt(0).toUpperCase()
  const subColor = SUB_COLORS[profile.subscription] || SUB_COLORS.free

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Шапка профиля */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative group">
            <div
              className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-3xl font-bold text-white cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Camera" size={18} className="text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{profile.name || "Пользователь"}</h1>
            <p className="text-muted-foreground text-sm truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-xs ${subColor}`}>{profile.subscription_label}</Badge>
              <span className="text-muted-foreground text-xs">· с {formatDate(profile.created_at)}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-2xl font-bold text-white">{totalGenerations}</span>
            <span className="text-muted-foreground text-xs">генераций</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="User" size={14} className="mr-2" />Профиль
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="History" size={14} className="mr-2" />История
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="CreditCard" size={14} className="mr-2" />Подписка
            </TabsTrigger>
          </TabsList>

          {/* ===== ПРОФИЛЬ ===== */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white text-base">Личные данные</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Имя</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ваше имя"
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  {profileMsg && (
                    <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${profileMsg.ok ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                      <Icon name={profileMsg.ok ? "CheckCircle" : "AlertCircle"} size={14} />
                      {profileMsg.text}
                    </div>
                  )}
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={profileSaving}>
                    {profileSaving ? <><Icon name="Loader2" size={14} className="mr-2 animate-spin" />Сохраняем...</> : "Сохранить"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white text-base">Смена пароля</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Текущий пароль</Label>
                    <Input
                      type="password"
                      value={currentPwd}
                      onChange={(e) => setCurrentPwd(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Новый пароль</Label>
                    <Input
                      type="password"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      placeholder="Минимум 6 символов"
                      required
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Повторите новый пароль</Label>
                    <Input
                      type="password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  {pwdMsg && (
                    <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${pwdMsg.ok ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                      <Icon name={pwdMsg.ok ? "CheckCircle" : "AlertCircle"} size={14} />
                      {pwdMsg.text}
                    </div>
                  )}
                  <Button type="submit" variant="outline" className="border-border text-white bg-transparent" disabled={pwdSaving}>
                    {pwdSaving ? <><Icon name="Loader2" size={14} className="mr-2 animate-spin" />Меняем...</> : "Изменить пароль"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ИСТОРИЯ ===== */}
          <TabsContent value="history">
            {/* Фильтры по типу */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { key: "all", label: "Все", icon: "LayoutGrid" },
                { key: "music", label: "Музыка", icon: "Music" },
                { key: "jingle", label: "Джинглы", icon: "Radio" },
                { key: "video", label: "Видео", icon: "Video" },
                { key: "photo", label: "Фото", icon: "Image" },
                { key: "text", label: "Тексты", icon: "FileText" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setHistoryFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    historyFilter === f.key
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  <Icon name={f.icon as "Music"} size={13} />
                  {f.label}
                  {f.key !== "all" && profile.generation_counts[f.key]
                    ? <span className="ml-1 text-xs opacity-70">({profile.generation_counts[f.key]})</span>
                    : null}
                </button>
              ))}
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="Loader2" size={24} className="animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Icon name="FolderOpen" size={40} className="text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Здесь появятся твои генерации</p>
                <Link to="/music">
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-white" size="sm">
                    Создать первый трек
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className={`w-9 h-9 rounded-lg bg-background flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type]}`}>
                      <Icon name={(TYPE_ICONS[item.type] || "File") as "Music"} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm truncate">{item.title || "Без названия"}</span>
                        <Badge className="text-xs bg-zinc-800 text-zinc-400 border-0">{item.type_label}</Badge>
                      </div>
                      {item.prompt && (
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{item.prompt}</p>
                      )}
                      <p className="text-muted-foreground text-xs mt-1">{formatDate(item.created_at)}</p>
                    </div>
                    {item.result_url && (
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        title="Открыть"
                      >
                        <Icon name="ExternalLink" size={16} />
                      </a>
                    )}
                  </div>
                ))}
                {historyTotal > history.length && (
                  <p className="text-center text-muted-foreground text-sm pt-2">
                    Показано {history.length} из {historyTotal}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ===== ПОДПИСКА ===== */}
          <TabsContent value="subscription">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Icon name="CreditCard" size={16} className="text-primary" />
                  Текущий тариф
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-lg">{profile.subscription_label}</p>
                    {profile.subscription_expires_at ? (
                      <p className="text-muted-foreground text-sm">
                        Активна до {formatDate(profile.subscription_expires_at)}
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-sm">Без ограничений по времени</p>
                    )}
                  </div>
                  <Badge className={`text-sm px-3 py-1 ${subColor}`}>{profile.subscription_label}</Badge>
                </div>

                {/* Статистика использования */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-t border-border">
                  {[
                    { key: "music", label: "Музыка", icon: "Music" },
                    { key: "jingle", label: "Джинглы", icon: "Radio" },
                    { key: "video", label: "Видео", icon: "Video" },
                    { key: "photo", label: "Фото", icon: "Image" },
                  ].map((s) => (
                    <div key={s.key} className="bg-background rounded-lg p-3 text-center">
                      <Icon name={s.icon as "Music"} size={16} className={`mx-auto mb-1 ${TYPE_COLORS[s.key]}`} />
                      <p className="text-white font-bold text-lg">{profile.generation_counts[s.key] || 0}</p>
                      <p className="text-muted-foreground text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                {profile.subscription === "free" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-white text-sm font-medium mb-1">Хочешь больше возможностей?</p>
                    <p className="text-muted-foreground text-xs mb-3">Подключи платный тариф и получи доступ к видео, фото, джинглам и истории генераций.</p>
                    <Link to="/pricing">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        Выбрать тариф
                      </Button>
                    </Link>
                  </div>
                )}

                {profile.subscription !== "free" && (
                  <Link to="/pricing">
                    <Button variant="outline" size="sm" className="border-border text-white bg-transparent">
                      Изменить тариф
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}