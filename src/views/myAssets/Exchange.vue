<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisabled } from '@/hooks/useDisabled'
import { useI18n } from 'vue-i18n'
import { useBalance } from '@/hooks/useBalance'
import { getCoinSelectorApi, instantExchangeApi, getInstantExchangeFeeApi } from '@/api/my'
import { friendlyNumber, multiply, divide, subtract, removeDot, formatNumber } from '@/utils/utils'
import { successMessage } from '@/utils/message'
import useSocket from '@/hooks/useSocket'

const { walletInfo, getSpotBalance, getWalletData } = useBalance([1])
const { t } = useI18n()
const router = useRouter()

const excludedSymbols = ['HMXR', 'HLNP', 'EDNE']

// 跳转到历史记录页面
const toPage = (path, query) => {
    if (query) {
        router.push({ path, query })
    } else {
        router.push(path)
    }
}

const fromData = reactive({
    fromCurrency: '',
    fromCurrencyLabel: '',
    toCurrency: '',
    toCurrencyLabel: '',
    amount: 0,
})

const recordMap = ref({})
const setListData = data => {
    if (data && data.data && data.data.symbol && data.data.price) {
        if (recordMap.value[data.data.symbol]) {
            return
        }
        recordMap.value[data.data.symbol] = data.data.price
    }
}

// 优化：只在组件挂载时订阅WebSocket，组件卸载时取消订阅
const { setSub, unsubscribeChannel } = useSocket()
onMounted(() => {
    setSub('public:spot_allticker', setListData)
})

const errorObj = ref({})
const isDisabled = useDisabled(fromData)

// 货币列表
const currencyList = ref([])

// 获取币种选择器数据
const getCurrencyList = async () => {
    try {
        const data = await getCoinSelectorApi()
        // 确保数据格式正确，包含name和id字段
        const filteredList = (data || []).filter(item => {
            const symbol = (item.symbol || item.name || item.coin_name || '').toUpperCase()
            return symbol && !excludedSymbols.includes(symbol)
        })
        currencyList.value = filteredList.map(item => ({
            ...item,
            name: item.name || item.coin_name || item.symbol,
            id: item.id || item.coin_id || item.symbol_id
        }))
        const defaultFrom = currencyList.value[0]
        const defaultTo = currencyList.value.find(item => item.id !== defaultFrom?.id)
        fromData.fromCurrency = defaultFrom?.id || ''
        fromData.fromCurrencyLabel = defaultFrom?.name || ''
        fromData.toCurrency = defaultTo?.id || ''
        fromData.toCurrencyLabel = defaultTo?.name || ''
    } catch (error) {
        console.error('获取币种列表失败:', error)
    }
}

// 页面加载时获取币种列表和手续费
onMounted(() => {
    getCurrencyList()
    getExchangeFee()
})

// 选择源货币
const fromCurrencyChange = (value) => {
    fromData.amount = ''
    const selectedItem = currencyList.value.find(item => item.id === value)
    if (selectedItem) {
        fromData.fromCurrency = selectedItem.id
        fromData.fromCurrencyLabel = selectedItem.name
        // 重新获取手续费
        getExchangeFee()
    }
}

// 选择目标货币
const toCurrencyChange = (value) => {
    const selectedItem = currencyList.value.find(item => item.id === value)
    if (selectedItem) {
        fromData.toCurrency = selectedItem.id
        fromData.toCurrencyLabel = selectedItem.name
    }
}

// 可选择的源货币列表(排除已选择的目标货币)
const fromCurrencyList = computed(() => {
    return currencyList.value.filter(item => item.id !== fromData.toCurrency)
})

// 可选择的目标货币列表(排除已选择的源货币)
const toCurrencyList = computed(() => {
    return currencyList.value.filter(item => item.id !== fromData.fromCurrency)
})

