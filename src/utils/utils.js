import { isEmpty } from "@/utils/is"
import JSEncrypt from "jsencrypt/bin/jsencrypt.min.js"
import Decimal from "decimal.js"
export const baseUrl = import.meta.env.VITE_IMG_DOMAIN_REAL

/**
 * @author: linBin
 * @Date: 2022-09-14 14:48:39
 * @description: 对象属性设置
 * @param {object} obj
 * @return {*}
 */
export const setObjectDefault = (obj, setObj = {}) => {
    Object.keys(obj).forEach((key) => {
        obj[key] = setObj[key] || ""
    })
    return obj
}
// 加密
export const setPublicKey = (val = "") => {
    if (val === "") {
        return ""
    } else {
        const encryptor = new JSEncrypt()
        // 设置公钥
        encryptor.setPublicKey(
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAviSuCu4Yg/WAyjp06qiaE/ioI2M/ACT9UTUVxWtM7IZlXMQZPjLn0H1x0zmJ/VLIhnBliyb06QLvtrrBFRt4jnOJR5LjoTg/g8XYdVXN6a+XFjqFvOUPgzZ7OdywOoXxiO+M7WrvT0XgqyBqCnDADpY1eucDqfIDYYOBHKbtMkh0N4ZVBcfULb1Sm+Q7ed+jUa8eXPQPhMrWvhQkIeZJh+hCIrNjXUxyfZPh1tSvqoJYArbyHZs8LnbUtjIQCx9OlR9+xJTx3L9h89I4D+hqA4CZqxUzfibsu5XgYKnoSri2OCR2FefSfYlCd8Fysp0wET/r1L141qnhoMQtrUs8jwIDAQAB"
        )
        // 加密数据
        return encryptor.encrypt(val)
    }
}
// 解密
export const getPublicKey = (val = "") => {
    if (val === "") {
        return ""
    } else {
        const encryptor = new JSEncrypt()
        // 设置公钥
        encryptor.setPrivateKey(
            "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+JK4K7hiD9YDKOnTqqJoT+KgjYz8AJP1RNRXFa0zshmVcxBk+MufQfXHTOYn9UsiGcGWLJvTpAu+2usEVG3iOc4lHkuOhOD+Dxdh1Vc3pr5cWOoW85Q+DNns53LA6hfGI74ztau9PReCrIGoKcMAOljV65wOp8gNhg4Ecpu0ySHQ3hlUFx9QtvVKb5Dt536NRrx5c9A+Eyta+FCQh5kmH6EIis2NdTHJ9k+HW1K+qglgCtvIdmzwudtS2MhALH06VH37ElPHcv2Hz0jgP6GoDgJmrFTN+Juy7leBgqehKuLY4JHYV59J9iUJ3wXKynTARP+vUvXjWqeGgxC2tSzyPAgMBAAECggEAMhFkhtpFOFIoFJgp+zRkRgf+9jqG91nGHmEVF4P2oH2PKUs1vmwXII43r8AB9uOai9QC2Q5sBQNR7dLlTtKJ/zCrIF6sc+JkzyUEp3jtnLAw35iPaLsER6/L6OOUwARPIpi5ijbTRxOGYmlJovAnkm+5K2CzVUe13jKLh+joool/ReZk0Rsr4tVLSLmvzDA/sRwYun0x0+jl5EZSQfwsVyN9bD5rY/In/EuvH9yj5R4lPe+mimF4Os6IgTsP5LzqDTAiFx5NNioFRJ2SkcTmM0CZQeMIBuvvF2HCtJlDEfCytD7wYup3GBvar2ccOe9T3YhJdsj5bfAJHVJtamxQwQKBgQDnYReMMzqAh2HOFL8QymzOjImsrOz6NCZatq38TU1hSe9PK+C0sFGhkd788y4AuURS1Btu4i7F+hOYcj1z3L+NSPGE3yLHVjakMrrNbA9rwG/t7oU0cG7d0WWM9bcTQiCSNcUyt69BGH3dZdqee1tITzqghE7+gh9RYiVcI6/8LwKBgQDSYEuWFLMUsR/s7unSHCucuEXjwbYrvknv8Y81sjvrWktNXrJoYlbGy/7HYA6lxzchtSxhPuUSjopwQ5scgMhqf8Gxz7jsDN9ak2dErF7cWRFYfh6aKhkbEw9oG01jIX15MK0TbMafoJslDhPQF1cP9i0+ZGg+gPbASdeUVRTNoQKBgQCOjwDOLgYeiMtXCOtL8hymCmsNDCKaaiUzgRijuhEyHzamJhe13Gj/TnwAh+hRI9UX333jjNJawqDuLXz1dQ5Eg6vjPQQVo2XZNzRnOuwpbJDKHUrPK3Lzkn+qIP6ii/y7eQu+GvSM/AUYsxfGy6RLYh1yJvLw1sVrBDiWk5prmwKBgFvgrmI3XBa3XKgPl5KptupVGEDmAveLvaLLLq5WzxB0eNqrduNbv2ZHBVhxvTPtk0hnZaB65XR7SD7LZ9zE6cKJVUCg5bRB0vIt2jYFydAWHhs1yYuuwxQt+NaQxfV7VN8uwQfww7ZHYDqIsWJ6Lw3Lh+rt0xEpJZrJJRulJNbBAoGBAK1OEnfBpSB99N8gdhp+ZGLsDfwFCQ2Cd4Jpsd4hxdwbXevNuA1OiE20sHPuKqEqfOKocgTMobCwbSfnymatRydVoeUumkEc4Ja+XDgH+P1eXQLdIuRCwh0AXl+vkuOCBDMw367Zp/j6vwPlNKh9ZmOBPwhV0Syv2Z8uGkTZ6g+f"
        )
        // 加密数据
        return encryptor.decrypt(val)
    }
}

