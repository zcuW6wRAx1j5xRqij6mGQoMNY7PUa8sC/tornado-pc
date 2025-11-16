<script setup>
import { useUserStoreHook } from "@/store/modules/user"
import { useI18n } from "vue-i18n"
import { computed } from "vue"
import Language from "@/views/login/components/Language.vue"
import { useRouter, useRoute } from "vue-router"
import OpeBtn from "./OpeBtn.vue"
const { t } = useI18n()
const router = useRouter()
const toPath = (path) => {
    router.push(path)
}
const route = useRoute()
const useUserStore = useUserStoreHook()
const userName = computed(() => {
    return useUserStore.userInfoData.name
})

const props = defineProps({
    isCollapsed: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['toggle-menu'])
const getIcon = url => {
    return new URL(`../img/${url}.svg`, import.meta.url).href
}
const opeList = computed(() => {
    return [
        {
            name: t('userPopup.btn1'),
            icon: getIcon("ope1"),
            path: '/setting'
        },
        {
            name: t('userPopup.btn2'),
            icon: getIcon("ope2"),
            path: '/setting'
        }
    ]
})
</script>

<template>
    <section class="top-header">
        <img src="../img/open.svg" class="open" :class="{ 'collapsed': isCollapsed }" @click="emit('toggle-menu')"
            alt="">
        <div class="right-ope">
            <OpeBtn />
            <Language />
            <!-- <img src="../img/notice.svg" class="notice" alt=""> -->
        </div>
    </section>
</template>

<style scoped lang="scss">
.top-header {
    width: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    padding: 20px 30px;
    flex-shrink: 0;
}


.right-ope {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-left: auto;
    cursor: pointer;
}

.open {
    cursor: pointer;
    transition: transform 0.3s ease;

    &.collapsed {
        transform: rotate(180deg);
    }
}

.notice {
    width: 60px;
    height: 60px;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 20px;
}

</style>
