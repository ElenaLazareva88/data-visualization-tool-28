import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AUTH_URL, getToken, getUser } from "@/lib/auth"

const FAQ_ITEMS = [
  {
    q: "Как начать пользоваться платформой?",
    a: "Зарегистрируйтесь бесплатно, перейдите в любой раздел (Музыка, Видео, Фото и т.д.) и введите описание того, что хотите создать. ИИ сделает всё остальное.",
  },
  {
    q: "Могу ли я использовать созданный контент в коммерческих целях?",
    a: "На тарифах «Базовый» и выше весь созданный контент доступен для коммерческого использования. На бесплатном тарифе — только для личных нужд.",
  },
  {
    q: "Почему качество генерации отличается?",
    a: "Качество зависит от точности вашего описания. Чем подробнее вы укажете стиль, настроение и детали — тем лучше результат. Используйте раздел «Обучение» для изучения промптов.",
  },
  {
    q: "Как отменить подписку?",
    a: "В личном кабинете перейдите в «Настройки» → «Подписка» → «Отменить». Подписка действует до конца оплаченного периода.",
  },
  {
    q: "Куда обратиться, если оплата прошла, но подписка не активировалась?",
    a: "Напишите нам в чат поддержки с указанием email и номера заказа. Решим в течение 1 часа в рабочее время.",
  },
  {
    q: "Можно ли скачать исходники (stems, raw файлы)?",
    a: "Да, исходники доступны на тарифе «Премиум». На других тарифах доступны только финальные файлы (MP3, WAV, MP4, JPG и т.д.).",
  },
  {
    q: "Есть ли мобильное приложение?",
    a: "Сейчас платформа работает через браузер на любых устройствах. Мобильное приложение в разработке — следите за анонсами в Telegram-канале.",
  },
]

const AI_HINTS = [
  "Для музыки указывайте темп (BPM), жанр и настроение — результат будет точнее",
  "При генерации видео добавьте «кинематографичный стиль» для более профессионального вида",
  "Для текстов укажите целевую аудиторию — это сильно влияет на тон и стиль",
  "Джинглы до 5 секунд лучше подходят для фирменного звука, 10–30 сек — для радио",
  "Используйте готовые промпты из раздела «Сообщество» — там сотни проверенных шаблонов",
]

const TOPICS = [
  "Проблема с оплатой",
  "Вопрос по тарифу",
  "Ошибка при генерации",
  "Скачивание файлов",
  "Коллаборации",
  "Другое",
]