export const parse = (val) => {
    try {
        return JSON.parse(JSON.stringify(val))
    } catch (error) {
        return val
    }
}

export function setObj(obj, row = {}) {
    obj = JSON.parse(JSON.stringify(obj))
    Object.keys(obj).forEach((key) => {
        obj[key] = isEmpty(row[key]) ? undefined : row[key]
    })
    return obj
}


/**
 * 格式化数字为友好的显示格式
 * @param {number|string} num - 要格式化的数字
 * @param {boolean} addSign - 是否为正数添加+号
 * @returns {string} 格式化后的数字字符串
 */
export const friendlyNumber = (num, addSign = false) => {
    // 输入验证
    if (isEmpty(num)) return ""
    if (isNaN(Number(num))) return num
    const number = Number(num)
    
    if (number === 0) return "0,0000"
    
    // 使用 Decimal.js 进行向下取整到4位小数
    const decimal = new Decimal(number)
    const truncated = decimal.toDecimalPlaces(4, Decimal.ROUND_DOWN)
    
    // 转换为字符串并格式化为欧洲格式
    let result = truncated.toFixed(4)
    
    // 分离整数部分和小数部分
    const parts = result.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1] || '0000'
    
    // 为整数部分添加千分位分隔符（欧洲格式：千分位用点）
    let formattedInteger = integerPart
    if (integerPart.length > 3) {
        formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
    
    // 组合结果（欧洲格式：整数部分用点分隔，小数部分用逗号）
    result = `${formattedInteger},${decimalPart}`
    
    if (addSign && formatNumber(number) > 0) {
        result = `+${result}`
    }
    
    return result
}

/**
 * 预处理数字字符串，将欧洲格式转换为标准格式
 * @param {string|number} value - 要处理的数值
 * @returns {number} - 标准格式的数值
 */
