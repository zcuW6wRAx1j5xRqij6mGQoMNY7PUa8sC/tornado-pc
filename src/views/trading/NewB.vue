<script  setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useSocket from '@/hooks/useSocket'
import { getSpotListApi, getContractListApi } from '@/api/data'
import { friendlyNumber, setBaseUrl } from '@/utils/utils'
const { t } = useI18n()
const router = useRouter()
const tableSearch = ref(false)
const tableRefresh = ref(false)
const typeTabList = computed(() => {
    return [
        { id: 'spot', name: t('transaction.tab3') },
        { id: 'futures', name: t('transaction.tab4') },
    ]
})
const recordMap = ref({})
const setListData = data => {
    recordMap.value[data.data.symbol] = data.data
}

function getData(row, prop) {
    let data = recordMap.value[row.symbol] || {}
    row[prop] = +data[prop] || '-'
    const show = +data[prop] || '-'
    return show
}
const typeActiveTab = ref('spot')
const action = ref(getSpotListApi)
const tableParams = reactive({ coin_type: 'new' })
const { setSub, unsubscribeAll } = useSocket('public:allticker', setListData)
const typeTabChange = id => {
    typeActiveTab.value = id
    action.value = typeActiveTab.value === 'spot' ? getSpotListApi : getContractListApi
    tableSearch.value = !tableSearch.value
    unsubscribeAll()
    setSub(`public:allticker`, setListData)
}
const handleCellClick = (row) => {
    router.push({
        path: typeActiveTab.value === 'spot' ? '/SpotTrading' : '/ContractTrading',
        query: {
            id: row.id,
        },
    })
}
</script>

<template>
    <MyTab
        :tabList="typeTabList"
        :tabActive="typeActiveTab"
        @tabChange="typeTabChange"
        class="flex-shrink-0"
        isFlex
    />
    <ob-table-page
        :getTableUrl="action"
        :tableRefresh="tableRefresh"
        :tableParams="tableParams"
        :hasBtn="false"
        :tableSearch="tableSearch"
        pageSize="300"
        hidePage
        isNum
    >
        <template #table="{ tableData }">
            <el-table :data="tableData" height="auto" @cell-click="handleCellClick">
                <el-table-column :label="t('spotOpe.colum4.field1')">
                    <template #default="{ row }">
                        <div class="flex">
                            <img :src="setBaseUrl(row.logo)" class="b-img" alt="" /> {{ row.name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="t('tradingCommon.text21')">
                    <template #default="{ row }">
                        <div
                            :class="[
                                getData(row, 'price_latest_change') >= 0
                                    ? 'green-color'
                                    : 'red-color ',
                            ]"
                        >
                            {{ friendlyNumber(getData(row, 'price')) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="t('tradingCommon.text22')">
                    <template #default="{ row }">
                        <span
                            :class="[
                                getData(row, 'price_change_percent') > 0
                                    ? 'green-color'
                                    : 'red-color',
                            ]"
                        >
                            {{ friendlyNumber(getData(row, 'price_change_percent')) }}%</span
                        >
                    </template>
                </el-table-column>
                <el-table-column :label="t('tradingCommon.text23')">
                    <template #default="{ row }">
                        {{ friendlyNumber(getData(row, 'high_price_24h')) }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('tradingCommon.text24')">
                    <template #default="{ row }">
                        {{ friendlyNumber(getData(row, 'low_price_24h')) }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('tradingCommon.text25')">
                    <template #default="{ row }">
                        {{ friendlyNumber(getData(row, 'volume')) }}
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </ob-table-page>
</template>

<style scoped></style>
