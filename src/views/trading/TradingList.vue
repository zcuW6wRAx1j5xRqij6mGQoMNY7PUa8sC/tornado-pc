<script setup>
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import useSocket from "@/hooks/useSocket"
import { Search } from "@element-plus/icons-vue"
import CustomTable from "@/components/CustomTable"
import {
    getSpotListApi,
    getCollectListApi,
    addCollectApi,
    getContractListApi,
} from "@/api/data"
import { friendlyNumber, setBaseUrl } from "@/utils/utils"
import { onUnmounted, onMounted } from "vue"
import { useDebounceFn } from '@vueuse/core'

const { t } = useI18n()
const router = useRouter()
const tableSearch = ref(false)
const tableRefresh = ref(false)
const typeTabList = computed(() => {
    return [
        { id: 0, name: t("transaction.tab1") },
        { id: 1, name: t("transaction.tab2") },
    ]
})
const type =
    router.currentRoute.value.path === "/TradingList" ? "spot" : "futures"
const action = ref(type === "spot" ? getSpotListApi : getContractListApi)
const tableParams = reactive({ symbol_type: type })
const typeActiveTab = ref(0)
const typeTabChange = (id) => {
    typeActiveTab.value = id
    action.value =
        id === 0
            ? type === "spot"
                ? getSpotListApi
                : getContractListApi
            : getCollectListApi
    tableSearch.value = !tableSearch.value
}
const handleCellClick = (row) => {
    router.push({
        path: type === "spot" ? "/SpotTrading" : "/ContractTrading",
        query: {
            id: row.id,
        },
    })
}
const recordMap = ref(new Map())
const setListData = (data) => {
    recordMap.value.set(data.data.symbol, data.data)
}

// 优化：只在组件挂载时订阅WebSocket，组件卸载时取消订阅
const { setSub, unsubscribeChannel } = useSocket()
onMounted(() => {
    setSub('public:allticker', setListData)
})

function getData (row, prop) {
    let data = recordMap.value.get(row.symbol) || {}
    row[prop] = +data[prop] || "-"
    const show = +data[prop] || "-"
    return show
}
const colletLoading = ref(false)
// 收藏
const handleCollect = (row) => {
    if (colletLoading.value) return
    colletLoading.value = true
    // spot 现货/ futures 合约
    addCollectApi({
        symbol_id: row.id,
        symbol_type: type,
    }).then(() => {
        row.is_collection = !row.is_collection
    }).finally(() => {
        colletLoading.value = false
    })
}
const initData = ref([])
const getTableData = ({ setData }) => {
    initData.value = setData
    dataList.value = setData
}
const inputData = ref('')
const dataList = ref([])

// 优化：使用防抖搜索，避免频繁过滤
const debouncedSearch = useDebounceFn(() => {
    if (!inputData.value.trim()) {
        dataList.value = initData.value
        return
    }
    // 优化：避免深拷贝，直接过滤
    dataList.value = initData.value.filter(item => 
        item.name.toLowerCase().includes(inputData.value.toLowerCase())
    )
}, 300)

const handleSearch = () => {
    debouncedSearch()
}

// 监听输入变化，自动搜索
watch(inputData, () => {
    debouncedSearch()
})

// 表格列配置
const tableColumns = computed(() => [
    { prop: 'index', label: '#', width: '80px' },
    { prop: 'name', label: t('spotOpe.colum4.field1'),  },
    { prop: 'price', label: t('tradingCommon.text21'),  align: 'right' },
    { prop: 'price_change_percent', label: t('tradingCommon.text22'),  align: 'right' },
    { prop: 'high_price_24h', label: t('tradingCommon.text23'),  align: 'right' },
    { prop: 'low_price_24h', label: t('tradingCommon.text24'),  align: 'right' },
    { prop: 'volume', label: t('tradingCommon.text25'),  align: 'right' },
    { prop: 'action', label: t('otcHis.label1'), width: '100px' },
    { prop: 'collection', label: '', width: '80px' }
])

// 处理表格行点击
const handleRowClick = ({ row }) => {
    handleCellClick(row)
}

onUnmounted(() => {
    recordMap.value.clear()
    // 取消WebSocket订阅
    unsubscribeChannel('public:allticker')
})
</script>

