<template>
    <section
        v-loading="loading && !hideLoading"
        class="table-page"
        :class="{
            'has-tab': hasTab,
            'no-mg-pd': noMgPd,
            'small-table': isSmall,
            'is-num': isNum
        }"
    >
        <slot />
        <section class="table-page-search" v-if="hasSearch">
            <section class="search-content">
                <slot name="search" />
            </section>
        </section>
        <div class="btn-box" v-if="hasBtn">
            <slot name="btn" />
        </div>
        <!-- <section class="table-content" v-allow="tableAllow"> -->
        <section
            class="table-content"
            v-if="(tableData && tableData.length > 0) || hasData"
        >
            <slot name="table" :tableData="tableData" :comData="comData" />
        </section>
        <div
            class="page-content"
            v-if="!hidePage"
            v-show="pagerParams.total > 0"
        >
            <!-- <div class="mr-16">从{{ fromNum }}到{{ toNum }}条，共{{ pagerParams.total }}条记录</div> -->
            <el-pagination
                v-model:current-page="pagerParams.page"
                v-model:page-size="pagerParams.page_size"
                :total="pagerParams.total"
                @current-change="handleSizeChange"
                background layout="prev, pager, next"
            />
        </div>
        <NoData
            v-if="
                (getTableUrl && tableData && tableData.length === 0) ||
                (!getTableUrl && !hasData && !selfData)
            "
        />
    </section>
</template>

