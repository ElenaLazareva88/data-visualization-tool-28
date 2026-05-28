import { useState } from "react"
import Icon from "@/components/ui/icon"
import { Link } from "react-router-dom"
import TermsModal from "@/components/TermsModal"

const SOCIAL_LINKS = [
  { name: "Telegram", href: "https://t.me/aistudio", icon: "Send", label: "Telegram" },
  { name: "VK", href: "https://vk.com/GPTAIStudio", icon: "Users", label: "ВКонтакте" },
  { name: "Max", href: "https://max.ru/aistudio", icon: "MessageCircle", label: "Max" },
]

export function Footer() {
  const [termsOpen, setTermsOpen] = useState(false)

  return (
    <>
      <footer className="bg-black border-t border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/">
                <h2 className="font-orbitron text-2xl font-bold text-white mb-4">
                  AI<span className="text-red-500"> Studio</span>
                </h2>
              </Link>
              <p className="font-space-mono text-gray-300 mb-6 max-w-md">
                Привет-привет! Я Кира. Рада видеть тебя здесь — самое время для крутых идей! ✨
              </p>
              <div className="flex space-x-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-500 transition-all duration-200 rounded-lg px-3 py-2 text-sm"
                    title={s.label}
                  >
                    <Icon name={s.icon as "Send"} size={16} />
                    <span className="font-space-mono text-xs">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-orbitron text-white font-semibold mb-4">Платформа</h3>
              <ul className="space-y-2">
                {[
                  { label: "Создание музыки", path: "/music" },
                  { label: "Создание видео", path: "/video" },
                  { label: "Работа с фото", path: "/photo" },
                  { label: "Написание текстов", path: "/text" },
                  { label: "Джинглы", path: "/jingle" },
                ].map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-orbitron text-white font-semibold mb-4">Компания</h3>
              <ul className="space-y-2">
                {[
                  { label: "Сообщество", path: "/community" },
                  { label: "Коллаборации", path: "/collab" },
                  { label: "Обучение", path: "/learn" },
                  { label: "Чат", path: "/chat" },
                  { label: "Тарифы", path: "/pricing" },
                  { label: "Поддержка", path: "/support" },
                ].map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="font-space-mono text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-red-500/20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="font-space-mono text-gray-400 text-sm">© 2025 AI Studio. Все права защищены.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="font-space-mono text-gray-400 hover:text-red-500 text-sm transition-colors duration-200">
                  Конфиденциальность
                </Link>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="font-space-mono text-gray-400 hover:text-red-500 text-sm transition-colors duration-200"
                >
                  Условия использования
                </button>
                <Link to="/cookie-policy" className="font-space-mono text-gray-400 hover:text-red-500 text-sm transition-colors duration-200">
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