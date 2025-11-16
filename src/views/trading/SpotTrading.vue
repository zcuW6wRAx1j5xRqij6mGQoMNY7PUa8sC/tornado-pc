<script setup>
import { ref } from "vue"
import Chart from "./components/Chart.vue"
import SpotTableBox from "./components/SpotTableBox.vue"
import SpotTransaction from "./components/SpotTransaction.vue"
import TopHeader from "./components/TopHeader.vue"
import RightTable from "./components/RightTable.vue"
import useSocket from "@/hooks/useSocket"
import { useRoute } from "vue-router"
import { getSymbolDetailApi } from "@/api/data"
const { setSub, unsubscribeChannel } = useSocket()
const route = useRoute()
const symbolInfo = ref({})
const symbolId = ref(+route.query.id)
const changeCoin = async (item) => {
    symbolId.value = item.id
    await getDetail()
    change()
}
const getDetail = () => {
    if (!symbolId.value) {
        return
    }
    const type = "spot"
    return getSymbolDetailApi({
        symbol_id: symbolId.value,
        symbol_type: type,
    }).then((data) => {
        symbolInfo.value = data || {}
        refreshBottomTable()
    })
}
onMounted(getDetail)
const symbolData = ref({})
const changeData = (data) => {
    symbolData.value = data
}
const isRefreshBottomTable = ref(false)
const refreshBottomTable = () => {
    isRefreshBottomTable.value = !isRefreshBottomTable.value
}
const walletRefresh = ref(false)
const change = () => {
    walletRefresh.value = !walletRefresh.value
}
</script>
<template>
    <div class="contract-trading">
        <TopHeader
                    :isSpot="true"
                    :setSub="setSub"
                    :symbolInfo="symbolInfo"
                    @changeData="changeData"
                    @changeCoin="changeCoin"
                    :unsubscribeChannel="unsubscribeChannel"
                />
        <div class="contract-top flex">
            <RightTable
                :isSpots="true"
                :setSub="setSub"
                :symbolInfo="symbolInfo"
                :unsubscribeChannel="unsubscribeChannel"
                :symbolData="symbolData"
            />
            <div class="top-box">
                
                <Chart
                    :isSpot="true"
                    :setSub="setSub"
                    :symbolInfo="symbolInfo"
                    :unsubscribeChannel="unsubscribeChannel"
                />
                <SpotTransaction
                    :isSpot="true"
                    :setSub="setSub"
                    :symbolInfo="symbolInfo"
                    :unsubscribeChannel="unsubscribeChannel"
                    :symbolData="symbolData"
                    @refreshBottomTable="refreshBottomTable"
                    :walletRefresh="walletRefresh"
                />
            </div>
           
        </div>
        <SpotTableBox
            :setSub="setSub"
            :symbolInfo="symbolInfo"
            :isRefreshBottomTable="isRefreshBottomTable"
            @change="change"
        />
    </div>
</template>

<style scoped lang="scss">
.contract-trading {
    flex: auto;

    .contract-top {
        height: auto;

        .top-box {
            position: relative;
            border-radius: 6px;
            overflow: auto;
            flex: auto;
            display: flex;

            .tool-box {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 30px;
                height: 60px;
                border-bottom: 1px solid rgb(255 255 255 / 5%);
                font-family: "PingFang SC";
            }
        }
    }
}
</style>
