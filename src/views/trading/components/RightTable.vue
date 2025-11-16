<script setup>
import { ref, watch } from 'vue'
import { friendlyNumber } from '@/utils/utils'
const props = defineProps({
    setSub: {
        type: Function,
        required: true,
    },
    symbolInfo: {
        type: Object,
        default: () => { },
    },
    unsubscribeChannel: {
        type: Function,
        required: false,
    },
    isSpots: {
        type: Boolean,
        default: false,
    },
    symbolData: {
        type: Object,
        default: () => { },
    },
})

// 买卖数据
const buyList = ref([])
const sellList = ref([])
function setListData (ctx) {
    const data = ctx.data
    buyList.value = data.bids || []
    sellList.value = data.asks || []
}
watch(
    () => props.symbolInfo.binance_symbol,
    (newValue, oldValue) => {
        if(props.setSub){
        const type = props.isSpots ? 'spot' : 'futures'
        oldValue && props.unsubscribeChannel(`public:spot_book_${oldValue}`)
        newValue && props.setSub(`public:spot_book_${newValue}`, setListData)
        }
        
    },
    {
        immediate: true,
    }
)
const baseAsset = computed(() => {
    return props.symbolInfo?.base_asset?.toUpperCase()
})
const quoteAsset = computed(() => {
    return props.symbolInfo?.quote_asset?.toUpperCase()
})
</script>
<template>
    <div class="price-ul">
        <div class="flex-auto">
            <div class="info-box info-box-top">
                <span class="info-title">{{ $t('tradingCommon.table.colum6.field1') }}({{ quoteAsset }})</span>
                <span class="info-title">{{ $t('tradingCommon.table.colum6.field2') }}({{ baseAsset }})</span>
            </div>
            <div class="info-box" v-for="(item, index) in buyList" :key="index">
                <span class="green-color">{{ friendlyNumber(item[0]) }}</span>
                <span class="c-is-num">{{ friendlyNumber(item[1]) }}</span>
            </div>
            <div class="now-price" :class="{ 'red-color': friendlyNumber(+symbolData.price_latest_change) < 0 }">
                {{ friendlyNumber(symbolData.price) || 0 }}
            </div>
            <div class="info-box" v-for="(item, index) in sellList" :key="index">
                <span class="red-color">{{ friendlyNumber(item[0]) }}</span>
                <span class="c-is-num">{{ friendlyNumber(item[1]) }}</span>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.price-ul {
    display: flex;
    justify-content: space-between;
    width: 22%;
    flex-shrink: 0;
    margin-left: 8px;
    max-width: 280px;
    min-width: 200px;

    .info-box {
        padding-right: 30px;
        font-family: DIN;
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
        display: flex;
        justify-content: space-between;
        margin-top: 16px;

        &:first-child {
            margin-top: 0;
        }

        .info-title {
            font-size: 12px;
            color: #A4A8AB;
            margin-bottom: 4px;
        }
    }
    .info-box-top {
        padding-bottom: 10px;
    }

    .now-price {
        font-family: DIN;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
        margin: 22px 0;
        color: #00b481;
        padding: 10px 30px;
    }
}
</style>
