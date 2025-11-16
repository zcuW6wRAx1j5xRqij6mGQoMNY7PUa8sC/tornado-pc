import { defineStore } from "pinia"
// import { getSignOut } from '@api/system/user'
import router from "/@/router"
export const useUserStore = defineStore({
    id: "pure-user",
    state: () => ({
        userInfo: null,
        curCurrency: "", // 当前货币类型
        centrifuge: null, // socket
        bookPriceInfo: {}, // 现货 合约交易右侧订单书价格
        symbolId: null, // 合约交易
        symbolInfo: {
            derivative_id: null,
        },
    }),
    actions: {
        setUserInfo(userInfo) {
            localStorage.setItem("userInfo", JSON.stringify(userInfo))
            this.userInfo = userInfo
        },
        // 登出
        logOut() {
            localStorage.removeItem("token")
            this.setUserInfo(null)
            router.replace("/Login")
        },
    },
    getters: {
        userInfoData(state) {
            return state.userInfo
                ? state.userInfo
                : JSON.parse(localStorage.getItem("userInfo") || '{}') || {}
        },
    },
})

export function useUserStoreHook() {
    return useUserStore()
}
