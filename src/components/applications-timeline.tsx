import { Timeline } from "@/components/ui/timeline"

export function ApplicationsTimeline() {
  const data = [
    {
      title: "Музыка и джинглы",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Создавай профессиональные треки и джинглы за минуты. Выбери стиль, настрой BPM и голосовые параметры — ИИ сгенерирует готовый аудиопродукт.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Генерация трека по текстовому описанию
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Вокал: мужской, женский, дуэт — на выбор
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Джинглы от 3 секунд до полноценного радиоролика
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Видео и клипы",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Генерируй видео из текста или фотографий, создавай клипы на музыку, редактируй готовые материалы. Вертикальный формат для соцсетей в один клик.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Видеоклипы из фото и текстовых описаний
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Вертикальный формат для Instagram, TikTok, Reels
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Эффекты, тайминг и редактирование загруженных видео
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Фото и изображения",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Оживляй фото, раскрашивай чёрно-белые снимки, создавай слайд-шоу с музыкой. Генерация изображений по описанию — просто напиши, что хочешь увидеть.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Анимация и «оживление» статичных снимков
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Колоризация ч/б фото и конвертация обратно
            </div>
            <div className="flex items-center gap-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Слайд-шоу с музыкой и ручным таймингом
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="applications" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Возможности платформы</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            ИИ Кира объединяет все инструменты для создания контента — от музыки и видео до текстов и брендинговых джинглов — в одной платформе.
          </p>
        </div>

        <div className="relative">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  )
}