import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"

export default function PaymentSuccess() {
  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white font-orbitron mb-3">Оплата прошла!</h1>
          <p className="text-muted-foreground text-lg mb-2">Подписка успешно активирована</p>
          <p className="text-muted-foreground text-sm mb-8">Чек отправлен на ваш email. Все инструменты ИИ Кира теперь доступны.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/music">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Icon name="Music" size={16} className="mr-2" />
                Начать создавать
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-border text-white hover:border-primary bg-transparent">
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}