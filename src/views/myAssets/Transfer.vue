<script setup>
import { useDisabled } from "@/hooks/useDisabled"
import { useI18n } from "vue-i18n"
import { ref, onMounted, reactive } from "vue"
import { friendlyNumber } from "@/utils/utils"
import { successMessage } from "@utils/message"
import {
    transferApi,
    getTransferBalanceApi,
} from "@/api/my"
import { useBalance } from "@/hooks/useBalance"
const { getWalletData, walletInfo, getSpotBalance } =
    useBalance([1, 2])
const { t } = useI18n()
const transferDataInit = {
    amountKey: "USDC",
    account: "",
    account1: "",
    amount: "",
}
const transferData = reactive({
    ...transferDataInit,
})
const isTransferDisabled = useDisabled(transferData)
const contactTotal = ref(0)
const getTransferBalance = () => {
    getTransferBalanceApi().then((data) => {
        contactTotal.value = data
    })
}
onMounted(() => {
    getTransferBalance()
})
const errorObj = ref({})
const total = computed(() => {
    return friendlyNumber(transferData.account === 0 ? walletInfo.value.total : contactTotal.value)

})
const accountList = computed(() => {
    return [
        { name: t("transform.select1"), id: 0 },
        { name: t("transform.select3"), id: 2 },
    ]
})
const transferList = [
    {
        id: "USDC",
        name: "USDC",
    },
]
const accountChange = () => {
    transferData.amount = ""
}
const accountList1 = computed(() => {
    return accountList.value.filter((item) => item.id !== transferData.account1)
})
const accountList2 = computed(() => {
    return accountList.value.filter((item) => item.id !== transferData.account)
})
const change = () => {
    transferData.amount = ""
    const temp = transferData.account
    transferData.account = transferData.account1
    transferData.account1 = temp
}
const emit = defineEmits(["success"])
const sureHandle = () => {
    let to = "spot"
    if (transferData.account === 0) {
        to = "derivative"
    }
    return transferApi({ amount: transferData.amount, to: to }).then(() => {
        successMessage(t("common.opeSuccess"))
        getWalletData(1)
        getTransferBalance(2)
        emit("success")
    }).catch(err => {
        errorObj.value = err
    })
}
</script>
<template>
    <div class="transfer-body">
        <el-select v-model="transferData.amountKey" size="large" disabled :placeholder="t('withdrawal.pla1')"
            class="mb-10px">
            <el-option v-for="item in transferList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <div class="flex items-center mb-4">
            <el-select v-model="transferData.account" size="large" :placeholder="t('transform.pla1')">
                <el-option v-for="item in accountList1" :key="item.id" :label="item.name" :value="item.id"
                    @click.stop="accountChange" />
            </el-select>
            <img src="./img/transfer.svg" class="mx-3  flex-shrink-0 cursor-pointer" @click="change" alt="" />
            <el-select v-model="transferData.account1" size="large" :placeholder="t('transform.pla2')">
                <el-option v-for="item in accountList2" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
        </div>
        <MyInput isLarge v-model="transferData.amount" :placeholder="$t('transform.pla4')" :errorObj="errorObj"
            propName="amount" hasSuffix>
            <template #suffix>
                <span class="all-btn" @click="transferData.amount = total">{{ $t("contractOpe.bond.all")
                }}</span>
            </template>
        </MyInput>
        <div class="from-label flex justify-between">
            <span class="text-[#9098A2]">{{ $t("withdrawal.tip.tip1") }}</span>{{ friendlyNumber(total) }}USDC
        </div>
        <MyButton :clickFn="sureHandle" :disabled="isTransferDisabled" size="large" class="justify-self-end submit-btn">
            {{
                $t("transform.title") }}
        </MyButton>
    </div>
</template>
<style scoped lang="scss">
.transfer-body {
    max-width: 800px;
    flex-shrink: 0;
    margin: 0 auto;
}

.set-box {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.from-label {
    margin-bottom: 10px;
}

.all-btn {
    font-weight: 400;
    font-size: 15px;
    color: var(--el-color-primary);
    line-height: 18px;
    margin-left: 12px;
    cursor: pointer;
}

.submit-btn {
    height: 60px;
    min-width: 180px;
    border-radius: 20px;
    margin-top: 30px;
}
</style>