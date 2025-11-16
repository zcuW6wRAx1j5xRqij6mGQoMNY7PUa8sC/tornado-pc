import type { Ref } from 'vue'
import { unref, nextTick, onMounted } from 'vue'
import echarts from '@/plugins/echarts/index'
import { tryOnUnmounted, useDebounceFn, useTimeoutFn } from '@vueuse/core'

export function useECharts(
    elRef: Ref<HTMLDivElement> | HTMLDivElement,
    resizeRef = null,
    theme: 'light' | 'dark' | 'default' = 'default'
) {
    let chartInstance: echarts.ECharts | null = null
    let hasResizeListener = false
    let resizeFn = resize
    // 防抖
    resizeFn = useDebounceFn(resize, 200)
    // const el = unref(elRef)
    function initCharts(t = theme) {
        const el = unref(elRef)
        if (!el || !unref(el)) {
            return
        }
        // 初始化
        chartInstance = echarts.init(el, t)
        // 初始化后再监听resize，避免重复监听
        if (!hasResizeListener) {
            window.addEventListener('resize', resizeFn)
            hasResizeListener = true
        }
    }

    function setOptions(options, clear = false) {  // 将 clear 默认设置为 false
        if (unref(elRef)?.offsetHeight === 0) {
            useTimeoutFn(() => {
                setOptions(unref(options), clear)  // 传递 clear 参数
            }, 30)
            return
        }
    
        nextTick(() => {
            useTimeoutFn(() => {
                if (!chartInstance) {
                    initCharts()
                    if (!chartInstance) return
                }
                // 将 clear 设置为 false，这样就不会清除现有图表
                clear && chartInstance?.clear()
                chartInstance?.setOption(unref(options), { notMerge: false })  // 设置 notMerge 为 false
                chartInstance?.resize() // 立即触发一次resize，保证自适应
            }, 30)
        })
    }
    
    function resize() {
        console.log('resize')
        chartInstance?.resize()
    }

    tryOnUnmounted(() => {
        if (chartInstance) {
            chartInstance.dispose()
            chartInstance = null
        }
        if (hasResizeListener) {
            window.removeEventListener('resize', resizeFn)
            hasResizeListener = false
        }
    })

    function getInstance(): echarts.ECharts | null {
        if (!chartInstance) {
            initCharts()
        }
        return chartInstance
    }
    function axisLabel(provideNumber = 10) {
        return {
            formatter: function (params) {
                let newParamsName = '' // 最终拼接成的字符串
                const paramsNameNumber = params.length // 实际标签的个数
                // 每行能显示的字的个数
                const rowNumber = Math.ceil(paramsNameNumber / provideNumber) // 换行的话，需要显示几行，向上取整
                /**
                 * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                 */
                // 条件等同于rowNumber>1
                if (paramsNameNumber > provideNumber) {
                    /** 循环每一行,p表示行 */
                    for (let p = 0; p < rowNumber; p++) {
                        let tempStr = '' // 表示每一次截取的字符串
                        const start = p * provideNumber // 开始截取的位置
                        const end = start + provideNumber // 结束截取的位置
                        // 此处特殊处理最后一行的索引值
                        if (p === rowNumber - 1) {
                            // 最后一次不换行
                            tempStr = params.substring(start, paramsNameNumber)
                        } else {
                            // 每一次拼接字符串并换行
                            tempStr = `${params.substring(start, end)}\n`
                        }
                        newParamsName += tempStr // 最终拼成的字符串
                    }
                } else {
                    // 将旧标签的值赋给新标签
                    newParamsName = params
                }
                //将最终的字符串返回
                return newParamsName
            },
            show: true,
            textStyle: {
                color: '#999999', //更改坐标轴文字颜色
                fontSize: 14, //更改坐标轴文字大小
            },
        }
    }
    return {
        setOptions,
        resize,
        echarts,
        getInstance,
        axisLabel,
        chartInstance,
    }
}
