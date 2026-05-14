import { useState, useRef } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const EFFECTS = ["Плавный переход", "Зум", "Затухание", "Вспышка", "Панорама", "Кинематограф"]

export default function VideoPage() {
  const [description, setDescription] = useState("")
  const [format, setFormat] = useState("vertical")
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [duration, setDuration] = useState([15])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const toggleEffect = (e: string) => {
    setSelectedEffects(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      saveGeneration({
        type: "video",
        title: description ? description.slice(0, 80) : "Видеоролик",
        prompt: description,
        duration: duration[0],
      })
    }, 3000)
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Video" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Создание видео</h1>
          </div>
          <p className="text-muted-foreground">Генерируй видео из текста, фото или редактируй своё</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="w-full bg-card border border-border mb-4">
                <TabsTrigger value="generate" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Wand2" size={14} className="mr-1" />По описанию
                </TabsTrigger>
                <TabsTrigger value="from-photo" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Image" size={14} className="mr-1" />Из фото
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Film" size={14} className="mr-1" />Редактировать
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <Label className="text-muted-foreground text-sm mb-2 block">Описание видео</Label>
                    <Textarea
                      placeholder="Опишите видео... например: «Закат на море, медленная съёмка, тёплые тона, кинематографичный стиль»"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="from-photo">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => photoRef.current?.click()}
                    >
                      {uploadedPhoto ? (
                        <img src={uploadedPhoto} alt="Загружено" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Icon name="ImagePlus" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">Нажмите или перетащите фото</p>
                          <p className="text-muted-foreground text-xs mt-1">JPG, PNG до 20 МБ</p>
                        </>
                      )}
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setUploadedPhoto(URL.createObjectURL(file))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="edit">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5">
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => videoRef.current?.click()}
                    >
                      {uploadedVideo ? (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Icon name="CheckCircle" size={20} className="text-primary" />
                          <span className="text-sm">Видео загружено</span>
                        </div>
                      ) : (
                        <>
                          <Icon name="Film" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">Загрузите видео для редактирования</p>
                          <p className="text-muted-foreground text-xs mt-1">MP4, MOV до 500 МБ</p>
                        </>
                      )}
                      <input
                        ref={videoRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setUploadedVideo("loaded")
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Format */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Monitor" size={16} className="text-primary" />
                  Формат видео
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {[
                    { id: "vertical", label: "Вертикальное", sub: "9:16 • Reels, TikTok", icon: "Smartphone" },
                    { id: "horizontal", label: "Горизонтальное", sub: "16:9 • YouTube", icon: "Monitor" },
                    { id: "square", label: "Квадратное", sub: "1:1 • Instagram", icon: "Square" },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className={`flex-1 rounded-lg border-2 p-3 cursor-pointer transition-colors text-center ${
                        format === f.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setFormat(f.id)}
                    >
                      <Icon name={f.icon as "Smartphone"} size={20} className={`mx-auto mb-1 ${format === f.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className={`text-xs font-medium ${format === f.id ? "text-white" : "text-muted-foreground"}`}>{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.sub}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Effects & Timing */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Sparkles" size={16} className="text-primary" />
                  Эффекты и тайминг
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Длительность: {duration[0]} сек</Label>
                  <Slider value={duration} onValueChange={setDuration} min={5} max={60} step={5} className="w-full" />
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Эффекты переходов</Label>
                  <div className="flex flex-wrap gap-2">
                    {EFFECTS.map((e) => (
                      <Badge
                        key={e}
                        variant={selectedEffects.includes(e) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          selectedEffects.includes(e)
                            ? "bg-primary text-white border-primary"
                            : "border-border text-muted-foreground hover:border-primary hover:text-white"
                        }`}
                        onClick={() => toggleEffect(e)}
                      >
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Play" size={16} className="text-primary" />
                  Предпросмотр
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generated ? (
                  <div
                    className={`rounded-lg bg-background border border-border flex flex-col items-center justify-center text-center p-4 ${format === "vertical" ? "aspect-[9/16]" : format === "square" ? "aspect-square" : "aspect-video"}`}
                  >
                    <Icon name="Video" size={36} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Предпросмотр появится здесь</p>
                  </div>
                ) : (
                  <div className={`rounded-lg bg-gradient-to-br from-primary/20 to-background border border-primary/30 flex items-center justify-center ${format === "vertical" ? "aspect-[9/16]" : format === "square" ? "aspect-square" : "aspect-video"}`}>
                    <div className="text-center">
                      <Icon name="Play" size={40} className="text-primary mx-auto mb-2" />
                      <p className="text-white text-sm">Видео готово</p>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Генерация...
                    </>
                  ) : (
                    <>
                      <Icon name="Wand2" size={16} className="mr-2" />
                      Сгенерировать
                    </>
                  )}
                </Button>

                {generated && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Скачать</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-border text-white hover:border-primary text-xs">
                        <Icon name="Download" size={12} className="mr-1" />MP4
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-border text-white hover:border-primary text-xs">
                        <Icon name="Download" size={12} className="mr-1" />MOV
                      </Button>
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