import { useState } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const TEXT_TYPES = ["Статья", "Сценарий", "Пост для соцсетей", "Рекламный текст", "Email-рассылка", "Описание товара", "Пресс-релиз", "Биография", "Сказка", "SEO-текст"]
const TONES = ["Профессиональный", "Дружелюбный", "Юмористический", "Вдохновляющий", "Нейтральный", "Продающий"]

export default function TextPage() {
  const [prompt, setPrompt] = useState("")
  const [textType, setTextType] = useState("")
  const [tone, setTone] = useState("")
  const [length, setLength] = useState([500])
  const [generatedText, setGeneratedText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedText(`Здесь появится ваш сгенерированный текст на тему "${prompt}". Тип: ${textType || "не выбран"}, Тон: ${tone || "нейтральный"}, Длина: ~${length[0]} слов.\n\nИИ создаст уникальный, качественный текст точно по вашему запросу. Вы сможете редактировать его прямо здесь — изменять, дополнять, улучшать.`)
      saveGeneration({
        type: "text",
        title: prompt ? prompt.slice(0, 80) : textType || "Текст",
        prompt: [prompt, textType, tone].filter(Boolean).join(" · "),
      })
    }, 2000)
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="FileText" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Написание текстов</h1>
          </div>
          <p className="text-muted-foreground">Создавай статьи, сценарии, посты и любые тексты с помощью ИИ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-5">

            <Card className="glow-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Search" size={16} className="text-primary" />
                  Запрос
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Тема, ключевые слова, идея... например: «Статья о пользе утренних пробежек для офисных сотрудников, 3 главных аргумента»"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="LayoutList" size={16} className="text-primary" />
                  Тип текста
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TEXT_TYPES.map((t) => (
                    <Badge
                      key={t}
                      variant={textType === t ? "default" : "outline"}
                      className={`cursor-pointer transition-colors text-xs ${
                        textType === t
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-white"
                      }`}
                      onClick={() => setTextType(textType === t ? "" : t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Sliders" size={16} className="text-primary" />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Тон</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-background border-border text-white">
                      <SelectValue placeholder="Выберите тон" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">
                    Длина: ~{length[0]} слов
                  </Label>
                  <Slider value={length} onValueChange={setLength} min={100} max={3000} step={100} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Короткий</span>
                    <span>Длинный</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white pulse-button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? (
                <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Генерация...</>
              ) : (
                <><Icon name="Wand2" size={16} className="mr-2" />Сгенерировать</>
              )}
            </Button>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Icon name="Edit3" size={16} className="text-primary" />
                    Редактор текста
                  </CardTitle>
                  {generatedText && (
                    <div className="flex gap-2">
                      {["TXT", "DOCX", "PDF"].map((fmt) => (
                        <Button key={fmt} variant="outline" size="sm" className="border-border text-white hover:border-primary text-xs">
                          <Icon name="Download" size={12} className="mr-1" />{fmt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!generatedText ? (
                  <div className="min-h-[400px] rounded-lg bg-background border border-border flex flex-col items-center justify-center text-center p-8">
                    <Icon name="FileText" size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Заполните запрос слева и нажмите «Сгенерировать»</p>
                    <p className="text-muted-foreground text-sm mt-2">Текст появится здесь и будет доступен для редактирования</p>
                  </div>
                ) : (
                  <Textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    className="min-h-[500px] bg-background border-border text-white resize-none leading-relaxed"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}