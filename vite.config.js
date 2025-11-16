import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import tailwindcss from "tailwindcss"

import { resolve } from "path"
// 路径查找
const pathResolve = (dir) => {
    return resolve(__dirname, ".", dir)
}
// 设置别名
const alias = {
    "/@": pathResolve("src"),
    "@": pathResolve("src"),
    "@build": pathResolve("build"),
    "@components": pathResolve("src/components"),
    "@utils": pathResolve("src/utils"),
    "@api": pathResolve("src/api"),
}
// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias,
    },
    css: {
        postcss: {
            plugins: [tailwindcss],
        },
        preprocessorOptions: {
            scss: { api: 'modern-compiler' },
        },
    },
    plugins: [
        vue(),

        AutoImport({
            resolvers: [ElementPlusResolver()],
            imports: [
                "vue", // 你可以选择从 'vue' 导入 ref, reactive 等
            ],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    server: {
        port: 6789,  // 设置端口号为 5555
        // ... other server options ...
    },
})
