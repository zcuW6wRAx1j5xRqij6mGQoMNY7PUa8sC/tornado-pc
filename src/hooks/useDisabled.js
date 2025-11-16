import { isArray, isEmpty } from '../utils/is'
import { computed, isRef } from 'vue'
export function useDisabled(obj, keysToCheck = [], isObj = true) {
    return computed(() => {
        let setObj = isRef(obj) ? obj.value : obj
        if (!isObj) {
            return isEmpty(setObj)
        }
        if (!isArray(keysToCheck)) {
            keysToCheck = []
        }
        if (keysToCheck.length === 0) {
            for (const value of Object.values(setObj)) {
                if (isEmpty(value)) {
                    return true
                }
            }
            return false
        } else {
            for (const key of keysToCheck) {
                if (isEmpty(setObj[key])) {
                    console.log('key')
                    return true
                }
            }
            return false
        }
    })
}
