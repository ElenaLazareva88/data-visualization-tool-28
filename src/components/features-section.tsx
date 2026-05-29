import React from "react"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const features = [
  {
    title: "Создание музыки",
    description: "Генерируй треки по текстовому описанию, добавляй вокал — мужской, женский или дуэт. Поддержка всех музыкальных стилей.",
    icon: "Music",
    badge: "Аудио",
    path: "/music",
    color: "from-violet-500/20 to-purple-600/10",
    iconColor: "text-violet-400",
    borderColor: "hover:border-violet-500/40",
  },
  {
    title: "Генерация видео",
    description: "Создавай видео из текста или фото, озвучивай с AI-аватарами. Мультфильмы, клипы и вертикальный формат для соцсетей.",
    icon: "Video",
    badge: "Видео",
    path: "/video",
    color: "from-cyan-500/20 to-blue-600/10",
    iconColor: "text-cyan-400",
    borderColor: "hover:border-cyan-500/40",
  },
  {
    title: "Фото и картинки",
    description: "Создавай изображения в 21 стиле — от фотореализма до аниме и киберпанка. Реставрация, смена стиля и анимации.",
    icon: "Image",
    badge: "Фото",
    path: "/photo",
    color: "from-pink-500/20 to-rose-600/10",
    iconColor: "text-pink-400",
    borderColor: "hover:border-pink-500/40",
  },
  {
    title: "Написание текстов",
    description: "Создавай статьи, сценарии, посты и любые другие тексты по запросу. Редактируй с помощью ИИ.",
    icon: "FileText",
    badge: "Текст",
    path: "/text",
    color: "from-emerald-500/20 to-teal-600/10",
    iconColor: "text-emerald-400",
    borderColor: "hover:border-emerald-500/40",
  },
  {
    title: "Создание джинглов",
    description: "Музыкальные, вокальные и смешанные джинглы. Звуковые логотипы от 3 секунд до радиороликов.",
    icon: "Radio",
    badge: "Джинглы",
    path: "/jingle",
    color: "from-orange-500/20 to-amber-600/10",
    iconColor: "text-orange-400",
    borderColor: "hover:border-orange-500/40",
  },
  {
    title: "Все нейросети в одном",
    description: "Интеграция со всеми актуальными ИИ-сервисами: текстовыми, аудио, видео и графическими.",
    icon: "Sparkles",
    badge: "ИИ",
    path: null,
    color: "from-indigo-500/20 to-violet-600/10",
    iconColor: "text-indigo-400",
    borderColor: "hover:border-indigo-500/40",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function FeaturesSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "hsl(230 15% 7%)" }}>
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-violet w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.05 }} />
      </div>
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-4 block">Возможности</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 font-orbitron">
            Всё для вашего <span className="gradient-text">творчества</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Музыка, видео, фото, тексты и джинглы — создавай контент любого формата с помощью ИИ
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const CardWrapper = feature.path
              ? ({ children }: { children: React.ReactNode }) => (
                  <Link to={feature.path!} className="block group">{children}</Link>
                )
              : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

            return (
              <motion.div key={index} variants={itemVariants}>
                <CardWrapper>
                  <div className={`glass-card rounded-2xl p-6 h-full ${feature.borderColor} border border-white/[0.06] relative overflow-hidden`}>
                    {/* Gradient bg */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center border border-white/10`}>
                          <Icon name={feature.icon as "Music"} size={22} className={feature.iconColor} fallback="Star" />
                        </div>
                        <Badge className="bg-white/5 text-white/60 border border-white/10 text-xs">
                          {feature.badge}
                        </Badge>
                      </div>

                      <h3 className="text-white font-semibold text-lg mb-2 font-orbitron">{feature.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>

                      {feature.path && (
                        <div className={`flex items-center gap-1.5 mt-4 text-xs font-medium ${feature.iconColor} opacity-0 group-hover:opacity-100 transition-all duration-200`}>
                          Перейти <Icon name="ArrowRight" size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
