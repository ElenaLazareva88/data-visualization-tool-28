import { useState } from "react"
import { saveGeneration } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const LOGO_STYLES = [
  { id: "minimal", label: "Минимализм", icon: "◻", desc: "Лаконично и современно" },
  { id: "emblem", label: "Эмблема", icon: "🛡", desc: "Классика и надёжность" },
  { id: "wordmark", label: "Леттеринг", icon: "𝔸", desc: "Только название" },
  { id: "mascot", label: "Маскот", icon: "🦁", desc: "Персонаж-символ бренда" },
  { id: "abstract", label: "Абстракция", icon: "◈", desc: "Уникальная геометрия" },
  { id: "vintage", label: "Винтаж", icon: "⚙", desc: "Ретро и крафт" },
]

const INDUSTRIES = [
  { id: "tech", label: "IT / Технологии", icon: "💻" },
  { id: "food", label: "Еда / Ресторан", icon: "🍽️" },
  { id: "beauty", label: "Красота / Spa", icon: "💅" },
  { id: "sport", label: "Спорт / Фитнес", icon: "🏋️" },
  { id: "finance", label: "Финансы", icon: "💰" },
  { id: "medical", label: "Медицина", icon: "⚕️" },
  { id: "edu", label: "Образование", icon: "📚" },
  { id: "fashion", label: "Мода / Одежда", icon: "👗" },
  { id: "realty", label: "Недвижимость", icon: "🏠" },
  { id: "auto", label: "Авто", icon: "🚗" },
  { id: "travel", label: "Туризм", icon: "✈️" },
  { id: "other", label: "Другое", icon: "✨" },
]

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", size: "1080×1080" },
  { id: "tiktok", label: "TikTok", icon: "🎵", size: "200×200" },
  { id: "youtube", label: "YouTube", icon: "▶️", size: "800×800" },
  { id: "vk", label: "ВКонтакте", icon: "💙", size: "200×200" },
  { id: "telegram", label: "Telegram", icon: "✈️", size: "512×512" },
  { id: "facebook", label: "Facebook", icon: "👍", size: "180×180" },
  { id: "twitter", label: "X / Twitter", icon: "🐦", size: "400×400" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", size: "256×256" },
]

const BRAND_COLORS = [
  { id: "red", label: "Красный", color: "#ef4444" },
  { id: "blue", label: "Синий", color: "#3b82f6" },
  { id: "green", label: "Зелёный", color: "#22c55e" },
  { id: "purple", label: "Фиолетовый", color: "#a855f7" },
  { id: "orange", label: "Оранжевый", color: "#f97316" },
  { id: "black", label: "Чёрный", color: "#111111" },
  { id: "gold", label: "Золотой", color: "#eab308" },
  { id: "teal", label: "Бирюзовый", color: "#14b8a6" },
]

