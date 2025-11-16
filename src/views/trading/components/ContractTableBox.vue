<script setup>
import { ref, defineProps, watch, computed, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    getContractOrderApi,
    cancelContractOrderApi,
    closeContractOrderApi,
    updateMarginApi,
    updateStopProfitApi,
} from '@/api/data'
import { successMessage } from '/@/utils/message'
import { friendlyNumber, multiply, divide, subtract, add, setBaseUrl, formatNumber, percentage } from '@/utils/utils'
import dayjs from 'dayjs'
import { useBalance } from '@/hooks/useBalance'
const { getContractBalance, getWalletData } = useBalance([2])
const { t } = useI18n()

const props = defineProps({
    isRefreshBottomTable: {
        type: Boolean,
        default: false,
    },
    symbolInfo: {
        type: Object,
        default: () => { },
    },
    recordMap: {
        type: Object,
        default: () => {
            return {}
        },
    },
    setSub: {
        type: Function,
        default: () => { },
    },
})
const orderMap = ref({})
function socketHandle (data) {
    let eventName = data.data?.event
    if (eventName === 'refresh') {
        getTableList()
    }
    if (eventName === 'order_margin_ratio') {
        let socketData = data.data.payload || {}
        orderMap.value[socketData.order_id] = socketData
    }
}
onMounted(() => {
    props.setSub(
        `person:${localStorage.getItem('uid')}`,
        socketHandle,
        localStorage.getItem('ws_channel_token')
    )
    // 初始化时设置定时器
    setupRefreshTimer()
})

onUnmounted(() => {
    // 组件销毁时清除定时器
    if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
        refreshTimer.value = null
    }
})
const quoteAsset = computed(() => {
    return props.symbolInfo?.quote_asset?.toUpperCase()
})
// 类型
const searchList = computed(() => {
    return [
        {
            name: t('contractOpe.tab.tab1'),
            id: 1,
        },
        {
            name: t('contractOpe.tab.tab2'),
            id: 2,
        },
        {
            name: t('contractOpe.tab.tab3'),
            id: 3,
        },
    ]
})
const tabActive = ref(1)
// 定时器引用
const refreshTimer = ref(null)

const tabChange = id => {
    tabActive.value = id
    getTableList()
    // 切换tab时重新设置定时器
    setupRefreshTimer()
}

// 设置定时刷新
const setupRefreshTimer = () => {
    // 清除现有定时器
    if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
        refreshTimer.value = null
    }
    
    // 只有当 tabActive 为 2 时才启动定时刷新
    if (tabActive.value === 2) {
        refreshTimer.value = setInterval(() => {
            getTableList()
        }, 5000) // 每5秒刷新一次
    }
}
/**
 * table
 */
const tableSearch = ref(false)
const tableParams = reactive({ futures_id: undefined, status: 'pending' })
const tableRefresh = ref(false)

// 通用确认弹框
const dialogVisible = ref(false)
const setRow = ref({})
const handleConfirm = () => {
    if (fullscreenLoading.value) {
        return
    }
    fullscreenLoading.value = true
    const action = opeType.value === 1 ? cancelContractOrderApi : closeContractOrderApi
    action({ order_id: setRow.value.id })
        .then(() => {
            successHandle()
        })
        .finally(() => {
            fullscreenLoading.value = false
        })
}
const checked = ref(false)
const getTableList = () => {
    if ([1, 2].includes(tabActive.value)) {
        tableParams.status = tabActive.value === 1 ? 'pending' : 'open'
        tableParams.futures_id = checked.value ? props.symbolInfo.id : undefined
    }
    else{
        tableParams.status = 'closed'
    }
    nextTick(() => {
        tableRefresh.value = !tableRefresh.value
    })
}
watch(
    () => props.isRefreshBottomTable,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            getTableList()
        }
    }
)
function successHandle () {
    getTableList()
    emit('change')
    successMessage(t('common.opeSuccess'))
    getWalletData(2)
    dialogVisible.value = false
    profitShow.value = false
    marginShow.value = false
}
const emit = defineEmits(['change'])
const fullscreenLoading = ref(false)
const opeType = ref(1) // 1 取消， 2平仓
const cancelHandle = (data, type) => {
    opeType.value = type
    setRow.value = data
    dialogVisible.value = true
}
const changeCheck = val => {
    checked.value = val
    getTableList()
}
function getData (row, prop) {
    let data = props.recordMap[row.symbol] || {}
    row[prop] = +data[prop] || 0
    const show = +data[prop] || 0
    return show
}

