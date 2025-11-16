import { http } from '@/utils/http'

// 登录
export const loginApi = data => {
    return http.request('post', '/api/app/signin', { data })
}

// 注册
export const registerApi = data => {
    return http.request('post', '/api/app/signup', { data })
}

// 忘记密码
export const forgetPasswordApi = data => {
    return http.request('post', '/api/app/account/forget_password', { data })
}
