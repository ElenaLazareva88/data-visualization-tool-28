import { useState } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const EVENT_TYPES = [
  { id: "birthday", label: "День рождения", icon: "🎂", category: "Праздник" },
  { id: "wedding", label: "Свадьба", icon: "💍", category: "Праздник" },
  { id: "anniversary", label: "Юбилей", icon: "🎉", category: "Праздник" },
  { id: "baby", label: "Рождение ребёнка", icon: "👶", category: "Праздник" },
  { id: "newyear", label: "Новый год", icon: "🎄", category: "Праздник" },
  { id: "graduation", label: "Выпускной", icon: "🎓", category: "Праздник" },
  { id: "concert", label: "Концерт", icon: "🎵", category: "Мероприятие" },
  { id: "exhibition", label: "Выставка", icon: "🖼️", category: "Мероприятие" },
  { id: "corporate", label: "Корпоратив", icon: "🏢", category: "Мероприятие" },
  { id: "sport", label: "Спортивное событие", icon: "🏆", category: "Мероприятие" },
  { id: "conference", label: "Конференция", icon: "📊", category: "Мероприятие" },
  { id: "custom", label: "Другое", icon: "✨", category: "Мероприятие" },
]

const STYLES = [
  { id: "elegant", label: "Элегантный", desc: "Классика и роскошь" },
  { id: "playful", label: "Игривый", desc: "Яркий и весёлый" },
  { id: "minimal", label: "Минимализм", desc: "Чисто и лаконично" },
  { id: "vintage", label: "Винтаж", desc: "Ретро-атмосфера" },
]

export default function InvitePage() {
  const [selectedEvent, setSelectedEvent] = useState("birthday")
  const [inviteFrom, setInviteFrom] = useState("")
  const [inviteTo, setInviteTo] = useState("")
  const [inviteDate, setInviteDate] = useState("")
  const [invitePlace, setInvitePlace] = useState("")
  const [inviteText, setInviteText] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("elegant")
  const [format, setFormat] = useState("vertical")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const currentEvent = EVENT_TYPES.find(e => e.id === selectedEvent)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      saveGeneration({
        type: "photo",
        title: `Приглашение: ${currentEvent?.label}${inviteFrom ? ` от ${inviteFrom}` : ""}`,
        prompt: `${currentEvent?.label}, от: ${inviteFrom}, для: ${inviteTo}, дата: ${inviteDate}, место: ${invitePlace}`,
      })
    }, 2500)
  }

  const holidays = EVENT_TYPES.filter(e => e.category === "Праздник")
  const events = EVENT_TYPES.filter(e => e.category === "Мероприятие")

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">

        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Mail" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Пригласительные</h1>
          </div>
          <p className="text-muted-foreground">Создавай красивые приглашения на праздники и мероприятия за секунды</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Тип события */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="PartyPopper" size={16} className="text-primary" />
                  Тип события
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wide">Праздники</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {holidays.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev.id)}
                        className={`rounded-lg border-2 p-2.5 cursor-pointer transition-colors text-center ${
                          selectedEvent === ev.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{ev.icon}</div>
                        <p className={`text-xs leading-tight ${selectedEvent === ev.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{ev.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-2 uppercase tracking-wide">Мероприятия</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev.id)}
                        className={`rounded-lg border-2 p-2.5 cursor-pointer transition-colors text-center ${
                          selectedEvent === ev.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{ev.icon}</div>
                        <p className={`text-xs leading-tight ${selectedEvent === ev.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{ev.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Детали */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="ClipboardList" size={16} className="text-primary" />
                  Детали приглашения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Кто приглашает</Label>
                    <Input
                      placeholder="Иван и Мария, ООО «Ромашка»..."
                      value={inviteFrom}
                      onChange={(e) => setInviteFrom(e.target.value)}
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Кого приглашают</Label>
                    <Input
                      placeholder="Дорогих друзей, Алексея..."
                      value={inviteTo}
                      onChange={(e) => setInviteTo(e.target.value)}
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Дата и время</Label>
                    <Input
                      placeholder="15 июня 2025, в 18:00"
                      value={inviteDate}
                      onChange={(e) => setInviteDate(e.target.value)}
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-1.5 block">Место проведения</Label>
                    <Input
                      placeholder="Ресторан «Маяк», ул. Садовая 12"
                      value={invitePlace}
                      onChange={(e) => setInvitePlace(e.target.value)}
                      className="bg-background border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-1.5 block">Дополнительный текст</Label>
                  <Textarea
                    placeholder="Дресс-код, пожелания гостям, контакт для подтверждения..."
                    value={inviteText}
                    onChange={(e) => setInviteText(e.target.value)}
                    rows={3}
                    className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Стиль */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Palette" size={16} className="text-primary" />
                  Стиль оформления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {STYLES.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={`rounded-lg border-2 p-3 cursor-pointer transition-colors text-center ${
                        selectedStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className={`text-sm font-medium ${selectedStyle === s.id ? "text-primary" : "text-white"}`}>{s.label}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Боковая панель */}
          <div className="space-y-4">
            {/* Предпросмотр */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Eye" size={16} className="text-primary" />
                  Предпросмотр
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generated ? (
                  <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-red-950 via-black to-red-900 border border-red-500/20 flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <div className="text-4xl mb-2">{currentEvent?.icon}</div>
                    <p className="text-red-400 text-xs uppercase tracking-widest font-medium">{currentEvent?.label}</p>
                    {inviteFrom && <p className="text-white text-sm font-semibold">{inviteFrom}</p>}
                    <p className="text-muted-foreground text-xs">приглашает</p>
                    {inviteTo && <p className="text-white text-sm">{inviteTo}</p>}
                    {inviteDate && (
                      <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Icon name="Calendar" size={12} />
                        {inviteDate}
                      </div>
                    )}
                    {invitePlace && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Icon name="MapPin" size={12} />
                        {invitePlace}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-lg bg-background border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-4">
                    <div className="text-4xl mb-3">{currentEvent?.icon}</div>
                    <p className="text-muted-foreground text-sm">{currentEvent?.label}</p>
                    <p className="text-muted-foreground text-xs mt-1">Заполните детали и нажмите «Создать»</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Формат */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Формат</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "vertical", label: "Портрет", icon: "Smartphone" },
                    { id: "horizontal", label: "Альбом", icon: "Monitor" },
                    { id: "square", label: "Квадрат", icon: "Square" },
                  ].map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={`rounded-lg border-2 p-2 cursor-pointer transition-colors text-center ${
                        format === f.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon name={f.icon as "Smartphone"} size={16} className={`mx-auto mb-1 ${format === f.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className={`text-xs ${format === f.id ? "text-primary" : "text-muted-foreground"}`}>{f.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-11"
              onClick={handleGenerate}
              disabled={isGenerating || !inviteFrom}
            >
              {isGenerating
                ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Создаём...</>
                : <><Icon name="Sparkles" size={16} className="mr-2" />Создать приглашение</>
              }
            </Button>

            {generated && (
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-border text-white bg-transparent">
                  <Icon name="Download" size={14} className="mr-2" />Скачать PNG
                </Button>
                <Button variant="outline" className="w-full border-border text-white bg-transparent">
                  <Icon name="Share2" size={14} className="mr-2" />Поделиться
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
