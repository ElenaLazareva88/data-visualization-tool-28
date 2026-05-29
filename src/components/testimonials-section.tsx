import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Icon from "@/components/ui/icon"

const testimonials = [
  {
    name: "Алексей Морозов",
    role: "Музыкальный продюсер",
    avatar: "/cybersecurity-expert-man.jpg",
    content: "ИИ Кира полностью изменила мой рабочий процесс. Раньше на создание демо уходили дни — теперь генерирую трек за 10 минут и сразу отправляю клиенту.",
    stars: 5,
  },
  {
    name: "Мария Соколова",
    role: "SMM-специалист, рекламное агентство",
    avatar: "/asian-woman-tech-developer.jpg",
    content: "Создаю видеоконтент для соцсетей прямо в браузере. Вертикальный формат, музыка, текст на фото — всё в одном месте. Экономлю 3–4 часа каждый день.",
    stars: 5,
  },
  {
    name: "Екатерина Волкова",
    role: "Владелец малого бизнеса",
    avatar: "/professional-woman-scientist.png",
    content: "Заказала джингл для своего магазина. Выбрала стиль, настроила голос — и за 5 минут получила готовый рекламный ролик. Раньше это стоило десятки тысяч рублей.",
    stars: 5,
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function TestimonialsSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "hsl(230 15% 5%)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-cyan w-96 h-96 bottom-0 right-0" style={{ opacity: 0.06 }} />
        <div className="orb orb-violet w-80 h-80 top-0 left-0" style={{ opacity: 0.06 }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-4 block">Отзывы</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 font-orbitron">
            Что говорят <span className="gradient-text">пользователи</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Реальные отзывы людей, которые создают контент с ИИ Кира каждый день
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((t, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="glass-card rounded-2xl p-6 h-full border border-white/[0.06] flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Icon key={i} name="Star" size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/70 text-sm leading-relaxed flex-1 mb-6">
                  "{t.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={t.avatar || "/placeholder.svg"} alt={t.name} />
                    <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
