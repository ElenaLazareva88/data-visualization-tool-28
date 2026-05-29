import { Timeline } from "@/components/ui/timeline"

export function ApplicationsTimeline() {
  const dotColor = "bg-violet-500"
  const textColor = "text-violet-300"

  const makeItems = (items: string[]) => (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`flex items-center gap-3 ${textColor} text-sm`}>
          <div className={`w-1.5 h-1.5 ${dotColor} rounded-full flex-shrink-0`} />
          {item}
        </div>
      ))}
    </div>
  )

  const data = [
    {
      title: "Музыка и джинглы",
      content: (
        <div>
          <p className="text-white/60 text-sm md:text-base font-normal mb-5 leading-relaxed">
            Создавай профессиональные треки и джинглы за минуты. Выбери стиль, настрой BPM и голосовые параметры — ИИ сгенерирует готовый аудиопродукт.
          </p>
          {makeItems([
            "Генерация трека по текстовому описанию",
            "Вокал: мужской, женский, дуэт — на выбор",
            "Джинглы от 3 секунд до полноценного радиоролика",
          ])}
        </div>
      ),
    },
    {
      title: "Видео и клипы",
      content: (
        <div>
          <p className="text-white/60 text-sm md:text-base font-normal mb-5 leading-relaxed">
            Генерируй видео из текста или фотографий, создавай клипы на музыку, редактируй готовые материалы. Вертикальный формат для соцсетей в один клик.
          </p>
          {makeItems([
            "Видеоклипы из фото и текстовых описаний",
            "Вертикальный формат для Instagram, TikTok, Reels",
            "Эффекты, тайминг и редактирование загруженных видео",
          ])}
        </div>
      ),
    },
    {
      title: "Фото и изображения",
      content: (
        <div>
          <p className="text-white/60 text-sm md:text-base font-normal mb-5 leading-relaxed">
            Оживляй фото, раскрашивай чёрно-белые снимки, создавай слайд-шоу с музыкой. Генерация изображений по описанию — просто напиши, что хочешь увидеть.
          </p>
          {makeItems([
            "Анимация и «оживление» статичных снимков",
            "Колоризация ч/б фото и конвертация обратно",
            "Слайд-шоу с музыкой и ручным таймингом",
          ])}
        </div>
      ),
    },
  ]

  return (
    <section id="applications" className="py-20 relative overflow-hidden" style={{ background: "hsl(230 15% 5%)" }}>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10 relative z-10">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-4 block">Платформа</span>
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-6">
            Возможности <span className="gradient-text">платформы</span>
          </h2>
          <p className="text-white/50 text-lg max-w-3xl mx-auto leading-relaxed">
            ИИ Кира объединяет все инструменты для создания контента — от музыки и видео до текстов и брендинговых джинглов — в одной платформе.
          </p>
        </div>
        <Timeline data={data} />
      </div>
    </section>
  )
}
