<template>
    <div class="flex-shrink-0">
        <MyTab :tabList="typeTabList" :tabActive="typeActiveTab" @tabChange="typeTabChange"  isBlock />
    </div>
    <div class="ieo-ul" v-loading="loading" >
        <div class="ieo-item" v-for="item in dataList" :key="item.id">
            <div class="flex items-center ">
                <template v-if="item.coin">
                    <img v-if="item.coin.logo" :src="setBaseUrl(item.coin.logo)" class="icon-avatar" alt="" />
                    <span class="coin-name"> {{ item.coin.name }}</span>
                </template>
                <template v-else-if="item.ieo && item.ieo.coin">
                    <img v-if="item.ieo.coin.logo" :src="setBaseUrl(item.ieo.coin.logo)" class="icon-avatar" alt="" />
                    <span class="coin-name"> {{ item.ieo.coin.name }}</span>
                </template>
                <div class="status-box status ml-auto" v-if="typeActiveTab === 0" :class="[
                    item.status === 0
                        ? 'status-grey'
                        : item.status === 1
                            ? 'status-green'
                            : item.status === 2
                                ? 'status-green'
                                : 'status-green',
                ]">
                    {{
                        item.status === 0
                            ? $t('ieo.status1')
                            : item.status === 1
                                ? $t('ieo.status2')
                                : item.status === 2
                                    ? $t('ieo.status3')
                                    : $t('ieo.status5')
                    }}
                </div>
                <div class="status-box status ml-auto" v-else :class="[
                    item.status === 0
                        ? 'status-green'
                        : item.status === 1
                            ? 'status-green'
                            : item.status === 2
                                ? 'status-green'
                                : 'status-grey',
                ]">
                    {{
                        item.status === 0
                            ? $t('ieo.status6')
                            : item.status === 1
                                ? $t('ieo.status4')
                                : item.status === 2
                                    ? $t('ieo.status7')
                                    : $t('ieo.status8')
                    }}
                </div>
            </div>
            <div class=" mt-4 flex items-center flex-wrap">
                <div class="progress-label">{{ $t('ieo.tab1.label4') }}</div>
                <el-progress  :percentage="+ Math.ceil(item.processing * 100 / item.total_supply)"
                color="#FFAC2F" >
                <div></div>
                </el-progress>
                <div class="w-full mt-1">{{ friendlyNumber(item.processing) }} / {{ friendlyNumber(item.total_supply) }}</div>
            </div>
            <div class="show-ul">
                <div class="show-item" v-for="show in showInfoList" :key="show.key">
                    <span class="show-item-label">{{ show.name }}</span>
                    <span class="show-item-value">{{ show.cb(item) }}</span>
                </div>
                <div class="show-item"  @click="openPDF(item.pdf)">
                    <span class="show-item-label"> {{ $t('ieo.tab1.label9') }}</span>
                    <span class="show-item-value cursor-pointer"> {{item.pdf ?  $t('ieo.tab1.label10') : '--'}}</span>
                </div>
            </div>
            <MyButton type="primary" v-if="typeActiveTab === 0" :disabled="item.status !== 1" class="mt-4" size="medium"
                @click="handleBuy(item)">
                {{ $t('ieo.btn') }}</MyButton>
        </div>
    </div>
    <NoData v-if="dataList.length === 0" />
    <my-dialog v-model="buyShow" :title="t('ieo.btn')" width="343px" @confirm="handleBuyConfirm"
        @close="buyShow = false">
        <MyInput v-model="checkFrom.amount" :errorObj="errorObj" propName="amount"
            :placeholder="`${friendlyNumber(showItem.min_order_price)}-${friendlyNumber(showItem.max_order_price)}`"
            isSmall type="digit" min="0" />
        <p class="mt-4 text-gray-400 flex items-center">
            {{ $t('ieo.label2') }}: {{ friendlyNumber(showItem.unit_price) }}
        </p>
        <p class="mt-4 text-gray-400 flex items-center">
            {{ $t('ieo.label3') }}: {{ count }}
        </p>
    </my-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getIEOListApi, buyIEOApi, getMyIEOOrderApi } from '@/api/data'
