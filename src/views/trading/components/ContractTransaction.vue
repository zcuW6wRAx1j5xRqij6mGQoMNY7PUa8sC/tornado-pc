<script setup>
import { useI18n } from "vue-i18n"
import { ref, defineProps, defineEmits } from "vue"
import { successMessage } from "/@/utils/message"
import { useBalance } from "@/hooks/useBalance"
import { friendlyNumber, multiply, divide, removeDot } from "@/utils/utils"
import { addContractOrderApi, } from "@/api/data"
import { getLeverApi } from "@/api/common"
const { getContractBalance, getWalletData } = useBalance([2])
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
    isSpot: {
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
        getWalletData(2)
    }
)
const quoteAsset = computed(() => {
    return props.symbolInfo?.quote_asset?.toUpperCase()
})
const baseAsset = computed(() => {
    return props.symbolInfo?.base_asset?.toUpperCase()
})
let emit = defineEmits(["refreshBottomTable"])
const errorObj = ref({})
const leverList = ref([])
onMounted(() => {
    getLeverApi().then(data => {
        leverList.value = Object.keys(data).map((el) => {
            return {
                name: `${el}X`,
                value: el,
                isDisabled: +data[el] === 0,
            };
        });
        if (leverList.value.length > 0) {
            initFrom.value.leverage = leverList.value[0].value
            initFromHandle()
        }

    })
})
const initFrom = ref({
    document_type_label: "",
    document_type: "market",
    price: 0, // 价格
    amount: "", // 数量
    leverage: 100, // 杠杆
    margin_type: "crossed",
})
const fromData = ref({ ...initFrom.value })
// 是否是限价订单
const isLimit = computed(() => {
    return fromData.value.document_type === "limit"
})
// 初始化表单
const initFromHandle = () => {
    fromData.value = {
        ...initFrom.value,
    }
    checked.value = false
    resetFrom()
    fromData.value.price = friendlyNumber(nowData.value.price)
}
const fullscreenLoading = ref(false)
const dialogVisible = ref(false)
const clickType = ref("")
const sureHandle = (type) => {
    clickType.value = type
    dialogVisible.value = true
}
const suerShow = computed(() => {
    const levelActiveTabName =
        fromData.value.margin_type === "crossed"
            ? t("contractOpe.level.tab.tab1")
            : t("contractOpe.level.tab.tab2")
    return [
        {
            name: t("contractOpe.orderSure.info.label1"),
            value: `≈ ${fromData.value.price} USDC`,
        },
        {
            name: t("contractOpe.orderSure.info.label2"),
            value: `${fromData.value.amount} ${t('unit.lots')} = ${friendlyNumber(multiply(removeDot(fromData.value.amount), 100))} USDC`,
        },
        {
            name: t("contractOpe.orderSure.info.label3"),
            value: `${levelActiveTabName}${fromData.value.leverage}x`,
        },
        {
            name: t("contractOpe.orderSure.info.label4"),
            value: `${checkFrom.value.tp || "-"}/${checkFrom.value.sl || "-"}`,
        },
        {
            name: t("contractOpe.orderSure.info.label5"),
            value: `${clickType.value === "buy" ? t("contractOpe.btn.btn1") : t("contractOpe.btn.btn2")}`,
        },
    ]
})
const handleConfirm = async () => {
    if (fullscreenLoading.value) {
        return
    }
    let params = {
        futures_id: props.symbolInfo.id,
        side: clickType.value, // 买卖方向
        trade_volume: fromData.value.amount, // 数量
        trade_type: fromData.value.document_type, // 交易类型
        leverage: fromData.value.leverage, // 杠杆
        price: fromData.value.price, // 价格
        margin_type: fromData.value.margin_type, // 保证金类型
        lots: fromData.value.amount, // 手数
    }
    if (checked.value) {
        params = {
            ...params,
            ...checkFrom.value,
        }
    }
    fullscreenLoading.value = true
    return addContractOrderApi(params)
        .then(() => {
            successMessage(t("common.opeSuccess"))
            initFromHandle()
            getWalletData(2)
            dialogVisible.value = false
            emit("refreshBottomTable")
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
        }
    }
}
watch(() => props.symbolData, dataChange)

const selectChange = (val) => {
    initFromHandle()
    fromData.value.document_type = val
}
//  保证金  输入的数量 * 100
const bond = computed(() => {
    return multiply(removeDot(fromData.value.amount), 100);
});
// const bond = ref(0)
const changeAmount = (val) => {
    if (typeof val === "object") {
        return
    }
    if (!val) {
        bond.value = 0
    } else {
        bond.value = divide(removeDot(val), fromData.value.leverage)
    }
    // 计算slider的值
    slider.value = +multiply(divide(val, getContractBalance.value), 100)
}
function resetFrom () {
    fromData.value.amount = ""
    fromData.value.money = ""
    checkFrom.value = {
        sl: "",
        tp: "",
    }
    slider.value = 0
}
const changeLeverage = (val) => {
    if (typeof val === "object") {
        return
    }
    resetFrom()
    if (val > 100) {
        fromData.value.leverage = 100
    }
}
// 止盈止损
const checked = ref(false)
const checkFrom = ref({
    sl: "",
    tp: "",
})
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
const changeSlide = val => {
    fromData.value.amount = multiply(divide(multiply(val, getContractBalance.value), 100), fromData.value.leverage)
   
    bond.value = multiply(divide(val, 100), getContractBalance.value)
   
}
// 输入的数量 * 100 / 价格
const tradeVolume = computed(() => {
    return friendlyNumber(divide(multiply(multiply(removeDot(fromData.value.amount), 100), fromData.value.leverage), removeDot(fromData.value.price)))
});

