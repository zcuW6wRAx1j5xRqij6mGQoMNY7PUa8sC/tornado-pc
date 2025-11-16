<script setup>
import { getOTCListApi, otcTradeApi, getOTCOrderApi } from "@/api/data"
import { useI18n } from "vue-i18n"
import { friendlyNumber, multiply, percentage } from "@/utils/utils"
import { onMounted } from "vue"
import { useBalance } from '@/hooks/useBalance'
const { walletInfo } = useBalance([1],1)
const balance = computed(() => {
    return friendlyNumber(walletInfo.value.total)
})
const { t } = useI18n()
const typeTabList = computed(() => {
    return [
        { id: 1, name: t("otc.tab1") },
        { id: 2, name: t("otc.tab2") },
        { id: 3, name: t("otcHis.title") },
    ]
})
const activeTab = ref(1)
const typeTabChange = (id) => {
    activeTab.value = id
    getData()
}
const loading = ref(false)
const dataList = ref([
])
const getData = () => {
    dataList.value = []
    loading.value = true
    const action = activeTab.value === 3 ? getOTCOrderApi : getOTCListApi
    action({
        page: 1,
        page_size: 99,
    }).then((data) => {
        if (activeTab.value === 3) {
            dataList.value = data.items || []
        } else {
            dataList.value = data || []
        }
    }).finally(() => {
        loading.value = false
    })
}
onMounted(getData)
const showInfoList = computed(() => {
    return [
        {
            key: 'total_count',
            name: t('otc.label1'),
            cb: data => {
                return friendlyNumber(data.total_count)
            },
        },
        {
            key: 'success_rate',
            name: t('otc.label2'),
            cb: data => {
                return `${percentage(data.success_rate, false)}%`
            },
        },
        {
            key: 'total_amount',
            name: t('otc.label3'),
            cb: data => {
                return friendlyNumber(data.total_amount)
            },
        },
        {
            key: 'result_total_amount',
            name: t('otc.label4'),
            cb: data => {
                const minLimit = activeTab.value === 1 ? data.min_limit : data.sell_min_limit
                const maxLimit = activeTab.value === 1 ? data.max_limit : data.sell_max_limit
                return `${friendlyNumber(minLimit)} - ${friendlyNumber(maxLimit)}`
            },
        },
        {
            key: 'buy_price',
            name: t('otc.label5'),
            nameCb: data => {
                return activeTab.value === 1 ? t('otc.label5') : t('otc.form.label5')
            },
            cb: data => {
                return activeTab.value === 1 ? friendlyNumber(data.buy_price) : friendlyNumber(data.sell_price)
            },
        },
    ]
})

const opeShow = ref(false)
const opeItem = ref({})
const liClick = item => {
    step.value = 1
    errorObj.value = {}
    form.value.quantity = ''
    form.value.comments = ''
    opeItem.value = item
    opeShow.value = true
}
const form = ref({
    quantity: '',
    comments: '',
})
const step = ref(1)
const payPrice = computed(() => {
    const price = activeTab.value === 1 ? opeItem.value.buy_price : opeItem.value.sell_price
    return friendlyNumber(multiply(price, form.value.quantity))
})
const errorObj = ref({})
const opeHandle = () => {
    errorObj.value = {}
    const minLimit = activeTab.value === 1 ? opeItem.value.min_limit : opeItem.value.sell_min_limit
    const maxLimit = activeTab.value === 1 ? opeItem.value.max_limit : opeItem.value.sell_max_limit
    if (+form.value.quantity < +minLimit || +form.value.quantity > +maxLimit) {
        errorObj.value.quantity = t('otc.form.error1')
        return
    }
    loading.value = true
    otcTradeApi({
        quantity: form.value.quantity,
        product_id: opeItem.value.id,
        comments: form.value.comments,
        payment_method: opeItem.value.payment_method[0],
        trade_type: activeTab.value === 1 ? 'buy' : 'sell',
    }).then(() => {
        step.value = 2
    }).catch(err => {
        errorObj.value = err
    }).finally(() => {
        loading.value = false
    })
}
const toCustomer = () => {
    opeShow.value = false
    let dom = document.querySelector('.gQHKDl')
    if (dom) {
        dom.click()
    }
}
const getStatus = (row) => {
    if (row.status === 'pending') {
        return {
            text: t('otcHis.status1'),
            css: 'status-yellow'
        }
    } else if (row.status === 'rejected') {
        return {
            text: t('otcHis.status3'),
            css: 'status-red'
        }
    } else if (row.status === 'accepted') {
        return {
            text: t('otcHis.status2'),
            css: 'status-green'
        }
    }
}

