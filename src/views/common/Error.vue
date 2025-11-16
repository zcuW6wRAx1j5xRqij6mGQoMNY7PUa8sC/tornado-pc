<script  setup>
defineProps({
    msg: String,
    content: String,
})
const emit = defineEmits(['reUpload'])
const reUpload = () => {
    emit('reUpload')
}
</script>
<!--  -->
<template>
    <div class="flex flex-col justify-center items-center">
        <img src="./img/refuse.svg" class="success" alt="" />
        <div class="success-txt">{{ msg }}</div>
        <div class="msg-txt">{{ content }}</div>
        <MyButton @click="reUpload" class="mt-10 min-w-32">{{ $t('my.reUpload') }}</MyButton>
    </div>
</template>

<style scoped>
.success {
    width: 157.728px;
    height: 128.109px;
    flex-shrink: 0;
}

.msg-txt {
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

.success-txt {
    color: #e34646;
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
