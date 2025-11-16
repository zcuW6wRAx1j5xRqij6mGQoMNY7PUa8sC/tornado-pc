<template>
    <div class="flex-shrink-0">
        <MyTab :tabList="typeTabList" :tabActive="typeActiveTab" @tabChange="typeTabChange" class="flex-shrink-0" isBlock />
    </div>
   <div class="flex-auto overflow-auto " v-loading="loading">
        <NoData v-if="dataList.length === 0" style="height: 90%;" />
        <div class="ai-ul" v-if="typeActiveTab !== 3">
            <div class="ai-item" v-for="item in dataList" :key="item.id">
                <div class="flex items-center ">
                    <img v-if="item.logo" :src="setBaseUrl(item.logo)" class="icon-avatar" alt="" />
                    <span class="coin-name"> {{ item.name }}</span>
                </div>
                <div class="mt-3 tip-box">
                    <span class="tip-label">{{ $t('ai.tip1') }}</span> <span class="rate">{{ item.min_daily_rate }}% ~
                        {{
                            item.max_daily_rate }}%</span>
                </div>
                <div class="time-list">
                    <div v-for="time in item.duration" :key="time"
                        :class="['time-item', { active: time === item.time }]" @click="timeClick(time, item)">
                        <span class="c-is-num">{{ time }}</span>{{ $t('ai.days') }}
                    </div>
                </div>
                <MyButton type="primary" v-if="typeActiveTab !== 3" class="mt-5" size="medium" @click="handleBuy(item)">
                    {{ $t('ai.btn1') }}</MyButton>
            </div>
        </div>
        <!-- 历史 -->
        <div class="ai-ul" v-else>
            <div class="ai-item" v-for="item in dataList" :key="item.id">
                <div class="flex items-center ">
                    <template v-if="item.financial">
                        <img v-if="item.financial.logo" :src="setBaseUrl(item.financial.logo)" class="icon-avatar"
                            alt="" />
                        <span class="coin-name"> {{ item.financial.name }}</span>
                    </template>
                    <div class="status-box cursor-pointer  ml-auto" @click="handleStatus(item)"
                        :class="[item.status === 'pending' ? 'blue' : 'status-grey']">
                        {{
                            item.status === 'pending'
                                ? $t('ai.status1')
                                : $t('aiHis.status2')
                        }}
                    </div>
                </div>
                <div class="flex mt-3">
                    <div class="c-order-tip-box blue ">
                        <span class=" c-is-num">{{
                            item.duration
                            }}</span>
                        {{ $t('aiHis.days') }}
                    </div>
                    <div class="c-order-tip-box">
                        {{ dayjs(item.start_at).format('DD.MM.YYYY') }}
                    </div>
                </div>
                <div class="show-ul is-small">
                    <div class="show-li" v-for="info in showInfoList" :key="info.key">
                        <span class="show-label">{{ info.name }}</span>
                        <span class="show-value " :class="[info.cssCb ? info.cssCb(item) : '']">
                            {{ info.cb(item) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <my-dialog v-model="buyShow" :loading="loading" :disabled="!amount" :title="t('ai.btn1')" width="350px"
        @confirm="handleBuyConfirm" @close="buyShow = false">
        <div class="flex-auto ">
            <div class="info ">
                <div class="flex items-center">
                    <img v-if="detail.logo" :src="setBaseUrl(detail.logo)" class="w-7 h-7 rounded-full" alt="" />
                    <div class="title ml-2">{{ detail.name }}</div>
                </div>
                <div class="flex items-center mt-3">
                    <div class="mt-1 flex items-center">
                        <span class="text-sm text-[#8B939A]">{{ $t('aiBuy.tip1') }}</span>
                        <span class="text-[#1EB576] text-sm ml-2 c-is-num">{{ detail.min_daily_rate }}% ~ {{
                            detail.max_daily_rate }}%</span>
                    </div>
                    <div class="text-sm ml-4"><span class="c-is-num">{{ checkItem.time }}</span>{{ $t('ai.days') }}
                    </div>
                </div>
                <div class="mt-5">
                    <MyInput :placeholder="`${detail.min_amount || 0} - ${detail.max_amount || 0}`"
                        :fromLabel="$t('aiBuy.label2')" v-model="amount"  :errorObj="errorObj"
                        propName="amount" hasSuffix>
                        <template #suffix>
                            <div class="flex items-center font-15">
                                <span class="text-[#fff] mr-4">USDC</span>
                                <span class="text-[#0F7DFF] cursor-pointer" @click="amount = +balance">
                                    {{ $t('aiBuy.btn2') }}
                                </span>
                            </div>
                        </template>
                    </MyInput>

                    <div class="flex justify-between items-center ">
                        <span class="text-sm text-[#8B939A]">{{ $t('aiBuy.tip2') }} :</span>
                        <span class="text-[#fff] ml-2 c-is-num">{{
                            friendlyNumber(balance) }} USDC</span>

                    </div>
                </div>
            </div>
            <div class="title mt-4">
                {{ $t('aiBuy.tip3') }}
            </div>
            <div class="show-ul">
                <div class="show-li" v-for="item in infoList" :key="item.key" @click="liClick(item, dataInfo)">
                    <span class="show-label">{{ item.name }}</span>
                    <span class="show-value " :class="[item.cssCb ? item.cssCb(item) : '']">
                        {{ item.cb(detail) }}
                    </span>
                </div>
            </div>
        </div>
    </my-dialog>
    <my-dialog v-model="dialogVisible" :title="t('common.text3')" width="343px" :closeIcon="true" :loading="loading"
        @confirm="handleConfirm" @close="dialogVisible = false">
        <div class="my-dialog-body">
            {{ t("aiHis.sureTip") }}
        </div>
    </my-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { financialProductListApi, financialProductBuyApi, financialProductOrderListApi, financialProductDetailApi, financialProductRedeemApi } from '@/api/data'
import { friendlyNumber, setBaseUrl, divide, multiply } from '@/utils/utils'
import { successMessage } from '/@/utils/message'
import dayjs from 'dayjs'
import { useBalance } from '@/hooks/useBalance'
const { walletInfo } = useBalance([1])
const balance = computed(() => {
    return walletInfo.value.total
})
const { t } = useI18n()
const typeTabList = computed(() => {
    return [
        { id: 1, name: t('ai.tab1') },
        { id: 2, name: t('ai.tab2') },
        { id: 3, name: t('ai.tab3') },
    ]
})
const typeActiveTab = ref(1)
const typeTabChange = (id) => {
    typeActiveTab.value = id
    getData(id)
}
const dataList = ref([])
const loading = ref(false)
const getData = (type = 1) => {
    dataList.value = []
    loading.value = true
    const action = type === 3 ? financialProductOrderListApi : financialProductListApi
    let params = {
        category: type === 1 ? 'flexible' : type === 2 ? 'fixed' : '',
        page: 1,
        page_size: 999
    }
    action(params).then(data => {
        dataList.value = data.items.map(item => {
            item.time = item.duration[0]
            return item
        })
    }).finally(() => {
        loading.value = false
    })
}
onMounted(() => {
    getData()
})
const timeClick = (time, item) => {
    item.time = time
}
const amount = ref('')
const errorObj = ref({})
const buyShow = ref(false)
const detail = ref({})
const checkItem = ref({})
const handleBuy = (item) => {
    errorObj.value = {}
    financialProductDetailApi({
        id: item.id
    }).then(data => {
        detail.value = data
        checkItem.value = item
    })
    amount.value = ''
    buyShow.value = true
}
const handleBuyConfirm = () => {
    if (loading.value) {
        return
    }
    // 判断金额是否在最小和最大之间
    if (+amount.value < +detail.value.min_amount || +amount.value > +detail.value.max_amount) {
        errorObj.value.amount = t('aiBuy.tip4')
        return
    }
    if (!detail.value.duration.includes(+checkItem.value.time)) {
        errorMessage(t('aiBuy.tip5'))
        return
    }
    loading.value = true
    financialProductBuyApi({
        financial_id: detail.value.id,
        amount: amount.value,
        duration: checkItem.value.time,
    }).then(() => {
        buyShow.value = false
        loading.value = false
        successMessage(t('common.opeSuccess'))
    }).catch(err => {
        errorObj.value = err
    }).finally(() => {
        loading.value = false
    })
}

const infoList = computed(() => {
    return [
        {
            key: 'unit_price',
            name: t('aiBuy.label1'),
            cb: data => {
                return dayjs().format('YYYY-MM-DD')
            },
        },
        {
            key: 'amount',
            name: t('aiBuy.label2'),
            cb: () => {
                return `${amount.value} USDC`
            },
        },
        {
            key: 'income',
            name: t('aiBuy.label3'),
            cb: data => {
                return `${income.value} USDC`
            },
        },
        {
            key: 'endTime',
            name: t('aiBuy.label4'),
            cb: data => {
                // 今天的时间加上传入的time
                return dayjs().add(checkItem.value.time, 'day').format('YYYY-MM-DD')
            },
        },
        {
            key: 'penaltyFee',
            name: t('aiBuy.label5'),
            cb: data => {
                return `${penaltyFee.value} USDC`
            },
        },
    ]
})

// 计算预估总收益 = 天数 * 日利率 * 投入本金
const income = computed(() => {
    if (!amount.value || !detail.value.min_daily_rate) return '0.00'
    const rate = divide(detail.value.min_daily_rate, 100)
    return friendlyNumber(multiply(multiply(amount.value, rate), checkItem.value.time))
})

// 计算提前赎回违约金 = 本金 * 违约金比例
const penaltyFee = computed(() => {
    if (!amount.value || !detail.value.penalty_rate) return '0.00'
    const penalty_rate = divide(detail.value.penalty_rate, 100)
    return friendlyNumber(multiply(amount.value, penalty_rate))
})
// 历史
const showInfoList = computed(() => {
    let list = [
        {
            key: 'amount',
            name: t('aiHis.label1'),
            cb: data => {
                return `${friendlyNumber(data.amount)} USDC`
            },
        },
        {
            key: 'end_at',
            name: t('aiHis.label2'),
            cb: data => {
                return dayjs(data.end_at).format('DD.MM.YYYY')
            },
        },
        {
            key: 'amount',
            name: t('aiHis.label3'),
            cb: data => {
                return friendlyNumber(data.amount)
            },
        },
        {
            key: 'penalty_amount',
            name: t('aiHis.label4'),
            cb: data => {
                return friendlyNumber(data.penalty_amount)
            },
        },
        {
            key: 'expected_total_profit',
            name: t('aiHis.label5'),
            cb: data => {
                return friendlyNumber(data.expected_total_profit)
            },
            cssCb: (data) => {
                return +data.expected_total_profit < 0 ? 'red-color' : 'green-color'
            },
        },
    ]
    return list
})
const opeItem = ref({})
const handleStatus = (item) => {
    if (item.status === 'pending') {
        opeItem.value = item
        dialogVisible.value = true
    }
}
const dialogVisible = ref(false)
const handleConfirm = () => {
    if (loading.value) {
        return
    }
    loading.value = true
    financialProductRedeemApi({
        order_id: opeItem.value.id,
    }).then(() => {
        dialogVisible.value = false
        successMessage(t('common.opeSuccess'))
        getData(3)
    }).finally(() => {
        loading.value = false
    })
}
</script>

<style lang="scss" scoped>
.ai-ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 16px;
}

.ai-item {
    padding: 16px;
    margin-top: 10px;
    background: #1C242E;
    border-radius: 16px;
}

.icon-avatar {
    width: 29px;
    height: 29px;
}

.coin-name {
    font-weight: 500;
    font-size: 15px;
    color: #FFFFFF;
    line-height: 18px;
    margin-left: 8px;
}

.time-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
    margin-top: 12px;

    .time-item {
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        padding: 5px 8px;
        border-radius: 4px;
        flex-shrink: 0;
        cursor: pointer;
        background: #272F38;
border-radius: 100px ;
        &.active {
            color: #fff;
            font-weight: 500;
            background: var(--el-color-primary);
            border-color: var(--el-color-primary);
        }
    }
}

.tip-box {
    padding-top: 12px;
}

.tip-label {
    font-size: 14px;
    color: #8B939A;
    line-height: 16px;
}

.rate {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 15px;
    color: #1EB576;
    line-height: 18px;
    margin-left: 8px;
}


.title {
    font-weight: 500;
    font-size: 15px;
    color: #FFFFFF;
    line-height: 18px;
}

.font-15 {
    font-size: 15px;
}

.show-ul {
    font-size: 15px;
    line-height: 18px;

    &.is-small {
        font-size: 12px;
        line-height: 14px;

        .show-li {
            margin-top: 12px;
        }
    }

    .show-li {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .show-label {

        color: #8B939A;
        display: flex;
        align-items: center;
    }

    .show-value {
        font-family: DIN;
        font-weight: 500;
        color: #fff;

        text-align: right;
        display: flex;
        align-items: center;
    }
}
</style>
