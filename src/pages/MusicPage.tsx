import { useState, useRef } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const MUSIC_STYLES = [
  "Поп", "Рок", "Джаз", "Классика", "Электронная", "Хип-хоп", "R&B", "Кантри",
  "Фолк", "Метал", "Регги", "Блюз", "Инди", "Лаунж", "Оркестровая",
]

export default function MusicPage() {
  const [description, setDescription] = useState("")
  const [ownLyrics, setOwnLyrics] = useState("")
  const [useOwnLyrics, setUseOwnLyrics] = useState(false)
  const [style, setStyle] = useState("")
  const [voiceType, setVoiceType] = useState("")
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      saveGeneration({
        type: "music",
        title: description ? description.slice(0, 80) : "Музыкальный трек",
        prompt: description,
      })
    }, 2500)
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Music" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Создание музыки</h1>
          </div>
          <p className="text-muted-foreground">Генерируй треки по описанию, добавляй текст и вокал</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <Card className="glow-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Wand2" size={16} className="text-primary" />
                  Описание трека
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Опишите трек, который хотите создать... например: «Энергичная поп-музыка с яркими синтами для рекламного ролика»"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                />
              </CardContent>
            </Card>

            {/* Own lyrics toggle */}
            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Mic2" size={16} className="text-primary" />
                    <Label className="text-white font-medium">Использовать собственный текст</Label>
                  </div>
                  <Switch checked={useOwnLyrics} onCheckedChange={setUseOwnLyrics} />
                </div>
                {useOwnLyrics && (
                  <Textarea
                    placeholder="Вставьте текст песни..."
                    value={ownLyrics}
                    onChange={(e) => setOwnLyrics(e.target.value)}
                    rows={5}
                    className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                  />
                )}
              </CardContent>
            </Card>

            {/* Style */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Sliders" size={16} className="text-primary" />
                  Стиль музыки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_STYLES.map((s) => (
                    <Badge
                      key={s}
                      variant={style === s ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        style === s
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-white"
                      }`}
                      onClick={() => setStyle(style === s ? "" : s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voice */}
            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Volume2" size={16} className="text-primary" />
                    <Label className="text-white font-medium">Добавить озвучку</Label>
                  </div>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                </div>
                {voiceEnabled && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block">Тип голоса</Label>
                      <Select value={voiceType} onValueChange={setVoiceType}>
                        <SelectTrigger className="bg-background border-border text-white">
                          <SelectValue placeholder="Выберите голос" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Мужской</SelectItem>
                          <SelectItem value="female">Женский</SelectItem>
                          <SelectItem value="duet">Дуэт</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-3 block">Источник голоса</Label>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-border text-white hover:border-primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Icon name="Upload" size={14} className="mr-2" />
                          Загрузить файл
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 border-border text-white hover:border-primary ${isRecording ? "border-red-500 text-red-400" : ""}`}
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          <Icon name={isRecording ? "Square" : "Mic"} size={14} className="mr-2" />
                          {isRecording ? "Остановить" : "Запись с микрофона"}
                        </Button>
                        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Download */}
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
                  <div className="aspect-square rounded-lg bg-background border border-border flex flex-col items-center justify-center text-center p-4">
                    <Icon name="Music2" size={40} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Здесь появится ваш трек после генерации</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-background border border-primary/30 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="Music" size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Ваш трек</p>
                          <p className="text-muted-foreground text-xs">{style || "Без стиля"} • 3:24</p>
                        </div>
                      </div>
                      {/* Fake waveform */}
                      <div className="flex items-center gap-1 h-10 mb-3">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/60 rounded-sm"
                            style={{ height: `${20 + Math.sin(i * 0.8) * 15 + Math.random() * 10}px` }}
                          />
                        ))}
                      </div>
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                        <Icon name="Play" size={14} className="mr-2" />
                        Воспроизвести
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white pulse-button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !description}
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
                    <Label className="text-muted-foreground text-xs">Скачать в формате</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-border text-white hover:border-primary text-xs">
                        <Icon name="Download" size={12} className="mr-1" />
                        MP3
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-border text-white hover:border-primary text-xs">
                        <Icon name="Download" size={12} className="mr-1" />
                        WAV
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