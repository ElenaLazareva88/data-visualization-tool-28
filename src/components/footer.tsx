import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Link } from "react-router-dom"
import TermsModal from "@/components/TermsModal"

const SOCIAL_LINKS = [
  { name: "Telegram", href: "https://t.me/aistudio", icon: "Send", label: "Telegram" },
  { name: "VK", href: "https://vk.com/GPTAIStudio", icon: "Users", label: "ВКонтакте" },
  { name: "Max", href: "https://max.ru/aistudio", icon: "MessageCircle", label: "Max" },
]

const PLATFORM_LINKS = [
  { label: "Создание музыки", path: "/music" },
  { label: "Создание видео", path: "/video" },
  { label: "Работа с фото", path: "/photo" },
  { label: "Написание текстов", path: "/text" },
  { label: "Джинглы", path: "/jingle" },
  { label: "Презентации", path: "/presentation" },
]

const COMPANY_LINKS = [
  { label: "Сообщество", path: "/community" },
  { label: "Коллаборации", path: "/collab" },
  { label: "Обучение", path: "/learn" },
  { label: "Чат", path: "/chat" },
  { label: "Тарифы", path: "/pricing" },
  { label: "Поддержка", path: "/support" },
]

export function Footer() {
  const [termsOpen, setTermsOpen] = useState(false)

  return (
    <>
      <footer className="relative overflow-hidden border-t border-white/[0.06]" style={{ background: "hsl(230 15% 5%)" }}>
        {/* Subtle orb */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-violet w-96 h-96 bottom-0 left-1/2 -translate-x-1/2" style={{ opacity: 0.05 }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/">
                <h2 className="font-orbitron text-2xl font-bold mb-4">
                  <span className="text-white">ИИ</span>
                  <span className="gradient-text"> Кира</span>
                </h2>
              </Link>
              <p className="text-white/40 text-sm mb-6 max-w-sm leading-relaxed">
                Привет-привет! Я Кира. Рада видеть тебя здесь — самое время для крутых идей!
              </p>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 glass hover:border-violet-500/30 border border-white/[0.06] text-white/40 hover:text-violet-300 transition-all duration-200 rounded-lg px-3 py-2 text-xs"
                    title={s.label}
                  >
                    <Icon name={s.icon as "Send"} size={14} />
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-orbitron text-white/80 font-semibold text-sm mb-4 uppercase tracking-wider">Платформа</h3>
              <ul className="space-y-2.5">
                {PLATFORM_LINKS.map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-white/40 hover:text-white transition-colors duration-200 text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-orbitron text-white/80 font-semibold text-sm mb-4 uppercase tracking-wider">Компания</h3>
              <ul className="space-y-2.5">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-white/40 hover:text-white transition-colors duration-200 text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-white/[0.06]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-xs">© 2025 ИИ Кира. Все права защищены.</p>
              <div className="flex gap-6">
                <Link to="/privacy" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  Конфиденциальность
                </Link>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  Условия использования
                </button>
                <Link to="/cookie-policy" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  Cookie-политика
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    </>
  )
}
