import { useState } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const SLIDE_COUNTS = ["5 слайдов", "10 слайдов", "15 слайдов", "20 слайдов"]

const THEMES = [
  "Минимализм", "Корпоративный", "Тёмный", "Яркий", "Научный",
  "Творческий", "Стартап", "Элегантный", "Технологичный", "Природа",
]

const LANGUAGES = ["Русский", "English", "Español", "Français", "Deutsch", "中文"]

const SLIDE_EXAMPLES = [
  { icon: "Layout", title: "Титульный", desc: "Название и автор" },
  { icon: "Target", title: "Цели", desc: "Ключевые задачи" },
  { icon: "BarChart2", title: "Данные", desc: "Графики и цифры" },
  { icon: "CheckCircle", title: "Итоги", desc: "Выводы и CTA" },
]

export default function PresentationPage() {
  const [text, setText] = useState("")
  const [slideCount, setSlideCount] = useState("10 слайдов")
  const [theme, setTheme] = useState("")
  const [lang, setLang] = useState("Русский")
  const [addSpeakerNotes, setAddSpeakerNotes] = useState(false)
  const [addImages, setAddImages] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    if (!text.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      saveGeneration({
        type: "presentation",
        title: text.slice(0, 80) || "Презентация",
        prompt: text,
      })
    }, 3000)
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="MonitorPlay" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Презентации</h1>
          </div>
          <p className="text-muted-foreground">Вставь текст — Кира оформит красивые слайды автоматически</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-5">

            {/* Text input */}
            <Card className="glow-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="FileText" size={16} className="text-primary" />
                  Твой текст или тема
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Вставь готовый текст, тезисы или просто опиши тему... например: «Стратегия развития компании на 2025 год: новые рынки, автоматизация и рост команды»"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground text-xs">Минимум 50 символов для качественного результата</span>
                  <span className={`text-xs ${text.length > 50 ? "text-green-400" : "text-muted-foreground"}`}>{text.length} симв.</span>
                </div>
              </CardContent>
            </Card>

            {/* Slide count & Language */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-5">
                  <Label className="text-white font-medium mb-3 block flex items-center gap-2">
                    <Icon name="Layers" size={15} className="text-primary" />
                    Количество слайдов
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SLIDE_COUNTS.map((s) => (
                      <Badge
                        key={s}
                        variant={slideCount === s ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          slideCount === s
                            ? "bg-primary text-white border-primary"
                            : "border-border text-muted-foreground hover:border-primary hover:text-white"
                        }`}
                        onClick={() => setSlideCount(s)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-5">
                  <Label className="text-white font-medium mb-3 block flex items-center gap-2">
                    <Icon name="Globe" size={15} className="text-primary" />
                    Язык презентации
                  </Label>
                  <Select value={lang} onValueChange={setLang}>
                    <SelectTrigger className="bg-background border-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Theme */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Palette" size={16} className="text-primary" />
                  Стиль оформления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <Badge
                      key={t}
                      variant={theme === t ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        theme === t
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-white"
                      }`}
                      onClick={() => setTheme(theme === t ? "" : t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="bg-card border-border">
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Image" size={16} className="text-primary" />
                    <Label className="text-white font-medium">Добавить изображения к слайдам</Label>
                  </div>
                  <Switch checked={addImages} onCheckedChange={setAddImages} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="MessageSquare" size={16} className="text-primary" />
                    <Label className="text-white font-medium">Заметки докладчика</Label>
                  </div>
                  <Switch checked={addSpeakerNotes} onCheckedChange={setAddSpeakerNotes} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Actions */}
          <div className="space-y-5">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Sparkles" size={16} className="text-primary" />
                  Результат
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generated ? (
                  <div className="rounded-xl border-2 border-dashed border-border bg-background/50 flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
                    <Icon name="MonitorPlay" size={36} className="text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">Здесь появится превью слайдов после генерации</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/30 p-4 text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-white font-semibold text-sm">{text.slice(0, 40) || "Презентация"}...</p>
                      <p className="text-muted-foreground text-xs mt-1">{slideCount} · {theme || "Авто-стиль"} · {lang}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SLIDE_EXAMPLES.map((s) => (
                        <div key={s.title} className="rounded-lg bg-background border border-border p-3 text-center">
                          <Icon name={s.icon as "Layout"} size={18} className="text-primary mx-auto mb-1" />
                          <p className="text-white text-xs font-medium">{s.title}</p>
                          <p className="text-muted-foreground text-xs">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white gap-2">
                        <Icon name="Download" size={15} />
                        Скачать PPTX
                      </Button>
                      <Button variant="outline" className="w-full border-border text-white hover:border-primary gap-2">
                        <Icon name="FileDown" size={15} />
                        Скачать PDF
                      </Button>
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-white gap-2" onClick={() => { setGenerated(false); setText("") }}>
                        <Icon name="RefreshCw" size={14} />
                        Создать новую
                      </Button>
                    </div>
                  </div>
                )}

                {!generated && (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
                    onClick={handleGenerate}
                    disabled={isGenerating || text.length < 10}
                  >
                    {isGenerating ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        Создаю слайды...
                      </>
                    ) : (
                      <>
                        <Icon name="Wand2" size={16} />
                        Создать презентацию
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Icon name="Lightbulb" size={14} className="text-primary" />
                  Советы от Киры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Чем подробнее текст — тем точнее слайды",
                  "Укажи стиль, если знаешь аудиторию",
                  "Заметки докладчика помогут при выступлении",
                  "PDF удобен для отправки, PPTX — для редактирования",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2 text-muted-foreground text-xs">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
