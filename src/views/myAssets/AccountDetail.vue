<script setup >
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch } from 'vue'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { getCoinsListApi, getSpotWalletFlowApi, getDerivativeWalletFlowApi } from '@/api/data'
import { useRoute } from 'vue-router'
const { t } = useI18n()
const route = useRoute()
const tableSearch = ref(false)
const tableParams = reactive({})
const tableRefresh = ref(false)

const coinId = ref(null)

const options = ref([])
const tableList = ref([])
const getOpsData = async () => {
    try {
        let res = await getCoinsListApi()
        options.value = res?.map(item => {
            return {
                value: item.id,
                label: item.name,
            }
        })
    } catch (error) {
        console.log('error', error)
    }
}

const getTableList = async () => {
    const API = +route.query.isSpot === 0 ? getSpotWalletFlowApi : getDerivativeWalletFlowApi
    try {
        let res2 = await API({
            page: 1,
            page_size: 200,
            ...(coinId.value && {
                coin_id: +coinId.value,
            }),
        })
        tableList.value = res2?.items
    } catch (error) {
        console.log('error', error)
    }
}
watch(
    () => coinId.value,
    () => {
        getTableList()
    }
)
onMounted(() => {
    getOpsData()
    getTableList()
})
</script>
<template>
    <div class="account-detail">
        <div class="detail-line">
            <div class="detail-title">{{ t('assets.text.text2') }}</div>
            <el-select
                v-model="coinId"
                :placeholder="t('assets.text.text4')"
                size="large"
                clearable
                popper-class="select-option"
                style="width: 205px"
            >
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </div>
        <ob-table-page
            class="mt-6"
            :tableRefresh="tableRefresh"
            :tableParams="tableParams"
            :hasBtn="false"
            :tableSearch="tableSearch"
            :isPage="false"
        >
            <el-table
                :data="tableList"
                height="auto"
                :sortConfig="{
                    multiple: true,
                }"
            >
                <el-table-column :label="t('assets.table.field1')">
                    <template #default="{ row }">
                        {{ row?.coin?.name }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('assets.table.field6')">
                    <template #default="{ row }">
                        {{
                            row?.amount > 0
                                ? row?.amount && new Decimal(+row.amount).toFixed(8)
                                : Math.trunc(row?.amount)
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('assets.table.field7')">
                    <template #default="{}">
                        {{ t('assets.table.field23') }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('assets.table.field11')">
                    <template #default="{ row }">
                        {{ dayjs(row?.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                    </template>
                </el-table-column>
            </el-table>
        </ob-table-page>
    </div>
</template>
<style lang="scss" scoped>
.account-detail {
    background: #000;
    flex: auto;
    display: flex;
    flex-direction: column;

    .detail-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #141517;
        padding: 16px 30px;
        flex-shrink: 0;

        :deep(.el-input__wrapper) {
            background-color: #1C1E27;
            border-color: #1C1E27;
            box-shadow: none;

            .el-input__inner {
                color: #fff;
            }
        }

        :deep(.el-select) {
            background: #1C1E27;
            border-color: #1C1E27;
            border-radius: 4px;
        }

        :deep(.el-select__wrapper) {
            background: #1C1E27;
            border-color: #1C1E27;
            box-shadow: 0 0 0 1px var(--el-text-color) inset;
        }
    }

    // :deep(.el-input__wrapper) {
    //     background-color: #1C1E27;
    //     border-color: #1C1E27;
    //     box-shadow: none;
    //     border-radius: 4px;

    //     .el-input__inner {
    //         color: #fff;
    //     }
    // }

    .mt-6 {
        margin-top: 6px;
    }
}
</style>
<style>
.select-option {
    background-color: #1C1E27;
}
</style>
