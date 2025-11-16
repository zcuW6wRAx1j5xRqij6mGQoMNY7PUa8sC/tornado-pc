<script  setup>
import { ref, computed } from 'vue'
import { getContractOrderApi, getSpotOrderApi } from '@/api/data'
import { useI18n } from 'vue-i18n'
import { friendlyNumber, multiply, subtract, setBaseUrl , formatNumber} from '@/utils/utils'
import dayjs from 'dayjs'
import useSocket from '@/hooks/useSocket'
const recordMap = ref({})
const setListData = data => {
    recordMap.value[data.data.symbol] = data.data
}
useSocket('public:spot_allticker', setListData)
function getData(row, prop, needSymbol = false) {
    let data = recordMap.value[row.symbol] || {}
    row[prop] = +data[prop] || 0
    const show = +data[prop] || 0
    if (needSymbol) {
        if (show > 0) {
            return `+${show}`
        }
    }
    return show
}
const setProfit = item => {
    //  盈亏 = 交易量(volume) * (最新价格(你获取到最新价格) - 开盘价(open_price))
    // 如果 是卖(side = sell) , 则还需要 abs[取反](盈亏)
    let value = multiply(item.volume, subtract(getData(item, 'price'), item.open_price))
    return friendlyNumber(item.side === 'sell' ? -value : value)
}
const { t } = useI18n()
// 类型
const tabList = computed(() => {
    return [
        { id: 0, name: t('orderHis.tab.tab1') },
        { id: 1, name: t('orderHis.tab.tab2') },
    ]
})
const tabActive = ref(0)
const tabChange = id => {
    tabActive.value = id
}
const tableRefresh = ref(false)
</script>
<!--  -->
<template>
    <div class="flex-auto overflow-auto">
        <MyTab
        :tabList="tabList"
        :tabActive="tabActive"
        @tabChange="tabChange"
        class="flex-shrink-0 justify-self-start mb-4"
        isBlock
    />
    <ob-table-page
        v-if="tabActive == 0"
        :tableRefresh="tableRefresh"
        :hasBtn="false"
        :isPage="false"
        :getTableUrl="getSpotOrderApi"
    >
        <template #table="{ tableData }">
            <el-table :data="tableData" height="auto">
                <!-- 现货订单 -->
                <el-table-column :label="t('spotOpe.history.field1')" width="150">
                    <template #default="{ row }">
                        <div class="flex">
                            <img :src="setBaseUrl(row.logo)" class="b-img" alt="" />
                            {{ row.name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="t('spotOpe.history.field2')">
                    <template #default="{ row }">
                        {{
                            row.trade_type === 'limit'
                                ? $t('spotOpe.order.order1')
                                : $t('spotOpe.order.order2')
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('spotOpe.history.field3')">
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
                <el-table-column :label="t('spotOpe.history.field4')" width="180">
                    <template #default="{ row }">
                        {{ dayjs(row.created_at).format('DD.MM.YYYY HH:mm:ss') }}
                    </template>
                </el-table-column>
                <el-table-column :label="`${t('spotOpe.history.field5')}`" align="right" min-width="120">
                    <template #default="{ row }">
                        {{
                            `${
                                row.trade_status === 'failed' ? '-' : friendlyNumber(row.volume)
                            } / ${friendlyNumber(row.volume)}`
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="`${t('spotOpe.history.field6')}(USDC)`"
                    align="right"
                    min-width="120"
                >
                    <template #default="{ row }">
                        {{
                            `${
                                row.trade_status === 'failed'
                                    ? '-'
                                    : friendlyNumber(row.trade_volume)
                            } / ${friendlyNumber(row.trade_volume)}`
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="`${t('spotOpe.history.field7')}`" align="right">
                    <template #default="{ row }">
                        {{ row.trade_status === 'failed' ? '-' : friendlyNumber(row.match_price) }}
                    </template>
                </el-table-column>
                <el-table-column :label="`${t('spotOpe.history.field8')}`" align="right">
                    <template #default="{ row }">
                        {{ row.trade_status === 'failed' ? '-' : friendlyNumber(row.price) }}
                    </template>
                </el-table-column>
                <el-table-column :label="`${t('spotOpe.history.field9')}`" width="120">
                    <template #default="{ row }">
                        <div
                            :class="[
                                row.trade_status === 'success'
                                    ? 'green-color'
                                    : row.trade_status === 'failed'
                                    ? 'color-red'
                                    : 'color-grey',
                            ]"
                        >
                            {{
                                row.trade_status === 'pending'
                                    ? $t('spotOpe.pending')
                                    : row.trade_status === 'success'
                                    ? $t('spotOpe.success')
                                    : $t('spotOpe.failed')
                            }}
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </ob-table-page>
    <ob-table-page
        v-if="tabActive == 1"
        :tableRefresh="tableRefresh"
        :hasBtn="false"
        :isPage="false"
        :getTableUrl="getContractOrderApi"
    >
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
                <el-table-column :label="`${t('contractOpe.history.field8')}(USDC)`" align="right">
                    <template #default="{ row }">
                        <div
                            :class="[
                                (row.trade_status === 'open' ? formatNumber(setProfit(row)) : +row.profit) >= 0
                                    ? 'green-color'
                                    : 'red-color',
                            ]"
                        >
                            {{
                                row.trade_status === 'open'
                                    ? setProfit(row)
                                    : friendlyNumber(row.profit)
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="`${t('contractOpe.history.field9')}`" width="120">
                    <template #default="{ row }">
                        <div
                            :class="[
                                row.trade_status === 'closed'
                                    ? 'green-color'
                                    : row.trade_status === 'cancel'
                                    ? 'color-red'
                                    : 'color-grey',
                            ]"
                        >
                            {{ $t(`contractOpe.status.${row.trade_status}`) }}
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </ob-table-page>
    </div>
</template>

<style scoped>
:deep(.tab-block){
    min-width: 120px;
}</style>