export default function LogoPage() {
  const [activeTab, setActiveTab] = useState("company")

  // Логотип компании
  const [companyName, setCompanyName] = useState("")
  const [companyDesc, setCompanyDesc] = useState("")
  const [companySlogan, setCompanySlogan] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("tech")
  const [selectedStyle, setSelectedStyle] = useState("minimal")
  const [selectedColor, setSelectedColor] = useState("blue")
  const [brandPackage, setBrandPackage] = useState(false)

  // Логотип для соцсетей
  const [socialName, setSocialName] = useState("")
  const [socialDesc, setSocialDesc] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"])
  const [socialStyle, setSocialStyle] = useState("minimal")
  const [socialColor, setSocialColor] = useState("blue")

  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(true)
      const title =
        activeTab === "company"
          ? `Логотип: ${companyName || "Компания"}`
          : `Логотип соцсети: ${socialName || "Аккаунт"}`
      const prompt =
        activeTab === "company"
          ? `${companyName}, ${companyDesc}, стиль: ${selectedStyle}, отрасль: ${selectedIndustry}`
          : `${socialName}, ${socialDesc}, платформы: ${selectedPlatforms.join(", ")}`
      saveGeneration({ type: "photo", title, prompt })
    }, 2500)
  }

  const currentColor = BRAND_COLORS.find(c => c.id === (activeTab === "company" ? selectedColor : socialColor))

  return (
    <div className="dark min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4 max-w-5xl mx-auto">

        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="Hexagon" size={28} className="text-primary" />
            <h1 className="text-3xl font-bold text-white font-orbitron">Создание логотипов</h1>
          </div>
          <p className="text-muted-foreground">Логотип для бизнеса, фирменный стиль и аватары для соцсетей</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setGenerated(false) }} className="w-full">
              <TabsList className="w-full bg-card border border-border mb-4">
                <TabsTrigger value="company" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Building2" size={14} className="mr-1" />Для компании
                </TabsTrigger>
                <TabsTrigger value="social" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Icon name="Share2" size={14} className="mr-1" />Для соцсетей
                </TabsTrigger>
              </TabsList>

              {/* ===== ЛОГОТИП КОМПАНИИ ===== */}
              <TabsContent value="company" className="space-y-4">

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="PenLine" size={16} className="text-primary" />
                      О компании
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm mb-1.5 block">Название компании</Label>
                      <Input
                        placeholder="Например: NovaTech, «Берёзка», Studio88..."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="bg-background border-border text-white placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-1.5 block">Чем занимается компания</Label>
                      <Textarea
                        placeholder="Опишите продукт или услугу, ценности, целевую аудиторию..."
                        value={companyDesc}
                        onChange={(e) => setCompanyDesc(e.target.value)}
                        rows={3}
                        className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-1.5 block">Слоган (необязательно)</Label>
                      <Input
                        placeholder="Just Do It, Think Different..."
                        value={companySlogan}
                        onChange={(e) => setCompanySlogan(e.target.value)}
                        className="bg-background border-border text-white placeholder:text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="LayoutGrid" size={16} className="text-primary" />
                      Отрасль
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {INDUSTRIES.map((ind) => (
                        <div
                          key={ind.id}
                          onClick={() => setSelectedIndustry(ind.id)}
                          className={`rounded-lg border-2 p-2 cursor-pointer transition-colors text-center ${
                            selectedIndustry === ind.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-xl mb-1">{ind.icon}</div>
                          <p className={`text-xs leading-tight ${selectedIndustry === ind.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{ind.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Shapes" size={16} className="text-primary" />
                      Стиль логотипа
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LOGO_STYLES.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedStyle(s.id)}
                          className={`rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                            selectedStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className={`text-sm font-medium ${selectedStyle === s.id ? "text-primary" : "text-white"}`}>{s.label}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Palette" size={16} className="text-primary" />
                      Основной цвет
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_COLORS.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedColor(c.id)}
                          className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 cursor-pointer transition-colors ${
                            selectedColor === c.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                          <span className={`text-xs ${selectedColor === c.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Package" size={16} className="text-primary" />
                      Фирменный стиль
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      onClick={() => setBrandPackage(!brandPackage)}
                      className={`rounded-lg border-2 p-4 cursor-pointer transition-colors flex items-center justify-between ${
                        brandPackage ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-medium ${brandPackage ? "text-primary" : "text-white"}`}>Разработать фирменный стиль</p>
                        <p className="text-muted-foreground text-xs mt-0.5">Логотип + визитка + фирменные цвета + шрифты + паттерн</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-3 ${brandPackage ? "border-primary bg-primary" : "border-border"}`}>
                        {brandPackage && <Icon name="Check" size={12} className="text-white" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>

              {/* ===== ЛОГОТИП ДЛЯ СОЦСЕТЕЙ ===== */}
              <TabsContent value="social" className="space-y-4">

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="PenLine" size={16} className="text-primary" />
                      Описание аккаунта
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm mb-1.5 block">Название / Никнейм</Label>
                      <Input
                        placeholder="@my_brand, Студия «Свет»..."
                        value={socialName}
                        onChange={(e) => setSocialName(e.target.value)}
                        className="bg-background border-border text-white placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm mb-1.5 block">О чём аккаунт</Label>
                      <Textarea
                        placeholder="Например: фотограф, lifestyle-блог, магазин украшений, кулинарный канал..."
                        value={socialDesc}
                        onChange={(e) => setSocialDesc(e.target.value)}
                        rows={3}
                        className="bg-background border-border text-white placeholder:text-muted-foreground resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Share2" size={16} className="text-primary" />
                      Платформы
                      <Badge variant="outline" className="border-primary/50 text-primary text-xs ml-auto">
                        Выбрано: {selectedPlatforms.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SOCIAL_PLATFORMS.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={`rounded-lg border-2 p-3 cursor-pointer transition-colors text-center ${
                            selectedPlatforms.includes(p.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-xl mb-1">{p.icon}</div>
                          <p className={`text-xs font-medium ${selectedPlatforms.includes(p.id) ? "text-primary" : "text-white"}`}>{p.label}</p>
                          <p className="text-muted-foreground text-xs">{p.size}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Shapes" size={16} className="text-primary" />
                      Стиль
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LOGO_STYLES.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setSocialStyle(s.id)}
                          className={`rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                            socialStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className={`text-sm font-medium ${socialStyle === s.id ? "text-primary" : "text-white"}`}>{s.label}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Icon name="Palette" size={16} className="text-primary" />
                      Цвет
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {BRAND_COLORS.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setSocialColor(c.id)}
                          className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 cursor-pointer transition-colors ${
                            socialColor === c.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                          <span className={`text-xs ${socialColor === c.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>
            </Tabs>
          </div>

          {/* Боковая панель */}
          <div className="space-y-4">

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Icon name="Eye" size={16} className="text-primary" />
                  Предпросмотр
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generated ? (
                  <div
                    className="aspect-square rounded-xl flex flex-col items-center justify-center p-6 text-center"
                    style={{ background: `linear-gradient(135deg, ${currentColor?.color}22, ${currentColor?.color}11)`, border: `2px solid ${currentColor?.color}44` }}
                  >
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 text-3xl font-bold text-white"
                      style={{ backgroundColor: currentColor?.color }}
                    >
                      {(activeTab === "company" ? companyName : socialName).charAt(0).toUpperCase() || "L"}
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">
                      {(activeTab === "company" ? companyName : socialName) || "Логотип"}
                    </p>
                    {activeTab === "company" && companySlogan && (
                      <p className="text-muted-foreground text-xs mt-1 italic">{companySlogan}</p>
                    )}
                    {activeTab === "social" && selectedPlatforms.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap justify-center">
                        {selectedPlatforms.slice(0, 4).map(id => (
                          <span key={id} className="text-xs text-muted-foreground bg-border px-1.5 py-0.5 rounded">
                            {SOCIAL_PLATFORMS.find(p => p.id === id)?.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-background border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-4">
                    <Icon name="Hexagon" size={36} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">Заполните форму</p>
                    <p className="text-muted-foreground text-xs mt-1">и нажмите «Создать»</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {activeTab === "company" && brandPackage && (
              <Card className="bg-primary/5 border-primary/30">
                <CardContent className="pt-4">
                  <p className="text-primary text-sm font-medium mb-2">Входит в фирменный стиль:</p>
                  <ul className="space-y-1">
                    {["Логотип (все варианты)", "Визитная карточка", "Фирменные цвета", "Типографика", "Паттерн / текстура"].map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="Check" size={12} className="text-primary flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-11"
              onClick={handleGenerate}
              disabled={isGenerating || (activeTab === "company" ? !companyName : !socialName)}
            >
              {isGenerating
                ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Создаём...</>
                : <><Icon name="Sparkles" size={16} className="mr-2" />Создать логотип</>
              }
            </Button>

            {generated && (
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-border text-white bg-transparent">
                  <Icon name="Download" size={14} className="mr-2" />Скачать PNG
                </Button>
                <Button variant="outline" className="w-full border-border text-white bg-transparent">
                  <Icon name="FileDown" size={14} className="mr-2" />Скачать SVG
                </Button>
                {brandPackage && activeTab === "company" && (
                  <Button variant="outline" className="w-full border-border text-white bg-transparent">
                    <Icon name="Package" size={14} className="mr-2" />Скачать фирстиль
                  </Button>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
