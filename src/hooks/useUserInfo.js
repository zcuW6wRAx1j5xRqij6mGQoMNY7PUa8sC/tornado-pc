import { getMyInfoApi } from '@/api/my'
export function useUserInfo() {
    const userInfo = ref([])
    function initUserData() {
        getMyInfoApi()
            .then(data => {
                userInfo.value = data || {}
                localStorage.setItem('is_verified_identity', data.is_verified_identity)
            })
            .finally(() => {})
    }
    initUserData()
    return { userInfo, initUserData }
}
