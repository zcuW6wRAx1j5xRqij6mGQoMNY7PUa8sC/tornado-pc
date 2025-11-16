<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCodeApi } from '@/api/common'
import { successMessage } from '/@/utils/message'
import { forgetPasswordApi } from '@/api/user'
import Language from '@/views/login/components/Language.vue'
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 'phone', name: t('register.tab1') },
        { id: 'email', name: t('register.tab2') },
    ]
})
const tabChange = id => {
    fromData.account_type = id
}
const router = useRouter()
const fromData = reactive({
    email: '',
    password: '',
    captcha_code: '',
    nwePassword: '',
    account_type: 'phone',
    phone_code: '',
    phone: '',
    cf_token: ''
})
const codeValid = computed(() => {
    return fromData.account_type === 'phone' ? fromData.phone : fromData.email
})
// 发送验证码
const getCode = token => {
    return getCodeApi({
        email: fromData.email,
        phone: fromData.phone,
        account_type: fromData.account_type,
        phone_code: fromData.phone_code,
        type: 'reset_password',
        cf_token: token,
    }).then(() => {
        successMessage(t('common.sendSuccess'))
    })
}
const getCodeError = error => {
    errorObj.value = error
}
const errorObj = ref({})
const isDisabled = computed(() => {
    if (fromData.account_type === 'email') {
        return (
            !fromData.email || !fromData.password || !fromData.nwePassword || !fromData.captcha_code
        )
    } else {
        return (
            !fromData.phone || !fromData.password || !fromData.nwePassword || !fromData.captcha_code
        )
    }
})
const submitForm = () => {
    errorObj.value = {}
    if (fromData.password !== fromData.nwePassword) {
        errorObj.value.password = t('forgetPwd.error1')
        return
    }
    return forgetPasswordApi(fromData)
        .then(() => {
            successMessage(t('common.opeSuccess'))
            router.replace('/Login')
        })
        .catch(error => {
            errorObj.value = error
        })
}
const toPage = path => {
    router.push(path)
}
const changePhoneCode = (value) => {
    fromData.phone_code = value
}

</script>
<template>
    <div class="c-content login-page">
        <div class="top-header">
            <Language />
        </div>
        <img src="./img/login-right.png" class="login-right" alt="">
        <div class="from-box">
            <div class="login-title">
                {{ $t('forgetPwd.title') }}
            </div>
            <MyTab
                :tabList="tabList"
                class="mb-4"
                :tabActive="fromData.account_type"
                @tabChange="tabChange"
            />
            <MyInput
                v-model="fromData.phone"
                :placeholder="$t('register.input0')"
                :errorObj="errorObj"
                propName="phone"
                isPhone
                v-if="fromData.account_type === 'phone'"
                @changePhoneCode="changePhoneCode"
            />
            <MyInput
                v-model="fromData.email"
                :placeholder="$t('forgetPwd.input1')"
                :errorObj="errorObj"
                propName="email"
                v-if="fromData.account_type === 'email'"
            />
            <MyInput
                v-model="fromData.captcha_code"
                :placeholder="$t('forgetPwd.input2')"
                :errorObj="errorObj"
                propName="captcha_code"
                showCode
                :codeValid="codeValid"
                :getCode="getCode"
                @getCodeError="getCodeError"
            />
            <MyInput
                v-model="fromData.password"
                :placeholder="$t('forgetPwd.input3')"
                :errorObj="errorObj"
                propName="password"
                type="password"
            />
            <MyInput
                v-model="fromData.nwePassword"
                :placeholder="$t('forgetPwd.input4')"
                :errorObj="errorObj"
                propName="nwePassword"
                type="password"
            />
            <MyButton :clickFn="submitForm" :disabled="isDisabled">{{
                $t('forgetPwd.button2')
            }}</MyButton>
            <div class="tip-font mt-10 text-center" @click="toPage('/Login')">
                {{ $t('forgetPwd.toLogin') }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-header {
    position: absolute;
    flex-shrink: 0;
    top: 60px;
    right: 60px;
}

.login-page {
    position: relative;
    height: 100%;
    display: flex;
}

.login-left {
    height: 100%;
    flex-shrink: 0;
}

.from-box {
    padding-top: 20vh;
    width: 400px;
    margin: 0 auto;
}


.login-title {
    color: #fff;
    font-family: 'PingFang SC';
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px; /* 91.667% */
    margin-bottom: 60px;
    text-align: center;
}

.code-get {
    min-width: 142px;
    height: 40px;
    padding: 0 16px;
    border-radius: 4px;
    background-color: #1c252a;
    color: #fff;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    
    line-height: 120%; /* 16.8px */
    flex-shrink: 0;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.tip-font {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
}
.cf-turnstile {
        width: 400px;
    }
</style>
