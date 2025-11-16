<script  setup></script>
<!--  -->
<template>
    <div class="no-data">
        <img src="./img/noData.svg" class="no-data-img" alt="" />
        <div class="no-data-text">{{ $t('common.noData') }}</div>
    </div>
</template>

<style scoped lang="scss">
.no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    flex: auto;

    .no-data-img {
        width: 138px;
        height: 140px;
    }

    .no-data-text {
        margin-top: 10px;
        color: #6b6b6b;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 140%; /* 19.6px */
        letter-spacing: 0.5px;
    }
}
</style>
