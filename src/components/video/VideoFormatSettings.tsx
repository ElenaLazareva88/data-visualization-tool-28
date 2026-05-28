import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"

const EFFECTS = ["Плавный переход", "Зум", "Затухание", "Вспышка", "Панорама", "Кинематограф"]

const FORMATS = [
  { id: "vertical",   label: "9:16", sub: "Reels · TikTok", icon: "Smartphone" },
  { id: "horizontal", label: "16:9", sub: "YouTube",         icon: "Monitor" },
  { id: "square",     label: "1:1",  sub: "Instagram",       icon: "Square" },
]

const QUALITIES = [
  { id: "draft", label: "Черновик", sub: "Быстро",   icon: "⚡" },
  { id: "hd",    label: "HD",       sub: "Стандарт", icon: "✨" },
  { id: "4k",    label: "4K",       sub: "Максимум", icon: "💎" },
]

interface Props {
  format: string
  setFormat: (v: string) => void
  quality: string
  setQuality: (v: string) => void
  duration: number[]
  setDuration: (v: number[]) => void
  selectedEffects: string[]
  toggleEffect: (e: string) => void
}

export function VideoFormatSettings({
  format, setFormat,
  quality, setQuality,
  duration, setDuration,
  selectedEffects, toggleEffect,
}: Props) {
  return (
    <>
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
              {QUALITIES.map((q) => (
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
    </>
  )
}
