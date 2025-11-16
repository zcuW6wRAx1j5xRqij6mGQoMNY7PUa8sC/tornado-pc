import { createRouter, createWebHistory } from "vue-router"
import fnRouter from "./modules/fn"
import baseRouter from "./modules/base"
import i18n from '@/utils/i18n';
import { ElMessage } from 'element-plus'
const routes = [{
    path: '/Login',
    component: () => import('@/views/login/LoginPage.vue'),
    meta: {
        title: '登录',
        id: 'login',
    },
},
{
    path: '/ForgetPwd',
    component: () => import('@/views/login/ForgetPwd.vue'),
    meta: {
        title: '忘记密码',
        id: 'forgetPwd',
    },
},
{
    path: '/Register',
    component: () => import('@/views/login/Register.vue'),
    meta: {
        title: '注册',
        id: 'register',
    },
},fnRouter, baseRouter]
const router = createRouter({
    history: createWebHistory(),
    routes: routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
})
router.addRoute({
    path: "/:pathMatch(.*)",
    redirect: "/404",
})
router.beforeEach((to, from, next) => {
    console.log(to.path);
    if (
        to.path.includes("Login") ||
        to.path.includes("Register") ||
        to.path.includes("ForgetPwd") ||
        to.path.includes("Home") ||
        to.path === '/'
    ) {
        next()
        return
    }
    const token = localStorage.getItem("token")
    if (!token && to.path !== "/Login") {
        ElMessage.warning(i18n.global.t('loginTip'))
        next("/Login")
        return
    }
        // 初始化客服
        // _MEIQIA('metadata', {
        //     name: localStorage.getItem('uid'),
        // })

    next()
})
export default router
