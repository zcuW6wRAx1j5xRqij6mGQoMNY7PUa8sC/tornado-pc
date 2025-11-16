<script setup>
import { useI18n } from "vue-i18n"
import { ref, defineProps, defineEmits } from "vue"
import { successMessage } from "/@/utils/message"
import { useBalance } from "@/hooks/useBalance"
import { friendlyNumber, multiply, divide, formatNumber, removeDot } from "@/utils/utils"
import { addSpotOrderApi } from "@/api/data"
const { getSpotBalance, getWalletData } = useBalance([1])
const { t } = useI18n()
// eslint-disable-next-line
const props = defineProps({
    symbolInfo: {
        type: Object,
        default: () => { },
    },
    unsubscribeChannel: {
        type: Function,
        required: false,
    },
    isSpots: {
        type: Boolean,
        default: false,
    },
    symbolData: {
        type: Object,
        default: () => { },
    },
    walletRefresh: {
        type: Boolean,
        default: false,
    },
})
watch(
    () => props.walletRefresh,
    () => {
        isInit = true
        initFromHandle()
        getWalletData(1)
    }
)
const activeTab = ref(1)
const searchChange = id => {
    activeTab.value = id
    initFromHandle()
}
const isBuy = computed(() => {
    return activeTab.value === 1
})
const baseAsset = computed(() => {
    return props.symbolInfo?.base_asset?.toUpperCase()
})
const quoteAsset = computed(() => {
    return props.symbolInfo?.quote_asset?.toUpperCase()
})
const baseBalance = computed(() => {
    return getSpotBalance(baseAsset.value, true)
})
const quoteBalance = computed(() => {
    return getSpotBalance(quoteAsset.value, true)
})
let emit = defineEmits(["refreshBottomTable"])
const errorObj = ref({})
const initFrom = {
    document_type: "limit",
    price: 0, // 价格
    amount: "", // 数量
    money: "", // 金额
    sell_price: 0,
    sell_amount: "",
    sell_money: "",
}
const fromData = ref({ ...initFrom })
// 是否是限价订单
const isLimit = computed(() => {
    return fromData.value.document_type === "limit"
})
// 初始化表单
const initFromHandle = () => {
    fromData.value = {
        ...initFrom,
    }
    slider.value = 0
    sellSlider.value = 0
    fromData.value.price = friendlyNumber(nowData.value.price)
    fromData.value.sell_price = friendlyNumber(nowData.value.price)
}
const fullscreenLoading = ref(false)
const sureHandle = (type) => {
    fullscreenLoading.value = true
    const isBuy = type === "buy"
    return addSpotOrderApi({
        spot_id: props.symbolInfo.id,
        side: isBuy ? "buy" : "sell", // 买卖方向
        quantity: isBuy ? fromData.value.money : fromData.value.sell_amount, // 买：金额 USDC 卖：数量
        trade_type: fromData.value.document_type, // 交易类型
        price: isBuy ? fromData.value.price : fromData.value.sell_price, // 价格
    })
        .then(() => {
            successMessage(t("common.opeSuccess"))
            initFromHandle()
            getWalletData(1)
            emit("refreshBottomTable")
        })
        .catch((err) => {
            errorObj.value = err
        })
        .finally(() => {
            fullscreenLoading.value = false
        })
}
let isInit = true
const nowData = ref({})
const dataChange = (val) => {
    if (val.symbol === props.symbolData.symbol) {
        nowData.value = val
        // 初始化价格
        if (isInit) {
            isInit = false
            fromData.value.price = friendlyNumber(val.price)
            fromData.value.sell_price = friendlyNumber(val.price)
        }
    }
}
watch(() => props.symbolData, dataChange)

const selectChange = () => {
    fromData.value.price = friendlyNumber(nowData.value.price)
    fromData.value.sell_price = friendlyNumber(nowData.value.price)
    fromData.value.amount = ""
    fromData.value.money = ""
    fromData.value.sell_amount = ""
    fromData.value.sell_money = ""
}
const changeAmount = (val) => {
    if (typeof val === "object") {
        return
    }
    if (!val) {
        fromData.value.money = 0

    } else {
        fromData.value.money = multiply(removeDot(fromData.value.price), removeDot(val))
    }
    setSlide()
}
const changeSellAmount = (val) => {
    if (typeof val === "object") {
        return
    }
    if (!val) {
        fromData.value.sell_money = 0
    } else {
        fromData.value.sell_money = multiply(removeDot(fromData.value.sell_price), removeDot(val))
    }
    setSellSlide()
}
const changeMoney = (val) => {
    if (typeof val === "object") {
        return
    }
    if (!val || !fromData.value.price || val < 0) {
        fromData.value.amount = 0
    } else {
        fromData.value.amount = divide(removeDot(val), removeDot(fromData.value.price))
    }
    setSlide()
}
const changeSellMoney = (val) => {
    if (typeof val === "object") {
        return
    }
    if (!val) {
        fromData.value.sell_amount = 0
    } else {
        fromData.value.sell_amount = divide(removeDot(val), removeDot(fromData.value.sell_price))
    }
    setSellSlide()
}
function setSlide () {
    const count =  fromData.value.money 
    const balance =  quoteBalance.value 
    if (formatNumber(count) > formatNumber(balance)) {
        slider.value = 100
    } else {
        slider.value = formatNumber(multiply(divide(count, balance), 100))
    }
}
function setSellSlide () {
    const count =  fromData.value.amount
    const balance =  quoteBalance.value
    if (formatNumber(count) > formatNumber(balance)) {
        sellSlider.value = 100
    } else {
        sellSlider.value = formatNumber(multiply(divide(count, balance), 100))
    }
}
const changePrice = () => {
    fromData.value.amount = ""
    fromData.value.money = ""
    slider.value = 0
}
const changeSellPrice = () => {
    fromData.value.sell_amount = ""
    fromData.value.sell_money = ""
    sellSlider.value = 0
}

