<template>
    <my-dialog v-model="visible" :title="t('common.text3')" width="600px" :hideCancel="true" :show-close="false" @confirm="handleConfirm">
        <div class="my-dialog-body" v-html="currentAnnouncement?.content">
        </div>
    </my-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { announcementListApi, readAnnouncementApi } from '@/api/common'

const { t } = useI18n()
const visible = ref(false)
const announcements = ref([])
const currentIndex = ref(0)
const currentAnnouncement = ref(null)

const showNextAnnouncement = () => {
    if (currentIndex.value < announcements.value.length) {
        currentAnnouncement.value = announcements.value[currentIndex.value]
        visible.value = true
        console.log(currentAnnouncement.value, 'dialog')
    }
}

const handleConfirm = async () => {
    if (currentAnnouncement.value) {
        try {
            await readAnnouncementApi({ announcement_id: currentAnnouncement.value.id })
            currentIndex.value++
            visible.value = false
            showNextAnnouncement()
        } catch (error) {
            console.error('Failed to mark announcement as read:', error)
        }
    }
}

onMounted(async () => {
    try {
        const data = await announcementListApi()
        announcements.value =data || []
        if (announcements.value.length > 0) {
            showNextAnnouncement()
        }
    } catch (error) {
        console.error('Failed to fetch announcements:', error)
    }
})
</script>

<style scoped>
.my-dialog-body {
    text-align: center;
    color: #fff;
    padding: 20px;
    word-break: break-word;
    max-height: 70vh;
    overflow-y: auto;
}
</style> 