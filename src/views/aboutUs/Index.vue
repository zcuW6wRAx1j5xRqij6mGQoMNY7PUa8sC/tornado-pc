<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
<template>
    <div class="about-us-page">
        <div :innerHTML="t('about.text1')" />
    </div>
</template>

<style scoped>
.about-us-page {
    display: flex;
    flex-direction: column;

    /* align-items: center; */
    background: #141517;
    color: #fff;
    font-family: 'PingFang SC';
    font-size: 16px;
    padding: 25px 80px;
    height: 100%;
    line-height: 50px;
    overflow: auto;
}
</style>
