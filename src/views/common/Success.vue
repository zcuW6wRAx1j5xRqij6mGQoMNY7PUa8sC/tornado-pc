<script  setup>
defineProps({
    msg: String,
})
</script>
<!--  -->
<template>
    <div class="flex flex-col justify-center items-center">
        <img src="./img/success.svg" class="success" alt="" />
        <div class="success-txt">{{ msg || $t('common.opeSuccess') }}</div>
    </div>
</template>

<style scoped>
.success {
    width: 157.728px;
    height: 128.109px;
    flex-shrink: 0;
}

.success-txt {
    color: #8c8c8c;
    text-align: center;
    font-variant-numeric: lining-nums proportional-nums;
    font-family: 'PingFang SC';
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 32px; /* 177.778% */
    margin-top: 20px;
}
</style>
