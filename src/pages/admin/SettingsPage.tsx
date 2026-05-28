import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("ИИ Кира")
  const [siteEmail, setSiteEmail] = useState("support@iikira.ru")
  const [twofa, setTwofa] = useState(false)
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white font-orbitron mb-1">Системные настройки</h2>
        <p className="text-muted-foreground text-sm">Управление конфигурацией платформы</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-background border border-border mb-5">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
            <Icon name="Settings" size={14} className="mr-2" />Общие
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
            <Icon name="Shield" size={14} className="mr-2" />Безопасность
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
            <Icon name="Puzzle" size={14} className="mr-2" />Интеграции
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
            <Icon name="HardDrive" size={14} className="mr-2" />Бэкапы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card border-border max-w-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Общие настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Название сайта</Label>
                <Input value={siteName} onChange={e => setSiteName(e.target.value)} className="bg-background border-border text-white" />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Email поддержки</Label>
                <Input value={siteEmail} onChange={e => setSiteEmail(e.target.value)} className="bg-background border-border text-white" />
              </div>
              <Button
                className={`${saved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"} text-white`}
                onClick={handleSave}
              >
                {saved ? <><Icon name="Check" size={14} className="mr-2" />Сохранено</> : "Сохранить изменения"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card border-border max-w-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Безопасность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-sm">Двухфакторная аутентификация</Label>
                  <p className="text-muted-foreground text-xs mt-0.5">Обязательна для администраторов</p>
                </div>
                <Switch checked={twofa} onCheckedChange={setTwofa} />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1.5 block">Максимум попыток входа</Label>
                <Input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={e => setMaxLoginAttempts(e.target.value)}
                  className="bg-background border-border text-white w-32"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleSave}>
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="bg-card border-border max-w-xl">
            <CardContent className="pt-6 space-y-4">
              {[
                { name: "Robokassa", desc: "Платёжная система", icon: "CreditCard", connected: true },
                { name: "Telegram Bot", desc: "Уведомления в Telegram", icon: "Send", connected: false },
                { name: "Email SMTP", desc: "Отправка писем", icon: "Mail", connected: false },
              ].map(int => (
                <div key={int.name} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={int.icon as "CreditCard"} size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{int.name}</p>
                      <p className="text-muted-foreground text-xs">{int.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={`border-border text-xs ${int.connected ? "text-green-400 border-green-500/30" : "text-white hover:border-primary"}`}>
                    {int.connected ? "Подключено" : "Подключить"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card className="bg-card border-border max-w-xl">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                <div>
                  <p className="text-white text-sm font-medium">Последний бэкап</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Сегодня, 03:00 · 142 МБ</p>
                </div>
                <Button variant="outline" size="sm" className="border-border text-white hover:border-primary">
                  <Icon name="Download" size={13} className="mr-1.5" />Скачать
                </Button>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                <Icon name="Database" size={14} className="mr-2" />Создать бэкап сейчас
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}