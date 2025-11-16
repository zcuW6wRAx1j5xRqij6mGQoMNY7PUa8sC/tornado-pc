<script setup>
import { getPledgeConfigApi, pledgeApi, pledgeRecordApi } from "@/api/defn"
import { useRouter } from "vue-router"
import { useDisabled } from "@/hooks/useDisabled"
import useSocket from "@/hooks/useSocket"
import { useI18n } from "vue-i18n"
import { friendlyNumber, divide} from "@/utils/utils"
import dayjs from "dayjs"
import { successMessage } from '/@/utils/message'
import { useUserInfo } from '@/hooks/useUserInfo'
const { userInfo } = useUserInfo()
const { t } = useI18n()
const router = useRouter()
const currencyList = ref([])
const recordMap = ref({})
const setListData = (data) => {
    recordMap.value[data.data.symbol] = data.data
}
useSocket("public:spot_allticker", setListData)
const count = computed(() => {
    if (!fromData.coin_id) return 0
    return divide(fromData.usdc_amount, recordMap.value[fromData.coin_symbol]?.price)
})
const coinChange = (id) => {
    fromData.coin_symbol = currencyList.value.find(el => el.id === id).symbol
}
onMounted(() => {
    getPledgeConfigApi().then((data) => {
        dayList.value = data.duration.map(el => {
            return {
                id: el,
                name: `${el} ${t("ai.days")}`,
               
            }
        })
        currencyList.value = data.coin
    })
})
onMounted(() => {
    getData()
})
const loading = ref(false)
const dataList = ref([
])
const getData = () => {
    loading.value = true
    pledgeRecordApi({
       
    }).then((data) => {
        dataList.value = data || []
    }).finally(() => {
        loading.value = false
    })
}
const showInfoList = computed(() => {
    return [
        {
            key: "amount",
            name: t("defn.label2"),
            nameCb: (data) => {
                return `${t("defn.label2")}(${data.name})`
            },
            cb: (data) => {
                return friendlyNumber(data.amount)
            },
        },
        {
            key: "quota",
            name: `${t("defn.label4")}(USDC)`,
            cb: (data) => {
                return friendlyNumber(data.quota)
            },
        },
        {
            key: "duration",
            name: t("defn.label3"),
            cb: (data) => {
                return `${data.duration} ${t("ai.days")}`
            },
        },
    ]
})
const sureHandle = () => {
    if(loading.value) return
    loading.value = true
    return pledgeApi({
        coin_id: fromData.coin_id,
        duration: fromData.day_id,
    })
        .then(() => {
            getData()
            successMessage(t("common.opeSuccess"))
        })
        .catch((error) => {
            errorObj.value = error
        }).finally(() => {
            loading.value = false
        })
}
const fromData = reactive({
    usdc_amount: "500",
    coin_id: "",
    coin_symbol: "",
    day_id: "",
})
const isDisabled = useDisabled(fromData)
const errorObj = ref({})

