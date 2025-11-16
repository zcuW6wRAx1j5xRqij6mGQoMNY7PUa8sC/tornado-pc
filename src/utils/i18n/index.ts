// index.ts
import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import en from './en.js'
import es from './es.js'
import fr from './fr.js'
import it from './it.js'
import de from './de.js'
const messages = {
    'zh_CN': zh,
    'en': en,
    'es': es, // 西班牙
    'fr': fr, // 法语
    'it': it, // 意大利
    'de': de, // 德语
}
// 尝试从 localStorage 获取语言设置
let locale = localStorage.getItem('language')
// 如果 localStorage 中没有语言设置，那就使用默认的语言
if (!locale) {
    locale = 'en'
}
const i18n = createI18n({
    locale: locale, // 设置默认语言
    fallbackLocale: 'en', // 设置备用语言
    legacy: false,
    messages,
})

export default i18n
