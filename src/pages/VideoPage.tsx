import { useState } from "react"
import { saveGeneration } from "@/lib/auth"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { VideoTabsPanel } from "@/components/video/VideoTabsPanel"
import { VideoFormatSettings } from "@/components/video/VideoFormatSettings"
import { VideoPreviewPanel } from "@/components/video/VideoPreviewPanel"

export default function VideoPage() {
  const [activeTab, setActiveTab]             = useState("avatar")
  const [description, setDescription]         = useState("")
  const [format, setFormat]                   = useState("vertical")
  const [cartoonStyle, setCartoonStyle]       = useState("disney")
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [duration, setDuration]               = useState([15])
  const [isGenerating, setIsGenerating]       = useState(false)
  const [generated, setGenerated]             = useState(false)
  const [uploadedPhoto, setUploadedPhoto]     = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo]     = useState<string | null>(null)
  const [avatarText, setAvatarText]           = useState("")
  const [selectedAvatar, setSelectedAvatar]   = useState("kira")
  const [avatarVoice, setAvatarVoice]         = useState("female")
  const [avatarLang, setAvatarLang]           = useState("ru")
  const [showAvatarPanel, setShowAvatarPanel] = useState(false)
  const [quality, setQuality]                 = useState("hd")

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
            <VideoTabsPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              description={description}
              setDescription={setDescription}
              cartoonStyle={cartoonStyle}
              setCartoonStyle={setCartoonStyle}
              uploadedPhoto={uploadedPhoto}
              setUploadedPhoto={setUploadedPhoto}
              uploadedVideo={uploadedVideo}
              setUploadedVideo={setUploadedVideo}
              avatarText={avatarText}
              setAvatarText={setAvatarText}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              avatarVoice={avatarVoice}
              setAvatarVoice={setAvatarVoice}
              avatarLang={avatarLang}
              setAvatarLang={setAvatarLang}
              showAvatarPanel={showAvatarPanel}
              setShowAvatarPanel={setShowAvatarPanel}
            />

            <VideoFormatSettings
              format={format}
              setFormat={setFormat}
              quality={quality}
              setQuality={setQuality}
              duration={duration}
              setDuration={setDuration}
              selectedEffects={selectedEffects}
              toggleEffect={toggleEffect}
            />
          </div>

          {/* ─── ПРАВАЯ КОЛОНКА ─── */}
          <div className="space-y-4">
            <VideoPreviewPanel
              format={format}
              quality={quality}
              duration={duration}
              activeTab={activeTab}
              generated={generated}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
