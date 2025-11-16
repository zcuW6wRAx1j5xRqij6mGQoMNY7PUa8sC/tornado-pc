<script setup>
// 设置属性 size默认是medium，type默认是primary，disabled默认是false
// size: small, medium, large
import { computed, ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'
// type: primary, secondary, danger, white
// const props = defineProps<{
//     size: 'small' | 'medium' | 'large'
//     type: 'primary' | 'secondary' | 'danger' | 'white' | 'grey' | 'green'
//     disabled: boolean
//     clickFn: () => void | undefined
// }>()
const props = defineProps({
    size: String,
    type: String,
    disabled: Boolean,
    clickFn: Function
})
const size = computed(() => {
    return props.size || 'large'
})
const type = computed(() => {
    return props.type || 'primary'
})
const disabled = computed(() => {
    return props.disabled || false
})
const emit = defineEmits(['click'])
const loading = ref(false)
const btnClick = () => {
    if (props.disabled) return
    if (loading.value) return
    if (props.clickFn) {
        loading.value = true
        Promise.resolve(props.clickFn())
            .then(() => {
                loading.value = false
            })
            .catch(() => {
                loading.value = false
            })
    }
    emit('click')
}
</script>
<!--  -->
<template>
    <div class="my-button" :class="{
        disabled: disabled,
        [type]: true,
        [size]: true,
        loading: loading,
    }" @click="btnClick">
        <Loading class="w-5 h-5 mr-2 animate-spin spin-slow" v-if="loading" />
        <slot />
    </div>
</template>

<style scoped lang="scss">
.my-button {
    border-radius: 16px;
    background: #0CAF60;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    text-align: center;
    font-family: 'PingFang SC';
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    /* 150% */
    cursor: pointer;

    &.loading,
    &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &.inline {
        display: inline-block;
        flex-grow: 0;
    }
}

.small {
    padding: 6px 15px;
    font-size: 14px;
}

.medium {
    padding: 8px 15px;
    font-size: 14px;
}

.large {
    padding: 18px 22px;
    border-radius: 20px;
}

.primary {
    background-color: #0CAF60;
}

.white {
    border: 1px solid #ddd;
    background-color: #fff;
}

.secondary {
    color: #fff;
    background: #fdb715;

    &:active,
    &:hover {
        color: #fff;
    }
}

.grey {
    color: #fff;
    background: #757575;

    &:active,
    &:hover {
        color: #fff;
    }
}

:deep(.animate-spin) {
    animation: spin 2s linear infinite;
}

.danger {
    background-color: #EF5350;
}

.green {
    background: #0CAF60;

}
</style>
