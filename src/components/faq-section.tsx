import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Нужны ли специальные навыки для работы с ИИ Кира?",
      answer:
        "Нет. ИИ Кира создана для обычных пользователей без технических знаний. Просто опишите то, что хотите создать — ИИ сделает всё остальное.",
    },
    {
      question: "Можно ли скачать созданный контент?",
      answer:
        "Да, все созданные файлы — музыка, видео, фото, тексты и джинглы — доступны для скачивания в популярных форматах прямо из личного кабинета.",
    },
    {
      question: "Какие нейросети используются в платформе?",
      answer:
        "ИИ Кира интегрирована со всеми актуальными ИИ-сервисами для работы с аудио, видео, изображениями и текстом. Мы регулярно добавляем новые модели по мере их появления.",
    },
    {
      question: "Как зарегистрироваться?",
      answer:
        "Регистрация доступна по email или номеру телефона. Также можно войти через Google, ВКонтакте, Mail.ru или Яндекс — в один клик.",
    },
    {
      question: "Можно ли общаться с другими пользователями платформы?",
      answer:
        "Да, ИИ Кира включает сообщество пользователей для общения, обмена проектами и вдохновения. Делитесь своими работами и находите единомышленников.",
    },
    {
      question: "Сохраняется ли история моих генераций?",
      answer:
        "Да, все ваши проекты автоматически сохраняются в личном кабинете. Вы можете вернуться к любому проекту, отредактировать или пересоздать его в любое время.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Ответы на популярные вопросы об ИИ Кира
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}