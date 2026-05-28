import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Link } from "react-router-dom"

const features = [
  {
    title: "Создание музыки",
    description: "Генерируй треки по текстовому описанию, добавляй вокал — мужской, женский или дуэт. Поддержка всех музыкальных стилей и озвучка треков с микрофона.",
    icon: "Music",
    badge: "Аудио",
    path: "/music",
  },
  {
    title: "Генерация видео",
    description: "Создавай видео из текста или фото, редактируй загруженные клипы. Вертикальный формат для соцсетей, эффекты и работа с таймингом.",
    icon: "Video",
    badge: "Видео",
    path: "/video",
  },
  {
    title: "Фото и картинки",
    description: "Создавай изображения в 21 стиле — от фотореализма до аниме и киберпанка. Меняй фон, стиль, возраст персонажа, реставрируй фото и генерируй анимации из статичных картинок.",
    icon: "Image",
    badge: "Фото",
    path: "/photo",
  },
  {
    title: "Написание текстов",
    description: "Создавай статьи, сценарии, посты и любые другие тексты по запросу. Редактируй и улучшай собственные тексты с помощью ИИ.",
    icon: "FileText",
    badge: "Текст",
    path: "/text",
  },
  {
    title: "Создание джинглов",
    description: "Музыкальные, вокальные и смешанные джинглы. Звуковые логотипы от 3 секунд до радиороликов. Настройка BPM, жанра, инструментов и голосовых эффектов.",
    icon: "Radio",
    badge: "Джинглы",
    path: "/jingle",
  },
  {
    title: "Все нейросети в одном месте",
    description: "Интеграция со всеми актуальными ИИ-сервисами: текстовыми, аудио, видео и графическими. Регистрация через Google, VK, Яндекс и другие сервисы.",
    icon: "Sparkles",
    badge: "ИИ",
    path: null,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Всё для вашего творчества</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Музыка, видео, фото, тексты и джинглы — создавай контент любого формата с помощью ИИ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const CardWrapper = feature.path
              ? ({ children }: { children: React.ReactNode }) => (
                  <Link to={feature.path!} className="block group">{children}</Link>
                )
              : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

            return (
              <CardWrapper key={index}>
                <Card
                  className={`glow-border transition-all duration-300 slide-up h-full ${feature.path ? "cursor-pointer group-hover:border-primary/80" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon name={feature.icon} size={32} className="text-primary" fallback="Star" />
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    {feature.path && (
                      <p className="text-primary text-sm mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Открыть <Icon name="ArrowRight" size={14} />
                      </p>
                    )}
                  </CardContent>
                </Card>
              </CardWrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}