const typeList = computed(() => [
    {
        name: t("contractOpe.btn.btn1"),
        id: "buy",
    },
    {
        name: t("contractOpe.btn.btn2"),
        id: "sell",
    },
])
const typeActive = ref("buy")
const typeChange = (val) => {
    typeActive.value = val
}
</script>
<template>
    <div class="trading-operation" v-loading.fullscreen.lock="fullscreenLoading">
        <MyTab :tabList="typeList" :tabActive="typeActive" @tabChange="typeChange" class="flex-shrink-0 mb-4 w-full"
            isBlock />
        <el-select size="large"  v-model="fromData.margin_type" @change="resetFrom"
            :placeholder="$t('contractOpe.level.title')">
            <el-option :label="$t('contractOpe.level.tab.tab1')" value="crossed" />
            <el-option :label="$t('contractOpe.level.tab.tab2')" value="isolated" />
        </el-select>
        <el-select size="large"  v-model="fromData.leverage" @change="resetFrom"
            :placeholder="$t('assets.table.field25')">
            <el-option v-for="item in leverList" :key="item.value" :label="item.name" :value="item.value" :disabled="item.isDisabled" />
        </el-select>
        <MyInput isLarge :placeholder="t('tradingCommon.placeholder.text3')" :disabled="!isLimit" v-model="fromData.price"
             :errorObj="errorObj" propName="price" @input="resetFrom" />
        <el-checkbox v-model="checked" class="mb-2" >{{
            $t("contractOpe.check.checkTxt")
        }}</el-checkbox>
            <MyInput isLarge :placeholder="t('contractOpe.check.label1')"  v-model="checkFrom.tp" :errorObj="errorObj"
                propName="tp" v-if="checked" />
                <MyInput isLarge :placeholder="t('contractOpe.check.label2')"  v-model="checkFrom.sl" :errorObj="errorObj"
                propName="sl" v-if="checked" />
        <el-select size="large" v-model="fromData.document_type"  :placeholder="$t('tradingCommon.placeholder.text1')"
            @change="selectChange">
            <el-option :label="$t('spotOpe.order.order1')" value="limit" />
            <el-option :label="$t('spotOpe.order.order2')" value="market" />
        </el-select>
        <MyInput isLarge v-model="fromData.amount" type="number"  :placeholder="t('assets.table.field2')"
            :errorObj="errorObj" propName="amount"  hasSuffix>
            <template #suffix>{{ $t('unit.lots') }}</template>
        </MyInput>
        <MyInput isLarge :modelValue="tradeVolume"   :placeholder="t('unit.tradeVolume')" disabled
            :errorObj="errorObj" propName="amount" hasSuffix>
            <template #suffix><span >{{ baseAsset }}</span></template>
        </MyInput>
        <div class="title">
            1{{ $t('unit.lots') }} = <span class="font-bold ml-1">100 USDC</span>
        </div>
       
        <div class="title">
            {{ $t("walletAsset.spotWallet.wallet1") }}
            <span class="balance">{{ getContractBalance }} USDC</span>
        </div>
        <div class="title">
            {{ $t("contractOpe.label.label2") }}
            <span class="balance">{{ bond }} {{ quoteAsset }}</span>
        </div>
        <MyButton size="large" :clickFn="() => sureHandle(typeActive)" class="mt-auto" :type="typeActive === 'buy' ? 'green' : 'danger'"
            :disabled="!fromData.leverage || !fromData.amount">{{ typeActive === 'buy' ? $t("contractOpe.btn.btn1") : $t("contractOpe.btn.btn2") }}
        </MyButton>
        <my-dialog v-model="dialogVisible" :title="t('contractOpe.orderSure.title')" 
        @confirm="handleConfirm" @close="dialogVisible = false" :width="400">
        <div class="flex items-center justify-between mt-4" v-for="(item, index) in suerShow" :key="index">
            <div class="bond-label">{{ item.name }}</div>
            <div class="bond-value">{{ item.value }}</div>
        </div>
    </my-dialog>
    </div>
    
</template>
<style lang="scss" scoped>
.trading-operation {
    font-family: "PingFang SC";
    padding: 0 24px;
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}
:deep(.my-input),:deep(.el-select){
    margin-bottom: 10px;
}

.balance {
    font-family: DIN;
    font-weight: bold;
    font-size: 14px;
    color: #fff;
}

.bond-label {
    font-family: "PingFang SC";
    font-weight: 400;
    font-size: 14px;
    color: #8b939a;
    line-height: 24px;
}

.bond-value {
    font-family: "PingFang SC";
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    line-height: 24px;
    word-break: break-all;
}
.title{
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
:deep(.el-dialog__footer) {
    button {
        flex: auto;
    }
}
</style>
