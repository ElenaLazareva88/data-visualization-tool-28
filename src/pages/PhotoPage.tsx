import { useState, useRef } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const STYLES = [
  { id: "photorealistic", label: "Фотореализм", emoji: "📷" },
  { id: "portrait", label: "Портрет", emoji: "🧑‍🎨" },
  { id: "anime", label: "Аниме", emoji: "⛩️" },
  { id: "3d", label: "3D-рендер", emoji: "🎲" },
  { id: "oil", label: "Масло", emoji: "🖼️" },
  { id: "watercolor", label: "Акварель", emoji: "🎨" },
  { id: "sketch", label: "Эскиз", emoji: "✏️" },
  { id: "pixel", label: "Пиксель-арт", emoji: "👾" },
  { id: "comic", label: "Комикс", emoji: "💥" },
  { id: "cinematic", label: "Кино", emoji: "🎬" },
  { id: "fantasy", label: "Фэнтези", emoji: "🐉" },
  { id: "cyberpunk", label: "Киберпанк", emoji: "🤖" },
  { id: "vintage", label: "Винтаж", emoji: "📻" },
  { id: "minimalist", label: "Минимализм", emoji: "⬜" },
  { id: "surreal", label: "Сюрреализм", emoji: "🌀" },
  { id: "impressionism", label: "Импрессионизм", emoji: "🌸" },
  { id: "lowpoly", label: "Low Poly", emoji: "🔷" },
  { id: "neon", label: "Неон", emoji: "💜" },
  { id: "noir", label: "Нуар", emoji: "🕵️" },
  { id: "popart", label: "Поп-арт", emoji: "🟡" },
  { id: "ghibli", label: "Гибли", emoji: "🌿" },
]

const EDIT_TOOLS = [
  { id: "bg", icon: "Layers", label: "Сменить фон", desc: "Убрать или заменить фон на любой" },
  { id: "age", icon: "UserCog", label: "Изменить возраст", desc: "Состарить или омолодить персонажа" },
  { id: "style", icon: "Palette", label: "Сменить стиль", desc: "Перерисовать в другом художественном стиле" },
  { id: "animate", icon: "Zap", label: "Оживить фото", desc: "Создать анимацию из статичного изображения" },
  { id: "colorize", icon: "Droplets", label: "Колоризация", desc: "Раскрасить чёрно-белое фото" },
  { id: "upscale", icon: "Maximize2", label: "Улучшить качество", desc: "Увеличить разрешение и чёткость" },
  { id: "restore", label: "Реставрация", icon: "Sparkles", desc: "Восстановить старое или повреждённое фото" },
  { id: "face", icon: "Smile", label: "Редактировать лицо", desc: "Изменить выражение, причёску, черты лица" },
]

const AI_MODELS = [
  { id: "flux", label: "FLUX 1.1 Pro", desc: "Лучшее качество", badge: "Топ" },
  { id: "sdxl", label: "Stable Diffusion XL", desc: "Быстро и детально", badge: "" },
  { id: "dalle3", label: "DALL·E 3", desc: "Точное следование тексту", badge: "" },
  { id: "midjourney", label: "Midjourney Style", desc: "Художественный стиль", badge: "Новый" },
]

