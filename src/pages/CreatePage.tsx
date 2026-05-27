import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Icon from "@/components/ui/icon"

const TOOLS = [
  {
    path: "/music",
    icon: "Music",
    emoji: "🎵",
    label: "Музыка",
    desc: "Создавай треки и мелодии по описанию",
    color: "from-purple-500/20 to-purple-900/10",
    border: "border-purple-500/30 hover:border-purple-400",
    badge: "",
  },
  {
    path: "/video",
    icon: "Video",
    emoji: "🎬",
    label: "Видео",
    desc: "Генерируй видеоролики из текста или фото",
    color: "from-blue-500/20 to-blue-900/10",
    border: "border-blue-500/30 hover:border-blue-400",
    badge: "",
  },
  {
    path: "/photo",
    icon: "Image",
    emoji: "🖼️",
    label: "Фото и картинки",
    desc: "Оживляй, раскрашивай и генерируй изображения",
    color: "from-pink-500/20 to-pink-900/10",
    border: "border-pink-500/30 hover:border-pink-400",
    badge: "",
  },
  {
    path: "/text",
    icon: "FileText",
    emoji: "✍️",
    label: "Тексты",
    desc: "Посты, статьи, сценарии и рекламные тексты",
    color: "from-green-500/20 to-green-900/10",
    border: "border-green-500/30 hover:border-green-400",
    badge: "",
  },
  {
    path: "/jingle",
    icon: "Radio",
    emoji: "📻",
    label: "Джинглы",
    desc: "Рекламные аудиоролики и джинглы за секунды",
    color: "from-yellow-500/20 to-yellow-900/10",
    border: "border-yellow-500/30 hover:border-yellow-400",
    badge: "",
  },
  {
    path: "/invite",
    icon: "Mail",
    emoji: "💌",
    label: "Пригласительные",
    desc: "Красивые приглашения на любые события",
    color: "from-red-500/20 to-red-900/10",
    border: "border-red-500/30 hover:border-red-400",
    badge: "",
  },
  {
    path: "/logo",
    icon: "Hexagon",
    emoji: "🎨",
    label: "Логотипы",
    desc: "Логотип для бизнеса и аватары для соцсетей",
    color: "from-orange-500/20 to-orange-900/10",
    border: "border-orange-500/30 hover:border-orange-400",
    badge: "Новый",
  },
]

export default function CreatePage() {
  const navigate = useNavigate()

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">

        <div className="text-center mb-12 mt-10">
          <h1 className="text-4xl font-bold text-white font-orbitron mb-3">
            Что будем создавать?
          </h1>
          <p className="text-muted-foreground text-lg">Выбери тип контента и начни прямо сейчас</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className={`relative rounded-2xl border-2 bg-gradient-to-br ${tool.color} ${tool.border} p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group`}
            >
              {tool.badge && (
                <span className="absolute top-4 right-4 text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium">
                  {tool.badge}
                </span>
              )}
              <div className="text-4xl mb-4">{tool.emoji}</div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name={tool.icon as "Music"} size={18} className="text-white/70" />
                <h2 className="text-white font-semibold text-lg">{tool.label}</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-white/50 text-xs group-hover:text-white/80 transition-colors">
                <span>Перейти</span>
                <Icon name="ArrowRight" size={12} />
              </div>
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  )
}
