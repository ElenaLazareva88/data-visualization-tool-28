import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Нужны ли специальные навыки для работы с ИИ Кира?",
    answer: "Нет. ИИ Кира создана для обычных пользователей без технических знаний. Просто опишите то, что хотите создать — ИИ сделает всё остальное.",
  },
  {
    question: "Можно ли скачать созданный контент?",
    answer: "Да, все созданные файлы — музыка, видео, фото, тексты и джинглы — доступны для скачивания в популярных форматах прямо из личного кабинета.",
  },
  {
    question: "Какие нейросети используются в платформе?",
    answer: "ИИ Кира интегрирована со всеми актуальными ИИ-сервисами для работы с аудио, видео, изображениями и текстом. Мы регулярно добавляем новые модели по мере их появления.",
  },
  {
    question: "Как зарегистрироваться?",
    answer: "Регистрация доступна по email или номеру телефона. Также можно войти через Google, ВКонтакте, Mail.ru или Яндекс — в один клик.",
  },
  {
    question: "Можно ли общаться с другими пользователями платформы?",
    answer: "Да, ИИ Кира включает сообщество пользователей для общения, обмена проектами и вдохновения. Делитесь своими работами и находите единомышленников.",
  },
  {
    question: "Сохраняется ли история моих генераций?",
    answer: "Да, все ваши проекты автоматически сохраняются в личном кабинете. Вы можете вернуться к любому проекту, отредактировать или пересоздать его в любое время.",
  },
]

export function FAQSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "hsl(230 15% 7%)" }}>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-4 block">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 font-orbitron">
            Частые <span className="gradient-text">вопросы</span>
          </h2>
          <p className="text-white/50 text-lg">
            Ответы на популярные вопросы об ИИ Кира
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl border border-white/[0.06] px-2 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-base font-medium text-white hover:text-violet-300 transition-colors font-orbitron px-4 py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/55 leading-relaxed px-4 pb-4 text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
