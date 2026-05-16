import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Icon from "@/components/ui/icon"
import { OAuthButtons } from "@/components/auth-oauth-buttons"

interface ErrorBoxProps {
  text: string
}

function ErrorBox({ text }: ErrorBoxProps) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      <Icon name="AlertCircle" size={14} />
      {text}
    </div>
  )
}

interface AuthTabsProps {
  activeTab: "login" | "register"
  onTabChange: (v: string) => void
  loginData: { email: string; password: string }
  setLoginData: (d: { email: string; password: string }) => void
  loginError: string
  isLoading: boolean
  onLogin: (e: React.FormEvent) => void
  onForgotClick: () => void
  registerData: { name: string; email: string; password: string; confirm: string }
  setRegisterData: (d: { name: string; email: string; password: string; confirm: string }) => void
  registerError: string
  termsAccepted: boolean
  setTermsAccepted: (v: boolean) => void
  onOpenTerms: () => void
  onRegister: (e: React.FormEvent) => void
}

export function AuthTabs({
  activeTab,
  onTabChange,
  loginData,
  setLoginData,
  loginError,
  isLoading,
  onLogin,
  onForgotClick,
  registerData,
  setRegisterData,
  registerError,
  termsAccepted,
  setTermsAccepted,
  onOpenTerms,
  onRegister,
}: AuthTabsProps) {
  const navigate = useNavigate()

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-2">
      <TabsList className="w-full bg-background border border-border">
        <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
          Вход
        </TabsTrigger>
        <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground">
          Регистрация
        </TabsTrigger>
      </TabsList>

      {/* Вход */}
      <TabsContent value="login" className="mt-4">
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
            <Input
              type="email"
              placeholder="example@mail.ru"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="bg-white border-border text-black placeholder:text-gray-400"
              required
              autoFocus
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-muted-foreground text-sm">Пароль</Label>
              <button
                type="button"
                className="text-primary text-xs hover:underline"
                onClick={onForgotClick}
              >
                Забыли пароль?
              </button>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="bg-white border-border text-black placeholder:text-gray-400"
              required
            />
          </div>
          {loginError && <ErrorBox text={loginError} />}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
            {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Входим...</> : "Войти"}
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <span className="text-muted-foreground text-xs">или войти через</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <OAuthButtons />
        </div>
        <p className="text-center text-muted-foreground text-sm mt-4">
          Нет аккаунта?{" "}
          <button className="text-primary hover:underline" onClick={() => onTabChange("register")}>
            Зарегистрироваться
          </button>
        </p>
      </TabsContent>

      {/* Регистрация */}
      <TabsContent value="register" className="mt-4">
        <form onSubmit={onRegister} className="space-y-3">
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Имя</Label>
            <Input
              type="text"
              placeholder="Ваше имя"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              className="bg-white border-border text-black placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
            <Input
              type="email"
              placeholder="example@mail.ru"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="bg-white border-border text-black placeholder:text-gray-400"
              required
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Пароль</Label>
            <Input
              type="password"
              placeholder="Минимум 6 символов"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="bg-white border-border text-black placeholder:text-gray-400"
              required
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-1.5 block">Подтвердите пароль</Label>
            <Input
              type="password"
              placeholder="Повторите пароль"
              value={registerData.confirm}
              onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })}
              className="bg-white border-border text-black placeholder:text-gray-400"
              required
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer group pt-1">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(v) => setTermsAccepted(!!v)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Я ознакомился и принимаю{" "}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-primary hover:underline"
              >
                Пользовательское соглашение
              </button>
              {" "}и{" "}
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className="text-primary hover:underline"
              >
                Политику конфиденциальности
              </button>
            </span>
          </label>
          {registerError && <ErrorBox text={registerError} />}
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-1" disabled={isLoading || !termsAccepted}>
            {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Создаём аккаунт...</> : "Зарегистрироваться"}
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <span className="text-muted-foreground text-xs">или войти через</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <OAuthButtons />
        </div>
        <div className="mt-3 pt-3 border-t border-border text-center">
          <p className="text-muted-foreground text-xs">
            Уже есть аккаунт?{" "}
            <button type="button" className="text-primary hover:underline" onClick={() => onTabChange("login")}>Войти</button>
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
