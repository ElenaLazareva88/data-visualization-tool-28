import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Алексей Морозов",
    role: "Музыкальный продюсер",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "ИИ Кира полностью изменила мой рабочий процесс. Раньше на создание демо уходили дни — теперь генерирую трек за 10 минут и сразу отправляю клиенту.",
  },
  {
    name: "Мария Соколова",
    role: "SMM-специалист, рекламное агентство",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "Создаю видеоконтент для соцсетей прямо в браузере. Вертикальный формат, музыка, текст на фото — всё в одном месте. Экономлю 3–4 часа каждый день.",
  },
  {
    name: "Екатерина Волкова",
    role: "Владелец малого бизнеса",
    avatar: "/professional-woman-scientist.png",
    content:
      "Заказала джингл для своего магазина. Выбрала стиль, настроила голос — и за 5 минут получила готовый рекламный ролик. Раньше это стоило десятки тысяч рублей.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Что говорят пользователи</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Реальные отзывы людей, которые создают контент с ИИ Кира каждый день
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}