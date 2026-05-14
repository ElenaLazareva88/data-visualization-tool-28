import { useState } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const JINGLE_TYPES = [
  { id: "instrumental", label: "Музыкальный", sub: "Инструментальный", icon: "Music" },
  { id: "vocal", label: "С вокалом", sub: "Голосовое объявление", icon: "Mic" },
  { id: "mixed", label: "Смешанный", sub: "Музыка + голос", icon: "Headphones" },
  { id: "logo", label: "Звуковой логотип", sub: "3–5 сек, фирменный", icon: "Zap" },
]

const GENRES = ["Поп", "Джингл 80-х", "Джаз", "Электронный", "Оркестровый", "Акустический", "Рок"]
const MOODS = ["Радостный", "Серьёзный", "Дружелюбный", "Энергичный", "Романтичный", "Деловой"]
const INSTRUMENTS = ["Фортепиано", "Гитара", "Синтезатор", "Скрипка", "Саксофон", "Барабаны", "Труба"]
const ACCENTS = ["Русский", "Британский", "Американский", "Нейтральный", "Детский"]
const EMOTIONS = ["Нейтральный", "Радостный", "Уверенный", "Мягкий", "Энергичный"]
const SOUND_EFFECTS = ["Колокольчик", "Вуш", "Пинг", "Барабанная дробь", "Аплодисменты", "Взрыв конфетти"]

const DURATIONS = [
  { label: "3–5 сек", sub: "Звуковой логотип", value: "3-5" },
  { label: "5–10 сек", sub: "Короткий джингл", value: "5-10" },
  { label: "10–30 сек", sub: "Радио-джингл", value: "10-30" },
]

export default function JinglePage() {
  const [jingleType, setJingleType] = useState("instrumental")
  const [duration, setDuration] = useState("5-10")
  const [genre, setGenre] = useState("")
  const [mood, setMood] = useState("")
  const [bpm, setBpm] = useState([120])
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [catchyMelody, setCatchyMelody] = useState(false)
  const [voiceType, setVoiceType] = useState("")
  const [accent, setAccent] = useState("")
  const [emotion, setEmotion] = useState("")
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [effectsVolume, setEffectsVolume] = useState([50])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  }

  const showVoice = jingleType === "vocal" || jingleType === "mixed"

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      saveGeneration({
        type: "jingle",
        title: [genre, mood].filter(Boolean).join(" · ") || "Джингл",
        prompt: [genre, mood, jingleType].filter(Boolean).join(", "),
        duration: parseInt(duration.split("-")[1] || "10"),
      })
    }, 2500)
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Radio" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Создание джинглов</h1>
          </div>
          <p className="text-muted-foreground">Фирменные звуки, радио-джинглы и звуковые логотипы для вашего бренда</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Type */}
            <Card className="glow-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="LayoutGrid" size={16} className="text-primary" />
                  Тип джингла
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {JINGLE_TYPES.map((t) => (
                    <div
                      key={t.id}
                      className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                        jingleType === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setJingleType(t.id)}
                    >
                      <Icon name={t.icon as "Music"} size={22} className={`mb-2 ${jingleType === t.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className={`font-medium text-sm ${jingleType === t.id ? "text-white" : "text-muted-foreground"}`}>{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.sub}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duration */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-primary" />
                  Длительность
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {DURATIONS.map((d) => (
                    <div
                      key={d.value}
                      className={`flex-1 rounded-lg border-2 p-3 cursor-pointer transition-colors text-center ${
                        duration === d.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setDuration(d.value)}
                    >
                      <p className={`font-bold text-sm ${duration === d.value ? "text-primary" : "text-white"}`}>{d.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.sub}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generation params */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Sliders" size={16} className="text-primary" />
                  Параметры генерации
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-2 block">Жанр/стиль</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="bg-background border-border text-white">
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm mb-2 block">Настроение</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="bg-background border-border text-white">
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Темп (BPM): {bpm[0]}</Label>
                  <Slider value={bpm} onValueChange={setBpm} min={60} max={200} step={5} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Медленно</span><span>Быстро</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm mb-2 block">Инструменты</Label>
                  <div className="flex flex-wrap gap-2">
                    {INSTRUMENTS.map((ins) => (
                      <Badge
                        key={ins}
                        variant={selectedInstruments.includes(ins) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${selectedInstruments.includes(ins) ? "bg-primary text-white" : "border-border text-muted-foreground hover:border-primary hover:text-white"}`}
                        onClick={() => toggleItem(selectedInstruments, setSelectedInstruments, ins)}
                      >
                        {ins}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-white text-sm">Запоминающийся мотив</Label>
                  <Switch checked={catchyMelody} onCheckedChange={setCatchyMelody} />
                </div>
              </CardContent>
            </Card>

            {/* Voice options */}
            {showVoice && (
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Icon name="Mic" size={16} className="text-primary" />
                    Голосовые опции
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {["Мужской", "Женский", "Дуэт"].map((v) => (
                      <div
                        key={v}
                        className={`rounded-lg border-2 p-3 cursor-pointer transition-colors text-center ${voiceType === v ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                        onClick={() => setVoiceType(v)}
                      >
                        <p className={`text-sm ${voiceType === v ? "text-white" : "text-muted-foreground"}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block">Акцент/язык</Label>
                      <Select value={accent} onValueChange={setAccent}>
                        <SelectTrigger className="bg-background border-border text-white">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block">Эмоция голоса</Label>
                      <Select value={emotion} onValueChange={setEmotion}>
                        <SelectTrigger className="bg-background border-border text-white">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMOTIONS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sound effects */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Volume2" size={16} className="text-primary" />
                  Звуковые эффекты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {SOUND_EFFECTS.map((e) => (
                    <Badge
                      key={e}
                      variant={selectedEffects.includes(e) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${selectedEffects.includes(e) ? "bg-primary text-white" : "border-border text-muted-foreground hover:border-primary hover:text-white"}`}
                      onClick={() => toggleItem(selectedEffects, setSelectedEffects, e)}
                    >
                      {e}
                    </Badge>
                  ))}
                </div>
                {selectedEffects.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-sm mb-2 block">Громкость эффектов: {effectsVolume[0]}%</Label>
                    <Slider value={effectsVolume} onValueChange={setEffectsVolume} min={0} max={100} step={5} />
                  </div>
                )}
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
                  <div className="aspect-square rounded-lg bg-background border border-border flex flex-col items-center justify-center text-center p-4">
                    <Icon name="Radio" size={36} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Ваш джингл появится здесь</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-background border border-primary/30 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="Radio" size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Ваш джингл</p>
                          <p className="text-muted-foreground text-xs">{duration} сек • {genre || "Без жанра"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 h-8 mb-3">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="flex-1 bg-primary/60 rounded-sm" style={{ height: `${12 + Math.abs(Math.sin(i * 1.2)) * 20}px` }} />
                        ))}
                      </div>
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
                        <Icon name="Play" size={14} className="mr-2" />Воспроизвести
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white pulse-button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Генерация...</>
                  ) : (
                    <><Icon name="Wand2" size={16} className="mr-2" />Сгенерировать</>
                  )}
                </Button>

                {generated && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Скачать</Label>
                    <div className="flex gap-2">
                      {["MP3", "WAV"].map((fmt) => (
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