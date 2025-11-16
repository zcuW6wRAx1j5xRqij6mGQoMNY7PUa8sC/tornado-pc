import Axios from "axios"
import qs from "qs"
import { useUserStoreHook } from "@/store/modules/user"
import { errorMessage } from "@/utils/message"
import router from "@/router"
const useUserStore = useUserStoreHook()
// 加载环境变量 VITE_PROXY_DOMAIN（开发环境）  VITE_PROXY_DOMAIN_REAL（打包后的线上环境）
const { VITE_PROXY_DOMAIN, VITE_PROXY_DOMAIN_REAL } = import.meta.env
console.log(VITE_PROXY_DOMAIN)
console.log(VITE_PROXY_DOMAIN_REAL)
// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig = {
    baseURL: VITE_PROXY_DOMAIN_REAL,
    timeout: 10000,
    headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
    // 数组格式参数序列化
    paramsSerializer: (params) => qs.stringify(params, { indices: false }),
}

class PureHttp {
    constructor() {
        // 添加请求缓存相关的属性
        this.pendingRequests = new Map() // 存储待处理的请求
        this.requestCache = new Map() // 存储请求缓存

        this.httpInterceptorsRequest()
        this.httpInterceptorsResponse()
    }

    // 获取请求的唯一key
    getRequestKey(config) {
        const { method, url, params, data } = config
        return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
    }

    // 检查是否有相同请求正在进行中
    checkPendingRequest(config) {
        const requestKey = this.getRequestKey(config)
        if (this.requestCache.has(requestKey)) {
            return this.requestCache.get(requestKey)
        }
        return null
    }

    // 缓存请求
    cacheRequest(config, promise) {
        const requestKey = this.getRequestKey(config)
        this.requestCache.set(requestKey, promise)

        // 请求完成后删除缓存
        promise.finally(() => {
            this.requestCache.delete(requestKey)
        })
    }

    // 取消重复请求
    cancelPendingRequest(url, method) {
        const key = `${method}:${url}`
        if (this.pendingRequests.has(key)) {
            const cancel = this.pendingRequests.get(key)
            cancel('Request canceled due to duplicate request')
            this.pendingRequests.delete(key)
        }
    }

    // 初始化配置对象
    static initConfig = {}

    // 保存当前Axios实例对象
    static axiosInstance = Axios.create(defaultConfig)

    // 请求拦截
    httpInterceptorsRequest() {
        PureHttp.axiosInstance.interceptors.request.use(
            (config) => {
                const $config = config
                // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
                if (typeof config.beforeRequestCallback === "function") {
                    config.beforeRequestCallback($config)
                    return $config
                }
                if (PureHttp.initConfig.beforeRequestCallback) {
                    PureHttp.initConfig.beforeRequestCallback($config)
                    return $config
                }
                const lang = localStorage.getItem("language") || "en"
                config.headers["Accept-Language"] = lang
                config.headers["X-Device-Type"] = 'web'

                const token = localStorage.getItem("token")
                if (token) {
                    config.headers["Authorization"] = `Bearer ${token}`
                    return $config
                } else {
                    return $config
                }
            },
            (error) => {
                return Promise.reject(error)
            }
        )
    }

    // 响应拦截
    httpInterceptorsResponse() {
        const instance = PureHttp.axiosInstance
        instance.interceptors.response.use(
            (response) => {
                const $config = response.config
                // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
                if (typeof $config.beforeResponseCallback === "function") {
                    $config.beforeResponseCallback(response)
                    return response.data
                }
                if (PureHttp.initConfig.beforeResponseCallback) {
                    PureHttp.initConfig.beforeResponseCallback(response)
                    return response.data
                }
                if (
                    response.headers["content-type"].includes(
                        "application/vnd.ms-excel"
                    )
                ) {
                    return Promise.resolve(response)
                } else if (response.headers["content-type"] === "image/jpeg") {
                    const url = window.URL.createObjectURL(response.data)
                    return Promise.resolve(url)
                } else {
                    const responseCode = response.status
                    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
                    // 否则的话抛出错误
                    if (responseCode === 200 && response.data?.code === 0) {
                        return Promise.resolve(response.data?.data)
                    } else if (
                        responseCode === 200 &&
                        response.data.code === 422
                    ) {
                        console.log(response)
                        return Promise.reject(response.data.errors)
                    } else {
                        errorShow(response.data.msg || response.data.message)
                        return Promise.reject(response.data)
                    }
                }
            },
            (error) => {
                if (error.response?.data?.code === 422) {
                    return Promise.reject(error.response.data?.data.errors)
                }
                if (error?.response?.status === 401) {
                    localStorage.removeItem("token")
                    useUserStore.setUserInfo(null)
                    router.push("/Login")
                    return
                }
                const $error = error
                $error.isCancelRequest = Axios.isCancel($error)
                if (
                    $error?.response?.data &&
                    ($error?.response?.data["msg"] ||
                        $error?.response?.data["message"])
                ) {
                    errorShow(
                        $error.response.data["msg"] ||
                        $error.response.data["message"]
                    )
                }
                // 所有的响应异常 区分来源为取消请求/非取消请求
                return Promise.reject($error)
            }
        )
    }

    // 修改request方法，添加重复请求检查
    request(method, url, param, axiosConfig) {
        const config = {
            method,
            url,
            ...param,
            ...axiosConfig,
        }

        // 检查是否有相同请求正在进行中
        const pendingRequest = this.checkPendingRequest(config)
        if (pendingRequest) {
            return pendingRequest
        }

        // 发起新请求
        const promise = new Promise((resolve, reject) => {
            PureHttp.axiosInstance
                .request(config)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    if (error?.response?.status === 401) {
                        localStorage.removeItem("token")
                        useUserStore.setUserInfo(null)
                        router.push("/Login")
                        return
                    }
                    reject(error)
                })
        })

        // 缓存请求
        this.cacheRequest(config, promise)

        return promise
    }

    // 单独抽离的post工具函数
    post(url, params, config) {
        return this.request("post", url, params, config)
    }

    // 单独抽离的get工具函数
    get(url, params, config) {
        return this.request("get", url, params, config)
    }
}
function errorShow(msg) {
    if (msg !== sessionStorage.getItem("errorTxt") && msg) {
        errorMessage(msg)
        sessionStorage.setItem("errorTxt", msg)
        setTimeout(() => {
            sessionStorage.removeItem("errorTxt")
        }, 2000)
    }
}
export const http = new PureHttp()
