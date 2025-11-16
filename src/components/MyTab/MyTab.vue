<script setup>
// 传入属性tabList 选项卡列表， tabActive 选中的选项卡
import { ref, watchEffect } from 'vue'
const props = defineProps({
    tabList: {
        type: Array,
        default: () => [],
    },
    tabActive: {
        type: [Number, String, Array],
        default: '',
    },
    isBlock: {
        type: Boolean,
        default: false,
    },
    isMultiple: {
        type: Boolean,
        default: false,
    },
    isSmall: {
        type: Boolean,
        default: false,
    },
    isFlex: {
        type: Boolean,
        default: false,
    },
})
const activeList = ref([])
const tabActive = ref()
let init = true
watchEffect(() => {
    if (init) {
        if (props.isMultiple) {
            activeList.value = props.tabActive || []
        } else {
            tabActive.value = props.tabActive
        }
        init = false
    }
})
const tabListShow = computed(() => {
    let list = props.tabList
    return list
})
const emit = defineEmits(['tabChange'])
const tabClick = item => {
    if (props.isMultiple) {
        if (activeList.value.includes(item.id)) {
            activeList.value = activeList.value.filter(id => id !== item.id)
        } else {
            activeList.value.push(item.id)
        }
    } else {
        tabActive.value = item.id
    }
    emit('tabChange', props.isMultiple ? activeList.value : tabActive.value, item)
}
</script>
<!--  -->
<template>
    <div class="tab-box" :style="{ 'justify-content': 'flex-start' }"
        :class="{ 'is-small': isSmall, 'is-flex': isFlex, 'is-block': isBlock }">
        <div v-for="item in tabListShow" :key="item.id" :class="[
            isBlock ? 'tab-block' : 'tab-item',
            isMultiple
                ? activeList.includes(item.id)
                    ? 'active'
                    : ''
                : tabActive === item.id && 'active',
            !!item.name ? '' : 'is-empty',
        ]" @click="tabClick(item)">
            {{ item.name }}
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-box {
    flex-shrink: 0;
    display: inline-flex;
    flex-wrap: wrap;
    margin-left: -10px;
}

.tab-item {
    position: relative;
    flex: auto;
    text-align: center;
    color: #fff;
    font-family: 'PingFang SC';
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    /* 157.143% */
    margin-left: 10px;
    cursor: pointer;
    padding: 8px;
    min-width: 80px;
    &.active {
        background: var(--el-primary-color);
        border-radius: 14px;
    }
}

.is-empty {
    visibility: hidden;
}

.is-small {
    flex-wrap: wrap;
    justify-content: flex-start !important;

    .tab-block {
        color: #a1a1a1;
        font-family: 'PingFang SC';
        font-size: 12px;
        font-style: normal;
        line-height: normal;
        padding: 4px;
        border-radius: 4px;
        background: #253037;
        text-align: center;
        margin-left: 8px;
        margin-top: 10px;
        flex: none;
        width: auto;

        &.active {
            color: #fff;
            font-weight: bold;
        }
    }
}

.is-flex {
    padding: 16px;
    margin-left: 0;

    .tab-item {
        flex: none;
        margin-right: 60px;
        margin-left: 24px;
    }
}

.is-block {
    padding: 6px;
    background: #161D26;
    border-radius: 25px;
    font-size: 12px;
    color: #A4A8AB;
    margin-left: 0;
    border: 1px solid #212A36;
    display: flex;
    align-items: center;
    justify-self: flex-start;
}

.tab-block {
    flex: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 13px 16px;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
    &.active {
        background: #212A36;
        color: #fff;
        font-weight: bold;
    }
}
</style>
