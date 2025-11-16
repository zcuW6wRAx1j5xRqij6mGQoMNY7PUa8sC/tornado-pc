<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCodeApi } from '@/api/common'
import { successMessage } from '/@/utils/message'
import { registerApi } from '@/api/user'
import Language from '@/views/login/components/Language.vue'
import { ArrowLeftBold } from '@element-plus/icons-vue'
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 'email', name: t('register.tab2') },
        { id: 'phone', name: t('register.tab1') },
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
    account_type: 'email',
    phone_code: '',
    phone: '',
    invite_code: '',
    newPassword: '',
     cf_token: ''
})
const codeValid = computed(() => {
    return fromData.account_type === 'phone' ? fromData.phone : fromData.email
})
// 发送验证码
const getCode = (token) => {
    errorObj.value = {}
    return getCodeApi({
        email: fromData.email,
        phone: fromData.phone,
        account_type: fromData.account_type,
        phone_code: fromData.phone_code,
        type: 'register',
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
        console.log(fromData)
        return (
            !fromData.email ||
            !fromData.password ||
            !fromData.captcha_code ||
            !fromData.invite_code ||
            !fromData.newPassword
        )
    } else {
        console.log(fromData)
        return (
            !fromData.phone ||
            !fromData.password ||
            !fromData.captcha_code ||
            !fromData.invite_code ||
            !fromData.newPassword
        )
    }
})

const submitForm = () => {
    if (fromData.password !== fromData.newPassword) {
        errorObj.value = {
            newPassword: t('register.diffPwd'),
        }
        return
    }
    return registerApi(fromData)
        .then(() => {
            successMessage(t('register.success'))
            toPage('/Login')
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
        <div class="login-body">
            <div class="from-box">
                <div class="login-title">
                    {{ $t('register.title') }}
                </div>
                <MyTab :tabList="tabList" class="mb-4" :tabActive="fromData.account_type" @tabChange="tabChange" />
                <MyInput isIn isLarge  v-model="fromData.phone" :placeholder="$t('register.input0')" :errorObj="errorObj"
                    propName="phone" isPhone v-if="fromData.account_type === 'phone'" @changePhoneCode="changePhoneCode" />
                <MyInput isIn isLarge  v-model="fromData.email" :placeholder="$t('register.input1')" :errorObj="errorObj"
                    propName="email" v-if="fromData.account_type === 'email'" />
                <MyInput isIn isLarge  v-model="fromData.captcha_code" :placeholder="$t('forgetPwd.input2')" :errorObj="errorObj"
                    propName="captcha_code" showCode :codeValid="codeValid" :getCode="getCode"
                    @getCodeError="getCodeError" />
                <MyInput isIn isLarge  v-model="fromData.password" :placeholder="$t('register.input3')" :errorObj="errorObj"
                    propName="password" type="password" />
                <MyInput isIn isLarge  v-model="fromData.newPassword" :placeholder="$t('register.input4')" :errorObj="errorObj"
                    propName="newPassword" type="password" />
                <MyInput isIn isLarge  v-model="fromData.invite_code" :placeholder="$t('register.input5')" :errorObj="errorObj"
                    propName="invite_code" />
                <MyButton :clickFn="submitForm" :disabled="isDisabled">{{
                    $t('register.button2')
                }}</MyButton>
                <div class="tip-font mt-10 text-center" @click="toPage('/Login')">
                    {{ $t('register.toLogin') }}
                </div>
            </div>
            <div class="flex-auto flex flex-col justify-center items-center">
                <div class="flex items-center">
                    <img src="/logo.svg" alt="" class="logo">
                    <img src="/text.svg" alt="" class="text-logo">
                </div>
                <img src="./img/login-right.png" class="login-bg" alt="">
            </div>
        </div>
    </div>
</template>

<style scoped>
@import './login.scss';
.from-box{
    padding-top: 40px;
}
</style>