// 切换货币
const switchCurrency = () => {
    fromData.amount = ''
    const tempId = fromData.fromCurrency
    fromData.fromCurrency = fromData.toCurrency
    fromData.toCurrency = tempId

    const tempLabel = fromData.fromCurrencyLabel
    fromData.fromCurrencyLabel = fromData.toCurrencyLabel
    fromData.toCurrencyLabel = tempLabel
}

// 确认兑换
const confirmExchange = async () => {
    if (fromData.fromCurrency === fromData.toCurrency) {
        errorObj.value = {
            fromCurrency: t('transform.errorAccount'),
            toCurrency: t('transform.errorAccount')
        }
        return
    }
    console.log(formatNumber(fromData.amount))
    if (!fromData.amount || formatNumber(fromData.amount) <= 0) {
        errorObj.value = {
            amount: t('exchange.errorAmount')
        }
        return
    }

    try {
        const exchangeData = {
            from_coin_id: Number(fromData.fromCurrency),
            to_coin_id: Number(fromData.toCurrency),
            quantity: fromData.amount
        }

        await instantExchangeApi(exchangeData)
        successMessage(t('common.opeSuccess'))
        getWalletData(1)
        emit('success')
        fromData.amount = ''
    } catch (error) {
        errorObj.value = error
        // 错误处理已经在http拦截器中处理
    }
}

// 手续费
const exchangeFee = ref(0)

// 获取手续费
const getExchangeFee = async () => {
    try {
        const data = await getInstantExchangeFeeApi()
        exchangeFee.value = data?.fee || 0
    } catch (error) {
        console.error('获取手续费失败:', error)
    }
}

// 可用余额
const availableBalance = computed(() => {
    return getSpotBalance(fromData.fromCurrencyLabel) || 0
})

// 获取源货币价格
const fromCurrencyPrice = computed(() => {
    if(fromData.fromCurrencyLabel === 'USDC') {
        return 1
    }
    const symbol = `${fromData.fromCurrencyLabel}USDC`.toLowerCase()
    const symbol2 = `${fromData.fromCurrencyLabel}USDT`.toLowerCase()
    return recordMap.value[symbol] || recordMap.value[symbol2] || 0
})

// 获取目标货币价格
const toCurrencyPrice = computed(() => {
    if(fromData.toCurrencyLabel === 'USDC') {
        return 1
    }
    const symbol = `${fromData.toCurrencyLabel}USDC`.toLowerCase()
    const symbol2 = `${fromData.toCurrencyLabel}USDT`.toLowerCase()
    return recordMap.value[symbol] || recordMap.value[symbol2] || 0
})

// 计算兑换比例
const exchangeRate = computed(() => {
    if (!fromCurrencyPrice.value || !toCurrencyPrice.value) return 0
    return fromCurrencyPrice.value / toCurrencyPrice.value
})

// 计算手续费金额（以目标货币计价）
const feeAmount = computed(() => {
    if (!fromData.amount || !exchangeFee.value || !exchangeRate.value) return '0,0000'
    // 先将源货币转换为目标货币，然后计算手续费
    const targetAmount = multiply(removeDot(fromData.amount), exchangeRate.value)
    return multiply(targetAmount, exchangeFee.value)
})

// 计算实际兑换数量（转换为目标货币）
const actualAmount = computed(() => {
    if (!fromData.amount || !exchangeFee.value || !exchangeRate.value) return '0,0000'
    // 先将源货币转换为目标货币
    const targetAmount = multiply(removeDot(fromData.amount), exchangeRate.value)
    // 扣除以目标货币计价的手续费
    return subtract(targetAmount, feeAmount.value)
})

// 格式化目标货币数量显示
const formattedTargetAmount = computed(() => {
    if (!fromData.amount || !exchangeRate.value) return '0,0000'
    return friendlyNumber(multiply(removeDot(fromData.amount), exchangeRate.value))
})

const emit = defineEmits(['success'])

onUnmounted(() => {
    // 取消WebSocket订阅
    unsubscribeChannel('public:spot_allticker')
})
</script>

