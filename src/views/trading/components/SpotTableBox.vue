<script setup>
import { ref, defineProps, watch, computed } from "vue"
import { useI18n } from "vue-i18n"
import { getSpotOrderApi, cancelSpotOrderApi } from "@/api/data"
import { successMessage } from "/@/utils/message"
import { friendlyNumber, setBaseUrl } from "@/utils/utils"
import { useBalance } from "@/hooks/useBalance"
import dayjs from "dayjs"
const { walletInfo, getWalletData } = useBalance()
const { t } = useI18n()

const props = defineProps({
    isRefreshBottomTable: {
        type: Boolean,
        default: false,
    },
    symbolInfo: {
        type: Object,
        default: () => {},
    },
    setSub: {
        type: Function,
        default: () => {},
    },
})
const quoteAsset = computed(() => {
    return props.symbolInfo?.quote_asset?.toUpperCase()
})
// 类型
const searchList = computed(() => {
    return [
        {
            name: t("spotOpe.tab.tab1"),
            id: 1,
        },
        {
            name: t("spotOpe.tab.tab2"),
            id: 2,
        },
        {
            name: t("spotOpe.tab.tab3"),
            id: 3,
        },
    ]
})

function socketHandle(data) {
    let eventName = data.data?.event
    if (eventName === 'refresh') {
        getTableList()
    }
    // if (eventName === 'order_margin_ratio') {
    //     let socketData = data.data.payload || {}
    //     orderMap.value[socketData.order_id] = socketData
    // }
}
onMounted(() => {
    props.setSub(
        `person:${localStorage.getItem('uid')}`,
        socketHandle,
        localStorage.getItem('ws_channel_token')
    )
})

const tabActive = ref(1)
const tabChange = (id) => {
    tabActive.value = id
    getTableList()
}
/**
 * table
 */
const tableSearch = ref(false)
const tableParams = reactive({ spot_id: undefined, status: "pending" })
const tableRefresh = ref(false)

