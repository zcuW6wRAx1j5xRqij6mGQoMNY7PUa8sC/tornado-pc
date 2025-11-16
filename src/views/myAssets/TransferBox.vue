<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Transfer from './Transfer.vue'
import Exchange from './Exchange.vue'
const tabList = computed(() => {
    return [
        {
            name: t('transform.title'),
            id: 1,
        },
        {
            name: t('exchange.title'),
            id: 2,
        },
    ]
})
const tabActive = ref(1)
const tabChange = id => {
    tabActive.value = id
}
const emit = defineEmits(['success'])
</script>
<!--  -->
<template>
    <div class="transfer-box">
        <MyTab :tabList="tabList" :tabActive="tabActive" @tabChange="tabChange"
            class="flex-shrink-0 mb-8 justify-self-start" isBlock />
        <Transfer v-if="tabActive === 1" @success="emit('success')" />
        <Exchange v-if="tabActive === 2" @success="emit('success')" />
    </div>
</template>

<style scoped lang="scss">
.transfer-box {
    max-width: 800px;
    margin: 0 auto;
    overflow: auto;
    flex: auto;
}

:deep(.tab-block) {
    min-width: 120px;
}
</style>
