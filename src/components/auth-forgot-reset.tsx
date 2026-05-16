import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      <Icon name="AlertCircle" size={14} />
      {text}
    </div>
  )
}

interface ForgotScreenProps {
  forgotEmail: string
  setForgotEmail: (v: string) => void
  forgotError: string
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

export function ForgotScreen({
  forgotEmail,
  setForgotEmail,
  forgotError,
  isLoading,
  onSubmit,
  onBack,
}: ForgotScreenProps) {
  return (
    <div className="mt-2">
      <button
        className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-white mb-4 transition-colors"
        onClick={onBack}
      >
        <Icon name="ChevronLeft" size={14} />
        Назад
      </button>
      <p className="text-white font-medium mb-1">Восстановление пароля</p>
      <p className="text-muted-foreground text-sm mb-4">
        Введите email — мы пришлём код для сброса пароля.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-sm mb-1.5 block">Email</Label>
          <Input
            type="email"
            placeholder="example@mail.ru"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="bg-white border-border text-black placeholder:text-gray-400"
            required
            autoFocus
          />
        </div>
        {forgotError && <ErrorBox text={forgotError} />}
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
          {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</> : "Получить код"}
        </Button>
      </form>
    </div>
  )
}

interface ResetScreenProps {
  codeFromServer: string
  resetCode: string
  setResetCode: (v: string) => void
  resetNewPwd: string
  setResetNewPwd: (v: string) => void
  resetConfirm: string
  setResetConfirm: (v: string) => void
  resetError: string
  resetSuccess: boolean
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  onSuccessLogin: () => void
}

export function ResetScreen({
  codeFromServer,
  resetCode,
  setResetCode,
  resetNewPwd,
  setResetNewPwd,
  resetConfirm,
  setResetConfirm,
  resetError,
  resetSuccess,
  isLoading,
  onSubmit,
  onBack,
  onSuccessLogin,
}: ResetScreenProps) {
  return (
    <div className="mt-2">
      {!resetSuccess ? (
        <>
          <button
            className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-white mb-4 transition-colors"
            onClick={onBack}
          >
            <Icon name="ChevronLeft" size={14} />
            Назад
          </button>
          <p className="text-white font-medium mb-1">Введите код и новый пароль</p>

          {codeFromServer && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-4">
              <p className="text-yellow-400 text-xs mb-1 flex items-center gap-1.5">
                <Icon name="Info" size={12} />
                Email-уведомления не настроены — используйте код ниже:
              </p>
              <p className="text-yellow-300 font-mono text-2xl font-bold tracking-widest text-center">{codeFromServer}</p>
              <p className="text-yellow-500 text-xs text-center mt-1">Действует 30 минут</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Код подтверждения</Label>
              <Input
                type="text"
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="bg-white border-border text-black placeholder:text-gray-400 font-mono text-center text-lg tracking-widest"
                maxLength={6}
                required
                autoFocus={!codeFromServer}
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Новый пароль</Label>
              <Input
                type="password"
                placeholder="Минимум 6 символов"
                value={resetNewPwd}
                onChange={(e) => setResetNewPwd(e.target.value)}
                className="bg-white border-border text-black placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-sm mb-1.5 block">Подтвердите пароль</Label>
              <Input
                type="password"
                placeholder="Повторите пароль"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                className="bg-white border-border text-black placeholder:text-gray-400"
                required
              />
            </div>
            {resetError && <ErrorBox text={resetError} />}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
              {isLoading ? <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Сохраняем...</> : "Сохранить новый пароль"}
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Icon name="CheckCircle" size={28} className="text-green-400" />
          </div>
          <p className="text-white font-medium text-lg mb-1">Пароль изменён!</p>
          <p className="text-muted-foreground text-sm mb-5">Теперь войдите с новым паролем</p>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={onSuccessLogin}
          >
            Войти
          </Button>
        </div>
      )}
    </div>
  )
}