import { friendlyNumber, setBaseUrl, divide, subtract,percentage } from '@/utils/utils'
import { successMessage } from '/@/utils/message'
import dayjs from 'dayjs'
const { t } = useI18n()
const typeTabList = computed(() => {
    return [
        { id: 0, name: t('ieo.status0') },
        { id: 1, name: t('ieo.status1') },
        { id: 2, name: t('ieo.status4') },
        { id: 3, name: t('ieo.status5') },
    ]
})
const typeActiveTab = ref(0)
const typeTabChange = (id) => {
    typeActiveTab.value = id
    getData(id)
}
const dataList = ref([])
const loading = ref(false)
const getData = (type = 0) => {
    dataList.value = []
    loading.value = true
    const action = type === 0 ? getIEOListApi : getMyIEOOrderApi
    let params = {
    }
    if (type !== 0) {
        params = {
            status: type === 1 ? 'pending' : type === 2 ? 'processing' : type === 3 ? 'completed' : '',
            page: 1,
            page_size: 999
        }
    }
    action(params).then(data => {
        if (type !== 0) {
            dataList.value = data.items || []
        } else {
            dataList.value = data
        }

    }).finally(() => {
        loading.value = false
    })
}
onMounted(() => {
    getData()
})
const showInfoList = computed(() => {
    if (typeActiveTab.value === 0) {
        return [
            {
                key: 'total_supply',
                name: t('ieo.tab1.label1'),
                cb: data => {
                    return friendlyNumber(data.total_supply)
                },
            },
            {
                key: 'unit_price',
                name: t('ieo.tab1.label2'),
                cb: data => {
                    return friendlyNumber(data.unit_price)
                },
            },
            {
                key: 'min_order_price',
                name: t('ieo.tab1.label3'),
                cb: data => {
                    return `${friendlyNumber(data.min_order_price)}-${friendlyNumber(data.max_order_price)}`
                },
            },
            {
                key: 'order_start_time',
                name: t('ieo.tab1.label5'),
                cb: data => {
                    return dayjs(data.order_start_time).format('YYYY.MM.DD HH:mm:ss')
                },
            },
            {
                key: 'order_end_time',
                name: t('ieo.tab1.label6'),
                cb: data => {
                    return dayjs(data.order_end_time).format('YYYY.MM.DD HH:mm:ss')
                },
            },
            {
                key: 'public_time',
                name: t('ieo.tab1.label7'),
                cb: data => {
                    return dayjs(data.public_time).format('YYYY.MM.DD HH:mm:ss')
                },
            },
            {
                key: 'release_time',
                name: t('ieo.tab1.label8'),
                cb: data => {
                    return dayjs(data.release_time).format('YYYY.MM.DD HH:mm:ss')
                },
            },
            {
                key: 'forecast_earnings',
                name: t('ieo.tab1.label11'),
                cb: data => {
                    return `${percentage(data.forecast_earnings, false)}%`
                },
            },
        ]
    } else {
        return [
            {
                key: 'unit_price',
                name: t('ieo.tab2.label1'),
                cb: data => {
                    return friendlyNumber(data.unit_price)
                },
            },
            {
                key: 'quantity',
                name: t('ieo.tab2.label2'),
                cb: data => {
                    return (data.quantity)
                },
            },
            {
                key: 'trade_volume',
                name: t('ieo.tab2.label3'),
                cb: data => {
                    return friendlyNumber(data.total_amount)
                },
            },
            {
                key: 'result_total_amount',
                name: t('ieo.tab2.label4'),
                cb: data => {
                    return friendlyNumber(data.result_total_amount)
                },
            },
            {
                key: 'result_quantity',
                name: t('ieo.tab2.label5'),
                cb: data => {
                    return (data.result_quantity)
                },
            },
            {
                key: 'result_unit_price',
                name: t('ieo.tab2.label6'),
                cb: data => {
                    return friendlyNumber(data.result_unit_price)
                },
            },
            {
                key: 'trade_volume',
                name: t('ieo.tab2.label7'),
                cb: data => {
                    return data.result_time ? dayjs(data.result_time).format('YYYY.MM.DD') : '-'
                },
            },
            {
                key: 'trade_volume',
                name: t('ieo.tab2.label8'),
                cb: data => {
                    return (
                        friendlyNumber(data.subscribed_amount) +
                        ' USDC / ' +
                        friendlyNumber(data.result_total_amount) +
                        ' USDC'
                    )
                },
            },
            {
                key: 'trade_volume',
                name: t('ieo.tab2.label9'),
                cb: data => {
                    return (
                        friendlyNumber(subtract(data.result_total_amount, data.subscribed_amount)) +
                        ' USDC'
                    )
                },
            },
        ]
    }
})

const checkFrom = ref({
    amount: '',
})
const errorObj = ref({})
const showItem = ref({})
const buyShow = ref(false)
const handleBuy = (item) => {

    showItem.value = item
    checkFrom.value.amount = ''
    buyShow.value = true
}
const handleBuyConfirm = () => {
    if (loading.value) {
        return
    }
    loading.value = true
    buyIEOApi({
        id: showItem.value.id,
        amount: checkFrom.value.amount,
    }).then(() => {
        buyShow.value = false
        loading.value = false
        successMessage(t('common.opeSuccess'))
        getData(typeActiveTab.value)
    }).catch(err => {
        errorObj.value = err
    }).finally(() => {
        loading.value = false
    })
}
const count = computed(() => {
    if (!checkFrom.value.amount) return 0
    return divide(checkFrom.value.amount, showItem.value.unit_price)
})
const openPDF = (pdf) => {
    if (pdf) {
        window.open(pdf, '_blank')
    }
}
</script>

<style lang="scss" scoped>
.ieo-ul {
    flex: auto;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
@media (max-width: 1600px) {
    .ieo-ul {
        grid-template-columns: repeat(3, 1fr);
    }
}
.status {
    font-weight: 500;
    border-radius: 6px;
}

.ieo-item {
    padding: 16px;
    background: #1C242E;
    border-radius: 8px;
    margin-top: 16px;
    align-self: flex-start;
}

.icon-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 8px;
}

.coin-name {
    font-size: 15px;
    font-weight: 500;
}

.progress-label {
    font-weight: 500;
    font-size: 12px;
    color: #C2C2C2;
    line-height: 14px;
    margin-right: 50px;
}

.show-ul {
    display: flex;
    flex-direction: column;
    margin-top: 16px;
}

.show-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.show-item-label {
    font-weight: 400;
    font-size: 14px;
    color: #C2C2C2;
    line-height: 16px;
    margin-right: 10px;
}

.show-item-value {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 16px;
    color: #fff;
    line-height: 19px;
    margin-left: auto;
    text-align: right;
}

:deep(.el-progress) {
    flex: auto;
    min-width: 100px;
}
</style>
