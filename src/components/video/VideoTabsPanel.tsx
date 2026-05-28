import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"

const AVATARS = [
  { id: "anna",   emoji: "👩‍💼", name: "Анна",      style: "Деловой" },
  { id: "alex",   emoji: "👨‍💻", name: "Алекс",     style: "Технологичный" },
  { id: "maria",  emoji: "👩‍🎤", name: "Мария",     style: "Творческий" },
  { id: "igor",   emoji: "👨‍🏫", name: "Игорь",     style: "Обучающий" },
  { id: "sofia",  emoji: "👩‍⚕️", name: "София",     style: "Медицина" },
  { id: "dan",    emoji: "🧑‍🎯", name: "Дэн",       style: "Спорт" },
  { id: "kira",   emoji: "🤖",   name: "Кира AI",   style: "ИИ-ассистент", badge: "Хит" },
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

const CARTOON_STYLES = [
  { id: "disney",      label: "Disney / Pixar", icon: "⭐" },
  { id: "anime",       label: "Аниме",          icon: "🌸" },
  { id: "2d",          label: "2D классика",    icon: "🎨" },
  { id: "stop-motion", label: "Стоп-моушен",    icon: "🧸" },
]

interface Props {
  activeTab: string
  setActiveTab: (v: string) => void
  description: string
  setDescription: (v: string) => void
  cartoonStyle: string
  setCartoonStyle: (v: string) => void
  uploadedPhoto: string | null
  setUploadedPhoto: (v: string | null) => void
  uploadedVideo: string | null
  setUploadedVideo: (v: string | null) => void
  avatarText: string
  setAvatarText: (v: string) => void
  selectedAvatar: string
  setSelectedAvatar: (v: string) => void
  avatarVoice: string
  setAvatarVoice: (v: string) => void
  avatarLang: string
  setAvatarLang: (v: string) => void
  showAvatarPanel: boolean
  setShowAvatarPanel: (v: boolean | ((p: boolean) => boolean)) => void
}

export function VideoTabsPanel({
  activeTab, setActiveTab,
  description, setDescription,
  cartoonStyle, setCartoonStyle,
  uploadedPhoto, setUploadedPhoto,
  uploadedVideo, setUploadedVideo,
  avatarText, setAvatarText,
  selectedAvatar, setSelectedAvatar,
  avatarVoice, setAvatarVoice,
  avatarLang, setAvatarLang,
  showAvatarPanel, setShowAvatarPanel,
}: Props) {
  const photoRef       = useRef<HTMLInputElement>(null)
  const videoRef       = useRef<HTMLInputElement>(null)
  const avatarPhotoRef = useRef<HTMLInputElement>(null)

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
  )
}
