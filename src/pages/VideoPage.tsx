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
  const [activeTab, setActiveTab] = useState("avatar")
  const [description, setDescription] = useState("")
  const [format, setFormat] = useState("vertical")
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [duration, setDuration] = useState([15])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [avatarText, setAvatarText] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [avatarVoice, setAvatarVoice] = useState("female")
  const [avatarLang, setAvatarLang] = useState("ru")
  const [showAvatarPanel, setShowAvatarPanel] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const avatarPhotoRef = useRef<HTMLInputElement>(null)

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

  const avatarPanel = showAvatarPanel && (
    <div className="mt-4 border border-primary/30 rounded-xl bg-primary/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-medium flex items-center gap-2">
          <Icon name="UserCircle" size={15} className="text-primary" />
          Озвучить аватаром
        </span>
        <button onClick={() => setShowAvatarPanel(false)} className="text-muted-foreground hover:text-white transition-colors">
          <Icon name="X" size={15} />
        </button>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs mb-1.5 block">Текст для озвучивания</Label>
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
        <Label className="text-muted-foreground text-xs mb-1.5 block">Аватар</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "anna", emoji: "👩‍💼", name: "Анна" },
            { id: "alex", emoji: "👨‍💻", name: "Алекс" },
            { id: "maria", emoji: "👩‍🎤", name: "Мария" },
            { id: "igor", emoji: "👨‍🏫", name: "Игорь" },
            { id: "sofia", emoji: "👩‍⚕️", name: "София" },
            { id: "dan", emoji: "🧑‍🎯", name: "Дэн" },
            { id: "kira", emoji: "🤖", name: "Кира AI" },
            { id: "custom", emoji: "📸", name: "Своё фото" },
          ].map((a) => (
            <div
              key={a.id}
              onClick={() => { setSelectedAvatar(a.id); if (a.id === "custom") avatarPhotoRef.current?.click() }}
              className={`rounded-lg border-2 p-2 cursor-pointer text-center transition-all ${selectedAvatar === a.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
            >
              <div className="text-xl mb-0.5">{a.emoji}</div>
              <p className="text-white text-xs leading-tight">{a.name}</p>
            </div>
          ))}
        </div>
        <input ref={avatarPhotoRef} type="file" accept="image/*" className="hidden" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1"><Icon name="Mic" size={12} className="text-primary" />Голос</Label>
          <div className="space-y-1">
            {[{ id: "female", label: "Женский", emoji: "👩" }, { id: "male", label: "Мужской", emoji: "👨" }, { id: "neutral", label: "Нейтральный", emoji: "🤖" }].map((v) => (
              <div key={v.id} onClick={() => setAvatarVoice(v.id)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer text-xs transition-all ${avatarVoice === v.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                <span>{v.emoji}</span>{v.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1"><Icon name="Globe" size={12} className="text-primary" />Язык</Label>
          <div className="space-y-1">
            {[{ id: "ru", label: "Русский", flag: "🇷🇺" }, { id: "en", label: "English", flag: "🇬🇧" }, { id: "es", label: "Español", flag: "🇪🇸" }, { id: "zh", label: "中文", flag: "🇨🇳" }].map((l) => (
              <div key={l.id} onClick={() => setAvatarLang(l.id)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer text-xs transition-all ${avatarLang === l.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                <span>{l.flag}</span>{l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-card border border-border mb-4 flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="avatar" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="UserCircle" size={14} className="mr-1" />Аватар
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Wand2" size={14} className="mr-1" />По описанию
                </TabsTrigger>
                <TabsTrigger value="from-photo" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Image" size={14} className="mr-1" />Из фото
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Film" size={14} className="mr-1" />Редактировать
                </TabsTrigger>
                <TabsTrigger value="cartoon" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Sparkles" size={14} className="mr-1" />Мультфильм
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-0">
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
                    <Button variant="outline" size="sm" className="mt-3 border-primary/50 text-primary hover:bg-primary/10 gap-2" onClick={() => setShowAvatarPanel(p => !p)}>
                      <Icon name="UserCircle" size={14} />
                      {showAvatarPanel ? "Скрыть аватара" : "Озвучить аватаром"}
                    </Button>
                    {avatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="from-photo" className="space-y-0">
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
                    <Button variant="outline" size="sm" className="mt-3 border-primary/50 text-primary hover:bg-primary/10 gap-2" onClick={() => setShowAvatarPanel(p => !p)}>
                      <Icon name="UserCircle" size={14} />
                      {showAvatarPanel ? "Скрыть аватара" : "Озвучить аватаром"}
                    </Button>
                    {avatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="edit" className="space-y-0">
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
                    <Button variant="outline" size="sm" className="mt-3 border-primary/50 text-primary hover:bg-primary/10 gap-2" onClick={() => setShowAvatarPanel(p => !p)}>
                      <Icon name="UserCircle" size={14} />
                      {showAvatarPanel ? "Скрыть аватара" : "Озвучить аватаром"}
                    </Button>
                    {avatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="cartoon" className="space-y-0">
                <Card className="bg-card border-border">
                  <CardContent className="pt-5 space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block">Описание мультфильма</Label>
                      <Textarea
                        placeholder="Опишите сцену... например: «Маленький котёнок идёт по радужному лесу, мультяшный стиль, яркие краски»"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block">Стиль анимации</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "disney", label: "Disney / Pixar", icon: "⭐" },
                          { id: "anime", label: "Аниме", icon: "🌸" },
                          { id: "2d", label: "2D классика", icon: "🎨" },
                          { id: "stop-motion", label: "Стоп-моушен", icon: "🧸" },
                        ].map((style) => (
                          <div
                            key={style.id}
                            className={`rounded-lg border-2 p-3 cursor-pointer transition-colors flex items-center gap-2 ${
                              format === style.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setFormat(style.id)}
                          >
                            <span className="text-xl">{style.icon}</span>
                            <span className={`text-sm font-medium ${format === style.id ? "text-primary" : "text-white"}`}>{style.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10 gap-2" onClick={() => setShowAvatarPanel(p => !p)}>
                      <Icon name="UserCircle" size={14} />
                      {showAvatarPanel ? "Скрыть аватара" : "Озвучить аватаром"}
                    </Button>
                    {avatarPanel}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* === АВАТАРЫ === */}
              <TabsContent value="avatar" className="space-y-4">
                <Card className="glow-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="FileText" size={16} className="text-primary" />
                      Текст для озвучивания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Введите текст, который аватар произнесёт на видео... например: «Привет! Сегодня расскажу вам о нашем новом продукте — он поможет сэкономить время и деньги»"
                      value={avatarText}
                      onChange={(e) => setAvatarText(e.target.value)}
                      rows={5}
                      className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground text-xs">Оптимально 50–500 слов</span>
                      <span className={`text-xs ${avatarText.length > 20 ? "text-green-400" : "text-muted-foreground"}`}>{avatarText.split(" ").filter(Boolean).length} слов</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Выбор аватара */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Users" size={16} className="text-primary" />
                      Выбери аватара
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { id: "anna", emoji: "👩‍💼", name: "Анна", style: "Деловой" },
                        { id: "alex", emoji: "👨‍💻", name: "Алекс", style: "Технологичный" },
                        { id: "maria", emoji: "👩‍🎤", name: "Мария", style: "Творческий" },
                        { id: "igor", emoji: "👨‍🏫", name: "Игорь", style: "Обучающий" },
                        { id: "sofia", emoji: "👩‍⚕️", name: "София", style: "Медицина" },
                        { id: "dan", emoji: "🧑‍🎯", name: "Дэн", style: "Спорт" },
                        { id: "kira", emoji: "🤖", name: "Кира AI", style: "ИИ-ассистент", badge: "Хит" },
                        { id: "custom", emoji: "📸", name: "Своё фото", style: "Загрузить" },
                      ].map((a) => (
                        <div
                          key={a.id}
                          onClick={() => { setSelectedAvatar(a.id); if (a.id === "custom") avatarPhotoRef.current?.click() }}
                          className={`rounded-xl border-2 p-3 cursor-pointer text-center transition-all relative ${
                            selectedAvatar === a.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {a.badge && (
                            <span className="absolute -top-2 -right-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{a.badge}</span>
                          )}
                          <div className="text-3xl mb-1">{a.emoji}</div>
                          <p className="text-white text-xs font-medium">{a.name}</p>
                          <p className="text-muted-foreground text-xs">{a.style}</p>
                        </div>
                      ))}
                    </div>
                    <input ref={avatarPhotoRef} type="file" accept="image/*" className="hidden" />
                  </CardContent>
                </Card>

                {/* Голос и язык */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="pt-5">
                      <Label className="text-white font-medium mb-3 block flex items-center gap-2">
                        <Icon name="Mic" size={15} className="text-primary" />
                        Голос
                      </Label>
                      <div className="space-y-2">
                        {[
                          { id: "female", label: "Женский", emoji: "👩" },
                          { id: "male", label: "Мужской", emoji: "👨" },
                          { id: "neutral", label: "Нейтральный", emoji: "🤖" },
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setAvatarVoice(v.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              avatarVoice === v.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            <span>{v.emoji}</span>
                            <span className="text-sm">{v.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardContent className="pt-5">
                      <Label className="text-white font-medium mb-3 block flex items-center gap-2">
                        <Icon name="Globe" size={15} className="text-primary" />
                        Язык
                      </Label>
                      <div className="space-y-2">
                        {[
                          { id: "ru", label: "Русский", flag: "🇷🇺" },
                          { id: "en", label: "English", flag: "🇬🇧" },
                          { id: "es", label: "Español", flag: "🇪🇸" },
                          { id: "zh", label: "中文", flag: "🇨🇳" },
                        ].map((l) => (
                          <div
                            key={l.id}
                            onClick={() => setAvatarLang(l.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              avatarLang === l.id ? "border-primary bg-primary/10 text-white" : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            <span>{l.flag}</span>
                            <span className="text-sm">{l.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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