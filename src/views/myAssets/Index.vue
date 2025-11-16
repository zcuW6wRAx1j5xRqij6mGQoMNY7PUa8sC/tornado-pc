<script setup>
import { useI18n } from 'vue-i18n'
import { useUserInfo } from '@/hooks/useUserInfo'
import {  friendlyNumber, formatNumber } from '@/utils/utils'
import { signInApi } from '@/api/my'
import { ElLoading } from 'element-plus'
import AssetsCommon from './AssetsCommon.vue'
import TransferRecord from './TransferRecord.vue'
import NameCertification from './NameCertification.vue'
import SetPwd from './SetPwd.vue'
import OrderHis from './OrderHis.vue'
import SetAccount from './SetAccount.vue'
import OpeBtn from './OpeBtn.vue'
import TransferBox from './TransferBox.vue'
import { useBalance } from '@/hooks/useBalance'
import { useRoute } from 'vue-router'
const { userInfo, initUserData } = useUserInfo()

const { walletInfo, contractWallet,getWalletData } =
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
const getWalletDataInit = () => {
    getWalletData(1)
    getWalletData(2)
    getTotal()
}
const menuList = computed(() => {
    return [
        { path: 'AssetsCommon', name: t('assets.tabList.tab1'), img: 'ope1', activeImg: 'active-ope1' },
        { path: 'NameCertification', name: t('assets.tabList.tab2'), img: 'ope2', activeImg: 'active-ope2' },
        { path: 'SetPwd', name: t('assets.tabList.tab3'), img: 'ope4', activeImg: 'active-ope4' },
        { path: 'OrderHis', name: t('assets.tabList.tab4'), img: 'ope5', activeImg: 'active-ope5' },
        // { path: 'SetAccount', name: t('assets.tabList.tab5') },
        { path: 'TransferRecord', name: t('assets.tabList.tab6'), img: 'ope3', activeImg: 'active-ope3' },
        { path: 'tradeContracts', name: t('assets.tabList.tab7'), img: 'ope6', activeImg: 'active-ope6' },
    ]
})
const activeTab = ref('AssetsCommon')
const changeTab = (item) => {
    activeTab.value = item.path
}
// 签到
const checkIn = () => {
    const loadingInstance = ElLoading.service()
    if (userInfo.value.today_punch) {
        return
    }
    signInApi()
        .then(() => {
            initUserData()
        })
        .finally(() => {
            loadingInstance.close()
        })
}
// 如果进入的时候有type，则跳转到对应的tab
const route = useRoute()
const type = route.query.type
if (type) {
    activeTab.value = type
}
function getImageUrl (imageName) {
    return new URL(`./img/${imageName}.svg`, import.meta.url).href
}
</script>
<template>
    <div class="my-assets">
        <div class="assets-header">
            <div class="card-box">
                <div class="card-title">{{ t("walletAsset.label1") }}</div>
                <div class="card-value">
                    {{ friendlyNumber(wallet.total) }}
                </div>
            </div>
            <div class="card-box">
                <div class="card-title">{{ t("walletAsset.label2") }}</div>
                <div class="card-value">
                    <span :class="[
                        formatNumber(wallet.total_profit) < 0
                            ? 'red-color'
                            : 'green-color',
                    ]">{{ friendlyNumber(wallet.total_profit) }}</span>
                </div>
            </div>
            <div class="card-box vip-box">
                <div class="card-title flex mb-8">{{ t("vip.title") }}
                    <span class="ml-auto">UID: {{ userInfo.id }}</span>
                </div>
                <div v-if="userInfo.level && userInfo.level.name" class=" flex items-center">
                    <img :src="getImageUrl(`icon-${userInfo.level.name}`)" class="vip-img" alt="" />
                    <img class="vip-name" :src="getImageUrl(`${userInfo.level.name}`)" />
                    <!-- <div class="vip-value">9999 / <span class="vip-count">9999</span></div> -->
                </div>
            </div>
        </div>
        <div class="data-list">
            <div class="data-box">
                <div class="data-value">
                    {{ friendlyNumber(walletInfo.total) }}
                </div>
                <div class="data-title">
                    <img src="@/assets/img/spot-green.svg" alt="" class="data-icon"/>
                    {{ t("walletAsset.label3") }}
                </div>

            </div>
            <div class="data-box">
                <div class="data-value">
                    {{ friendlyNumber(contractWallet.balance) }}
                </div>
                <div class="data-title">
                    <img src="@/assets/img/spot-green.svg" alt="" class="data-icon"/>
                    {{ t("walletAsset.label4") }}
                </div>

            </div>
            <div class="data-box">
                <div class="data-value">
                    {{ friendlyNumber(contractWallet.lock_balance) }}
                </div>
                <div class="data-title">
                    <img src="@/assets/img/spot-orange.svg" alt="" class="data-icon"/>
                    {{ t("walletAsset.label5") }}
                </div>
            </div>
        </div>
        <div class="assets-content">
            <div class="menu-ul">
                <div v-for="item in menuList" :key="item.name" class="menu-item"
                    :class="{ active: item.path === activeTab }" @click="changeTab(item)">
                    <img :src="getImageUrl(item.img)" alt="" class="menu-img" v-if="item.path !== activeTab" />
                    <img :src="getImageUrl(item.activeImg)" alt="" class="menu-img" v-else />
                    {{ item.name }}
                </div>
            </div>
            <AssetsCommon v-if="activeTab === 'AssetsCommon'" />
        <NameCertification v-if="activeTab === 'NameCertification'" />
        <SetPwd v-if="activeTab === 'SetPwd'" />
        <OrderHis v-if="activeTab === 'OrderHis'" />
        <SetAccount v-if="activeTab === 'SetAccount'" />
        <TransferRecord v-if="activeTab === 'TransferRecord'" />
        <TransferBox v-if="activeTab === 'tradeContracts'" @success="getWalletDataInit" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.my-assets {
    flex: auto;
    overflow: auto;
    display: flex;
    flex-direction: column;

}

