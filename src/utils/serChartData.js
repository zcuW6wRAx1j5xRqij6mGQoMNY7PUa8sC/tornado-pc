import { useECharts } from "@/hooks/useECharts"
import { getChartDataApi } from "@/api/data"
export function serChartData(
    list,
    symbol_type = "spot",
    hasSame = false,
    selfData,
    color = '#FFC84E'
) {
    let params = {
        grid: {
            left: 0, // 调整左侧的边距
            right: 10, // 调整右侧的边距
            top: 5, // 调整顶部的边距
            bottom: 5, // 调整底部的边距
        },
        xAxis: {
            type: "time",
            axisLine: { show: false }, // 隐藏X轴轴线
            axisTick: { show: false }, // 隐藏X轴刻度线
            splitLine: { show: false }, // 隐藏X轴网格线
            axisLabel: { show: false }, // 隐藏X轴标签
        },
        yAxis: {
            type: "value",
            axisLine: { show: false }, // 隐藏X轴轴线
            axisTick: { show: false }, // 隐藏X轴刻度线
            splitLine: { show: false }, // 隐藏X轴网格线
            axisLabel: { show: false }, // 隐藏X轴标签
        },
    }
    nextTick(async () => {
        let ids = list.map((item) => item.id)
        let bItems = {
            items: {},
            range: {},
        }
        if (ids.length === 0) {
            return
        }
        if (selfData) {
            bItems = selfData
        } else {
            let data = await getChartDataApi({
                symbol_type,
                symbol_ids: ids,
            })
            bItems = data
        }
        list.forEach((item) => {
            item.data =
                bItems?.items[item.binance_symbol] &&
                bItems.items[item.binance_symbol].map((cel) => {
                    return [+cel.t, +cel.p]
                })
            item.params = bItems?.range[item.symbol] || {}
            if (!item.setOptions) {
                item.setOptions = useECharts(
                    document.getElementById(
                        `chart${hasSame ? item.setId : item.id}`
                    )
                   
                )
            }
            const randomColor = color // 生成随机数并转换为十六进制
            let echartParams = { ...params }
            echartParams.yAxis = {
                ...echartParams.yAxis,
                min: +item.params.min,
                max: +item.params.max,
            }
            item.setOptions.setOptions({
                ...echartParams,
                series: [
                    {
                        data: item.data,
                        type: "line",
                        smooth: true,
                        showSymbol: false,
                        color: randomColor,
                        // 区域渐变
                        areaStyle: {
                            color: {
                                type: "linear",
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    { offset: 0, color: color },
                                    {
                                        offset: 1,
                                        color: "rgba(22, 29, 38, 0)",
                                    },
                                ],
                            },
                        },
                    },
                ],
            })
        })
    })
}