const marks = reactive({
    0: {
    },
    25: {
    },
    50: {
    },
    75: {
    },
    100: {
    },
})
const slider = ref(0)
const sellSlider = ref(0)
const changeSlide = val => {
    const balance =  quoteBalance.value 
    let setVal = multiply(divide(val, 100), balance)
    if (!val || !fromData.value.price) {
        fromData.value.amount = 0
        fromData.value.money = 0
        return
    }
        fromData.value.money = setVal
        fromData.value.amount = divide(setVal, removeDot(fromData.value.price))
    
}
function changeSellSlide (val) {
    const balance =  baseBalance.value
    let setVal = multiply(divide(val, 100), balance)
    if (!val || !fromData.value.sell_price) {
        fromData.value.sell_amount = 0
        fromData.value.sell_money = 0
    }
    fromData.value.sell_money =  multiply(setVal, removeDot(fromData.value.sell_price))
    fromData.value.sell_amount = setVal
}
const typeList = computed(() => [
    {
        name: t('spotOpe.order.order1'),
        id: 'limit',
    },
    {
        name: t('spotOpe.order.order2'),
        id: 'market',
    },
])
const typeActive = ref('limit')
const typeChange = (val) => {
    fromData.value.document_type = val
    selectChange()
}
</script>
<template>
    <div class="trading-operation" v-loading.fullscreen.lock="fullscreenLoading">
        <MyTab :tabList="typeList" :tabActive="typeActive" @tabChange="typeChange" class="flex-shrink-0 mb-4 w-full" isBlock />
        <MyInput isLarge :placeholder="t('tradingCommon.placeholder.text3')" :disabled="!isLimit"  min="0"
            v-model="fromData.price" @input="changePrice" />
        <MyInput isLarge v-model="fromData.amount" :placeholder="t('assets.table.field2')" :errorObj="errorObj"
            propName="amount"  min="0" @input="changeAmount" hasSuffix>
            <template #suffix>{{ baseAsset }}</template>
        </MyInput>
        <MyInput isLarge v-model="fromData.money" :placeholder="t('assets.table.field4')" :errorObj="errorObj"
             min="0" propName="money" @input="changeMoney" hasSuffix>
            <template #suffix>{{ quoteAsset }}</template>

        </MyInput>

        <div class="title">
            {{ t("tradingCommon.text2") }}
            <span class="balance">{{ friendlyNumber(quoteBalance) }} {{ quoteAsset }}</span>
        </div>
        <el-slider v-model="slider" step="25"  :marks="marks" @input="changeSlide" size="small" height="22" class="green-slider" />
        <MyButton :clickFn="() => sureHandle('buy')" size="large" type="green" class="mt-4 mb-6"
            :disabled="!fromData.price || !fromData.amount" >
            {{ $t("tradingCommon.text3") }}</MyButton>
            <MyInput isLarge :placeholder="t('tradingCommon.placeholder.text3')" :disabled="!isLimit"  min="0"
            v-model="fromData.sell_price" @input="changeSellPrice" />
        <MyInput isLarge v-model="fromData.sell_amount" :placeholder="t('assets.table.field2')" :errorObj="errorObj"
            propName="sell_amount"  min="0" @input="changeSellAmount" hasSuffix>
            <template #suffix>{{ baseAsset }}</template>
        </MyInput>
        <MyInput isLarge v-model="fromData.sell_money" :placeholder="t('assets.table.field4')" :errorObj="errorObj"
             min="0" propName="sell_money" @input="changeSellMoney" hasSuffix>
            <template #suffix>{{ quoteAsset }}</template>

        </MyInput>
        <div class="title">
            {{ t("tradingCommon.text2") }}
            <span class="balance">{{ friendlyNumber(baseBalance) }} {{ baseAsset }}</span>
        </div>
        <el-slider v-model="sellSlider" step="25"  :marks="marks" @input="changeSellSlide" size="small" height="22" class="red-slider" />
        <MyButton :clickFn="() => sureHandle('sell')" size="large" type="danger" class="mt-4"
            :disabled="!fromData.sell_price || !fromData.sell_amount">{{ $t("tradingCommon.text4") }} 
        </MyButton>
    </div>
</template>
<style lang="scss" scoped>
.trading-operation {
    font-family: "PingFang SC";
    padding: 0 24px;
    width: 320px;
    flex-shrink: 0;
}
.green-slider {
    :deep(.el-slider__stop), :deep(.el-slider__bar) {
        background-color: #0CAF60 !important;
    }
    :deep(.el-slider__button) {
        border-color: #0CAF60 !important;
    }
}
.red-slider {
    :deep(.el-slider__stop), :deep(.el-slider__bar){
        background-color: #EF5350 !important;
    }
    :deep(.el-slider__button) {
        border-color: #EF5350 !important;
    }
}
.balance{
    color: #fff;
    font-family: DIN;
    font-weight: bold;
}
.title{
    display: flex;
    justify-content: space-between;
    color: #9098A2;
    margin-bottom: 16px;
}
</style>
