<script setup>
import TopHeader from './components/TopHeader.vue'
import LeftMenu from './components/LeftMenu.vue'
import AnnouncementPopup from '@/components/AnnouncementPopup.vue'

import { ref } from 'vue'

const isMenuCollapsed = ref(false)
const toggleMenu = () => {
    isMenuCollapsed.value = !isMenuCollapsed.value
}
</script>
<template>
   <div class="h-full w-full flex">
    <LeftMenu :is-collapsed="isMenuCollapsed"/>
    <section class="view-content">
        <TopHeader @toggle-menu="toggleMenu" :is-collapsed="isMenuCollapsed"/>
        <router-view>
            <template #default="{ Component, route }">
                <transition mode="out-in">
                    <section :key="route.path" class="router-content">
                        <component :is="Component" />
                    </section>
                </transition>
            </template>
        </router-view>
        <AnnouncementPopup />

    </section>
   </div>
</template>
<style scoped lang="scss">
.view-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: #12181F;
    flex: auto;
}

.router-content {
    position: relative;
    flex: auto;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background-color: #161D26;
    padding: 24px;
}
</style>
