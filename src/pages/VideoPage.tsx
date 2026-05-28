import { useState, useRef } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const EFFECTS = ["Плавный переход", "Зум", "Затухание", "Вспышка", "Панорама", "Кинематограф"]

const AVATARS = [
  { id: "anna",   emoji: "👩‍💼", name: "Анна",     style: "Деловой" },
  { id: "alex",   emoji: "👨‍💻", name: "Алекс",    style: "Технологичный" },
  { id: "maria",  emoji: "👩‍🎤", name: "Мария",    style: "Творческий" },
  { id: "igor",   emoji: "👨‍🏫", name: "Игорь",    style: "Обучающий" },
  { id: "sofia",  emoji: "👩‍⚕️", name: "София",    style: "Медицина" },
  { id: "dan",    emoji: "🧑‍🎯", name: "Дэн",      style: "Спорт" },
  { id: "kira",   emoji: "🤖",   name: "Кира AI",  style: "ИИ-ассистент", badge: "Хит" },
  { id: "custom", emoji: "📸",   name: "Своё фото", style: "Загрузить" },
]

const VOICES = [
  { id: "female",  label: "Женский",     emoji: "👩" },
  { id: "male",    label: "Мужской",     emoji: "👨" },
  { id: "neutral", label: "Нейтральный", emoji: "🤖" },
]

const LANGS = [
  { id: "ru", label: "Русский", flag: "🇷🇺" },
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "es", label: "Español", flag: "🇪🇸" },
  { id: "zh", label: "中文",     flag: "🇨🇳" },
]

const FORMATS = [
  { id: "vertical",   label: "9:16",   sub: "Reels · TikTok",  icon: "Smartphone" },
  { id: "horizontal", label: "16:9",   sub: "YouTube",          icon: "Monitor" },
  { id: "square",     label: "1:1",    sub: "Instagram",        icon: "Square" },
]

const CARTOON_STYLES = [
  { id: "disney",      label: "Disney / Pixar", icon: "⭐" },
  { id: "anime",       label: "Аниме",          icon: "🌸" },
  { id: "2d",          label: "2D классика",    icon: "🎨" },
  { id: "stop-motion", label: "Стоп-моушен",    icon: "🧸" },
]

