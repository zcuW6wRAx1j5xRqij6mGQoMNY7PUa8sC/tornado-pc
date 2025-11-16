<script setup>
import { useI18n } from "vue-i18n"
import { useDisabled } from "@/hooks/useDisabled"
import { Plus } from "@element-plus/icons-vue"
import useUpload from "@/hooks/useUpload"
import { getRealNameInfoApi, submitRealNameApi } from "@/api/my"
import { successMessage } from "/@/utils/message"
import { useRouter } from "vue-router"
import Success from "@/views/common/Success.vue"
import { setObj, setBaseUrl } from "@/utils/utils"
import { getCountryApi } from "@/api/common"
const router = useRouter()
const { t } = useI18n()
// const activeTab = ref('phone')
const uploadFile = useUpload()
const countryList = ref([])
const getCountry = () => {
    return getCountryApi().then((data) => {
        countryList.value = data
    })
}
const initData = ref({
    data: {},
})
const isRefuse = ref(false)
const loading = ref(false)
onMounted(async () => {
    loading.value = true
    try {
        await getCountry()
    } catch (error) {
        console.log("error", error)
    }
    getRealNameInfoApi()
        .then((data) => {
            initData.value = data
            isRefuse.value = data.status === 2
            if (data.status !== -1) {
                fromData.value = setObj(fromData.value, data.data)
            }
        })
        .finally(() => {
            loading.value = false
        })
})

const fromData = ref({
    document_type: "",
    document_frontend: "",
    country_id: "",
    first_name: "",
    last_name: "",
    document_number: "",
    face: "",
})
const errorObj = ref({})
const isDisabled = useDisabled(fromData)

const dataList = computed(() => {
    return [
        {
            label: t("my.idCard"),
            value: "id_card",
        },
        {
            label: t("my.passport"),
            value: "passport",
        },
        {
            label: t("my.driverLicense"),
            value: "driver_license",
        },
    ]
})
// const btnStatusMap = {
//     1: t('assets.text.text22'), //审核中
//     2: t('assets.text.text23'), //已实名
// }
// 1 证件 2 面部
const handleAvatarSuccess = (file, type) => {
    uploadFile(file).then((data) => {
        fromData.value[type === 1 ? "document_frontend" : "face"] = data
    })
    return false
}

const submitForm = () => {
    return submitRealNameApi(fromData.value).then(() => {
        successMessage(t("common.opeSuccess"))
        router.push("/")
    })
}
</script>
<template>
    <div class="withdraw-container" v-loading="loading">
        <div class="withdraw-title flex flex-s-b">
            <!-- <div>{{ $t('assets.text.text12') }}</div> -->
        </div>
        <div class="from-box">
            <Success v-if="initData.status === 1" style="margin-top: 20vh" :msg="$t('assets.text.text23')" />
            <template v-else>
                <el-alert v-if="isRefuse" style="margin-bottom: 16px" :title="`${t('withdrawal.showItem.label3')}：${initData.data.reason
                    }`" type="error" />
                <el-select-v2 v-model="fromData.document_type" size="large" :placeholder="t('assets.text.text21')"
                    class="mb-4" :options="dataList" />
                <el-select v-model="fromData.country_id" size="large" :placeholder="t('my.realName.pla1')" class="mb-4"
                    filterable>
                    <el-option v-for="item in countryList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <MyInput isLarge v-model="fromData.first_name" :placeholder="$t('my.realName.pla3')"
                    :errorObj="errorObj" propName="first_name" className="flex-auto" />
                <MyInput isLarge className="ml-4 flex-auto" v-model="fromData.last_name"
                    :placeholder="$t('my.realName.pla2')" :errorObj="errorObj" propName="last_name" />
                <MyInput isLarge v-model="fromData.document_number" :placeholder="$t('my.realName.pla4')"
                    :errorObj="errorObj" propName="document_number" />
                <div></div>
                <div>
                    <div class="">
                        {{ $t("my.realName.pla6") }}
                    </div>
                    <div class="upload-box">
                        <el-upload class="avatar-uploader"
                            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                            :show-file-list="false" :before-upload="(file) => handleAvatarSuccess(file, 1)"
                            accept="image/*" :limit="1">
                            <img v-if="fromData.document_frontend" :src="setBaseUrl(fromData.document_frontend)"
                                class="avatar" />
                            <el-icon v-else class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </el-upload>
                    </div>
                </div>
                <div>
                    <div class="">
                        {{ $t("my.realName.pla5") }}
                    </div>
                    <div class="upload-box">
                        <el-upload class="avatar-uploader"
                            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                            :show-file-list="false" :before-upload="(file) => handleAvatarSuccess(file, 2)"
                            accept="image/*" :limit="1">
                            <img v-if="fromData.face" :src="setBaseUrl(fromData.face)" class="avatar" />
                            <el-icon v-else class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </el-upload>
                    </div>
                </div>
                <div></div>
                <MyButton class="submit-btn" size="large" :clickFn="submitForm"
                    :disabled="isDisabled || initData.status === 0" v-if="initData.status !== 1">{{
                        initData.status === 0
                            ? $t("assets.text.text22")
                            : $t("common.text7")
                    }}</MyButton>
               
            </template>
            
        </div>
    </div>
</template>

<style scoped lang="scss">
.withdraw-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    flex: auto;
    max-width: 800px;
    margin: 0 auto;


    .from-box {
        width: 100%;
        margin-top: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;

        .balance {
            margin: 16px 16px 16px 0;
        }

        :deep(.el-select__wrapper) {
            background-color: #1C1E27;
            border-color: #1C1E27;
            box-shadow: none;
            border-radius: 4px;

            .el-input__inner {
                color: #fff;
            }
        }

        .upload-box {
            min-height: 122px;
            border-radius: 8px;
            margin-top: 16px;
            background-color: #1c252a;
            padding: 12px 16px;
            box-sizing: border-box;
        }
    }

    .mt-16 {
        margin-top: 16px;
    }

    .avatar-uploader .avatar {
        max-width: 100%;
        max-height: 130px;
        display: block;
        border-radius: 8px;
        box-sizing: border-box;
        background-color: #4a575e;
    }
}

.error {
    font-weight: 600;
    font-size: 14px;
    color: #e34646;
    line-height: 22px;
    margin: 16px 0;
}
</style>
<style>
.avatar-uploader .el-upload {
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    background-color: #4a575e;
    width: 100%;
    height: 130px;
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 130px;
    height: 130px;
    text-align: center;
}
.submit-btn{
    justify-self: flex-end;
    height: 60px;
    min-width: 180px;
    border-radius: 20px;
}
</style>
