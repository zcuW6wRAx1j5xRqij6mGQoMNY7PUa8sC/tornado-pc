<script setup>
import { useI18n } from "vue-i18n"
const { t, locale } = useI18n()
import { ArrowDownBold } from "@element-plus/icons-vue"
const languageList = computed(() => {
    let list = []
    if (process.env.NODE_ENV === "development") {
        list.push({
            text: "中文简体",
            value: "zh_CN",
        })
    }
    return [
        ...list,
        {
            text: "Deutsch",
            value: "de",
        },
        {
            text: "English",
            value: "en",
        },
        {
            text: "Español",
            value: "es",
        },
        {
            text: "Français",
            value: "fr",
        },
        {
            text: "Italiano",
            value: "it",
        },
    ]
})
const curLanguage = ref("")
onMounted(() => {
    const language = localStorage.getItem("language")
    if (language) {
        locale.value = language
        curLanguage.value =
            languageList.value.find((item) => item.value === language)?.text ||
            t("changeLang.label6")
    } else {
        curLanguage.value = t("changeLang.label6")
    }
})
const handleCommand = (val) => {
    locale.value = val
    localStorage.setItem("language", val)
    curLanguage.value =
        languageList.value.find((item) => item.value === val)?.text ||
        t("changeLang.label6")
}
</script>
<template>
    <el-dropdown @command="handleCommand" popper-class="popper" class="ml-4">
        <div class="show-language">
            {{ curLanguage
            }}<el-icon class="el-icon--right">
                <ArrowDownBold />
            </el-icon>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item v-for="item in languageList" :key="item.value" :command="item.value">{{
                    item.text }}
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<style scoped lang="scss">
:deep(.el-dropdown) {
    .el-button--primary {
        height: 60px;
        background-color: #161D26;
        border-radius: 4px;
        border: none !important;
        color: #fff;
        font-family: Raleway;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: 22px;
        /* 157.143% */
        outline: none !important;
    }

    .el-icon {
        color: #fff;
    }

    .popper {
        background: pink !important;
    }
}

.show-language {
    background: #161D26;
    border-radius: 4px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 14px;
    color: #FFFFFF;
    min-width: 145px;
    height: 60px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>