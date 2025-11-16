<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useVModel } from '@vueuse/core'
import { getAreaCodeApi } from '@/api/common'
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        default: '',
    },
    propName: {
        type: String,
        default: '',
    },
    errorObj: {
        type: Object,
        default: () => ({}),
    },
    isSelect: {
        type: Boolean,
        default: false,
    },
    showCode: {
        type: Boolean,
        default: false,
    },
    codeValid: {
        type: [Function, String, Boolean, Number],
        default: () => true,
    },
    className: {
        type: String,
        default: '',
    },
    isPhone: {
        type: Boolean,
        default: false,
    },
    getCode: {
        type: Function,
    },
    max: {
        type: [Number, String],
    },
    min: {
        type: [Number, String],
    },
    hasSuffix: {
        type: Boolean,
        default: false,
    },
    noB: {
        type: Boolean,
        default: false,
    },
    fromLabel: {
        type: String,
    },
    title: {
        type: String,
        default: '',
    },
    classList: {
        type: String,
        default: '',
    },
    cfId: {
        type: String,
        default: 'cf-turnstile-id',
    },
    isLarge: {
        type: Boolean,
        default: false,
    },
    isIn: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue', 'getCodeError', 'changePhoneCode'])
const data = useVModel(props, 'modelValue', emit)

// 验证码倒计时
let timer = null
let time = ref(0)
const isFirst = ref(true)
const getCodeValue = () => {
    if (!props.codeValid) {
        emit('getCodeError', {})
    } else {
        // turnstile.ready(function () {
            if (isFirst.value) {
                turnstile.render(`#${props.cfId}`, {
                    sitekey: '0x4AAAAAABu8-vWKZ-ef4AEX',
                    callback: function (token) {
                        codeHandle(token)
                    },
                    theme: 'dark',
                })
                isFirst.value = false
            } else {
                turnstile.reset(`#${props.cfId}`)
            }
        // })
    }
}
const codeHandle = async token => {
    if (time.value === 0 && props.codeValid) {
        if (props.getCode) {
            try {
                await props.getCode(token)
                emit('getCodeError', {})
            } catch (error) {
                emit('getCodeError', error)
                return
            }
        }
        // emit('getCode', token)
        time.value = 60
        timer = setInterval(() => {
            time.value--
            if (time.value === 0) {
                clearInterval(timer)
                time.value = 0
            }
        }, 1000)
    }
}
onUnmounted(() => {
    clearInterval(timer)
})
const phoneCode = ref('')
const prePhoneList = ref([])
onMounted(() => {
    if (props.isPhone) {
        // 获取国际区域号
        getAreaCodeApi().then(data => {
            prePhoneList.value = Object.entries(data).map(([key, value]) => ({
                value: value,
                name: key,
            }))
            if (prePhoneList.value.length > 0) {
                changePhoneCode(prePhoneList.value[0].value)
            }

        })
    }
})
const changePhoneCode = (value) => {
    phoneCode.value = value
    emit('changePhoneCode', value)
}
</script>
<!--  -->
<template>
    <div v-if="title" class="from-title">{{ title }}</div>
    <div :class="[showCode ? 'flex' : '', classList]">
        <div class="from-label" v-if="fromLabel">{{ fromLabel }}</div>
        <div class="my-input" :class="{ 'is-large': isLarge, 'no-b': noB, 'is-in': isIn }" >
            <el-input v-model="data" :placeholder="placeholder" autosize size="large" :type="type" v-bind="$attrs"
                :max="max" :min="min">
                <template #prepend v-if="label">
                    <span class="input-label">{{ label }}</span>
                </template>
                <template #prepend v-else-if="isPhone">
                    <div class="my-input-phone-pre">
                        <el-select v-model="phoneCode" @change="changePhoneCode" placeholder="">
                            <el-option v-for="item in prePhoneList" :key="item.value" :label="item.name" :value="item.value" />
                        </el-select>
                    </div>
                </template>
                <template #suffix v-if="hasSuffix">
                    <slot name="suffix" />
                </template>
            </el-input>
            <div class="my-input-error" v-if="errorObj[propName]">
                <img src="./img/error.svg" alt="" class="error-img" />
                {{ errorObj[propName] }}
            </div>
        </div>
        <div v-if="showCode" class="code-get" :class="{ 'is-large': isLarge }"
            :style="{ cursor: time === 0 && props.codeValid ? 'pointer' : 'not-allowed' }" @click="getCodeValue">
            {{ time === 0 ? $t('forgetPwd.button1') : `${time}S` }}
        </div>
    </div>
    <div :id="cfId" class="cf-turnstile" v-if="showCode"></div>
</template>

<style scoped lang="scss">
.my-input {
    margin-bottom: 16px;
    width: 100%;
    flex: auto;

    :deep(.el-input__wrapper) {
        background-color: #12181F;
        border-color: #12181F;
        box-shadow: none;
        border-radius: 20px;

        .el-input__inner {
            color: #fff;
        }
    }
    &.is-large {
        :deep(.el-input__wrapper) {
            height: 64px;
        }
    }
    &.no-b {
        margin-bottom: 0px;
    }
}

.my-input-error {
    color: #bd251c;
    font-family: 'PingFang SC';

    /* Body3/400 */
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    /* 133.333% */
    display: flex;
    align-items: center;
    margin-top: 10px;

    .error-img {
        width: 18px;
        height: 18px;
        margin-right: 8px;
    }
}

.code-get {
    min-width: 142px;
    height: 40px;
    padding: 0 16px;
    background-color: #1C1E27;
    color: #fff;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    
    line-height: 120%;
    /* 16.8px */
    flex-shrink: 0;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 20px;
}
.is-large{
    &.code-get{
        height: 64px;
    }
}
.cf-turnstile {
    margin: 0 auto;
    width: 300px;
}

.my-input-phone-pre {
    position: relative;
    display: flex;
    font-size: 16px;
    align-items: center;
    z-index: 9;
    color: #fff;
    justify-content: center;
    min-width: 80px;
    :deep(.el-select__wrapper) {
        box-shadow: none !important;
        border-radius: 4px;
        border: none;
        padding: 0 !important;
        
    }
    &::after {
        position: absolute;
        right: -20px;
        content: '';
        width: 1px;
        height: 20px;
        background-color: #eee;
    }
}
.from-title{
    font-weight: 500;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 22px;
    margin-bottom: 16px;
}

.input-label {
    font-weight: 400;
    font-size: 14px;
    color: #9098a2;
    line-height: 17px;

    &::before {
        content: '*';
        display: inline-block;
        position: relative;
        width: 8px;
        font-size: 14px;
        font-weight: 400;
        color: #ff4c38;
        margin-right: 4px;
    }
}

.from-label {
    font-weight: 500;
    font-size: 15px;
    color: #fff;
    line-height: 18px;
    margin-bottom: 12px;
}
.is-in{
    :deep(.el-input__wrapper){
        background-color:#161D26 !important;
        border-color: #161D26 !important;
    }
}
</style>