.assets-header {
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.card-box {
    padding: 24px 36px 16px;
    background: #1C242E;
    border-radius: 30px;

    .card-title {
        font-weight: 500;
        font-size: 16px;
        color: #FFFFFF;
    }

    .card-value {
        margin-top: 12px;
        font-family: DIN;
        font-weight: 500;
        font-size: 44px;
        color: #FFFFFF;
        text-shadow: 0px 4px 28px rgba(0, 0, 0, 0.66);
    }

    .vip-img {
        width: 40px;
        margin-right: 8px;
        flex-shrink: 0;
    }

    .vip-name {
        height: 30px;
        flex-shrink: 0;
        width: 23px;
    }
}

.data-list {
    display: flex;
    gap: 12px;
}

.data-box {
    padding: 24px 0;
    margin-right: 10%;
    margin-left: 20px;
    .data-value {
        font-family: DIN;
        font-weight: 500;
        font-size: 26px;
        color: #FFFFFF;
        margin-bottom: 16px;
    }

    .data-title {
        font-weight: 400;
        font-size: 14px;
        color: #C2C2C2;
        display: flex;
        align-items: center;
    }

    .data-icon {
        width: 21px;
        height: 21px;
        margin-right: 8px;
    }
}
.assets-content{
    flex: auto;
    margin-top: 24px;
    padding: 0 20px;
    display: flex;
    overflow: hidden;
}
.menu-ul{
    display: flex;
    flex-direction: column;
    gap: 50px;
    min-width: 20%;
    flex-shrink: 0;
    overflow: auto;
    margin-right: 20px;
    .menu-item{
        font-size: 16px;
        color: #FFFFFF;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-weight: 600;
    }
    .menu-img{
        width: 60px;
        height: 60px;
        margin-right: 16px;
    }
}
</style>