export default function SupportPage() {
  const user = getUser()

  const [chatMessages, setChatMessages] = useState([
    { from: "support", text: "Привет! Я — Кира, ИИ-ассистент ИИ Кира. Чем могу помочь? Задайте вопрос — отвечу мгновенно или передам живому специалисту.", time: "сейчас" },
  ])
  const [chatInput, setChatInput] = useState("")
  const [ticketForm, setTicketForm] = useState({
    email: user?.email || "",
    topic: "",
    message: "",
  })
  const [ticketSent, setTicketSent] = useState(false)
  const [ticketId, setTicketId] = useState<number | null>(null)
  const [ticketLoading, setTicketLoading] = useState(false)
  const [ticketError, setTicketError] = useState("")
  const [hintIndex, setHintIndex] = useState(0)

  // Мои обращения
  interface Ticket {
    id: number
    subject: string
    status: string
    priority: string
    created_at: string
    updated_at: string
  }
  const [myTickets, setMyTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketsLoaded, setTicketsLoaded] = useState(false)

  const loadMyTickets = async () => {
    const token = getToken()
    if (!token) return
    setTicketsLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setMyTickets(data.tickets || [])
    } catch {
      // silent
    } finally {
      setTicketsLoading(false)
      setTicketsLoaded(true)
    }
  }

  // Загружаем при переходе на вкладку "my"
  useEffect(() => {
    if (ticketsLoaded) return
    if (user) loadMyTickets()
  }, [])

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    new:        { label: "Новый",       color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    open:       { label: "Открыт",      color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    in_progress:{ label: "В работе",    color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    resolved:   { label: "Решён",       color: "bg-green-500/15 text-green-400 border-green-500/30" },
    closed:     { label: "Закрыт",      color: "bg-muted/40 text-muted-foreground border-border" },
  }

  const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    high:   { label: "Высокий", color: "text-red-400" },
    normal: { label: "Обычный", color: "text-muted-foreground" },
    low:    { label: "Низкий",  color: "text-muted-foreground" },
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
    } catch { return iso }
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    const userMsg = { from: "user", text: chatInput, time: "сейчас" }
    const botMsg = {
      from: "support",
      text: "Спасибо за вопрос! Я передаю его специалисту. Обычно отвечаем в течение 5–15 минут. Пока можете посмотреть раздел «База знаний» — там много ответов.",
      time: "сейчас",
    }
    setChatMessages(prev => [...prev, userMsg, botMsg])
    setChatInput("")
  }

  const sendTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setTicketError("")
    setTicketLoading(true)

    const token = getToken()
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    try {
      const res = await fetch(`${AUTH_URL}/ticket`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: ticketForm.email,
          topic: ticketForm.topic,
          message: ticketForm.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTicketError(data.error || "Ошибка отправки")
        return
      }
      setTicketId(data.ticket_id)
      setTicketSent(true)
      // Сбрасываем кеш, чтобы новый тикет отобразился в "Мои обращения"
      setTicketsLoaded(false)
      if (user) loadMyTickets()
    } catch {
      setTicketError("Нет соединения. Проверьте интернет и попробуйте снова.")
    } finally {
      setTicketLoading(false)
    }
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="LifeBuoy" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Поддержка</h1>
          </div>
          <p className="text-muted-foreground">Чат с поддержкой, AI Кира-ассистент и база знаний</p>
        </div>

        <Tabs defaultValue="chat">
          <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="MessageCircle" size={14} className="mr-2" />Чат поддержки
            </TabsTrigger>
            <TabsTrigger value="ticket" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="Mail" size={14} className="mr-2" />Написать тикет
            </TabsTrigger>
            {user && (
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground"
                onClick={() => { if (!ticketsLoaded) loadMyTickets() }}
              >
                <Icon name="Inbox" size={14} className="mr-2" />Мои обращения
                {myTickets.filter(t => t.status !== "closed" && t.status !== "resolved").length > 0 && (
                  <span className="ml-2 bg-primary/30 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {myTickets.filter(t => t.status !== "closed" && t.status !== "resolved").length}
                  </span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="faq" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="HelpCircle" size={14} className="mr-2" />База знаний (FAQ)
            </TabsTrigger>
          </TabsList>

          {/* Chat */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="Bot" size={18} className="text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-base">AI Кира-ассистент</CardTitle>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-muted-foreground text-xs">Онлайн · обычно отвечает за 1 мин</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80 overflow-y-auto p-4 space-y-4">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.from === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.from === "support" ? "bg-primary/20" : "bg-muted"}`}>
                            <Icon name={m.from === "support" ? "Bot" : "User"} size={14} className="text-primary" fallback="User" />
                          </div>
                          <div className={`max-w-xs lg:max-w-sm flex flex-col gap-1 ${m.from === "user" ? "items-end" : ""}`}>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-background text-white border border-border rounded-tl-sm"}`}>
                              {m.text}
                            </div>
                            <span className="text-muted-foreground text-xs">{m.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border p-4 flex gap-3">
                      <Input
                        placeholder="Напишите вопрос..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                        className="bg-background border-border text-white placeholder:text-muted-foreground"
                      />
                      <Button onClick={sendChatMessage} className="bg-primary hover:bg-primary/90 text-white flex-shrink-0">
                        <Icon name="Send" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Hints */}
              <div className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Icon name="Lightbulb" size={16} className="text-primary" />
                      Подсказка от Киры
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      💡 {AI_HINTS[hintIndex]}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-border text-white hover:border-primary text-xs"
                      onClick={() => setHintIndex((hintIndex + 1) % AI_HINTS.length)}
                    >
                      <Icon name="RefreshCw" size={12} className="mr-2" />Другой совет
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-5 space-y-3">
                    <p className="text-white text-sm font-medium">Быстрые ответы</p>
                    {["Как скачать файл?", "Не работает генерация", "Вопрос по оплате", "Как отменить подписку?"].map((q) => (
                      <button
                        key={q}
                        className="w-full text-left text-muted-foreground text-sm hover:text-primary transition-colors py-1.5 border-b border-border/50 last:border-0"
                        onClick={() => setChatInput(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Ticket */}
          <TabsContent value="ticket">
            <div className="max-w-xl">
              {ticketSent ? (
                <Card className="bg-card border-border">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Icon name="CheckCircle" size={32} className="text-primary" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Тикет отправлен!</h3>
                    {ticketId && (
                      <p className="text-muted-foreground text-sm mb-1">
                        Номер обращения: <span className="text-white font-mono font-bold">#{ticketId}</span>
                      </p>
                    )}
                    <p className="text-muted-foreground text-sm">Ответим на {ticketForm.email} в течение 24 часов</p>
                    <Button
                      className="mt-6 bg-primary hover:bg-primary/90 text-white"
                      onClick={() => {
                        setTicketSent(false)
                        setTicketId(null)
                        setTicketForm({ email: user?.email || "", topic: "", message: "" })
                      }}
                    >
                      Отправить ещё
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Icon name="Mail" size={16} className="text-primary" />
                      Новый тикет
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={sendTicket} className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground text-sm mb-1.5 block">Ваш email</Label>
                        <Input
                          type="email"
                          placeholder="example@mail.ru"
                          value={ticketForm.email}
                          onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                          className="bg-background border-border text-white placeholder:text-muted-foreground"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm mb-1.5 block">Тема</Label>
                        <Select value={ticketForm.topic} onValueChange={(v) => setTicketForm({ ...ticketForm, topic: v })}>
                          <SelectTrigger className="bg-background border-border text-white">
                            <SelectValue placeholder="Выберите тему" />
                          </SelectTrigger>
                          <SelectContent>
                            {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm mb-1.5 block">Описание проблемы</Label>
                        <Textarea
                          placeholder="Опишите вашу проблему подробно..."
                          value={ticketForm.message}
                          onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                          rows={5}
                          className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                          required
                        />
                      </div>
                      {ticketError && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <Icon name="AlertCircle" size={14} />
                          {ticketError}
                        </p>
                      )}
                      <Button
                        type="submit"
                        disabled={ticketLoading || !ticketForm.topic}
                        className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                      >
                        {ticketLoading ? (
                          <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</>
                        ) : (
                          <><Icon name="Send" size={16} className="mr-2" />Отправить тикет</>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Мои обращения */}
          {user && (
            <TabsContent value="my">
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-base flex items-center gap-2">
                    <Icon name="Inbox" size={18} className="text-primary" />
                    Мои обращения
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMyTickets}
                    disabled={ticketsLoading}
                    className="border-border text-muted-foreground hover:text-white text-xs"
                  >
                    <Icon name={ticketsLoading ? "Loader2" : "RefreshCw"} size={13} className={`mr-1.5 ${ticketsLoading ? "animate-spin" : ""}`} />
                    Обновить
                  </Button>
                </div>

                {ticketsLoading && !myTickets.length ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    <span className="text-sm">Загружаем обращения...</span>
                  </div>
                ) : myTickets.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-14 text-center">
                      <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                        <Icon name="InboxIcon" size={28} className="text-muted-foreground" fallback="Inbox" />
                      </div>
                      <p className="text-white font-medium mb-1">Обращений пока нет</p>
                      <p className="text-muted-foreground text-sm">Если возникнет вопрос — напишите нам во вкладке «Написать тикет»</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((ticket) => {
                      const st = STATUS_LABELS[ticket.status] || { label: ticket.status, color: "bg-muted/40 text-muted-foreground border-border" }
                      const pr = PRIORITY_LABELS[ticket.priority] || PRIORITY_LABELS.normal
                      return (
                        <Card key={ticket.id} className="bg-card border-border hover:border-primary/40 transition-colors">
                          <CardContent className="py-4 px-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="text-muted-foreground text-xs font-mono">#{ticket.id}</span>
                                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>
                                    {st.label}
                                  </span>
                                  {ticket.priority === "high" && (
                                    <span className="flex items-center gap-1 text-[11px] text-red-400">
                                      <Icon name="AlertCircle" size={11} />
                                      Высокий приоритет
                                    </span>
                                  )}
                                </div>
                                <p className="text-white text-sm font-medium truncate">{ticket.subject}</p>
                                <p className="text-muted-foreground text-xs mt-1">
                                  Создан {formatDate(ticket.created_at)}
                                  {ticket.updated_at !== ticket.created_at && (
                                    <> · обновлён {formatDate(ticket.updated_at)}</>
                                  )}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {(ticket.status === "resolved" || ticket.status === "closed") ? (
                                  <Icon name="CheckCircle2" size={20} className="text-green-500" />
                                ) : (
                                  <Icon name="Clock" size={20} className="text-yellow-500/70" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}

                    <p className="text-muted-foreground text-xs text-center pt-2">
                      Показаны последние {myTickets.length} обращений
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* FAQ */}
          <TabsContent value="faq">
            <div className="max-w-3xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { label: "Оплата", icon: "CreditCard" },
                  { label: "Генерация", icon: "Wand2" },
                  { label: "Аккаунт", icon: "User" },
                  { label: "Скачивание", icon: "Download" },
                ].map((c) => (
                  <div key={c.label} className="rounded-lg bg-card border border-border p-4 text-center cursor-pointer hover:border-primary transition-colors">
                    <Icon name={c.icon as "CreditCard"} size={22} className="text-primary mx-auto mb-2" />
                    <p className="text-white text-sm">{c.label}</p>
                  </div>
                ))}
              </div>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-lg px-1">
                    <AccordionTrigger className="text-left font-medium text-white hover:text-red-400 px-4 py-4 text-sm">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-4 text-sm">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Card className="mt-8 bg-primary/10 border-primary/30">
                <CardContent className="pt-6 pb-6 flex items-center gap-4">
                  <Icon name="MessageCircle" size={28} className="text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Не нашли ответ?</p>
                    <p className="text-muted-foreground text-sm mt-0.5">Наша команда онлайн и готова помочь прямо сейчас</p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white flex-shrink-0">
                    Написать в чат
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}