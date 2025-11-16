<script setup>
import {  friendlyNumber } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
import { useBalance } from '@/hooks/useBalance'
import BShow from './components/BShow.vue'
import TransferRecord from '@/views/myAssets/TransferRecord.vue'
import AmountChart from './components/AmountChart.vue'
const { walletInfo, contractWallet, } =
    useBalance([1, 2])
import {
    getWalletApi,
} from "@/api/my"
const { t } = useI18n()
const wallet = ref({})
const loading = ref(false)

const getTotal = () => {
    loading.value = true
    // 钱包信息
    getWalletApi()
        .then((data) => {
            wallet.value = data || {}
        })
        .finally(() => {
            loading.value = false
        })
}
onMounted(getTotal)
</script>

<template>
    <div class="flex">
        <div class="left-box flex-auto flex flex-col">
            <div class="data-list flex-shrink-0">
                <div class="data-box">
                    <div class="data-value">
                        {{ friendlyNumber(wallet.total || 0) }}
                    </div>
                    <div class="data-title">
                        <img src="@/assets/img/spot-green.svg" alt="" class="data-icon" />
                        {{ t("walletAsset.label1") }}
                    </div>

                </div>
                <div class="data-box">
                    <div class="data-value">
                        {{ friendlyNumber(walletInfo.total || 0) }}
                    </div>
                    <div class="data-title">
                        <img src="@/assets/img/spot-green.svg" alt="" class="data-icon" />
                        {{ t("walletAsset.label3") }}
                    </div>

                </div>
                <div class="data-box">
                    <div class="data-value">
                        {{ friendlyNumber(contractWallet.balance || 0) }}
                    </div>
                    <div class="data-title orange">
                        <img src="@/assets/img/spot-orange.svg" alt="" class="data-icon" />
                        {{ t("walletAsset.label4") }}
                    </div>

                </div>
                <div class="data-box">
                    <div class="data-value">
                        {{ friendlyNumber(contractWallet.lock_balance || 0)  }}
                    </div>
                    <div class="data-title red">
                        <img src="@/assets/img/spot-red.svg" alt="" class="data-icon" />
                        {{ t("walletAsset.label5") }}
                    </div>
                </div>
            </div>
            <AmountChart />
        </div>
    </div>
    <TransferRecord style="flex-shrink: 0;min-height: 400px;"  heightValue="300px" />
    <BShow />
</template>

<style scoped lang="scss">
.data-list {
    display: flex;
    gap: 4%;
    flex-wrap: wrap;
}

.data-box {
    padding: 0 24px;

    .data-value {
        font-family: DIN;
        font-weight: 500;
        font-size: 26px;
        color: #FFFFFF;
        margin-bottom: 20px;
    }

    .data-title {
        justify-self: flex-start;
        font-weight: 400;
        font-size: 14px;
        color: #C2C2C2;
        display: flex;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 3px solid #0CAF60;

        &.orange {
            border-color: #FB774A;
        }

        &.red {
            border-color: #ED6167;
        }
    }

    .data-icon {
        width: 21px;
        height: 21px;
        margin-right: 8px;
    }
}
</style>