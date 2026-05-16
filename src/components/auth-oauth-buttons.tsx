import { AUTH_URL } from "@/lib/auth"

const YANDEX_AUTH_URL = `${AUTH_URL}/yandex`
const VK_AUTH_URL = `${AUTH_URL}/vk`
const MAILRU_AUTH_URL = `${AUTH_URL}/mailru`

export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <a
        href={YANDEX_AUTH_URL}
        className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-[#FC3F1D] hover:bg-[#e8381a] text-white text-sm font-medium py-2 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.706 2H11.13C7.645 2 5.5 3.887 5.5 7.04c0 2.74 1.3 4.257 3.747 5.832L5.5 22h3.47l3.882-9.558-.117-.073C10.64 10.95 9.47 9.8 9.47 7.24c0-1.83 1.077-2.89 3.16-2.89h1.076V22H17V2h-3.294z" fill="white"/>
        </svg>
        Войти через Яндекс
      </a>
      <a
        href={VK_AUTH_URL}
        className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-[#0077FF] hover:bg-[#0066dd] text-white text-sm font-medium py-2 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.366 1.26 2.182 1.817.616.42 1.084.328 1.084.328l2.18-.03s1.137-.071.598-1.223c-.044-.093-.313-.66-1.61-1.867-1.36-1.265-1.178-1.06.46-3.246.999-1.33 1.398-2.142 1.272-2.49-.12-.332-.855-.244-.855-.244l-2.455.015s-.182-.025-.317.056c-.132.079-.217.264-.217.264s-.386 1.026-.9 1.899c-1.085 1.843-1.52 1.94-1.698 1.825-.413-.267-.31-1.074-.31-1.646 0-1.79.271-2.535-.528-2.727-.265-.064-.46-.107-1.137-.114-.87-.009-1.605.003-2.02.207-.277.135-.49.437-.36.454.161.021.525.098.719.362.25.341.241 1.107.241 1.107s.144 2.108-.335 2.372c-.329.18-.78-.187-1.748-1.86-.497-.858-.872-1.808-.872-1.808s-.072-.178-.202-.274c-.156-.115-.375-.151-.375-.151l-2.33.015s-.35.01-.479.163c-.114.136-.009.417-.009.417s1.826 4.271 3.893 6.422c1.896 1.976 4.047 1.846 4.047 1.846h.976z" fill="white"/>
        </svg>
        Войти через ВКонтакте
      </a>
      <a
        href={MAILRU_AUTH_URL}
        className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-[#005FF9] hover:bg-[#004ed4] text-white text-sm font-medium py-2 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.64l-4.93 3.04-4.93-3.04H16.93zM17 15.36H7V9.48l5 3.08 5-3.08v5.88z" fill="white"/>
        </svg>
        Войти через Mail.ru
      </a>
    </div>
  )
}