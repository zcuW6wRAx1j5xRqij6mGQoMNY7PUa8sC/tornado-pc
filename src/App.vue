<template>
    <el-config-provider>
        <router-view :key="locale" />
    </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from "element-plus"
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
</script>
