<script setup>
import { onMounted, ref } from 'vue'
import { getTeacherListApi, voteTeacherApi } from '@/api/data'
import { setBaseUrl } from '@/utils/utils'
import { useI18n } from 'vue-i18n'
import { successMessage } from '/@/utils/message'
const { t } = useI18n()
const voteList = ref([])
const todayVote = ref(false)
const getData = () => {
    getTeacherListApi().then(data => {
        voteList.value = data.mentors
        todayVote.value = data.today_vote
    })
}
onMounted(() => {
    getData()
})
// 投票处理
const handleVote = (item) => {
    fullscreenLoading.value = true
    voteTeacherApi({ id: item.id }).then(data => {
        successMessage(t('vote.success'))
        getData()
    }).finally(() => {
        fullscreenLoading.value = false
    })
}
const fullscreenLoading = ref(false)
</script>

<template>
    <div class="vote-page" v-loading.fullscreen.lock="fullscreenLoading">
        <!-- 投票列表 -->
        <div class="vote-list">
            <div class="vote-row">
                <div class="vote-item" v-for="item in voteList" :key="item.id">
                    <div class="vote-content">
                        <div class="vote-header">
                            <img :src="setBaseUrl(item.avatar)" class="avatar" alt="">
                            <div class="vote-title">{{ item.name }}</div>
                        </div>
                        <p>{{ item.description }}</p>
                        <div class="vote-info">
                            <span>{{ t('vote.label') }}: {{ item.votes }}</span>
                            <div class="flex items-center">
                                <div class="count">{{ item.process }}%</div>
                                <div class="progress-bar">
                                    <div class="progress" :style="{ width: item.process + '%' }">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <MyButton @click="handleVote(item)" :disabled="todayVote && item.status === 1">
                            {{ t('vote.btn') }}
                        </MyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.vote-list {
    padding-top: 10px;
}

.vote-row {
    display: flex;
    flex-wrap: wrap;
    padding-left: 10px;
}

.vote-title {
    font-weight: 500;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 16px;
}

.vote-item {
    width: 220px;
    margin: 0 10px 10px 0;
    background: #1c1c1e;
    border-radius: 8px;
    padding: 12px;

    .vote-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #2c2c2e;
            margin-right: 8px;
            flex-shrink: 0;
        }

        h3 {
            color: #fff;
            font-size: 14px;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }
    }

    p {
        color: #86868b;
        font-size: 12px;
        margin: 0 0 12px;
        line-height: 1.4;
    }
}

.vote-info {
    margin-bottom: 16px;

    span {
        color: #fff;
        font-size: 12px;
        margin-bottom: 6px;
        display: block;
    }
}

.count {
    font-family: DIN, DIN;
    font-weight: 500;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 14px;
    margin-right: 10px;
}

.progress-bar {
    height: 4px;
    background: #2c2c2e;
    border-radius: 2px;
    overflow: hidden;
    flex: auto;

    .progress {
        height: 100%;
        background: linear-gradient(90deg, #C7A254 0%, #ECD396 100%);
        transition: width 0.3s;
    }
}

:deep(.large) {
    padding: 6px !important;
}
</style>