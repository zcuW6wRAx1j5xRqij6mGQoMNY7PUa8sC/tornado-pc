<script  setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserInfo } from '@/hooks/useUserInfo'
import { successMessage } from '/@/utils/message'
import { modifyEmailApi, modifyPhoneApi } from '@/api/my'
import { getCodeLoginApi } from '@/api/common'
const { userInfo, initUserData } = useUserInfo()
const { t } = useI18n()
const tabList = computed(() => {
    return [
        {
            name: t('setPhone.tab.tab1'),
            id: 1,
        },
        {
            name: t('setPhone.tab.tab2'),
            id: 2,
        },
    ]
})
const tabActive = ref(1)
const tabChange = id => {
    tabActive.value = id
}
const isPhoneTab = computed(() => {
    return tabActive.value === 1
})

const fromData = reactive({
    old_captcha: '',
    oldPhone: '',
    phone: '',
    captcha: '',
    phone_code: '0049',
    email: '',
    oldEmail: '',
})
const initData = () => {
    fromData.old_captcha = ''
    fromData.oldPhone = ''
    fromData.phone = ''
    fromData.captcha = ''
    fromData.phone_code = '0049'
    fromData.email = ''
    fromData.oldEmail = ''
}
const isDisabled = computed(() => {
    if (isPhoneTab.value) {
        if (fromData.oldPhone) {
            return !fromData.old_captcha || !fromData.phone || !fromData.captcha
        } else {
            return !fromData.phone || !fromData.captcha
        }
    } else {
        if (fromData.oldEmail) {
            return !fromData.old_captcha || !fromData.email || !fromData.captcha
        } else {
            return !fromData.email || !fromData.captcha
        }
    }
})
onMounted(() => {
    fromData.oldPhone = userInfo.value.phone
    fromData.oldEmail = userInfo.value.email
})
const getCode = (token,type) => {
    errorObj.value = {}
    return getCodeLoginApi({
        phone: type === 'old' ? fromData.oldPhone : fromData.phone,
        account_type: isPhoneTab.value ? 'phone' : 'email',
        phone_code: fromData.phone_code,
        type: isPhoneTab.value ? 'change_phone' : 'change_email',
        email: type === 'old' ? fromData.oldEmail : fromData.email,
        cf_token: token,
    }).then(() => {
        successMessage(t('common.sendSuccess'))
    })
}
const codeValid = computed(() => {
    return true
})

const errorObj = ref({})
const getCodeError = error => {
    errorObj.value = error
}
const submitHandle = () => {
    const action = isPhoneTab.value ? modifyPhoneApi : modifyEmailApi
    return action(fromData)
        .then(() => {
            initUserData()
            successMessage(t('common.success'))
            initData()
        })
        .catch(error => {
            errorObj.value = error
        })
}
</script>
<!--  -->
<template>
    <MyTab
        :tabList="tabList"
        :tabActive="tabActive"
        @tabChange="tabChange"
        class="flex-shrink-0"
        isFlex
    />
    <div class="set-pwd">
        <template v-if="tabActive === 1">
            <div class="mb-4">{{ $t('setPhone.title') }}</div>
            <template v-if="fromData.oldPhone">
                <MyInput
                    v-model="fromData.oldPhone"
                    :placeholder="$t('setPhone.pla1')"
                    :errorObj="errorObj"
                    propName="phone"
                    isPhone
                    disabled
                />
                <MyInput
                    v-model="fromData.old_captcha"
                    :placeholder="$t('setPhone.pla2')"
                    showCode
                    :errorObj="errorObj"
                    propName="old_captcha"
                    :getCode="(token) => getCode(token,'old')"
                    :codeValid="true"
                    @getCodeError="getCodeError"
                />
            </template>
            <MyInput
                v-model="fromData.phone"
                :placeholder="$t('setPhone.pla1')"
                :errorObj="errorObj"
                propName="phone"
                isPhone
            />
            <MyInput
                v-model="fromData.captcha"
                :placeholder="$t('setPhone.pla2')"
                showCode
                :errorObj="errorObj"
                propName="captcha"
                :getCode="(token) => getCode(token,'new')"
                :codeValid="codeValid"
                @getCodeError="getCodeError"
            />
        </template>
        <template v-else>
            <div class="mb-4">{{ $t('setEmail.title') }}</div>
            <template v-if="fromData.oldEmail">
                <MyInput
                    v-model="fromData.oldEmail"
                    :placeholder="$t('setEmail.pla1')"
                    :errorObj="errorObj"
                    propName="email"
                    disabled
                />
                <MyInput
                    v-model="fromData.old_captcha"
                    :placeholder="$t('setEmail.pla2')"
                    showCode
                    :errorObj="errorObj"
                    propName="captcha"
                    :getCode="(token) => getCode(token,'old')"
                    :codeValid="true"
                    @getCodeError="getCodeError"
                />
            </template>
            <MyInput
                v-model="fromData.email"
                :placeholder="$t('setEmail.pla1')"
                :errorObj="errorObj"
                propName="email"
            />
            <MyInput
                v-model="fromData.captcha"
                :placeholder="$t('setEmail.pla2')"
                showCode
                :errorObj="errorObj"
                propName="captcha"
                :getCode="(token) => getCode(token,'new')"
                :codeValid="codeValid"
                @getCodeError="getCodeError"
            />
        </template>
        <MyButton :disabled="isDisabled" size="medium" :clickFn="submitHandle">{{
            $t('setEmail.btn')
        }}</MyButton>
    </div>
</template>

<style scoped lang="scss">
.set-pwd {
    display: flex;
    flex-direction: column;
    width: 420px;
    margin: 100px auto;
}
</style>
