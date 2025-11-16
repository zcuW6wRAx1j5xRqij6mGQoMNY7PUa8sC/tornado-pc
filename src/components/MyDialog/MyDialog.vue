<template>
        <el-dialog v-model="visible" class="my-dialog" :title="title" :width="width" :close-on-click-modal="false"
            @update:visible="handleVisibleChange" @close="handleClose" v-bind="$attrs">
            <template #default>
                <div class="dialog-body">
                    <slot />
                </div>
            </template>
            <template #footer v-if="showFooter">
                <div v-if="showFooter" class="flex justify-between">
                    <el-button @click="handleCancel" v-if="!hideCancel" :disabled="loading" :loading="loading">{{ $t('common.text6') }}</el-button>
                    <el-button type="primary" :loading="loading" :disabled="disabled" :class="{'w-full': hideCancel}"
                        @click="handleConfirm">{{ $t('common.text1') }}</el-button>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
    modelValue: Boolean, // 用于v-model绑定的visible状态
    title: String, // 对话框标题
    width: {
        type: String,
        default: '30%', // 对话框宽度，默认为30%
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    hideCancel: {
        type: Boolean,
        default: true,
    },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)

// 监听props的变化，以更新visible状态
watch(
    () => props.modelValue,
    newValue => {
        console.log('new', newValue)
        visible.value = newValue
    }
)

const handleVisibleChange = val => {
    visible.value = val
    if (val === false) {
        // 当对话框关闭时，重置 depositVisible 状态
        handleClose()
    }
}

const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('update:modelValue', false)
    emit('close')
}

const handleClose = () => {
    emit('update:modelValue', false)
    emit('close')
}
</script>

<style scoped lang="scss">
   

   
</style>
