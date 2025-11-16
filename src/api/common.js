import { http } from '@/utils/http'

// 获取验证码-未登录
export const getCodeApi = data => {
    return http.request('post', '/api/app/captcha', { data })
}

// 获取验证码-已登录
export const getCodeLoginApi = data => {
    return http.request('post', '/api/app/account/captcha', { data })
}

// 国际区号
export const getAreaCodeApi = () => {
    return http.request('get', '/api/app/account/area_code')
}

// 获取上传地址
export const getUploadApi = data => {
    return http.request('post', '/api/app/images/upload', { data })
}

// 国家列表
export const getCountryApi = () => {
    return http.request('get', '/api/app/country')
}

// 平台支持的杠杆列表
export const getLeverApi = () => {
    return http.request('get', '/api/app/leverages')
}
// 支持提现的货币列表
export const getWithdrawApi = () => {
    return http.request('get', '/api/app/wallet/withdraw/coins')
}
// 弹窗公告列表
export const announcementListApi = params => {
    return http.request('get', '/api/app/announcement', { params })
}


// 已读反馈 (让用户点击个按钮)
export const readAnnouncementApi = data => {
    return http.request('post', '/api/app/announcement/read', { data })
}