const dayList = ref([
])
const addDialog = ref(false)
const addHandle = () => {
    fromData.usdc_amount = "500"
    fromData.coin_id = ""
    fromData.coin_symbol = ""
    fromData.day_id = ""
    addDialog.value = true
}
</script>
<!--  -->
<template>
    <div class="flex-auto overflow-auto " v-loading="loading">
        <div class="flex justify-between items-center mb-4">
            <div class="text-base">{{$t('defn.hisTitle')}}</div>
            <MyButton style="min-width: 180px;" @click="addHandle" :disabled="userInfo.on_pledge">{{ userInfo.on_pledge ? $t('defn.tip') : $t('ieo.btn')}}</MyButton>
        </div>
    <NoData v-if="dataList.length === 0" style="padding-top: 25vh;" />
    <div class="ai-ul" >
        <div class="ai-item" v-for="item in dataList" :key="item.id">
            <div class="flex items-center">
                <div class="c-order-tip-box">
                    {{ dayjs(item.start_at).format("DD.MM.YYYY HH:mm:ss") }}
                </div>
                <div
                    class="status-box cursor-pointer ml-auto"
                    @click="handleStatus(item)"
                    :class="[
                        item.status === 'pending' ? 'status-green' : item.status === 'hold' ?'status-yellow': item.status === 'closed' ? 'status-grey' : 'status-red'
                    ]"
                >
                    {{
                        item.status === 'pending' ? $t('defn.status1') : item.status === 'hold' ? $t('defn.status2') : item.status === 'closed' ? $t('defn.status3') : item.status === 'closing' ? $t('defn.status4') : $t('defn.status5')
                    }}
                </div>
            </div>
            <div class="show-ul is-small">
                <div
                    class="show-li"
                    v-for="info in showInfoList"
                    :key="info.key"
                > <span class="show-label" v-if="info.nameCb" v-html="info.nameCb(item)"></span>
                    <span class="show-label" v-else>{{ info.name }}</span>
                    <span
                        class="show-value"
                        :class="[info.cssCb ? info.cssCb(item) : '']"
                    >
                        {{ info.cb && info.cb(item) }}
                    </span>
                </div>
            </div>
        </div>
       
    </div>
    <MyDialog v-model="addDialog" :title="$t('ieo.btn')" class="defn overflow-auto flex-auto from-box" :disabled="isDisabled" @confirm="sureHandle" :loading="loading">
        <div class="from-title">{{ $t("defn.label1") }}</div>
        <el-select
            v-model="fromData.coin_id"
            size="large"
            class="mb-4"
            :placeholder="$t('defn.pla1')"
            :title="$t('defn.label1')"
            :errorObj="errorObj"
            propName="coin_id"
            @change="coinChange"
        >
            <el-option
                v-for="item in currencyList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
        </el-select>
        <MyInput
            isBlock
            :modelValue="count"
            :placeholder="$t('defn.label2')"
            :title="$t('defn.label2')"
            :errorObj="errorObj"
            propName="child_address"
            disabled
        ></MyInput>
        <MyInput
            isBlock
            v-model="fromData.usdc_amount"
            title="USDC"
            :errorObj="errorObj"
            propName="usdc_amount"
            disabled
        ></MyInput>
        <div class="from-title">{{ $t("defn.label3") }}</div>
        <el-select
            v-model="fromData.day_id"
            size="large"
            :placeholder="$t('defn.pla3')"
            :title="$t('defn.label3')"
            :errorObj="errorObj"
            propName="day_id"
        >
            <el-option
                v-for="item in dayList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
        </el-select>
    </MyDialog>
    </div>
</template>

<style scoped lang="scss">
.defn {
    width: 420px;
    margin: 100px auto;
}
.tip {
    color: #6b6b6b;
    text-align: right;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.bank-info {
    margin-top: 10px;
    width: 100%;
    flex-shrink: 0;
    background-color: #272727;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    color: #fff;
    font-size: 16px;
    font-style: normal;
    line-height: normal;
    border-radius: 8px;
}
.from-box {
    :deep(.el-select__wrapper) {
        background-color: #1C242E;
        border-color: #1C242E;
        box-shadow: none;
        border-radius: 4px;

        .el-input__inner {
            color: #fff;
        }
    }
}
.ai-ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}
@media (max-width: 1600px) {
    .ai-ul {
        grid-template-columns: repeat(3, 1fr);
    }
}
.ai-item {
    padding: 16px;
    background: var(--el-card-bg);
    border-radius: 8px 8px 8px 8px;
}

.title {
    font-weight: 500;
    font-size: 15px;
    color: #ffffff;
    line-height: 18px;
}

.font-15 {
    font-size: 15px;
}

.show-ul {
    font-size: 15px;
    line-height: 18px;

    .show-li {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .show-label {
        color: #8b939a;
        display: flex;
        align-items: center;
        font-size: 14px;
    }

    .show-value {
        font-family: DIN;
        font-weight: 500;
        color: #fff;

        text-align: right;
        display: flex;
        align-items: center;
    }
}
</style>