// 通用确认弹框
const dialogVisible = ref(false)
const setRow = ref({})
const handleConfirm = () => {
    if (fullscreenLoading.value) {
        return
    }
    fullscreenLoading.value = true
    cancelSpotOrderApi({ order_id: setRow.value.id })
        .then(() => {
            dialogVisible.value = false
            getTableList()
            emit("change")
            successMessage(t("common.opeSuccess"))
        })
        .finally(() => {
            fullscreenLoading.value = false
        })
}
const checked = ref(false)
const getTableList = () => {
    if (tabActive.value === 1) {
        tableParams.spot_id = checked.value ? props.symbolInfo.id : undefined
        nextTick(() => {
            tableRefresh.value = !tableRefresh.value
        })
    } else if (tabActive.value === 2) {
        getWalletData(1)
    } else if (tabActive.value === 3) {
        nextTick(() => {
            tableRefresh.value = !tableRefresh.value
        })
    }
}
watch(
    () => props.isRefreshBottomTable,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            getTableList()
        }
    }
)
const emit = defineEmits(["change"])
const fullscreenLoading = ref(false)
const cancelHandle = (data) => {
    setRow.value = data
    dialogVisible.value = true
}
const changeCheck = (val) => {
    checked.value = val
    getTableList()
}
</script>
<template>
    <div class="table-box" v-loading.fullscreen.lock="fullscreenLoading">
        <div class="box-tab ">
            <MyTab :tabList="searchList" :tabActive="tabActive" @tabChange="tabChange" class="flex-shrink-0 mb-4 " isBlock />
            <el-checkbox
                v-if="tabActive === 1"
                @change="changeCheck"
                v-model="checked"
                class="ml-auto"
                >{{ $t("spotOpe.hidden") }}</el-checkbox
            >
        </div>
        <ob-table-page
            v-if="tabActive == 1"
            :tableRefresh="tableRefresh"
            :tableParams="tableParams"
            :hasBtn="false"
            :tableSearch="tableSearch"
            :isPage="false"
            :getTableUrl="getSpotOrderApi"
            :defaultGet="false"
            isSmall
        >
            <template #table="{ tableData }">
                <el-table :data="tableData" height="auto">
                    <!-- 现货订单 -->
                    <el-table-column
                        :label="t('spotOpe.colum4.field1')"
                        width="150"
                    >
                        <template #default="{ row }">
                            <div class="flex">
                                <img
                                    :src="setBaseUrl(row.logo)"
                                    class="b-img"
                                    alt=""
                                />
                                {{ row.name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('spotOpe.colum4.field2')">
                        <template #default="{ row }">
                            {{
                                row.trade_type === "limit"
                                    ? $t("spotOpe.order.order1")
                                    : $t("spotOpe.order.order2")
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('spotOpe.colum4.field3')">
                        <template #default="{ row }">
                            <div
                                :class="[
                                    row.side === 'buy'
                                        ? 'green-color'
                                        : 'red-color',
                                ]"
                            >
                                {{
                                    row.side === "buy"
                                        ? $t("spotOpe.type.type1")
                                        : $t("spotOpe.type.type2")
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('spotOpe.colum4.field4')">
                        <template #default="{ row }">
                            {{
                                dayjs(row.created_at).format(
                                    "DD.MM.YYYY HH:mm:ss"
                                )
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.colum4.field5')}`"
                        align="right"
                    >
                        <template #default="{ row }">
                            {{ friendlyNumber(row.volume) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.colum4.field6')}(${quoteAsset})`"
                        align="right"
                        min-width="120"
                    >
                        <template #default="{ row }">
                            {{ friendlyNumber(row.trade_volume) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.colum4.field7')}`"
                        align="right"
                    >
                        <template #default="{ row }">
                            {{ friendlyNumber(row.price) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.colum4.field8')}`"
                        width="100"
                    >
                        <template #default="{ row }">
                            <div class="ope-btn" @click="cancelHandle(row)">
                                {{ $t("spotOpe.cancel") }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </ob-table-page>
        <ob-table-page
            v-if="tabActive == 2"
            :hasBtn="false"
            :hasData="!!walletInfo.coins.items.length"
            isSmall
        >
            <template #table="{}">
                <el-table :data="walletInfo.coins.items" height="auto">
                    <!-- 现货订单 -->
                    <el-table-column :label="t('spotOpe.colum5.field1')">
                        <template #default="{ row }">
                            <div class="flex">
                                <img
                                    :src="setBaseUrl(row.logo)"
                                    class="b-img"
                                    alt=""
                                />
                                {{ row.coin_name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="t('spotOpe.colum5.field2')"
                        width="200"
                        align="right"
                    >
                        <template #default="{ row }">
                            {{ friendlyNumber(row.amount) }}
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </ob-table-page>
        <ob-table-page
            v-if="tabActive == 3"
            :tableRefresh="tableRefresh"
            :hasBtn="false"
            :isPage="false"
            :getTableUrl="getSpotOrderApi"
            :defaultGet="false"
            isSmall
        >
            <template #table="{ tableData }">
                <el-table :data="tableData" height="auto">
                    <!-- 现货订单 -->
                    <el-table-column
                        :label="t('spotOpe.history.field1')"
                        width="150"
                    >
                        <template #default="{ row }">
                            <div class="flex">
                                <img
                                    :src="setBaseUrl(row.logo)"
                                    class="b-img"
                                    alt=""
                                />
                                {{ row.name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('spotOpe.history.field2')">
                        <template #default="{ row }">
                            {{
                                row.trade_type === "limit"
                                    ? $t("spotOpe.order.order1")
                                    : $t("spotOpe.order.order2")
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="t('spotOpe.history.field3')">
                        <template #default="{ row }">
                            <div
                                :class="[
                                    row.side === 'buy'
                                        ? 'green-color'
                                        : 'red-color',
                                ]"
                            >
                                {{
                                    row.side === "buy"
                                        ? $t("spotOpe.type.type1")
                                        : $t("spotOpe.type.type2")
                                }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="t('spotOpe.history.field4')"
                        width="180"
                    >
                        <template #default="{ row }">
                            {{
                                dayjs(row.created_at).format(
                                    "DD.MM.YYYY HH:mm:ss"
                                )
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.history.field5')}`"
                        align="right"
                        min-width="120"
                    >
                        <template #default="{ row }">
                            {{
                                `${
                                    row.trade_status === "failed"
                                        ? "-"
                                        : friendlyNumber(row.volume)
                                } / ${friendlyNumber(row.volume)} `
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.history.field6')}(${quoteAsset})`"
                        align="right"
                        min-width="120"
                    >
                        <template #default="{ row }">
                            {{
                                `${
                                    row.trade_status === "failed"
                                        ? "-"
                                        : friendlyNumber(row.trade_volume)
                                } / ${friendlyNumber(row.trade_volume)}`
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.history.field7')}`"
                        align="right"
                    >
                        <template #default="{ row }">
                            {{
                                row.trade_status === "failed"
                                    ? "-"
                                    : friendlyNumber(row.match_price)
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.history.field8')}`"
                        align="right"
                    >
                        <template #default="{ row }">
                            {{
                                row.trade_status === "failed"
                                    ? "-"
                                    : friendlyNumber(row.price)
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${t('spotOpe.history.field9')}`"
                        width="120"
                    >
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
                                    row.trade_status === "pending"
                                        ? $t("spotOpe.pending")
                                        : row.trade_status === "success"
                                        ? $t("spotOpe.success")
                                        : $t("spotOpe.failed")
                                }}
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </ob-table-page>
        <my-dialog
            v-model="dialogVisible"
            :title="t('common.text3')"
            width="343px"
            :closeIcon="true"
            @confirm="handleConfirm"
            @close="dialogVisible = false"
        >
            <div class="my-dialog-body">
                {{ t("contractOpe.cancelText") }}
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
    .my-dialog-body {
        text-align: center;
    }
}
.box-tab{
    display: flex;
    align-items: center;
    justify-content: space-between;
    :deep(.tab-block){
        min-width: 120px;
    }
}
</style>
