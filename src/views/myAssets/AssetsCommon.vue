<script setup>
import { useI18n } from "vue-i18n"
import { ref, reactive } from "vue"
import {  setBaseUrl, friendlyNumber } from "@/utils/utils"

import { useBalance } from "@/hooks/useBalance"
const { walletInfo, } =
    useBalance([1, 2])
const { t } = useI18n()
const tableSearch = ref(false)
const tableParams = reactive({})
const tableRefresh = ref(false)
const loading = ref(false)

</script>
<template>
    <div class="coin-account-page" v-loading="loading">
        <ob-table-page :tableRefresh="tableRefresh" :tableParams="tableParams" :hasBtn="false"
            :tableSearch="tableSearch" :isPage="false" :hasData="walletInfo.coins &&
                walletInfo.coins.items &&
                walletInfo.coins.items.length > 0
                ">
            <el-table :data="walletInfo.coins.items" height="auto">
                <el-table-column :label="t('walletAsset.spotWallet.wallet0')">
                    <template #default="{ row }">
                        <div class="flex b-box">
                            <img :src="setBaseUrl(row.logo)" class="b-img" alt="" />
                            {{ row.coin_name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column field="amount" :label="t('walletAsset.spotWallet.wallet1')" align="right">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.amount) }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('walletAsset.spotWallet.wallet2')" align="right">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.lock_amount) }}
                    </template>
                </el-table-column>
                <el-table-column :label="t('walletAsset.spotWallet.wallet3')" align="right">
                    <template #default="{ row }">
                        {{ friendlyNumber(row.usdt_value) }}
                    </template>
                </el-table-column>
            </el-table>
        </ob-table-page>
    </div>

</template>

<style lang="scss" scoped>
.coin-account-page {
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow: auto;
}
</style>
