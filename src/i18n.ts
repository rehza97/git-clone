import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import ar from "./locales/ar.json"
import fr from "./locales/fr.json"

const STORAGE_KEY = "ascap-lang"

export const defaultNS = "translation" as const
export const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
} as const

const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
const lng = (saved && (saved === "en" || saved === "ar" || saved === "fr")) ? saved : "en"

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: "en",
  defaultNS,
  interpolation: { escapeValue: false },
})

export function persistLanguage(lang: string) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lang)
  }
  document.documentElement.lang = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en"
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
}

// Set initial dir/lang
persistLanguage(lng)

export default i18n
