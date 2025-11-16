<script setup>
import { useRoute } from "vue-router"
import { ref } from "vue"
import { aboutUsApi, userAgreementApi, privacyPolicyApi } from "@/api/data"
const route = useRoute()
// type 1.关于我们 2.用户协议 3.隐私政策
const type = ref(+route.query.type)
const content = ref("")
const loading = ref(false)
const getData = () => {
    loading.value = true
    let action = null
    switch (type.value) {
        case 1:
            action = aboutUsApi
            break
        case 2:
            action = userAgreementApi
            break
        case 3:
            action = privacyPolicyApi
            break
        default:
            action = aboutUsApi
            break
    }
    action()
        .then((data) => {
            content.value = data.content
        })
        .finally(() => {
            loading.value = false
        })
}
getData()
</script>
<template>
    <div class="about-us-page" v-loading="loading">
        <div v-html="content" />
    </div>
</template>
<style scoped lang="scss">
.about-us-page {
    display: flex;
    flex-direction: column;
    background: #141517;
    color: #fff;
    font-family: "PingFang SC";
    font-size: 16px;
    padding: 25px 80px;
    height: 100%;
    line-height: 50px;
    overflow: auto;
    
}
:deep(span) {
    background-color: transparent !important;
    color: #fff !important;
}
</style>
