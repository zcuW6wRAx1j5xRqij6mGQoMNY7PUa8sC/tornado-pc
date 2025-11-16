const toString = Object.prototype.toString

export function is(val, type) {
    return toString.call(val) === `[object ${type}]`
}

export function isDef(val) {
    return typeof val !== "undefined"
}

export function isUnDef(val) {
    return !isDef(val)
}

export function isObject(val) {
    return val !== null && is(val, "Object")
}

export function isEmpty(val) {
    if (isArray(val) || isString(val)) {
        return val.length === 0
    }

    if (val instanceof Map || val instanceof Set) {
        return val.size === 0
    }

    if (isObject(val)) {
        return Object.keys(val).length === 0
    }
    if (isUnDef(val)) {
        return true
    }

    if (isNull(val)) {
        return true
    }
    return false
}

export function isDate(val) {
    return is(val, "Date")
}

export function isNull(val) {
    return val === null
}

export function isNullAndUnDef(val) {
    return isUnDef(val) && isNull(val)
}

export function isNullOrUnDef(val) {
    return isUnDef(val) || isNull(val)
}

export function isNumber(val) {
    return is(val, "Number")
}

export function isPromise(val) {
    return (
        is(val, "Promise") &&
        isObject(val) &&
        isFunction(val.then) &&
        isFunction(val.catch)
    )
}

export function isString(val) {
    return is(val, "String")
}

export function isFunction(val) {
    return typeof val === "function"
}

export function isBoolean(val) {
    return is(val, "Boolean")
}

export function isRegExp(val) {
    return is(val, "RegExp")
}

export function isArray(val) {
    return val && Array.isArray(val)
}

export function isWindow(val) {
    return typeof window !== "undefined" && is(val, "Window")
}

export function isElement(val) {
    return isObject(val) && !!val.tagName
}

export const isServer = typeof window === "undefined"

export const isClient = !isServer

/** url链接正则 */
export function isUrl(value) {
    const reg =
        // eslint-disable-next-line no-useless-escape
        /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/
    // @ts-expect-error
    return reg.test(value)
}

/** 手机号码正则 */
export function isPhone(value) {
    const reg =
        /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/
    // @ts-expect-error
    return reg.test(value)
}

/** 邮箱正则 */
export function isEmail(value) {
    const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    // @ts-expect-error
    return reg.test(value)
}