export default function PhotoPage() {
  const [activeTab, setActiveTab] = useState("generate")
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [selectedModel, setSelectedModel] = useState("flux")
  const [selectedTool, setSelectedTool] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [addAnimation, setAddAnimation] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = () => {
    if (activeTab === "generate" && !prompt.trim()) return
    if (activeTab === "edit" && !uploadedImage) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      saveGeneration({
        type: "photo",
        title: prompt.slice(0, 80) || (selectedTool ? `Редактирование: ${selectedTool}` : "Изображение"),
        prompt,
      })
    }, 2500)
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Image" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Фото и картинки</h1>
          </div>
          <p className="text-muted-foreground">
            Создавай изображения в 21 стиле, дорабатывай фото, меняй фон, стиль, возраст — и генерируй анимации
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setGenerated(false) }}>
              <TabsList className="w-full bg-card border border-border mb-4 p-1">
                <TabsTrigger value="generate" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Sparkles" size={13} className="mr-1.5" />Генерация
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Wand2" size={13} className="mr-1.5" />Доработка фото
                </TabsTrigger>
                <TabsTrigger value="animate" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Zap" size={13} className="mr-1.5" />Анимация
                </TabsTrigger>
              </TabsList>

              {/* === ГЕНЕРАЦИЯ === */}
              <TabsContent value="generate" className="space-y-5">
                <Card className="glow-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="MessageSquare" size={16} className="text-primary" />
                      Описание изображения
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Опишите, что хотите получить... например: «Фотореалистичный портрет девушки 25 лет, студийный свет, нейтральный фон»"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                    />
                  </CardContent>
                </Card>

                {/* 21 стиль */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Palette" size={16} className="text-primary" />
                      Стиль
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs ml-1">21 стиль</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStyle(selectedStyle === s.id ? "" : s.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                            selectedStyle === s.id
                              ? "bg-primary border-primary text-white"
                              : "bg-background border-border text-muted-foreground hover:border-primary hover:text-white"
                          }`}
                        >
                          <span>{s.emoji}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ИИ-модель */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Cpu" size={16} className="text-primary" />
                      ИИ-модель
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {AI_MODELS.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedModel === m.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-medium">{m.label}</span>
                            {m.badge && (
                              <Badge className="text-xs bg-primary/20 text-primary border-primary/30">{m.badge}</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">{m.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Zap" size={16} className="text-primary" />
                      <Label className="text-white font-medium">Создать анимацию из изображения</Label>
                    </div>
                    <Switch checked={addAnimation} onCheckedChange={setAddAnimation} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* === ДОРАБОТКА ФОТО === */}
              <TabsContent value="edit" className="space-y-5">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="" className="max-h-48 mx-auto rounded-lg object-contain" />
                      ) : (
                        <>
                          <Icon name="ImagePlus" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">Загрузи фото для обработки</p>
                          <p className="text-muted-foreground text-xs mt-1">JPG, PNG, WEBP</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setUploadedImage(URL.createObjectURL(f))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Wand2" size={16} className="text-primary" />
                      Что сделать с фото?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {EDIT_TOOLS.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTool(selectedTool === t.id ? "" : t.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedTool === t.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon name={t.icon as "Layers"} size={15} className="text-primary" />
                            <span className="text-white text-sm font-medium">{t.label}</span>
                          </div>
                          <p className="text-muted-foreground text-xs">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* === АНИМАЦИЯ === */}
              <TabsContent value="animate" className="space-y-5">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="" className="max-h-48 mx-auto rounded-lg object-contain" />
                      ) : (
                        <>
                          <Icon name="Film" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">Загрузи изображение для анимации</p>
                          <p className="text-muted-foreground text-xs mt-1">JPG, PNG, WEBP</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setUploadedImage(URL.createObjectURL(f))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="MessageSquare" size={16} className="text-primary" />
                      Описание движения (опционально)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Например: «плавное покачивание головой», «мигающие глаза», «волосы развеваются на ветру»"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={3}
                      className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                    />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Лицо", icon: "Smile", desc: "Мимика и эмоции" },
                    { label: "Тело", icon: "User", desc: "Жесты и движения" },
                    { label: "Фон", icon: "Wind", desc: "Ветер, вода, огонь" },
                  ].map((a) => (
                    <Card key={a.label} className="bg-card border-border cursor-pointer hover:border-primary transition-colors text-center p-4">
                      <Icon name={a.icon as "Smile"} size={22} className="text-primary mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">{a.label}</p>
                      <p className="text-muted-foreground text-xs">{a.desc}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Result */}
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
                    <Icon name="Image" size={36} className="text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">Здесь появится результат</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-900/20 border border-pink-500/30 aspect-square flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-3">
                          {STYLES.find(s => s.id === selectedStyle)?.emoji || "🖼️"}
                        </div>
                        <p className="text-white text-sm font-medium px-4">
                          {STYLES.find(s => s.id === selectedStyle)?.label || "Авто-стиль"}
                        </p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {AI_MODELS.find(m => m.id === selectedModel)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white gap-2">
                        <Icon name="Download" size={15} />
                        Скачать PNG
                      </Button>
                      <Button variant="outline" className="w-full border-border text-white hover:border-primary gap-2">
                        <Icon name="Share2" size={15} />
                        Поделиться
                      </Button>
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-white gap-2" onClick={() => { setGenerated(false); setPrompt("") }}>
                        <Icon name="RefreshCw" size={14} />
                        Создать ещё
                      </Button>
                    </div>
                  </div>
                )}

                {!generated && (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
                    onClick={handleGenerate}
                    disabled={isGenerating || (activeTab === "generate" && prompt.length < 5) || (activeTab === "edit" && !uploadedImage) || (activeTab === "animate" && !uploadedImage)}
                  >
                    {isGenerating ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        {activeTab === "animate" ? "Анимирую..." : "Генерирую..."}
                      </>
                    ) : (
                      <>
                        <Icon name="Wand2" size={16} />
                        {activeTab === "generate" ? "Создать изображение" : activeTab === "edit" ? "Обработать фото" : "Создать анимацию"}
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
                  "Добавь детали: освещение, угол, настроение",
                  "«Фотореализм» + FLUX — лучший дуэт",
                  "Для портретов укажи возраст и эмоцию",
                  "Анимации лучше работают с чётким лицом на фото",
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
