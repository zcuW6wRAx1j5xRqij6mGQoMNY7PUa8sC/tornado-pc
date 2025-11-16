import { http } from '@/utils/http'
// 获取质押配置
export const getPledgeConfigApi = () => {
    return http.request('get', '/api/app/order/pledge')
}

// 质押申请
export const pledgeApi = (data) => {
    return http.request('post', '/api/app/order/pledge/apply', { data })
}

// 申请记录
export const pledgeRecordApi = (params) => {
    return http.request('get', '/api/app/order/pledge/orders', { params })
}