const hisShowInfo = computed(() => {
    return [{
        key: "amount",
        name: t("otcHis.label1"),
        cb: (data) => {
            return data.trade_type === 'buy' ? t('otc.tab1') : t('otc.tab2')
        },
    },
    {
        key: "amount",
        name: t("otcHis.label2"),
        cssCb: () => 'green-color',
        cb: (data) => {
            return friendlyNumber(data.amount)
        },
    },
    {
        key: "price",
        name: t("otcHis.label3"),
        cb: (data) => {
            return friendlyNumber(data.price)
        },
    },
    {
        key: "quantity",
        name: t("otcHis.label4"),
        cb: (data) => {
            return friendlyNumber(data.quantity)
        },
    },
    {
        key: "payment_method",
        name: t("otcHis.label5"),
        cb: (data) => {
            return data.payment_method
        },
    },]
})


</script>
<!--  -->
<template>
    <div v-loading="loading" class="flex-auto flex flex-col">
        <div class="flex-shrink-0" >
            <MyTab :tabList="typeTabList" :tabActive="activeTab" @tabChange="typeTabChange" isBlock />
        </div>
        <NoData v-if="dataList.length === 0 " />
        <div class="ai-ul" v-if="[1,2].includes(activeTab)">
            <div class="ai-item" v-for="item in dataList" :key="item.id">
                <div class="flex items-center">
                    <div class="otc-name">
                        {{ item.title }}
                    </div>
                    <div class="text-tip">1{{ t('otc.tip') }}</div>
                </div>
                <div class="flex items-center mt-1">
                    <img src="./img/star.svg" v-for="i in 5" :key="i" class="star" alt="">
                </div>
                <div class="show-ul is-small">
                    <div class="show-li" v-for="info in showInfoList" :key="info.key"> <span class="show-label"
                            v-if="info.nameCb" v-html="info.nameCb(item)"></span>
                        <span class="show-label" v-else>{{ info.name }}</span>
                        <span class="show-value" :class="[info.cssCb ? info.cssCb(item) : '']">
                            {{ info.cb && info.cb(item) }}
                        </span>
                    </div>
                </div>
                <MyButton size="medium" class="mt-4" @click="liClick(item)">{{ activeTab === 1 ? t('otc.tab1') :
                    t('otc.tab2') }}USDC</MyButton>
            </div>
        </div>
        <div class="ai-ul" v-else>
            <div class="ai-item" v-for="item in dataList" :key="item.id">
                <div class="flex items-center">
                    <div class="otc-name">
                        {{ item.product?.title }}
                    </div>
                    <div class="status-box ml-auto is-small" :class="[
                        getStatus(item).css
                    ]">
                        {{
                            getStatus(item).text
                        }}
                    </div>
                </div>
                <div class="flex items-center mt-1">
                    <img src="./img/star.svg" v-for="i in 5" :key="i" class="star" alt="">
                </div>
                <div class="show-ul is-small">
                    <div class="show-li" v-for="info in hisShowInfo" :key="info.key"> <span class="show-label"
                            v-if="info.nameCb" v-html="info.nameCb(item)"></span>
                        <span class="show-label" v-else>{{ info.name }}</span>
                        <span class="show-value" :class="[info.cssCb ? info.cssCb(item) : '']">
                            {{ info.cb && info.cb(item) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <my-dialog :showFooter="false" v-model="opeShow" :title="t('otc.tip1')" >
            <div class=" h-full flex flex-col overflow-auto" ref="popup" @click.stop v-loading="loading">
                <template v-if="step === 1">
                    <div class="flex items-center">
                        <div class="form-label">{{ activeTab === 1 ? t('otc.form.label1') : t('otc.form.label4') }}
                        </div>
                        <div class="form-label ml-auto">USDC{{ t('otc.tip2') }}<span class="text-[#fff] c-is-num ml-1">{{ balance }}</span></div>
                    </div>
                    <MyInput isSmall :errorObj="errorObj" propName="quantity" v-model="form.quantity"
                        :placeholder="`${activeTab === 1 ? opeItem.min_limit : opeItem.sell_min_limit} - ${activeTab === 1 ? opeItem.max_limit : opeItem.sell_max_limit}`" />
                    <div class="flex items-center">
                        <div class="form-label">{{ activeTab === 1 ? t('otc.form.label2') : t('otc.form.label5') }}<span class="text-[#fff] c-is-num ml-1">{{
                            activeTab === 1 ? opeItem.buy_price : opeItem.sell_price }}</span></div>
                        <div class="form-label ml-auto">{{ activeTab === 1 ? t('otc.form.label3') :
                            t('otc.form.label6')
                            }}(USDC):<span class="green-color">{{ payPrice }}</span></div>
                    </div>
                    <div class="form-label">{{ t('otc.form.label7') }}</div>
                    <MyInput isSmall :errorObj="errorObj" propName="payment_method"
                        :model-value="opeItem.payment_method[0]" readonly :placeholder="opeItem.payment_method[0]" />
                    <div class="form-label">{{ t('otc.form.label8') }}</div>
                    <MyInput isSmall :errorObj="errorObj" propName="comments" v-model="form.comments"
                        :placeholder="t('otc.form.pla8')" />
                    <MyButton size="medium" class="mt-4" :disabled="!form.quantity"
                        :clickFn="opeHandle">{{
                            t('otc.form.btn1') }}</MyButton>
                </template>
                <template v-else>
                    <div class="c-card-box">
                        <div class="flex justify-between mb-4">
                            <div class="">
                                <div class="form-label">{{ t('otcHis.label1') }}</div>
                                <div>{{ activeTab == 1 ? t('otc.tab1') : t('otc.tab2') }}
                                    USDC</div>
                            </div>
                            <div class="">
                                <div class="form-label text-right">{{ t('otcHis.label2')
                                    }}(USDC)</div>
                                <div class="form-value green-color text-right">{{ payPrice }} </div>
                            </div>
                        </div>
                        <div class="flex justify-between mb-4">
                            <div class="flex-auto">
                                <div class="form-label">{{ t('otcHis.label3') }}
                                </div>
                                <div class="form-value">{{ opeItem.buy_price }}</div>
                            </div>
                            <div class="text-center flex-auto">
                                <div class="form-label">{{ t('otcHis.label4') }}
                                </div>
                                <div class="form-value">{{ form.quantity }} USDC</div>
                            </div>

                            <div class="text-right flex-auto">
                                <div class="form-label">{{ t('otc.form.label7') }}</div>
                                <div class="form-value">{{ opeItem.payment_method[0] }}</div>
                            </div>
                        </div>

                    </div>
                    <MyButton size="medium" class="mt-4" @click="toCustomer">{{ t('otc.form.btn2') }}</MyButton>
                </template>
            </div>
        </my-dialog>
    </div>
</template>

<style scoped lang="scss">
.defn {
    width: 420px;
    margin: 100px auto;
}

.tip {
    color: #6b6b6b;
    text-align: right;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.bank-info {
    margin-top: 10px;
    width: 100%;
    flex-shrink: 0;
    background-color: #272727;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    color: #fff;
    font-size: 16px;
    font-style: normal;
    line-height: normal;
    border-radius: 8px;
}

.from-box {
    :deep(.el-select__wrapper) {
        background-color: #1c1e27;
        border-color: #1c1e27;
        box-shadow: none;
        border-radius: 4px;

        .el-input__inner {
            color: #fff;
        }
    }
}

.ai-ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 16px;
}
@media (max-width: 1600px) {
    .ai-ul {
        grid-template-columns: repeat(3, 1fr);
    }
}

.ai-item {
    padding: 16px;
    background: var(--el-card-bg);
    border-radius: 8px 8px 8px 8px;
}
.title {
    font-weight: 500;
    font-size: 15px;
    color: #ffffff;
    line-height: 18px;
}

.font-15 {
    font-size: 15px;
}

.show-ul {
    font-size: 15px;
    line-height: 18px;

    .show-li {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .show-label {
        color: #8b939a;
        display: flex;
        align-items: center;
        font-size: 14px;
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

.text-tip {
    font-weight: 500;
    color: #8B939A;
    text-align: right;
    margin-left: auto;
}

.otc-name {
    font-weight: 500;
    color: #FFFFFF;
    font-size: 16px;
}

.star {
    width: 12px;
    height: 12px;
    margin-right: 4px;
}

.form-label {
    font-weight: 400;
    font-size: 14px;
    color: #8B939A;
    line-height: 24px;
    margin-bottom: 10px;
}

.form-value {
    font-weight: 400;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 24px;
}
</style>
