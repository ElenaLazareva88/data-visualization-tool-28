import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { AUTH_URL, getUser } from "@/lib/auth"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  time: string
  error?: boolean
}

const SUGGESTIONS = [
  "Как создать музыкальный трек?",
  "Помоги составить промпт для видео",
  "Что умеет платформа ИИ Кира?",
  "Как получить лучший результат при генерации?",
]

function now() {
  return new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })
}

export default function ChatPage() {
  const user = getUser()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: `Привет${user?.name ? `, ${user.name}` : ""}! Я — Кира, твой ИИ-ассистент. Помогу с созданием музыки, видео, фото и текста. Спрашивай — отвечу! 🎵`,
      time: now(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // История для контекста (без первого приветственного сообщения)
  const buildHistory = () =>
    messages.slice(1).map((m) => ({ role: m.role, content: m.content }))

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, time: now() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${AUTH_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: buildHistory() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: data.error || "Произошла ошибка. Попробуй ещё раз.", time: now(), error: true },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: data.reply, time: now() },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Нет соединения с сервером. Проверь интернет и попробуй снова.", time: now(), error: true },
      ])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: `Привет${user?.name ? `, ${user.name}` : ""}! Начнём с чистого листа. Чем могу помочь? 😊`,
        time: now(),
      },
    ])
  }

  return (
    <div className="dark min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col pt-16 max-w-3xl w-full mx-auto px-4">
        {/* Шапка */}
        <div className="flex items-center justify-between py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Icon name="Bot" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Кира — ИИ-ассистент</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-muted-foreground text-xs">Онлайн · GigaChat</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-white text-xs gap-1.5"
          >
            <Icon name="Trash2" size={14} />
            Новый диалог
          </Button>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Аватар */}
              {msg.role === "assistant" ? (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Icon name="Bot" size={15} className="text-primary" />
                </div>
              ) : (
                <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="bg-muted text-white text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "Я"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : msg.error
                      ? "bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-sm"
                      : "bg-card text-white border border-border rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-muted-foreground text-[11px]">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Индикатор печатания */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center">
                <Icon name="Bot" size={15} className="text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Подсказки — показываем только если 1 сообщение (приветствие) */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left text-xs text-muted-foreground bg-card border border-border hover:border-primary/50 hover:text-white rounded-xl px-3 py-2.5 transition-colors leading-snug"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Поле ввода */}
        <div className="pb-6">
          <div className="flex gap-3 items-end bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors">
            <Textarea
              ref={textareaRef}
              placeholder="Напиши сообщение... (Enter — отправить, Shift+Enter — новая строка)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="flex-1 bg-transparent border-0 text-white placeholder:text-muted-foreground resize-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0 max-h-32 overflow-y-auto"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              size="sm"
              className="flex-shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-40 rounded-xl h-8 w-8 p-0"
            >
              {loading ? (
                <Icon name="Loader2" size={15} className="animate-spin" />
              ) : (
                <Icon name="Send" size={15} />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-[11px] text-center mt-2">
            ИИ может ошибаться. Проверяй важную информацию.
          </p>
        </div>
      </div>
    </div>
  )
}
