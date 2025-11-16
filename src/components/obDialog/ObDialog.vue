<!--
 * @Author: linBin
 * @Date: 2022-07-11 09:32:28
 * @LastEditTime: 2024-07-30 11:10:42
 * @LastEditors: linBin
 * @Description: 弹窗组件
 * @FilePath: /ticket-pc/src/components/obDialog/ObDialog.vue
-->

<template>
    <el-dialog
        v-bind="$attrs"
        :width="width"
        :before-close="handleCancel"
        :close-on-click-modal="false"
    >
        <slot />
        <template #footer>
            <span class="dialog-footer" v-if="!selfFooter">
                <el-button @click="handleCancel" :loading="loading">{{ cancelText }}</el-button>
                <el-button
                    type="primary"
                    @click="handleConfirm"
                    :loading="loading"
                    :disabled="disabled"
                >
                    {{ confirmText }}
                </el-button>
            </span>
            <slot name="footer" />
        </template>
    </el-dialog>
</template>
<script setup >
// https://vxetable.cn/#/modal/api 文档链接
import { propTypes } from '@utils/propTypes'
const props = defineProps({
    confirmText: propTypes.string.def('确定'),
    cancelText: propTypes.string.def('取消'),
    selfFooter: propTypes.bool.def(false),
    width: {
        type: [String, Number],
        default: '472px',
    },
    loading: propTypes.bool.def(false),
    disabled: propTypes.bool.def(false),
})
const emit = defineEmits(['handleCancel', 'handleConfirm'])
// 取消函数
const handleCancel = () => {
    emit('handleCancel')
}
// 确认函数
const handleConfirm = () => {
    if (props.disabled) {
        return
    }
    emit('handleConfirm')
}
</script>
<style scope></style>
