import { useState, useRef } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const FONTS = ["Arial", "Roboto", "Playfair Display", "Montserrat", "Oswald", "Pacifico", "Comic Sans"]

const AI_MODELS = [
  { id: "flux", label: "FLUX 1.1 Pro", desc: "Лучшее качество", badge: "Топ" },
  { id: "sdxl", label: "Stable Diffusion XL", desc: "Быстро и детально", badge: "" },
  { id: "dalle3", label: "DALL·E 3", desc: "Точное следование тексту", badge: "" },
  { id: "midjourney", label: "Midjourney Style", desc: "Художественный стиль", badge: "Новый" },
]



export default function PhotoPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [generateDesc, setGenerateDesc] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [overlayText, setOverlayText] = useState("")
  const [selectedFont, setSelectedFont] = useState("")
  const [slideshowTiming, setSlideshowTiming] = useState([3])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Реалистичные картинки
  const [realisticDesc, setRealisticDesc] = useState("")
  const [selectedModel, setSelectedModel] = useState("flux")



  const toggleTool = (t: string) => {
    setActiveTools(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      const prompt =
        activeTab === "realistic" ? realisticDesc :
        activeTab === "invite" ? `Приглашение: ${inviteEvent}, от ${inviteFrom}, для ${inviteTo}` :
        generateDesc
      const title =
        activeTab === "realistic" ? (realisticDesc.slice(0, 80) || "Реалистичная картинка") :
        activeTab === "invite" ? `Приглашение на ${INVITE_EVENTS.find(e => e.id === inviteEvent)?.label}` :
        (generateDesc.slice(0, 80) || "Изображение")
      saveGeneration({ type: "photo", title, prompt })
    }, 2000)
  }

  const tools = [
    { id: "animate", icon: "Zap", label: "Оживить" },
    { id: "colorize", icon: "Palette", label: "Колоризация" },
    { id: "decolorize", icon: "Contrast", label: "Ч/Б" },
    { id: "slideshow", icon: "Images", label: "Слайд-шоу" },
  ]

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Image" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Работа с фото</h1>
          </div>
          <p className="text-muted-foreground">Оживляй, раскрашивай, создавай слайд-шоу и генерируй изображения</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-card border border-border mb-4 flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="upload" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Upload" size={14} className="mr-1" />Загрузить
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Sparkles" size={14} className="mr-1" />Сгенерировать
                </TabsTrigger>
                <TabsTrigger value="realistic" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Camera" size={14} className="mr-1" />Картинка
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImages.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {uploadedImages.slice(0, 4).map((src, i) => (
                            <img key={i} src={src} alt="" className="h-20 w-20 object-cover rounded-lg" />
                          ))}
                          {uploadedImages.length > 4 && (
                            <div className="h-20 w-20 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground text-sm">
                              +{uploadedImages.length - 4}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <Icon name="ImagePlus" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">Нажмите или перетащите изображения</p>
                          <p className="text-muted-foreground text-xs mt-1">JPG, PNG, WEBP — можно несколько</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          setUploadedImages(files.map(f => URL.createObjectURL(f)))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="generate">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <Label className="text-muted-foreground text-sm mb-2 block">Описание изображения</Label>
                    <Textarea
                      placeholder="Опишите, что хотите получить... например: «Портрет девушки в стиле аниме, закат, розовые тона»"
                      value={generateDesc}
                      onChange={(e) => setGenerateDesc(e.target.value)}
                      rows={4}
                      className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ===== РЕАЛИСТИЧНЫЕ КАРТИНКИ ===== */}
              <TabsContent value="realistic">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block">Описание картинки</Label>
                      <Textarea
                        placeholder="Опишите что хотите... например: «Реалистичный портрет женщины 30 лет, студийное освещение, нейтральный фон»"
                        value={realisticDesc}
                        onChange={(e) => setRealisticDesc(e.target.value)}
                        rows={3}
                        className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-3 block">ИИ-модель</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {AI_MODELS.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedModel(m.id)}
                            className={`rounded-lg border-2 p-3 cursor-pointer transition-colors flex items-center justify-between ${
                              selectedModel === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${selectedModel === m.id ? "text-primary" : "text-white"}`}>{m.label}</span>
                                {m.badge && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{m.badge}</span>}
                              </div>
                              <p className="text-muted-foreground text-xs mt-0.5">{m.desc}</p>
                            </div>
                            {selectedModel === m.id && <Icon name="CheckCircle" size={16} className="text-primary flex-shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>

            {/* Tools */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Wand2" size={16} className="text-primary" />
                  Инструменты
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tools.map((t) => (
                    <div
                      key={t.id}
                      className={`rounded-lg border-2 p-3 cursor-pointer transition-colors text-center ${
                        activeTools.includes(t.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleTool(t.id)}
                    >
                      <Icon name={t.icon as "Zap"} size={20} className={`mx-auto mb-1 ${activeTools.includes(t.id) ? "text-primary" : "text-muted-foreground"}`} />
                      <p className={`text-xs ${activeTools.includes(t.id) ? "text-white" : "text-muted-foreground"}`}>{t.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Text overlay */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Type" size={16} className="text-primary" />
                  Текст на фото
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Введите текст для наложения..."
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="bg-background border-border text-white placeholder:text-muted-foreground"
                />
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger className="bg-background border-border text-white">
                    <SelectValue placeholder="Выберите шрифт" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Slideshow timing */}
            {activeTools.includes("slideshow") && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Icon name="Timer" size={16} className="text-primary" />
                    Тайминг слайд-шоу
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label className="text-muted-foreground text-sm mb-3 block">
                    Время каждого слайда: {slideshowTiming[0]} сек
                  </Label>
                  <Slider value={slideshowTiming} onValueChange={setSlideshowTiming} min={1} max={10} step={0.5} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right */}
          <div className="space-y-5">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Eye" size={16} className="text-primary" />
                  Предпросмотр
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generated ? (
                  <div className="aspect-square rounded-lg bg-background border border-border flex flex-col items-center justify-center text-center p-4">
                    <Icon name="Image" size={36} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Результат появится здесь</p>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/30 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="CheckCircle" size={36} className="text-primary mx-auto mb-2" />
                      <p className="text-white text-sm">Готово!</p>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Обработка...</>
                  ) : (
                    <><Icon name="Wand2" size={16} className="mr-2" />Применить</>
                  )}
                </Button>

                {generated && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Скачать</Label>
                    <div className="flex gap-2 flex-wrap">
                      {["JPG", "PNG", "GIF"].map((fmt) => (
                        <Button key={fmt} variant="outline" size="sm" className="flex-1 border-border text-white hover:border-primary text-xs">
                          <Icon name="Download" size={12} className="mr-1" />{fmt}
                        </Button>
                      ))}
                    </div>
                  </div>
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