const Layout = () => import('@/layout/Index.vue')

const fnRouter = {
    path: '/',
    component: Layout,
    children: [
        // {
        //     path: '/',
        //     redirect: '/TradingList',
        // },
        {
            path: '/',
            // redirect: '/homePage',
            component: () => import('@/views/home/HomePage.vue'),
            meta: {
                title: '首页',
                id: 'homePage',
            },
        },
        
        {
            path: '/NewB',
            component: () => import('@/views/trading/NewB.vue'),
            meta: {
                title: '现货交易',
                id: '/NewB',
            },
        },
        {
            path: '/TradingList',
            component: () => import('@/views/trading/TradingList.vue'),
            meta: {
                title: '现货交易',
                id: 'TradingList',
            },
        },
        {
            path: '/ContractTradingList',
            component: () => import('@/views/trading/TradingList.vue'),
            meta: {
                title: '合约交易',
                id: 'ContractTradingList',
            },
        },
        {
            path: '/SpotTrading', // 现货交易图表(＾－＾)V
            component: () => import('/@/views/trading/SpotTrading.vue'),
            meta: {
                title: '现货交易购买',
                id: '/TradingList',
            },
        },

        {
            path: '/ContractTrading',
            component: () => import('@/views/trading/ContractTrading.vue'),
            meta: {
                title: '合约交易购买',
                id: '/ContractTradingList',
            },
        },
        {
            path: '/MyAssets',
            component: () => import('@/views/myAssets/Index.vue'),
            meta: {
                title: '我的资产',
            },
        },
        // {
        //     path: '/Recharge',
        //     component: () => import('@/views/recharge/Index.vue'),
        //     meta: {
        //         title: '快速充币',
        //         id: 'recharge',
        //     },
        // },
        {
            path: '/AboutUs',
            component: () => import('@/views/aboutUs/Index.vue'),
            meta: {
                title: '关于我们',
                id: 'aboutUs',
            },
        },
        {
            path: '/Agree',
            component: () => import('@/views/home/Agree.vue'),
            meta: {
                title: '关于我们',
                id: '/Agree',
            },
        },
        {
            path: '/IEO',
            component: () => import('@/views/IEO/IEO.vue'),
            meta: {
                title: 'IEO',
                id: '/IEO',
            },
        },
        {
            path: '/Vote',
            component: () => import('@/views/home/Vote.vue'),
            meta: {
                title: '投票',
                id: '/Vote',
            },
        },
        {
            path: '/AI',
            component: () => import('@/views/AI/AI.vue'),
            meta: {
                title: 'AI量化',
            },
        },
        {
            path: '/Defi',
            component: () => import('@/views/defn/Defn.vue'),
            meta: {
                title: 'Defn质押',
                id: 'Defi'
            },
        },
        {
            path: '/OTC',
            component: () => import('@/views/otc/OTC.vue'),
            meta: {
                title: 'OTC交易',
                id: 'OTC',
            },
        },
    ],
}

export default fnRouter
