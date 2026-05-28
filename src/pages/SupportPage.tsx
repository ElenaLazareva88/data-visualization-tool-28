import { useState } from "react"
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
  const [chatMessages, setChatMessages] = useState([
    { from: "support", text: "Привет! Я — Кира, AI-ассистент AI Studio. Чем могу помочь? Задайте вопрос — отвечу мгновенно или передам живому специалисту.", time: "сейчас" },
  ])
  const [chatInput, setChatInput] = useState("")
  const [ticketForm, setTicketForm] = useState({ email: "", topic: "", message: "" })
  const [ticketSent, setTicketSent] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

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

  const sendTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setTicketSent(true)
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
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="MessageCircle" size={14} className="mr-2" />Чат поддержки
            </TabsTrigger>
            <TabsTrigger value="ticket" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
              <Icon name="Mail" size={14} className="mr-2" />Написать тикет
            </TabsTrigger>
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
                    <p className="text-muted-foreground">Мы ответим на {ticketForm.email} в течение 24 часов</p>
                    <Button
                      className="mt-6 bg-primary hover:bg-primary/90 text-white"
                      onClick={() => { setTicketSent(false); setTicketForm({ email: "", topic: "", message: "" }) }}
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
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                        <Icon name="Send" size={16} className="mr-2" />Отправить тикет
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

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