const adjustColor = item => {
    item = formatNumber(item)
    if (typeof item === 'number') {
        return item < 0 ? 'red-color' : 'green-color'
    }
    if (typeof item === 'string') {
        if (item.startsWith('-')) {
            return 'red-color'
        } else {
            return 'green-color'
        }
    } 
    return ''
}

const setHandle = item => {
    return percentage(divide(setProfit(item), item.margin))
}
const setProfit = item => {
    //  盈亏 = 交易量(volume) * (最新价格(你获取到最新价格) - 开盘价(open_price))
    // 如果 是卖(side = sell) , 则还需要 abs[取反](盈亏)
    let value = multiply(item.volume, subtract(getData(item, 'price'), item.open_price))
    return item.side === 'sell' ?  multiply(value,-1)  : value
}
// 止盈止损
const profitShow = ref(false)
const showItem = ref({})
const checkFrom = ref({
    sl: '',
    tp: '',
})
const showProfit = data => {
    showItem.value = data
    checkFrom.value.sl = friendlyNumber(data.sl)
    checkFrom.value.tp = friendlyNumber(data.tp)
    profitShow.value = true
}
const errorObj = ref({})
const profitHandleConfirm = () => {
    if (fullscreenLoading.value) {
        return
    }
    fullscreenLoading.value = true
    updateStopProfitApi({
        order_id: showItem.value.id,
        sl: checkFrom.value.sl,
        tp: checkFrom.value.tp,
    })
        .then(() => {
            successHandle()
        })
        .catch(err => {
            errorObj.value = err
        })
        .finally(() => {
            fullscreenLoading.value = false
        })
}
// 保证金修改
const marginShow = ref(false)
const bondValue = ref(0)
const setMargin = item => {
    marginShow.value = true
    showItem.value = item
    bondValue.value = 0
}
const bondList = computed(() => [
    {
        name: t('contractOpe.bond.tab.tab1'),
        id: 1,
    },
    {
        name: t('contractOpe.bond.tab.tab2'),
        id: 2,
    },
])
const bondActiveTab = ref(1)
const bondChange = id => {
    bondActiveTab.value = id
}
const marginHandleConfirm = () => {
    if (fullscreenLoading.value) {
        return
    }
    fullscreenLoading.value = true
    const value = bondActiveTab.value === 1 ? bondValue.value : -bondValue.value
    updateMarginApi({
        order_id: showItem.value.id,
        amount: value,
    })
        .then(() => {
            successHandle()
        })
        .catch(err => {
            errorObj.value = err
        })
        .finally(() => {
            fullscreenLoading.value = false
        })
}
// 保证金调整后
const afterMargin = computed(() => {
    const value = bondActiveTab.value === 1 ? bondValue.value : -bondValue.value
    return add(+showItem.value.margin, +value)
})
// 调整后强平价格
const afterClosePrice = computed(() => {
    // 买: open_price * (1 - margin / (open_price * volume))
    // 卖 open_price * (1+ margin / (open_price * volume))
    if (showItem.value.side === 'buy') {
        return friendlyNumber(
            multiply(
                showItem.value.open_price,
                subtract(
                    1,
                    divide(
                        afterMargin.value,
                        multiply(showItem.value.open_price, showItem.value.volume)
                    )
                )
            )
        )
    } else {
        return friendlyNumber(
            multiply(
                showItem.value.open_price,
                add(
                    1,
                    divide(
                        afterMargin.value,
                        multiply(showItem.value.open_price, showItem.value.volume)
                    )
                )
            )
        )
    }
})
</script>
<template>
    <div class="table-box" v-loading.fullscreen.lock="fullscreenLoading">
        <div class="box-tab ">
            <MyTab :tabList="searchList" :tabActive="tabActive" @tabChange="tabChange" class="flex-shrink-0 mb-4 " isBlock />

            <el-checkbox v-if="[1, 2].includes(tabActive)" @change="changeCheck" v-model="checked" class="ml-auto">{{
                $t('spotOpe.hidden') }}
            </el-checkbox>
        </div>
        <ob-table-page v-if="tabActive == 1"  :tableRefresh="tableRefresh" :tableParams="tableParams" :hasBtn="false"
            :tableSearch="tableSearch" :isPage="false" :getTableUrl="getContractOrderApi" :defaultGet="false" isSmall>
            <template #table="{ tableData }">
                <el-table :data="tableData" height="auto">
                    <!-- 合约订单 -->
                    <el-table-column :label="t('contractOpe.colum.field1')" width="150">
                        <template #default="{ row }">
                            <div class="flex">
                                <img :src="setBaseUrl(row.logo)" class="b-img" alt="" />
                                {{ row.name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field2')">
                        <template #default="{ row }">
                            {{
                                row.trade_type === 'limit'
                                    ? $t('spotOpe.order.order1')
                                    : $t('spotOpe.order.order2')
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field3')">
                        <template #default="{ row }">
                            <div :class="[row.side === 'buy' ? 'green-color' : 'red-color']">
                                {{
                                    row.side === 'buy'
                                        ? $t('spotOpe.type.type1')
                                        : $t('spotOpe.type.type2')
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field4')">
                        <template #default="{ row }">
                            {{ dayjs(row.created_at).format('DD.MM.YYYY HH:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field5')" align="right">
                        <template #default="{ row }">
                            {{
                                row.margin_type === 'crossed'
                                    ? $t('contractOpe.level.tab.tab1')
                                    : $t('contractOpe.level.tab.tab2')
                            }}
                            {{ row.leverage }}x
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field6')" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.price) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum.field7')}`" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.match_price) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum.field8')}`" align="right" min-width="100">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.volume) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum.field9')}`" align="right" min-width="100">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.trade_volume) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum.field10')}`" width="100">
                        <template #default="{ row }">
                            <div class="ope-btn" @click="cancelHandle(row, 1)">
                                {{ $t('spotOpe.cancel') }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </ob-table-page>
        <ob-table-page v-if="tabActive == 2" hideLoading :tableRefresh="tableRefresh" :tableParams="tableParams" :hasBtn="false"
            :isPage="false" :getTableUrl="getContractOrderApi" :defaultGet="false" isSmall>
            <template #table="{ tableData }">
                <el-table :data="tableData" height="auto">
                    <!-- 合约订单 -->
                    <el-table-column :label="t('contractOpe.colum.field1')" width="150" fixed>
                        <template #default="{ row }">
                            <div class="flex">
                                <img :src="setBaseUrl(row.logo)" class="b-img" alt="" />
                                {{ row.name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field2')" min-width="120">
                        <template #default="{ row }">
                            {{
                                row.trade_type === 'limit'
                                    ? $t('spotOpe.order.order1')
                                    : $t('spotOpe.order.order2')
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field3')" width="100">
                        <template #default="{ row }">
                            <div :class="[row.side === 'buy' ? 'green-color' : 'red-color']">
                                {{
                                    row.side === 'buy'
                                        ? $t('spotOpe.type.type1')
                                        : $t('spotOpe.type.type2')
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field4')" width="160" >
                        <template #default="{ row }">
                            {{ dayjs(row.created_at).format('DD.MM.YYYY HH:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum2.label7')" width="100" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.price) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum.field5')" align="right" min-width="120">
                        <template #default="{ row }">
                            {{
                                row.margin_type === 'crossed'
                                    ? $t('contractOpe.level.tab.tab1')
                                    : $t('contractOpe.level.tab.tab2')
                            }}
                            {{ row.leverage }}x
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.colum2.field6')" align="right" min-width="120">
                        <template #default="{ row }">
                            <div :class="[adjustColor(setProfit(row))]">
                                {{ friendlyNumber(setProfit(row)) }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.field7')}`" align="right" min-width="130">
                        <template #default="{ row }">
                            <div :class="[adjustColor(setHandle(row))]">
                                {{setHandle(row) }}%
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('unit.number')}`" align="right" min-width="120">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.lots) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.label1')}`" align="right" min-width="120">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.volume) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.label2')}(${quoteAsset})`" align="right"
                        min-width="120">
                        <template #default="{ row }">
                            <div class="flex items-center justify-end">
                                {{ friendlyNumber(row.margin) }}
                                <img src="../img/add.png" class="w-4 h-4 ml-2" v-if="row.margin_type === 'isolated'"
                                    alt="" @click="setMargin(row)" />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.label3')}`" align="right" min-width="120">
                        <template #default="{ row }">
                            {{
                                `${row.margin_type !== 'crossed'
                                    ? friendlyNumber(row.margin_ratio)
                                    : percentage(orderMap[row.id]?.margin_ratio || row.margin_ratio, false)
                                }%`
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.label4')}`" align="right" min-width="120">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.open_fee) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.label5')}`" align="right" min-width="120">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.open_price) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum2.label6')}`" align="right" min-width="120">
                        <template #default="{ row }">
                            {{
                                row.margin_type !== 'crossed'
                                    ? friendlyNumber(row.force_close_price)
                                    : orderMap[row.id]?.force_price ||
                                    friendlyNumber(row.force_close_price)
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.colum.field10')}`" width="100" fixed="right">
                        <template #default="{ row }">
                            <div class="ope-btn-blue" @click="showProfit(row)">
                                {{ $t('contractOpe.colum2.btn1') }}
                            </div>
                            <div class="ope-btn ml-5" @click="cancelHandle(row, 2)">
                                {{ $t('contractOpe.colum2.btn2') }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </ob-table-page>
        <ob-table-page v-if="tabActive == 3" :tableRefresh="tableRefresh" :hasBtn="false" :isPage="false"
            :getTableUrl="getContractOrderApi" :defaultGet="false" :tableParams="tableParams" isSmall>
            <template #table="{ tableData }">
                <el-table :data="tableData" height="auto">
                    <!-- 合约订单 -->
                    <el-table-column :label="t('contractOpe.history.field1')" width="150">
                        <template #default="{ row }">
                            <div class="flex">
                                <img :src="setBaseUrl(row.logo)" class="b-img" alt="" />
                                {{ row.name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.history.field2')">
                        <template #default="{ row }">
                            {{
                                row.trade_type === 'limit'
                                    ? $t('spotOpe.order.order1')
                                    : $t('spotOpe.order.order2')
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.history.field3')" width="100">
                        <template #default="{ row }">
                            <div :class="[row.side === 'buy' ? 'green-color' : 'red-color']">
                                {{
                                    row.side === 'buy'
                                        ? $t('spotOpe.type.type1')
                                        : $t('spotOpe.type.type2')
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.history.field4')">
                        <template #default="{ row }">
                            {{ dayjs(row.created_at).format('DD.MM.YYYY HH:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.history.field13')">
                        <template #default="{ row }">
                            {{ dayjs(row.close_time).format('DD.MM.YYYY HH:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('contractOpe.history.field5')" align="right">
                        <template #default="{ row }">
                            {{
                                row.margin_type === 'crossed'
                                    ? $t('contractOpe.level.tab.tab1')
                                    : $t('contractOpe.level.tab.tab2')
                            }}
                            {{ row.leverage }}x
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field6')}`" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.volume) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field7')}`" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.open_price) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field14')}`" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.close_price) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field11')}`" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.open_fee) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field12')}`" align="right">
                        <template #default="{ row }">
                            {{ friendlyNumber(row.close_fee) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field8')}(${quoteAsset})`" align="right">
                        <template #default="{ row }">
                            <div :class="[
                                (row.trade_status === 'open' ? formatNumber(setProfit(row)) : +row.profit) >=
                                    0
                                    ? 'green-color'
                                    : 'red-color',
                            ]">
                                {{
                                    row.trade_status === 'open'
                                        ? setProfit(row)
                                        : friendlyNumber(row.profit)
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field10')}`" align="right">
                        <template #default="{ row }">
                            <div :class="[
                                (row.trade_status === 'open' ? formatNumber(setHandle(row)) : +row.profit_ratio) >=
                                    0
                                    ? 'green-color'
                                    : 'red-color',
                            ]">
                                {{
                                    row.trade_status === 'open'
                                        ? `${setHandle(row)}%`
                                        : `${percentage(row.profit_ratio)}%`
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="`${t('contractOpe.history.field9')}`" width="120">
                        <template #default="{ row }">
                            <div :class="[
                                row.trade_status === 'closed'
                                    ? 'green-color'
                                    : row.trade_status === 'cancel'
                                        ? 'color-red'
                                        : 'color-grey',
                            ]">
                                {{ $t(`contractOpe.status.${row.trade_status}`) }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </ob-table-page>
        <my-dialog v-model="dialogVisible" :title="t('common.text3')" width="343px" @confirm="handleConfirm"
            @close="dialogVisible = false">
            <div class="my-dialog-body">
                {{ opeType === 1 ? t('contractOpe.cancelText') : t('contractOpe.closeText') }}
            </div>
        </my-dialog>
        <my-dialog v-model="profitShow" :title="t('contractOpe.orderSure.info.label4')" width="343px"
            @confirm="profitHandleConfirm" @close="profitShow = false" :disabled="!checkFrom.sl || !checkFrom.tp">
            <MyInput v-model="checkFrom.tp" :placeholder="$t('contractOpe.check.label1')" :errorObj="errorObj"
                propName="tp" isSmall  />
            <MyInput v-model="checkFrom.sl" :placeholder="$t('contractOpe.check.label2')" :errorObj="errorObj"
                propName="sl" isSmall  />
        </my-dialog>
        <!-- 保证金修改 -->
        <my-dialog v-model="marginShow" :title="t('contractOpe.bond.title')" width="383px"
            @confirm="marginHandleConfirm" @close="marginShow = false" :disabled="!bondValue">
            <div class="h-full flex flex-col pb-4">
                <div class="level-select mb-5">
                    <div class="level-item" v-for="item in bondList" :key="item.id"
                        :class="{ active: bondActiveTab === item.id }" @click="bondChange(item.id)">
                        {{ item.name }}
                    </div>
                </div>
                <MyInput v-model="bondValue" :errorObj="errorObj" propName="sl" isSmall  hasSuffix>
                    <template #suffix>
                        <div class="flex items-center">
                            USDC
                            <span class="all-btn" @click="bondValue = +getContractBalance">{{
                                $t('contractOpe.bond.all')
                                }}</span>
                        </div>
                    </template>
                </MyInput>
                <div class="flex items-center justify-between">
                    <div class="bond-label">{{ $t('contractOpe.bond.label1') }}</div>
                    <div class="bond-value">{{ getContractBalance }}USDC</div>
                </div>
                <div class="flex justify-between">
                    <div class="bond-box">
                        <div class="bond-label">{{ showItem.name }}</div>
                        <div class="bond-label">{{ $t('contractOpe.bond.info.label3') }}</div>
                        <div class="bond-label">{{ $t('contractOpe.bond.info.label4') }}</div>
                    </div>
                    <div class="bond-box text-center">
                        <div class="bond-label">{{ $t('contractOpe.bond.info.label1') }}</div>
                        <div class="bond-value">{{ showItem.margin }}</div>
                        <div class="bond-value" :class="[bondActiveTab === 0 ? 'green-color' : 'red-color ']">
                            {{ friendlyNumber(afterMargin) }}
                        </div>
                    </div>
                    <div class="bond-box text-right">
                        <div class="bond-label">{{ $t('contractOpe.bond.info.label2') }}</div>
                        <div class="bond-value">
                            {{ showItem.force_close_price }}
                        </div>
                        <div class="bond-value" :class="[bondActiveTab === 0 ? 'green-color' : 'red-color ']">
                            {{ afterClosePrice }}
                        </div>
                    </div>
                </div>
            </div>
        </my-dialog>
    </div>
</template>
<style lang="scss" scoped>
.table-box {
    height: 600px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    margin-top: 36px;
    .box-tab{
    display: flex;
    align-items: center;
    justify-content: space-between;
    :deep(.tab-block){
        min-width: 120px;
    }
}
    .my-dialog-body {
        text-align: center;
    }
}

.level-select {
    display: flex;
    justify-content: space-between;

    .level-item {
        cursor: pointer;
        font-family: DIN;
        min-width: 60px;
        padding: 12px;
        font-size: 14px;
        color: #fff;
        text-align: center;
        margin-right: 12px;
        background: rgb(139 147 154 / 30%);
        flex: auto;
        border-radius: 12px;

        &:last-child {
            margin-right: 0;
        }

        &.active {
            background: var(--el-color-primary);
        }
    }
}

.all-btn {
    color: var(--el-color-primary);
    margin-left: 12px;
}

.bond-label {
    font-weight: 400;
    font-size: 14px;
    color: #8b939a;
    line-height: 24px;
}

.bond-value {
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    line-height: 24px;
    word-break: break-all;
    font-family: DIN;
}

.bond-box {
    width: 30%;
    flex: auto;

    .bond-label,
    .bond-value {
        margin-top: 14px;
    }
}

:deep(.el-dialog__footer) {
    button {
        flex: auto;
    }
}

:deep(.el-table .cell) {
    padding: 0 6px !important;
}
</style>
