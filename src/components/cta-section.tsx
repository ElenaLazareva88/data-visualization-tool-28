import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"

export function CTASection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "hsl(230 15% 5%)" }}>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-violet w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.1 }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-medium text-violet-300 border border-violet-500/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Начни прямо сейчас — это бесплатно
          </span>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-orbitron leading-tight">
            Готов раскрыть свой{" "}
            <span className="gradient-text">творческий потенциал?</span>
          </h2>

          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Присоединяйся к тысячам авторов, музыкантов и предпринимателей, которые уже создают контент с помощью ИИ Кира.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/music"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                boxShadow: "0 0 40px rgba(139, 92, 246, 0.35)",
              }}
            >
              Начать бесплатно
              <Icon name="ArrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white/70 hover:text-white transition-all duration-300 glass border border-white/10 hover:border-violet-500/40"
            >
              Посмотреть тарифы
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
