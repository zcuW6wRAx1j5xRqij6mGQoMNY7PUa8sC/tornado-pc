import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from '@/store'
// 引入重置样式
import './style/reset.scss'
import './assets/font/font.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 导入公共样式
import './style/index.scss'
import './style/Tailwind.css'
import i18n from './utils/i18n'
const app = createApp(App)
setupStore(app)
app.use(i18n).use(router).mount('#app')

// 声明JivoChat全局函数
window.jivoWidgetLoaded = false;
window.jivo_onLoadCallback = function () {
    window.jivoWidgetLoaded = true;
}