<template>
    <div class="exchange-body">
        <!-- 可用余额显示 -->
        <div class="flex justify-between mb-4">
            <span class="text-[#9098A2]">{{ $t('exchange.label3') }}</span>
            <span>{{ friendlyNumber(availableBalance) }} {{ fromData.fromCurrencyLabel }}</span>
        </div>
        <!-- 源货币选择 -->
        <MyInput isLarge v-model="fromData.amount" :placeholder="$t('exchange.pla1')" :errorObj="errorObj"
            propName="quantity" hasSuffix>
            <template #suffix>
                <div class="currency-suffix">
                    <el-select v-model="fromData.fromCurrency" size="large" class="currency-select"
                        @change="fromCurrencyChange">
                        <el-option v-for="item in fromCurrencyList" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </div>
            </template>
        </MyInput>


        <!-- 切换按钮 -->
        <img src="./img/transfer.svg" class="mx-auto my-3 flex-shrink-0 cursor-pointer" alt=""
            @click="switchCurrency" />

        <!-- 目标货币选择 -->
        <MyInput isLarge :model-value="formattedTargetAmount" :errorObj="errorObj"
            propName="to_coin_id" hasSuffix readonly>
            <template #suffix>
                <div class="currency-suffix">
                    <el-select v-model="fromData.toCurrency" size="large" class="currency-select"
                        @change="toCurrencyChange">
                        <el-option v-for="item in toCurrencyList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </div>
            </template>
        </MyInput>

        <div class="exchange-tip mb-4">{{ $t('exchange.label2') }}</div>

        <!-- 兑换信息显示 -->
        <div class="exchange-info">
            <div class="info-item">
                <span class="info-label">{{ $t('exchange.label1') }}</span>
                <span class="info-value">{{ formattedTargetAmount }} {{ fromData.toCurrencyLabel }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">{{ $t('exchange.label5') }}</span>
                <span class="info-value">{{ feeAmount }} {{ fromData.toCurrencyLabel }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">{{ $t('exchange.label4') }}</span>
                <span class="info-value">{{ actualAmount }} {{ fromData.toCurrencyLabel }}</span>
            </div>
        </div>

        <div class="tip-box mt-6">
            <div class="tip-title">{{ $t('exchange.tip1') }}</div>
            <div class="tip-text">{{ $t('exchange.tip2', { fee: exchangeFee * 100 }) }}</div>
        </div>

        <!-- 底部确认按钮 -->
        <MyButton :disabled="isDisabled" :clickFn="confirmExchange" size="large"
            class="justify-self-end submit-btn">
            {{ $t('exchange.btn1') }}
        </MyButton>
    </div>
</template>

<style scoped lang="scss">
.exchange-body {
    max-width: 800px;
    flex-shrink: 0;
    margin: 0 auto;
    overflow: auto;
}

.from-label {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.exchange-tip {
    font-weight: 400;
    color: #8B939A;
    font-size: 14px;
}

.currency-suffix {
    display: flex;
    align-items: center;
    gap: 12px;

    .currency-select {
        width: 140px;

        :deep(.el-input__wrapper) {
            background-color: transparent;
            border: none;
            box-shadow: none;
            padding: 0;

            .el-input__inner {
                color: #fff;
                text-align: center;
            }
        }
    }
}

.exchange-info {
    border-radius: 8px;
    padding: 0 16px;
    margin-bottom: 16px;

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        .info-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
        }

        .info-value {
            font-size: 14px;
            color: var(--el-text-color-primary);
            font-family: 'DIN', sans-serif;
            font-weight: 500;
        }
    }
}

.tip-box {
    border-radius: 8px;

    .tip-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
    }

    .tip-text {
        font-weight: 400;
        font-size: 14px;
        color: #8B939A;
        line-height: 1.5;
    }
}

.submit-btn {
    height: 60px;
    min-width: 180px;
    border-radius: 20px;
    margin-top: 30px;
}
</style>