<template>
    <div class="top-box">
        <MyTab :tabList="typeTabList" :tabActive="typeActiveTab" @tabChange="typeTabChange" class="flex-shrink-0"
            isBlock />
        <el-input v-model="inputData" class="w-240 ml-auto" :placeholder="t('common.search')" />
        <el-icon class="ml-4 cursor-pointer" @click="handleSearch">
            <Search />
        </el-icon>
    </div>
    <ob-table-page :getTableUrl="action" :tableRefresh="tableRefresh" :tableParams="tableParams" :hasBtn="false"
        :tableSearch="tableSearch" :pageSize="100" hidePage :isPage="typeActiveTab === 0" isNum :hasSearch="false"
        @getData="getTableData">
        <template #table="{ }">
            <CustomTable 
                :data="dataList" 
                :columns="tableColumns" 
                :loading="!dataList.length"
                :row-height="68"
                :virtual-scroll="true"
                @row-click="handleRowClick"
            >
                <!-- 序号列 -->
                <template #cell-index="{ index }">
                    {{ index + 1 }}
                </template>
                
                <!-- 名称列 -->
                <template #cell-name="{ row }">
                    <div class="flex b-box">
                        <img :src="setBaseUrl(row.logo)" class="b-img" alt="" />
                        {{ row.name }}
                    </div>
                </template>
                
                <!-- 最新价格列 -->
                <template #cell-price="{ row }">
                    <div :class="[
                        getData(row, 'price_latest_change') >= 0
                            ? 'c-num-status'
                            : 'c-num-status is-red',
                    ]">
                        {{ friendlyNumber(getData(row, "price")) }}
                    </div>
                </template>
                
                <!-- 涨跌幅列 -->
                <template #cell-price_change_percent="{ row }">
                    <span :class="[
                        getData(row, 'price_change_percent') > 0
                            ? 'c-num-status'
                            : 'c-num-status is-red',
                    ]">
                        {{ friendlyNumber(getData(row, "price_change_percent")) }}%
                    </span>
                </template>
                
                <!-- 24h最高价列 -->
                <template #cell-high_price_24h="{ row }">
                    {{ friendlyNumber(getData(row, "high_price_24h")) }}
                </template>
                
                <!-- 24h最低价列 -->
                <template #cell-low_price_24h="{ row }">
                    {{ friendlyNumber(getData(row, "low_price_24h")) }}
                </template>
                
                <!-- 成交量列 -->
                <template #cell-volume="{ row }">
                    {{ friendlyNumber(getData(row, "volume")) }}
                </template>
                
                <!-- 操作列 -->
                <template #cell-action="{ row }">
                    <div class="action-btn" @click.stop="handleCellClick(row)">
                        {{ $t('newHome.th.title6') }}
                    </div>
                </template>
                
                <!-- 收藏列 -->
                <template #cell-collection="{ row }">
                    <img 
                        v-if="row.is_collection" 
                        src="../../assets/img/colleted.svg" 
                        class="w-5 h-5 cursor-pointer" 
                        alt=""
                        @click.stop="handleCollect(row)" 
                    />
                    <img 
                        v-else 
                        src="../../assets/img/collet.svg" 
                        class="w-5 h-5 cursor-pointer" 
                        alt=""
                        @click.stop="handleCollect(row)" 
                    />
                </template>
            </CustomTable>
        </template>
    </ob-table-page>
</template>
<style lang="scss" scoped>
.top-box {
    display: flex;
    align-items: center;
    padding-right: 24px;
}

.action-btn {
    min-width: 69px;
    min-height: 35px;
    padding: 5px 10px;
    border-radius: 10px;
    border: 1px solid #363B47;
    color: #C2C2C2;
    text-align: center;
    cursor: pointer;
}

:deep(.tab-block){
    min-width: 120px;
}

// 表格容器样式
:deep(.table-content) {
    width: 100%;
    overflow: hidden;
}

.b-box {
    align-items: center;
    gap: 8px;
}

.b-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
}

.c-num-status {
    color: #00c853;
    font-weight: 500;
    
    &.is-red {
        color: #ff5252;
    }
}
</style>