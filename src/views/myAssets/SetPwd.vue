<script  setup>
import { ref, computed } from 'vue'
import { useDisabled } from '@/hooks/useDisabled'
import { useI18n } from 'vue-i18n'
import { useUserInfo } from '@/hooks/useUserInfo'
import { errorMessage, successMessage } from '/@/utils/message'
import { modifyLoginPwdApi, modifyPayPwdApi } from '@/api/my'
import { useRouter } from 'vue-router'
const router = useRouter()
const { userInfo, initUserData } = useUserInfo()
const { t } = useI18n()
const tabList = computed(() => {
    return [
        {
            name: t('changePwd.tab.tab1'),
            id: 1,
        },
        {
            name: t('changePwd.tab.tab2'),
            id: 2,
        },
    ]
})
const tabActive = ref(1)
const tabChange = id => {
    tabActive.value = id
}
// 是否有历史支付密码
const hasOldPwd = computed(() => {
    return userInfo.value.has_trade_password
})
const isPay = computed(() => {
    return +tabActive.value === 1
})
const fromData = reactive({
    old_password: '',
    new_password: '',
    confirmPwd: '',
})
const fromDataPay = reactive({
    old_trade_password: '',
    trade_password: '',
    confirmPwd: '',
})
const initData = () => {
    fromData.old_password = ''
    fromData.new_password = ''
    fromData.confirmPwd = ''
    fromDataPay.old_trade_password = ''
    fromDataPay.trade_password = ''
    fromDataPay.confirmPwd = ''
}
const isDisabled = useDisabled(fromData)
const isPayDisabled = useDisabled(fromDataPay, ['trade_password', 'confirmPwd'])
const isPayOldDisabled = useDisabled(fromDataPay)
const errorObj = ref({})
const submitHandle = () => {
    if (isPay.value) {
        if (fromDataPay.trade_password !== fromDataPay.confirmPwd) {
            errorMessage(t('forgetPwd.error1'))
            return
        }
    } else {
        if (fromData.new_password !== fromData.confirmPwd) {
            errorMessage(t('forgetPwd.error1'))
            return
        }
    }
    const action = isPay.value ? modifyPayPwdApi : modifyLoginPwdApi
    let params = isPay.value ? fromDataPay : fromData
    if (!hasOldPwd.value) {
        Reflect.deleteProperty(params, 'old_trade_password')
    }
    return action(params)
        .then(() => {
            successMessage(t('common.opeSuccess'))
            if (isPay.value) {
                initData()
                initUserData()
            } else {
                localStorage.removeItem('token')
                router.replace('/Login')
            }
        })
        .catch(error => {
            errorObj.value = error
        })
}
</script>
<!--  -->
<template>
    <div class="set-pwd">
        <MyTab
        :tabList="tabList"
        :tabActive="tabActive"
        @tabChange="tabChange"
        class="flex-shrink-0 mb-8 justify-self-start"
        isBlock
    />
    <div class="set-box">
        <template v-if="isPay">
            <MyInput
            isLarge
                v-model="fromDataPay.old_trade_password"
                type="password"
                :placeholder="$t('changePwd.pla1')"
                showSee
                :errorObj="errorObj"
                propName="old_trade_password"
                v-if="hasOldPwd"
            />
            <MyInput
            isLarge
                v-model="fromDataPay.trade_password"
                type="password"
                :placeholder="$t('changePwd.pla2')"
                showSee
                :errorObj="errorObj"
                propName="trade_password"
            />
            <MyInput
            isLarge
                v-model="fromDataPay.confirmPwd"
                type="password"
                :placeholder="$t('changePwd.pla3')"
                showSee
                :errorObj="errorObj"
                propName="confirmPwd"
            />
        </template>
        <template v-else>
            <MyInput
            isLarge
                v-model="fromData.old_password"
                type="password"
                :placeholder="$t('changePwd.pla1')"
                showSee
                :errorObj="errorObj"
                propName="old_password"
            />
            <MyInput
            isLarge
                v-model="fromData.new_password"
                type="password"
                :placeholder="$t('changePwd.pla2')"
                showSee
                :errorObj="errorObj"
                propName="new_password"
            />
            <MyInput
            isLarge
                v-model="fromData.confirmPwd"
                type="password"
                :placeholder="$t('changePwd.pla3')"
                showSee
                :errorObj="errorObj"
                propName="confirmPwd"
            />
        </template>
        </div>
        <MyButton
            size="large"
            v-if="isPay && hasOldPwd"
            :disabled="isPayOldDisabled"
            :clickFn="submitHandle"
            class="justify-self-end submit-btn"
            >{{ $t('changePwd.btn') }}</MyButton
        >
        <MyButton
            size="large"
            v-else-if="isPay"
            :disabled="isPayDisabled"
            :clickFn="submitHandle"
            class="justify-self-end submit-btn"
            >{{ $t('changePwd.btn') }}</MyButton
        >
        <MyButton size="large" v-else :disabled="isDisabled" :clickFn="submitHandle" class="justify-self-end submit-btn">{{
            $t('changePwd.btn')
        }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
.set-pwd {
    max-width: 800px;
    margin: 0 auto;
}
.set-box{
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}
.submit-btn{
    height: 60px;
    min-width: 180px;
    border-radius: 20px;
    margin-top: 30px;
}
:deep(.tab-block){
    min-width: 120px;
}
</style>