<script setup>
import { reactive, watch, onMounted, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { isArray } from '/@/utils/is'
// tableAllow: propTypes.string.def(''), // 列表显示权限字段
//     hasSearch: propTypes.bool.def(false), // 是否有搜索项
//     isPage: propTypes.bool.def(true), // 是否分页
//     tableSearch: propTypes.bool.def(true), // 值变化，搜索条件触发
//     tableRefresh: propTypes.bool.def(true), // 值变化，刷新列表
//     defaultGet: propTypes.bool.def(true), // 是否默认调用列表接口
//     hasBtn: propTypes.bool.def(true), // 是否有按钮
//     getTableUrl: propTypes.func, // 获取列表url
//     tableParams: propTypes.object, // 除分页外的搜索条件
//     opeBtnNames: propTypes.array, // 操作列按钮权限数组
//     hasTab: propTypes.bool.def(false), // 是否有tab
//     isSelfSetPage: propTypes.bool.def(false), // 是否前端自己分页
//     pageDataKey: propTypes.string.def('items'), // 分页数据类型
//     noMgPd: propTypes.bool.def(false), // 删除margin和padding
//     pageSize: propTypes.number.def(12),
//     isSmall: propTypes.bool.def(false),
//     hidePage: propTypes.bool.def(false), // 是否隐藏分页
//     hasData: propTypes.bool.def(false), // 是否有数据
const props = defineProps({
    tableAllow: {
        type: String,
        default: '',
    },
    hasSearch: {
        type: Boolean,
        default: false,
    },
    isPage: {
        type: Boolean,
        default: true,
    },
    tableSearch: {
        type: Boolean,
        default: true,
    },
    tableRefresh: {
        type: Boolean,
        default: true,
    },
    defaultGet: {
        type: Boolean,
        default: true,
    },
    hasBtn: {
        type: Boolean,
        default: true,
    },
    getTableUrl: {
        type: Function,
    },
    tableParams: {
        type: Object,
    },
    opeBtnNames: {
        type: Array,
    },
    hasTab: {
        type: Boolean,
        default: false,
    },
    isSelfSetPage: {
        type: Boolean,
        default: false,
    },
    pageDataKey: {
        type: String,
        default: 'items',
    },
    noMgPd: {
        type: Boolean,
        default: false,
    },
    pageSize: {
        type: Number,
        default: 12,
    },
    isSmall: {
        type: Boolean,
        default: false,
    },
    hidePage: {
        type: Boolean,
        default: false,
    },
    hasData: {
        type: Boolean,
        default: false,
    },
    isNum:{
        type:Boolean,
        default:false
    },
    selfData:{
        type:Array,
        default:()=>[]
    },
    hideLoading:{
        type:Boolean,
        default:false
    }
})

const loading = ref(false)
const emit = defineEmits(['getData'])
const pagerParams = reactive({
    page: 1,
    page_size: props.pageSize,
    total: 0,
})
const tableData = ref()
const comData = ref()
// 获取数据
const getTableData = () => {
    let params = {
        ...props.tableParams,
    }
    if (props.isPage || props.isSelfSetPage) {
        params = {
            ...pagerParams,
            ...params,
        }
    }
    if (props.getTableUrl) {
        loading.value = true
        props
            .getTableUrl(params)
            .then(data => {
                comData.value = data
                if (props.isSelfSetPage) {
                    if (isArray(data)) {
                        pagerParams.total = Number(data.length || 0)
                        tableData.value = data.slice(fromNum.value - 1, toNum.value)
                    } else {
                        pagerParams.total = 0
                        tableData.value = []
                    }
                } else if (props.isPage) {
                    pagerParams.total = Number(data.total || 0)
                    tableData.value = data[props.pageDataKey] || []
                } else {
                    tableData.value = data || []
                }
                emit('getData', { data, setData: tableData.value })
            })
            .finally(() => {
                loading.value = false
            })
    }else{
        tableData.value = props.selfData
        emit('getData', { data: props.selfData, setData: tableData.value })
    }
}
// 搜索函数
const searchData = useDebounceFn(() => {
    pagerParams.page = 1
    getTableData()
})
watch(
    () => props.tableRefresh,
    () => {
        getTableData()
    }
)
// 页数变化、数据量变化
const handleSizeChange = () => {
    getTableData()
}
// 搜索触发
watch(
    () => props.tableSearch,
    () => {
        searchData()
    }
)
onMounted(() => {
    if (props.defaultGet) {
        getTableData()
    }
})
// 判断页面数量和总数，触发刷新
watch(
    () => pagerParams.total,
    () => {
        if (
            Number(pagerParams.total) === (pagerParams.page - 1) * pagerParams.page_size &&
            Number(pagerParams.total) > 0
        ) {
            pagerParams.page = pagerParams.page - 1
            getTableData()
        }
    }
)
// 分页从xxx
const fromNum = computed(() => {
    if (Number(pagerParams.total) > 0) {
        return (pagerParams.page - 1) * pagerParams.page_size + 1
    } else {
        return 0
    }
})
// 分页到xxx
const toNum = computed(() => {
    if (Number(pagerParams.total) <= pagerParams.page_size) {
        return pagerParams.total
    } else {
        if (Number(pagerParams.total) > pagerParams.page * pagerParams.page_size) {
            return pagerParams.page * pagerParams.page_size
        } else {
            return Number(pagerParams.total)
        }
    }
})
</script>

<style lang="scss" scoped>
.table-page {
    display: flex;
    flex-direction: column;
    overflow: auto;
    flex: auto;

    &.has-tab {
        border-radius: 0 0 8px 8px;
        margin-top: 0;
    }

    &.no-mg-pd {
        margin: 0;
        padding: 0;
    }
}

.table-page-search {
    position: relative;
    background: #141517;
    display: flex;
    flex-shrink: 0;
}

.table-content {
    flex: auto;
    overflow: auto;
}

.search-content {
    flex: auto;
    flex-wrap: wrap;
    display: flex;
    margin-bottom: 12px;
}

.btn-content {
    margin-top: 6px;
    display: flex;
    flex-shrink: 0;
}

.btn-box {
    padding: 0 30px;
    display: flex;
    align-items: center;
    margin-bottom: 24px;
}

:deep(.vxe-pager--total) {
    margin-right: 24px;
}

.page-content {
    height: 60px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-top: 20px;
}
.is-num{
    :deep(.el-table__cell){
        font-family: 'DIN' !important;
    }
}

</style>
