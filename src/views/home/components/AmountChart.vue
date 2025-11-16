<template>
  <div class="amount-chart-container">
    <div class="chart-title">
        <span class="mr-auto">{{ checkInfo.name }}</span>
        <MyTab :tabList="tabList"  :tabActive="tabActive" @tabChange="tabChange" />
    </div>
    <div ref="chartRef" class="chart" id="chartxxxx"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { recommendListApi } from '@/api/data'
import { serChartData } from '@/utils/serChartData'
const checkInfo = ref({})
const getRecommendList =  () => {
    recommendListApi({ page: 1, page_size: 20 }).then(data => {
        const etf = data.items.find(item => item.base_asset === 'eth')
        if (etf) {
            checkInfo.value = etf
        }else{
            checkInfo.value = data.items[0]
        }
        nextTick(() => {
            checkInfo.value.setId = 'xxxx'
            console.log(checkInfo.value)
            serChartData([checkInfo.value], 'spot', true, null, '#0CAF60')
        })
    })
}
onMounted(() => {
    getRecommendList()
})
</script>

<style scoped>
.amount-chart-container {
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  min-width: 400px;
  min-height: 320px;
  flex: auto;
  display: flex;
  flex-direction: column;
}
.chart-title {
    flex-shrink: 0;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.chart {
  width: 100%;
  min-height: 260px;
  flex: auto;
}
</style>
