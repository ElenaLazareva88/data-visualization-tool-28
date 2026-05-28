import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"

const CHATS = [
  { id: 1, name: "Иван Петров", type: "personal", last: "Привет! Как дела?", time: "12:30", unread: 2, online: true },
  { id: 2, name: "Команда ИИ Кира", type: "group", last: "Новый трек загружен", time: "11:45", unread: 5, online: false },
  { id: 3, name: "Музыканты Pro", type: "channel", last: "Урок: создание бита", time: "Вчера", unread: 0, online: false },
  { id: 4, name: "Мария Сидорова", type: "personal", last: "Отличная работа!", time: "Вчера", unread: 0, online: true },
  { id: 5, name: "Дизайнеры", type: "group", last: "Поделитесь шаблоном", time: "Пн", unread: 1, online: false },
]

const MESSAGES = [
  { id: 1, from: "other", name: "Иван Петров", text: "Привет! Видел твой новый трек — просто огонь 🔥", time: "12:15" },
  { id: 2, from: "me", text: "Спасибо! Сделал на ИИ Кира за 10 минут", time: "12:17" },
  { id: 3, from: "other", name: "Иван Петров", text: "Не может быть! Какой стиль использовал?", time: "12:20" },
  { id: 4, from: "me", text: "Электронный + немного джаза. Попробуй сам, это реально работает", time: "12:25" },
  { id: 5, from: "other", name: "Иван Петров", text: "Буду пробовать! Как дела?", time: "12:30" },
]

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(CHATS[0])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(MESSAGES)
  const [searchQuery, setSearchQuery] = useState("")

  const sendMessage = () => {
    if (!message.trim()) return
    setMessages([...messages, { id: Date.now(), from: "me", text: message, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }])
    setMessage("")
  }

  const typeIcon = (type: string) => type === "personal" ? "User" : type === "group" ? "Users" : "Megaphone"
  const typeLabel = (type: string) => type === "personal" ? "" : type === "group" ? "Группа" : "Канал"

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <div className="w-80 bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-white font-bold text-lg font-orbitron mb-3">Сообщения</h2>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-border text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {CHATS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-background transition-colors border-b border-border/50 ${activeChat.id === chat.id ? "bg-background border-l-2 border-l-primary" : ""}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {chat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-sm font-medium truncate">{chat.name}</span>
                        {chat.type !== "personal" && (
                          <Badge variant="outline" className="text-xs border-border text-muted-foreground px-1 py-0">{typeLabel(chat.type)}</Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">{chat.time}</span>
                    </div>
                    <p className="text-muted-foreground text-xs truncate">{chat.last}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{chat.unread}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-16 bg-card border-b border-border flex items-center px-6 gap-4">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {activeChat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {activeChat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />}
              </div>
              <div>
                <p className="text-white font-medium">{activeChat.name}</p>
                <p className="text-muted-foreground text-xs">{activeChat.online ? "В сети" : "Был(а) недавно"}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  <Icon name="Phone" size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  <Icon name="Video" size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  <Icon name="Info" size={16} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.from === "me" ? "flex-row-reverse" : ""}`}>
                  {msg.from === "other" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {activeChat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${msg.from === "me" ? "bg-primary text-white rounded-tr-sm" : "bg-card text-white rounded-tl-sm border border-border"}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-muted-foreground text-xs">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-card border-t border-border">
              <div className="flex gap-3 items-end">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white flex-shrink-0">
                  <Icon name="Paperclip" size={18} />
                </Button>
                <Input
                  placeholder="Напишите сообщение..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="bg-background border-border text-white placeholder:text-muted-foreground flex-1"
                />
                <Button onClick={sendMessage} className="bg-primary hover:bg-primary/90 text-white flex-shrink-0">
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}