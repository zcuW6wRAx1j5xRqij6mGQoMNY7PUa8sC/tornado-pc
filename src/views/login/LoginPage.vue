<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setPublicKey, getPublicKey } from '@utils/utils'
import { loginApi } from '@/api/user'
import { useUserStoreHook } from '@/store/modules/user'
import useSocket from '@/hooks/useSocket'
import { computed, nextTick, onMounted, reactive } from 'vue'
import Language from '@/views/login/components/Language.vue'
const { unConnectHandle } = useSocket()
onMounted(unConnectHandle)
const { t } = useI18n()
const tabList = computed(() => {
    return [
        { id: 'email', name: t('login.tab2') },
        { id: 'phone', name: t('login.tab1') },
    ]
})
const tabChange = id => {
    fromData.account_type = id
}
const router = useRouter()
const rememberPwd = ref(false)
const fromData = reactive({
    email: '',
    phone: '',
    password: '',
    account_type: 'email',
    phone_code: '',
    cf_token: ''
})
const errorObj = ref({})
const isDisabled = computed(() => {
    if (fromData.account_type === 'email') {
        return !fromData.email || !fromData.password
    } else {
        return !fromData.phone || !fromData.password
    }
})

function waitForJivoAPI(callback, timeout = 5000) {
  const start = Date.now();
  const interval = setInterval(() => {
    if (window.jivoWidgetLoaded && window.jivo_api) {
      clearInterval(interval);
      callback();
    } else if (Date.now() - start > timeout) {
      clearInterval(interval);
      console.warn("JivoChat API load timeout");
    }
  }, 200);
}

const useUserStore = useUserStoreHook()
const submitForm = () => {
    let params = {
        phone: setPublicKey(fromData.phone),
        email: setPublicKey(fromData.email),
        password: setPublicKey(fromData.password),
    }
    if (rememberPwd.value) {
        localStorage.setItem('userRemember', JSON.stringify(params))
    } else {
        localStorage.removeItem('userRemember')
    }
    if (fromData.account_type === 'email') {
        fromData.phone = ''
    }
    return loginApi(fromData).then(data => {
        localStorage.setItem('ws_token', data.ws_token)
        localStorage.setItem('token', data.token)
        localStorage.setItem('ws_channel_token', data.ws_channel_token)
        localStorage.setItem('uid', data.uid)
        useUserStore.setUserInfo({
            token: data.token,
            username: fromData.email,
        })

        waitForJivoAPI(() => {
            window.jivo_api.setContactInfo({
                name: "UID: " + data.uid ,
            });
        });

        router.push('/')
    }).catch(err => {
        errorObj.value = err
    })
}
onMounted(() => {
    // 记住密码回填
    if (localStorage.getItem('userRemember')) {
        let userObj = JSON.parse(localStorage.getItem('userRemember'))
        fromData.email = getPublicKey(userObj.email)
        fromData.password = getPublicKey(userObj.password)
        fromData.phone = getPublicKey(userObj.phone)
        rememberPwd.value = true
    }
    localStorage.removeItem('token')
    useUserStore.setUserInfo({})
})
const toPage = path => {
    router.push(path)
}
const changePhoneCode = (value) => {
    fromData.phone_code = value
}
</script>
<template>
    <div class="c-content login-page relative">
        <div class="top-header">
            <Language />
        </div>
        <div class="login-body">

            <div class="from-box">
                <div class="login-title">
                    {{ $t('login.title') }}
                </div>
                <MyTab :tabList="tabList" class="mb-4" :tabActive="fromData.account_type" @tabChange="tabChange" />
                <MyInput isIn isLarge v-model="fromData.phone" :placeholder="$t('login.input0')" :errorObj="errorObj"
                    propName="phone" isPhone v-if="fromData.account_type === 'phone'"
                    @changePhoneCode="changePhoneCode" />
                <MyInput isIn isLarge v-model="fromData.email" :placeholder="$t('login.input1')" :errorObj="errorObj"
                    propName="email" v-if="fromData.account_type === 'email'" />
                <MyInput isIn isLarge v-model="fromData.password" :placeholder="$t('login.input2')" :errorObj="errorObj"
                    propName="password" type="password">
                    <template #suffix>
                        <span class="tip-forget-pwd" @click="router.push('/forgetPwd')">{{
                            $t('login.forgetPwd')
                            }}</span>
                    </template>
                </MyInput>
                <div class="remember-pwd" @click="rememberPwd = !rememberPwd">
                    <img src="@/assets/img/check.svg" v-if="!rememberPwd" />
                    <img src="@/assets/img/checked.svg" v-else />
                    <span class="ml-2">{{ $t('login.tip1') }}</span>
                </div>
                <MyButton :clickFn="submitForm" :disabled="isDisabled">{{
                    $t('login.button1')
                    }}</MyButton>
                <div class="tip-font mt-10 text-center" @click="toPage('/Register')">
                    {{ $t('login.toRegister') }}
                </div>
            </div>
            <div class="flex-auto flex flex-col justify-center items-center">
                <div class="flex items-center">
                    <img src="/logo.svg"  alt="" class="logo">
                    <div class="text-logo">Nvdx</div>
                    <!-- <img src="/text.svg" alt="" class="text-logo"> -->
                </div>
                <img src="./img/login-right.png" class="login-bg" alt="">
            </div>
        </div>
    </div>
</template>

<style scoped>
@import './login.scss';
.logo{
    width: 70px;
    height: auto;
}
.text-logo{
    font-size: 36px;
    font-style: normal;
    font-weight: bold;
    line-height: normal;
}
</style>
