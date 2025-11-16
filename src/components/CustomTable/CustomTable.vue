<template>
  <div class="custom-table" :style="{ height: height }">
    <div class="table-header" v-if="showHeader">
      <div 
        v-for="column in columns" 
        :key="column.prop || column.label"
        class="table-cell header-cell"
        :style="{ 
          width: column.width, 
          minWidth: column.width,
          flex: column.width ? 'none' : '1',
          textAlign: column.align || 'left' 
        }"
      >
        {{ column.label }}
      </div>
    </div>
    
    <div class="table-body" ref="tableBody" @scroll="handleScroll">
      <!-- 虚拟滚动的占位容器 -->
      <div 
        v-if="virtualScroll" 
        class="virtual-scroll-container"
        :style="{ height: totalHeight + 'px' }"
      >
        <div 
          v-for="(row, index) in visibleData" 
          :key="row.id || (startIndex + index)"
          class="table-row"
          :class="{ 'row-hover': hoverIndex === (startIndex + index) }"
          :style="{ 
            position: 'absolute',
            top: (startIndex + index) * rowHeight + 'px',
            left: 0,
            right: 0
          }"
          @mouseenter="hoverIndex = startIndex + index"
          @mouseleave="hoverIndex = -1"
          @click="handleRowClick(row, startIndex + index)"
        >
          <div 
            v-for="column in columns" 
            :key="column.prop || column.label"
            class="table-cell body-cell"
            :style="{ 
              width: column.width, 
              minWidth: column.width,
              flex: column.width ? 'none' : '1',
              textAlign: column.align || 'left' 
            }"
          >
            <slot 
              :name="`cell-${column.prop}`" 
              :row="row" 
              :column="column" 
              :index="startIndex + index"
            >
              {{ getCellValue(row, column) }}
            </slot>
          </div>
        </div>
      </div>
      
      <!-- 非虚拟滚动模式 -->
      <div v-else>
        <div 
          v-for="(row, index) in data" 
          :key="row.id || index"
          class="table-row"
          :class="{ 'row-hover': hoverIndex === index }"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = -1"
          @click="handleRowClick(row, index)"
        >
          <div 
            v-for="column in columns" 
            :key="column.prop || column.label"
            class="table-cell body-cell"
            :style="{ 
              width: column.width, 
              minWidth: column.width,
              flex: column.width ? 'none' : '1',
              textAlign: column.align || 'left' 
            }"
          >
            <slot 
              :name="`cell-${column.prop}`" 
              :row="row" 
              :column="column" 
              :index="index"
            >
              {{ getCellValue(row, column) }}
            </slot>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="table-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  height: {
    type: String,
    default: 'auto'
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowHeight: {
    type: Number,
    default: 50
  },
  virtualScroll: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['row-click', 'cell-click'])

const tableBody = ref(null)
const hoverIndex = ref(-1)
const scrollTop = ref(0)
const containerHeight = ref(0)

// 虚拟滚动相关
const visibleCount = computed(() => {
  if (!props.virtualScroll) return props.data.length
  return Math.ceil(containerHeight.value / props.rowHeight) + 4 // 增加缓冲区
})

const startIndex = computed(() => {
  if (!props.virtualScroll) return 0
  return Math.max(0, Math.floor(scrollTop.value / props.rowHeight) - 2) // 增加缓冲区
})

const endIndex = computed(() => {
  if (!props.virtualScroll) return props.data.length
  return Math.min(startIndex.value + visibleCount.value, props.data.length)
})

const visibleData = computed(() => {
  if (!props.virtualScroll) return props.data
  return props.data.slice(startIndex.value, endIndex.value)
})

const totalHeight = computed(() => {
  return props.data.length * props.rowHeight
})

// 获取单元格值
const getCellValue = (row, column) => {
  if (column.prop) {
    return row[column.prop] || ''
  }
  return ''
}

// 处理行点击
const handleRowClick = (row, index) => {
  emit('row-click', { row, index })
}

// 处理滚动
const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

// 更新容器高度
const updateContainerHeight = () => {
  if (tableBody.value) {
    containerHeight.value = tableBody.value.clientHeight
  }
}

// 监听数据变化，优化渲染
watch(() => props.data, () => {
  nextTick(() => {
    updateContainerHeight()
  })
}, { deep: true })

onMounted(() => {
  updateContainerHeight()
  window.addEventListener('resize', updateContainerHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
})
</script>

<style lang="scss" scoped>
.custom-table {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
  max-height: 100%;
  
  .table-header {
    display: flex;
    border-bottom: 1px solid #242D39;
    flex-shrink: 0;
    width: 100%;
    
    .header-cell {
      padding: 16px 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
      
      &:last-child {
        border-right: none;
      }
    }
  }
  
  .table-body {
    flex: 1;
    overflow-y: auto;
    position: relative;
    width: 100%;
    
    .virtual-scroll-container {
      position: relative;
      width: 100%;
    }
    
    .table-row {
      display: flex;
      transition: background-color 0.2s;
      width: 100%;
      
      &:last-child {
        border-bottom: none;
      }
      
      .body-cell {
        padding: 16px 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        
        &:last-child {
          border-right: none;
        }
      }
    }
  }
  
  .table-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #909399;
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #242D39;
      border-top: 2px solid #409eff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
