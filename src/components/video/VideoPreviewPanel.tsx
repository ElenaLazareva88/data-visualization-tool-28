import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"

interface Props {
  format: string
  quality: string
  duration: number[]
  activeTab: string
  generated: boolean
  isGenerating: boolean
  onGenerate: () => void
}

export function VideoPreviewPanel({
  format,
  quality,
  duration,
  activeTab,
  generated,
  isGenerating,
  onGenerate,
}: Props) {
  const previewAspect =
    format === "vertical" ? "aspect-[9/16] max-h-72" :
    format === "square"   ? "aspect-square max-h-64" :
    "aspect-video"

  const formatLabel =
    format === "vertical" ? "9:16 Вертикальное" :
    format === "square"   ? "1:1 Квадрат" :
    "16:9 Горизонтальное"

  const modeLabel =
    activeTab === "avatar"     ? "Аватар" :
    activeTab === "generate"   ? "По описанию" :
    activeTab === "from-photo" ? "Из фото" :
    activeTab === "edit"       ? "Редактирование" :
    "Мультфильм"

  const params = [
    { label: "Формат",  value: formatLabel },
    { label: "Длина",   value: `${duration[0]} сек` },
    { label: "Качество", value: quality.toUpperCase() },
    { label: "Режим",   value: modeLabel },
  ]

  return (
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
              <p className="text-muted-foreground text-xs">
                {duration[0]} сек · {format === "vertical" ? "9:16" : format === "square" ? "1:1" : "16:9"}
              </p>
            </div>
          )}
        </div>

        {/* Кнопка генерации */}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all"
          onClick={onGenerate}
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
          {params.map((p) => (
            <div key={p.label} className="flex justify-between">
              <span className="text-muted-foreground text-xs">{p.label}</span>
              <span className="text-white text-xs font-medium">{p.value}</span>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  )
}