const preprocessNumber = (value) => {
    if (isEmpty(value)) return 0
    
    const str = String(value).trim()
    let processedStr = str
    
    // 如果包含逗号且不包含点，说明是欧洲格式（如：1.234,56）
    if (str.includes(',') && !str.includes('.')) {
        // 欧洲格式：千分位用点，小数点用逗号
        processedStr = str.replace(/\./g, '').replace(',', '.')
    }
    
    // 如果同时包含逗号和点，需要判断格式
    else if (str.includes(',') && str.includes('.')) {
        const lastCommaIndex = str.lastIndexOf(',')
        const lastDotIndex = str.lastIndexOf('.')
        
        // 如果最后一个逗号在最后一个点之后，说明逗号是小数点
        if (lastCommaIndex > lastDotIndex) {
            // 欧洲格式：1.234,56 -> 1234.56
            processedStr = str.replace(/\./g, '').replace(',', '.')
        } else {
            // 美式格式：1,234.56 -> 1234.56
            processedStr = str.replace(/,/g, '')
        }
    }
    
    // 如果只包含点，移除千分位分隔符
    else if (str.includes('.')) {
        processedStr = str.replace(/,/g, '')
    }
    
    // 转换为数字并返回
    const num = Number(processedStr)
    return isNaN(num) ? 0 : num
}
/**
 * 相加
 * @param {number|string} a - 第一个加数
 * @param {number|string} b - 第二个加数
 * @returns {string} - 相加结果
 */
export const add = (a, b) => {
    if (isEmpty(a) || isEmpty(b)) {
        return "0,0000"
    }
    
    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)
    
    return friendlyNumber(new Decimal(processedA).plus(processedB))
}

/**
 * 相减
 * @param {number|string} a - 被减数
 * @param {number|string} b - 减数
 * @returns {string} - 相减结果
 */
export const subtract = (a, b) => {
    if (isEmpty(a) || isEmpty(b)) {
        return "0,0000"
    }
    
    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)
    
    return friendlyNumber(new Decimal(processedA).minus(processedB))
}

/**
 * 相乘
 * @param {number|string} a - 第一个乘数
 * @param {number|string} b - 第二个乘数
 * @returns {string} - 相乘结果
 */
export const multiply = (a, b) => {
    if (isEmpty(a) || isEmpty(b)) {
        return "0,0000"
    }
    
    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)
    
    return friendlyNumber(new Decimal(processedA).times(processedB))
}

/**
 * 相除
 * @param {number|string} a - 被除数
 * @param {number|string} b - 除数
 * @returns {string} - 相除结果
 */
export const divide = (a, b) => {
    if (isEmpty(a) || isEmpty(b) || b === 0) {
        return "0,0000"
    }
    
    const processedA = preprocessNumber(a)
    const processedB = preprocessNumber(b)
    
    return friendlyNumber(new Decimal(processedA).dividedBy(processedB))
}
export function setBaseUrl(url) {
    if (!url) {
        return ""
    }
    // 如果是绝对路径则拼接 否则直接返回
    if (url.startsWith("http")) {
        return url
    } else {
        // 如果url第一个是/则不需要加不是的话则加上/
        if (url.startsWith("/")) {
            return `${baseUrl}${url}`
        } else {
            return `${baseUrl}/${url}`
        }
    }
}

// 如果传入欧洲格式 帮我变成正常数字，如果是正常数字则返回，如果是字符串则先判断是否是欧洲格式，如果是欧洲格式则变成正常数字，如果是正常数字则返回
export const formatNumber = (num) => {
    if (typeof num === 'string') {
        return preprocessNumber(num)
    }
    return num
}

// 百分率 传入2个函数 得到2位小数,第二个参数是是否需要乘以100
export const percentage = (a, need = true) => {
    if (isEmpty(a)) {
        return "0,00"
    }
    const processedA = preprocessNumber(a)
    let data = new Decimal(processedA).times(need ? 100 : 1).toFixed(2)
    data = data.replace('.', ',')
    return data
}

// 传入的值如果有.则去掉
export const removeDot = (num) => {
    if (isEmpty(num)) return 0
    if (typeof num === 'string') {
        return num.replace('.', '')
    }
    return num
}