const Layout = () => import('@/layout/Index.vue')

const baseRouter = {
    path: '/',
    component: Layout,
    redirect: '/403',
    meta: {
        icon: 'information-line',
        title: '错误页面',
        rank: 9,
    },
    children: [
        {
            path: '/403',
            name: '403',
            component: () => import('@/views/base/403.vue'),
            meta: {
                title: 403,
            },
        },
        {
            path: '/404',
            name: '404',
            component: () => import('@/views/base/404.vue'),
            meta: {
                title: 404,
            },
        },
    ],
}

export default baseRouter
