<script setup>
import { useUserInfo } from "@/hooks/useUserInfo"
import { useUserStoreHook } from "@/store/modules/user"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
const { t } = useI18n()
import { setBaseUrl } from "@/utils/utils"
const { userInfo } = useUserInfo()
const useUserStore = useUserStoreHook()
const router = useRouter()
const props = defineProps({
    isCollapsed: {
        type: Boolean,
        default: false,
    },
})

const getIcon = url => {
    return new URL(`../img/${url}.svg`, import.meta.url).href
}
const menuList = computed(() => {
    return [
        {
            name: t("menu.menu1"),
            path: "/",
            id: "homePage",
            icon: getIcon("menu1")
        },
        {
            name: t("menu.menu2"),
            path: "/TradingList",
            id: "tradingList",
            icon: getIcon("menu2")
        },
        {
            name: t("menu.menu3"),
            path: "/ContractTradingList",
            id: "contractTradingList",
            icon: getIcon("menu3")
        },
        {
            name: t("menu.menu4"),
            path: "/MyAssets",
            id: "/MyAssets",
            icon: getIcon("menu4")
        },
        {
            name: 'IEO',
            path: "/IEO",
            id: "IEO",
            icon: getIcon("menu5")
        },
        {
            name: t('ai.title'),
            path: '/AI',
            id: "AI",
            icon: getIcon("menu9")
        },
        {
            name: t('defn.title'),
            path: "/Defi",
            id: "Defi",
            icon: getIcon("menu7")
        },
        {
            name: t('otc.title'),
            path: "/OTC",
            id: "OTC",
            icon: getIcon("menu8")
        },
    ]
})
const handleMenuClick = (item) => {
    router.push(item.path)
}
const handleSignOut = () => {
    useUserStore.logOut()
}
</script>

<template>
    <section class=" left-menu" :class="{ collapsed: isCollapsed }">
        <div class="flex items-center mb-10">
            <img src="/logo.svg" class="logo" alt="" />
        <img src="/text.svg" alt="" class="text-logo">
        </div>
        <img v-if="userInfo.avatar" :src="setBaseUrl(userInfo.avatar)" alt="" class="avatar" />
        <div class="user-info" v-show="!isCollapsed">{{ userInfo.name }}</div>
        <div class="verified-identity flex items-center">
          <div v-if="!isCollapsed">
            {{ userInfo.is_verified_identity ? $t('userPopup.endName') :
            $t('userPopup.noName') }}
          </div>
            <img src="../img/verified-success.svg" v-if="userInfo.is_verified_identity" class="verified-icon" alt="">
            <img src="../img/verified.svg" class="verified-icon" v-else alt="">
        </div>
        <div class="menu-ul">
            <div v-for="item in menuList" :key="item.name" class="menu-item" :class="{
                'active':
                    item.path === $route.path ||
                    item.path === $route.meta.id,
            }" @click="handleMenuClick(item)">
                <img :src="item.icon" class="menu-icon" alt="">
                <div class="menu-name" v-if="!isCollapsed">{{ item.name }}</div>
            </div>
        </div>
        <div class="sign-out"  @click="handleSignOut">
            <img src="../img/sign-out.svg" alt="" class="mr-2 w-4 h-4" :class="{ 'w-6 h-6': isCollapsed }" />
            <div class="sigh-out-text" v-if="!isCollapsed">{{ t('my.signOut') }}</div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.left-menu {
    flex-shrink: 0;
    width: 252px;
    padding: 24px;
    align-items: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
    background-color: #12181f;
    transition: width 0.3s ease;

    &.collapsed {
        width: 90px;
        padding: 24px 12px;

        .menu-name,
        .user-info,
        .verified-identity > div {
            opacity: 0;
            width: 0;
            margin: 0;
        }
    }

}

.avatar {
    width: 70px;
    height: 70px;
    border-radius: 25px;
    margin-bottom: 14px;
}

.user-info {
    font-weight: 600;
    font-size: 16px;
    text-align: center;
    transition: all 0.3s ease;
    opacity: 1;
    white-space: nowrap;
    overflow: hidden;
}

.verified-identity {
    margin-top: 4px;
    font-size: 14px;
    color: #C2C2C2;
    transition: all 0.3s ease;
    opacity: 1;
    white-space: nowrap;
    overflow: hidden;
}

.verified-icon {
    width: 14px;
    height: 14px;
    margin-left: 4px;
}

.menu-ul {
    margin-top: 32px;
    width: 100%;
    overflow: auto;

    .menu-item {
        font-weight: 500;
        font-size: 16px;
        color: #C2C2C2;
        display: flex;
        align-items: center;
        padding: 18px 20px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;

        .menu-name {
            margin-left: 12px;
            transition: all 0.3s ease;
            opacity: 1;
            white-space: nowrap;
            overflow: hidden;
        }

        &.active {
            font-weight: bold;
            color: #fff;
            background-color: #0CAF60;
        }
    }

    .menu-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }
}
.sign-out {
    padding: 18px 42px;
    background: #161D26;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: auto;
}
.collapsed .sign-out {
    padding: 12px;
}
.text-logo{
    height: 20px;
    margin-left: 10px;
}
.logo{
    width: 44px;
    height: 44px;
}
</style>