export default function VideoPage() {
  const [activeTab, setActiveTab]           = useState("avatar")
  const [description, setDescription]       = useState("")
  const [format, setFormat]                 = useState("vertical")
  const [cartoonStyle, setCartoonStyle]     = useState("disney")
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [duration, setDuration]             = useState([15])
  const [isGenerating, setIsGenerating]     = useState(false)
  const [generated, setGenerated]           = useState(false)
  const [uploadedPhoto, setUploadedPhoto]   = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo]   = useState<string | null>(null)
  const [avatarText, setAvatarText]         = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("kira")
  const [avatarVoice, setAvatarVoice]       = useState("female")
  const [avatarLang, setAvatarLang]         = useState("ru")
  const [showAvatarPanel, setShowAvatarPanel] = useState(false)
  const [quality, setQuality]               = useState("hd")

  const photoRef      = useRef<HTMLInputElement>(null)
  const videoRef      = useRef<HTMLInputElement>(null)
  const avatarPhotoRef = useRef<HTMLInputElement>(null)

  const toggleEffect = (e: string) =>
    setSelectedEffects(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

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

  const previewAspect =
    format === "vertical" ? "aspect-[9/16] max-h-72" :
    format === "square"   ? "aspect-square max-h-64" :
    "aspect-video"

  /* ── Панель аватара (inline, раскрывается под кнопкой) ── */
  const AvatarPanel = showAvatarPanel ? (
    <div className="mt-4 rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/5 to-transparent p-5 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold flex items-center gap-2">
          <Icon name="UserCircle" size={15} className="text-primary" />
          Озвучить аватаром
        </span>
        <button onClick={() => setShowAvatarPanel(false)} className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <Icon name="X" size={14} />
        </button>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs mb-2 block">Текст для озвучивания</Label>
        <Textarea
          placeholder="Введите текст, который аватар произнесёт на видео..."
          value={avatarText}
          onChange={(e) => setAvatarText(e.target.value)}
          rows={3}
          className="bg-background border-border text-white placeholder:text-muted-foreground resize-none text-sm"
        />
        <span className="text-muted-foreground text-xs mt-1 block">{avatarText.split(" ").filter(Boolean).length} слов</span>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs mb-2 block">Аватар</Label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {AVATARS.map((a) => (
            <div
              key={a.id}
              onClick={() => { setSelectedAvatar(a.id); if (a.id === "custom") avatarPhotoRef.current?.click() }}
              className={`relative rounded-xl border-2 p-2 cursor-pointer text-center transition-all ${selectedAvatar === a.id ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" : "border-border hover:border-primary/40"}`}
            >
              {a.badge && <span className="absolute -top-2 -right-2 text-[10px] bg-primary text-white px-1 py-0.5 rounded-full leading-none">{a.badge}</span>}
              <div className="text-xl mb-0.5">{a.emoji}</div>
              <p className="text-white text-[10px] leading-tight font-medium">{a.name}</p>
            </div>
          ))}
        </div>
        <input ref={avatarPhotoRef} type="file" accept="image/*" className="hidden" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground text-xs mb-2 flex items-center gap-1 block">
            <Icon name="Mic" size={11} className="text-primary" /> Голос
          </Label>
          <div className="space-y-1.5">
            {VOICES.map((v) => (
              <div key={v.id} onClick={() => setAvatarVoice(v.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all ${avatarVoice === v.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                <span>{v.emoji}</span>{v.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs mb-2 flex items-center gap-1 block">
            <Icon name="Globe" size={11} className="text-primary" /> Язык
          </Label>
          <div className="space-y-1.5">
            {LANGS.map((l) => (
              <div key={l.id} onClick={() => setAvatarLang(l.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all ${avatarLang === l.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                <span>{l.flag}</span>{l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null

  const avatarBtn = (
    <Button
      variant="outline"
      size="sm"
      className={`mt-3 gap-2 text-xs transition-all ${showAvatarPanel ? "border-primary bg-primary/10 text-primary" : "border-primary/40 text-primary hover:bg-primary/10"}`}
      onClick={() => setShowAvatarPanel(p => !p)}
    >
      <Icon name="UserCircle" size={13} />
      {showAvatarPanel ? "Скрыть аватара" : "Озвучить аватаром"}
    </Button>
  )

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-6xl mx-auto">

        {/* Шапка */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Icon name="Video" size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-orbitron">Создание видео</h1>
              <p className="text-muted-foreground text-sm">Аватар, текст, фото, редактирование и мультфильм</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── ЛЕВАЯ КОЛОНКА ─── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Вкладки */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setShowAvatarPanel(false) }} className="w-full">
              <TabsList className="w-full bg-card border border-border flex-wrap h-auto gap-1 p-1 mb-4 rounded-xl">
                {[
                  { value: "avatar",     icon: "UserCircle", label: "Аватар" },
                  { value: "generate",   icon: "Wand2",      label: "По описанию" },
                  { value: "from-photo", icon: "Image",      label: "Из фото" },
                  { value: "edit",       icon: "Film",       label: "Редактировать" },
                  { value: "cartoon",    icon: "Sparkles",   label: "Мультфильм" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="flex-1 min-w-[80px] text-xs gap-1 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all"
                  >
                    <Icon name={t.icon as "Wand2"} size={13} />{t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── По описанию ── */}
              <TabsContent value="generate">
                <Card className="bg-card border-border rounded-2xl">
                  <CardContent className="pt-5">
                    <Label className="text-muted-foreground text-xs mb-2 block">Опишите видео</Label>
                    <Textarea
                      placeholder="Например: «Закат на море, медленная съёмка, тёплые тона, кинематографичный стиль»"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="bg-background border-border text-white placeholder:text-muted-foreground resize-none text-sm"
                    />
                    {avatarBtn}
                    {AvatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Из фото ── */}
              <TabsContent value="from-photo">
                <Card className="bg-card border-border rounded-2xl">
                  <CardContent className="pt-5">
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                      onClick={() => photoRef.current?.click()}
                    >
                      {uploadedPhoto ? (
                        <div className="relative inline-block">
                          <img src={uploadedPhoto} alt="Загружено" className="max-h-44 mx-auto rounded-xl" />
                          <button
                            className="absolute -top-2 -right-2 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-white"
                            onClick={(e) => { e.stopPropagation(); setUploadedPhoto(null) }}
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Icon name="ImagePlus" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm font-medium">Нажмите или перетащите фото</p>
                          <p className="text-muted-foreground text-xs mt-1">JPG, PNG до 20 МБ</p>
                        </>
                      )}
                      <input ref={photoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedPhoto(URL.createObjectURL(f)) }} />
                    </div>
                    {avatarBtn}
                    {AvatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Редактировать ── */}
              <TabsContent value="edit">
                <Card className="bg-card border-border rounded-2xl">
                  <CardContent className="pt-5 space-y-4">
                    <div
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                      onClick={() => videoRef.current?.click()}
                    >
                      {uploadedVideo ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon name="Film" size={20} className="text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">Видео загружено</p>
                            <button className="text-muted-foreground text-xs hover:text-primary" onClick={(e) => { e.stopPropagation(); setUploadedVideo(null) }}>Удалить</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Icon name="Film" size={36} className="text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm font-medium">Загрузите видео для редактирования</p>
                          <p className="text-muted-foreground text-xs mt-1">MP4, MOV до 500 МБ</p>
                        </>
                      )}
                      <input ref={videoRef} type="file" accept="video/*" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) setUploadedVideo("loaded") }} />
                    </div>

                    {uploadedVideo && (
                      <div>
                        <Label className="text-muted-foreground text-xs mb-2 block">Инструкция по редактированию</Label>
                        <Textarea
                          placeholder="Например: «Убери первые 5 секунд, добавь субтитры, сделай переход между сценами плавным»"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="bg-background border-border text-white placeholder:text-muted-foreground resize-none text-sm"
                        />
                      </div>
                    )}
                    {avatarBtn}
                    {AvatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Мультфильм ── */}
              <TabsContent value="cartoon">
                <Card className="bg-card border-border rounded-2xl">
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Описание сцены</Label>
                      <Textarea
                        placeholder="Например: «Маленький котёнок идёт по радужному лесу, мультяшный стиль, яркие краски»"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="bg-background border-border text-white placeholder:text-muted-foreground resize-none text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Стиль анимации</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CARTOON_STYLES.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setCartoonStyle(s.id)}
                            className={`rounded-xl border-2 p-3 cursor-pointer text-center transition-all ${cartoonStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                          >
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <p className={`text-xs font-medium ${cartoonStyle === s.id ? "text-white" : "text-muted-foreground"}`}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {avatarBtn}
                    {AvatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Аватар ── */}
              <TabsContent value="avatar" className="space-y-4">
                <Card className="bg-card border-border rounded-2xl">
                  <CardContent className="pt-5 space-y-5">

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-muted-foreground text-xs">Текст для озвучивания</Label>
                        <span className={`text-xs ${avatarText.length > 20 ? "text-green-400" : "text-muted-foreground"}`}>
                          {avatarText.split(" ").filter(Boolean).length} слов · оптимально 50–500
                        </span>
                      </div>
                      <Textarea
                        placeholder="Введите текст, который аватар произнесёт на видео... например: «Привет! Сегодня расскажу о нашем новом продукте»"
                        value={avatarText}
                        onChange={(e) => setAvatarText(e.target.value)}
                        rows={5}
                        className="bg-background border-border text-white placeholder:text-muted-foreground resize-none text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-xs mb-3 block">Выбери аватара</Label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {AVATARS.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => { setSelectedAvatar(a.id); if (a.id === "custom") avatarPhotoRef.current?.click() }}
                            className={`relative rounded-xl border-2 p-2 sm:p-3 cursor-pointer text-center transition-all ${selectedAvatar === a.id ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" : "border-border hover:border-primary/40"}`}
                          >
                            {a.badge && <span className="absolute -top-2 -right-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full leading-none">{a.badge}</span>}
                            <div className="text-2xl sm:text-3xl mb-1">{a.emoji}</div>
                            <p className="text-white text-[10px] sm:text-xs font-medium leading-tight">{a.name}</p>
                            <p className="text-muted-foreground text-[10px] hidden sm:block">{a.style}</p>
                          </div>
                        ))}
                      </div>
                      <input ref={avatarPhotoRef} type="file" accept="image/*" className="hidden" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs mb-2 flex items-center gap-1 block">
                          <Icon name="Mic" size={11} className="text-primary" /> Голос
                        </Label>
                        <div className="space-y-1.5">
                          {VOICES.map((v) => (
                            <div key={v.id} onClick={() => setAvatarVoice(v.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all ${avatarVoice === v.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              <span>{v.emoji}</span>{v.label}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs mb-2 flex items-center gap-1 block">
                          <Icon name="Globe" size={11} className="text-primary" /> Язык
                        </Label>
                        <div className="space-y-1.5">
                          {LANGS.map((l) => (
                            <div key={l.id} onClick={() => setAvatarLang(l.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all ${avatarLang === l.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                              <span>{l.flag}</span>{l.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Формат + Качество */}
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="pt-5 space-y-5">
                <div>
                  <Label className="text-white text-sm font-medium mb-3 flex items-center gap-2 block">
                    <Icon name="Monitor" size={15} className="text-primary" /> Формат видео
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMATS.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={`rounded-xl border-2 p-3 cursor-pointer text-center transition-all ${format === f.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                      >
                        <Icon name={f.icon as "Smartphone"} size={20} className={`mx-auto mb-1.5 ${format === f.id ? "text-primary" : "text-muted-foreground"}`} />
                        <p className={`text-sm font-bold ${format === f.id ? "text-white" : "text-muted-foreground"}`}>{f.label}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{f.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-3 flex items-center gap-2 block">
                    <Icon name="Zap" size={15} className="text-primary" /> Качество
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "draft", label: "Черновик", sub: "Быстро", icon: "⚡" },
                      { id: "hd",    label: "HD",       sub: "Стандарт", icon: "✨" },
                      { id: "4k",    label: "4K",       sub: "Максимум", icon: "💎" },
                    ].map((q) => (
                      <div
                        key={q.id}
                        onClick={() => setQuality(q.id)}
                        className={`rounded-xl border-2 p-3 cursor-pointer text-center transition-all ${quality === q.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                      >
                        <div className="text-xl mb-1">{q.icon}</div>
                        <p className={`text-sm font-bold ${quality === q.id ? "text-white" : "text-muted-foreground"}`}>{q.label}</p>
                        <p className="text-muted-foreground text-xs">{q.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Эффекты и тайминг */}
            <Card className="bg-card border-border rounded-2xl">
              <CardContent className="pt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-white text-sm font-medium flex items-center gap-2">
                      <Icon name="Clock" size={15} className="text-primary" /> Длительность
                    </Label>
                    <span className="text-primary font-bold text-sm">{duration[0]} сек</span>
                  </div>
                  <Slider value={duration} onValueChange={setDuration} min={5} max={60} step={5} className="w-full" />
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground text-xs">5 сек</span>
                    <span className="text-muted-foreground text-xs">60 сек</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-3 flex items-center gap-2 block">
                    <Icon name="Sparkles" size={15} className="text-primary" /> Эффекты переходов
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {EFFECTS.map((e) => (
                      <Badge
                        key={e}
                        variant={selectedEffects.includes(e) ? "default" : "outline"}
                        className={`cursor-pointer transition-all text-xs px-3 py-1 rounded-lg ${
                          selectedEffects.includes(e)
                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-white"
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

          {/* ─── ПРАВАЯ КОЛОНКА ─── */}
          <div className="space-y-4">
            <Card className="bg-card border-border rounded-2xl lg:sticky lg:top-24">
              <CardContent className="pt-5 space-y-4">

                {/* Предпросмотр */}
                <div>
                  <Label className="text-white text-sm font-medium mb-3 flex items-center gap-2 block">
                    <Icon name="Play" size={15} className="text-primary" /> Предпросмотр
                  </Label>
                  {!generated ? (
                    <div className={`w-full rounded-xl bg-background border border-border flex flex-col items-center justify-center text-center p-6 ${previewAspect}`}>
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                        <Icon name="Video" size={24} className="text-primary/60" />
                      </div>
                      <p className="text-muted-foreground text-xs">Предпросмотр появится здесь</p>
                    </div>
                  ) : (
                    <div className={`w-full rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/30 flex flex-col items-center justify-center gap-2 ${previewAspect}`}>
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Icon name="Play" size={28} className="text-primary" />
                      </div>
                      <p className="text-white text-sm font-medium">Видео готово</p>
                      <p className="text-muted-foreground text-xs">{duration[0]} сек · {format === "vertical" ? "9:16" : format === "square" ? "1:1" : "16:9"}</p>
                    </div>
                  )}
                </div>

                {/* Кнопка генерации */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Генерируем видео...</>
                  ) : (
                    <><Icon name="Wand2" size={16} className="mr-2" />Сгенерировать</>
                  )}
                </Button>

                {/* Скачать */}
                {generated && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs block">Скачать</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["MP4", "MOV"].map((fmt) => (
                        <Button key={fmt} variant="outline" size="sm" className="border-border text-white hover:border-primary hover:bg-primary/5 text-xs rounded-xl">
                          <Icon name="Download" size={12} className="mr-1" />{fmt}
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-border text-muted-foreground hover:border-primary hover:text-white text-xs rounded-xl">
                      <Icon name="Share2" size={12} className="mr-1" />Поделиться
                    </Button>
                  </div>
                )}

                {/* Параметры генерации */}
                <div className="rounded-xl bg-background/60 border border-border p-3 space-y-2">
                  <p className="text-muted-foreground text-xs font-medium mb-2">Параметры</p>
                  {[
                    { label: "Формат", value: format === "vertical" ? "9:16 Вертикальное" : format === "square" ? "1:1 Квадрат" : "16:9 Горизонтальное" },
                    { label: "Длина", value: `${duration[0]} сек` },
                    { label: "Качество", value: quality.toUpperCase() },
                    { label: "Режим", value: activeTab === "avatar" ? "Аватар" : activeTab === "generate" ? "По описанию" : activeTab === "from-photo" ? "Из фото" : activeTab === "edit" ? "Редактирование" : "Мультфильм" },
                  ].map((p) => (
                    <div key={p.label} className="flex justify-between">
                      <span className="text-muted-foreground text-xs">{p.label}</span>
                      <span className="text-white text-xs font-medium">{p.value}</span>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
