<script setup >
import { useI18n } from 'vue-i18n'
import { withdrawalLogApi, rechargeHistoryApi, getTransferRecordApi } from '@/api/my'
import { ref, computed } from 'vue'
import { setBaseUrl, friendlyNumber } from '@/utils/utils'
import dayjs from 'dayjs'
const { t } = useI18n()
const props = defineProps({
    heightValue: {
        type: String,
        default: 'auto',
    },
})
const tableRefresh = ref(false)
const typeTabList = computed(() => {
    return [
        { id: 0, name: t('withdrawal.history') },
        { id: 1, name: t('rechargeRecord.history') },
        { id: 2, name: t('transferRecord.history') },
    ]
})
const typeActiveTab = ref(0)
const typeTabChange = id => {
    typeActiveTab.value = id
}

// 获取划转方向文本
const getTransferDirectionText = (flowType) => {
    return flowType === 'transfer_in' ? t('transferRecord.transferIn') : t('transferRecord.transferOut')
}
</script>
<template>
    <div class="flex-auto overflow-auto">
        <MyTab
        :tabList="typeTabList"
        :tabActive="typeActiveTab"
        @tabChange="typeTabChange"
        class="flex-shrink-0 justify-self-start mb-4"
        isBlock
    />
    <ob-table-page
        :getTableUrl="withdrawalLogApi"
        :tableRefresh="tableRefresh"
        :hasBtn="false"
        v-if="typeActiveTab === 0"
    >
        <template #table="{ tableData }">
            <el-table :data="tableData" :height="props.heightValue">
                <el-table-column field="name" :label="t('withdrawal.showItem.label0')">
                    <template #default="{ row }">
                        <div class="flex">
                            <img
                                :src="setBaseUrl(row.coin_logo)"
                                v-if="row.coin_logo"
                                class="b-img"
                                alt=""
                            />
                            {{ row.coin_name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column field="amount" :label="t('withdrawal.showItem.label1')" align="right">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.amount) }}
                    </template>
                </el-table-column>
                <el-table-column field="fee" :label="t('withdrawal.showItem.label2')" align="right">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.fee) }}
                    </template>
                </el-table-column>
                <el-table-column
                min-width="100"
                    field="receive_wallet_address"
                    :label="t('withdrawal.showItem.label4')"
                />
                <el-table-column field="reason" :label="t('withdrawal.showItem.label3')"  min-width="100" />
                <el-table-column field="audit_status" :label="t('withdrawal.showItem.label5')">
                    <template #default="{ row }">
                        <div
                        class="t-status-box"
                            :class="
                                row.audit_status === 0
                                    ? 'orange '
                                    : row.audit_status === 1
                                    ? 'green'
                                    : 'red'
                            "
                        >
                            {{
                                row.audit_status === 0
                                    ? $t('rechargeRecord.status1')
                                    : row.audit_status === 1
                                    ? $t('rechargeRecord.status2')
                                    : $t('rechargeRecord.status3')
                            }}
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </ob-table-page>
    <ob-table-page
        :getTableUrl="rechargeHistoryApi"
        :tableRefresh="tableRefresh"
        :hasBtn="false"
        v-if="typeActiveTab === 1"
    >
        <template #table="{ tableData }">
            <el-table :data="tableData" :height="props.heightValue">
                <el-table-column field="name" :label="t('walletAsset.spotWallet.wallet0')">
                    <template #default="{ row }">
                        <div class="flex">
                            <img
                                :src="setBaseUrl(row.coin_logo)"
                                v-if="row.coin_logo"
                                class="b-img"
                                alt=""
                            />
                            {{ row.coin_name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column field="amount" :label="t('rechargeRecord.showItem.label1')">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.amount) }}
                    </template>
                </el-table-column>
                <el-table-column field="usdt_value" :label="t('rechargeRecord.showItem.label2')">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.usdt_value) }}
                    </template>
                </el-table-column>
                <el-table-column field="wallet_address" :label="t('rechargeRecord.showItem.label4')" >
                    <template #default="{ row }">
                        {{ row.wallet_address }}
                    </template>
                </el-table-column>
                <el-table-column field="audit_status" :label="t('spotOpe.history.field9')">
                    <template #default="{ row }">
                        <div
                            class="t-status-box"
                            :class="
                                row.status === 0
                                    ? 'orange '
                                    : row.status === 1
                                    ? 'green'
                                    : 'red'
                            "
                        >
                            {{
                                row.status === 0
                                    ? $t('withdrawal.status1')
                                    : row.status === 1
                                    ? $t('withdrawal.status2')
                                    : $t('withdrawal.status3')
                            }}
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </ob-table-page>
    <ob-table-page
        :getTableUrl="getTransferRecordApi"
        :tableRefresh="tableRefresh"
        :hasBtn="false"
        pageDataKey="data"
        v-if="typeActiveTab === 2"
    >
        <template #table="{ tableData }">
            <el-table :data="tableData" :height="props.heightValue">
                <el-table-column field="flow_type" :label="t('transferRecord.direction')" min-width="150">
                    <template #default="{ row }">
                        {{ getTransferDirectionText(row.flow_type) }}
                    </template>
                </el-table-column>
                <el-table-column field="amount" :label="t('transferRecord.amount')" align="right" min-width="180">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.amount) }} USDC
                    </template>
                </el-table-column>
                <el-table-column field="created_at" :label="t('transferRecord.time')" min-width="180">
                    <template #default="{ row }">
                        {{ dayjs(row.created_at).format('DD.MM.YYYY HH:mm:ss') }}
                    </template>
                </el-table-column>
            </el-table>
        </template>
    </ob-table-page>
    </div>
</template>
<style lang="scss" scoped>
:deep(.tab-block){
    min-width: 120px;
}
</style>
