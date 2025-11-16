<script setup>
import { useI18n } from "vue-i18n"
import { ref, onMounted, reactive } from "vue"
import { friendlyNumber } from "@/utils/utils"
import { successMessage } from "@utils/message"
import { useDisabled } from "@/hooks/useDisabled"
import {
    withdrawalApi,
    getRechargeCoinListApi,
    transferApi,
    getTransferBalanceApi,
} from "@/api/my"
import { useBalance } from "@/hooks/useBalance"
import { getWithdrawApi } from "@/api/common"
import QRCode from "qrcode"
import copy from "@/utils/copy.js"
import { useUserInfo } from "@/hooks/useUserInfo"
const { userInfo } = useUserInfo()
const { getWalletData, walletInfo, getSpotBalance } =
    useBalance([1, 2])
const { t } = useI18n()

function getImageUrl (imageName) {
    return new URL(`./img/${imageName}.svg`, import.meta.url).href
}
const dialogVisible = ref(false)
const emit = defineEmits(["toSet"])
const handleConfirm = () => {
    emit("toSet")
    dialogVisible.value = false
}
// 对币的操作
const opeMoneyList = computed(() => {
    return [
        {
            name: t("userPopup.btn1"),
            path: "/Withdrawal",
            img: getImageUrl("btn2"),
        },
        {
            name: t("userPopup.btn2"),
            path: "/Recharge",
            img: getImageUrl("btn1"),
        },
        {
            name: t("userPopup.btn3"),
            path: "/Transform",
            img: getImageUrl("btn3"),
        },
    ]
})
const currencyList = ref([])

const getWithDrawData = () => {
    // 重置
    Object.keys(fromDataInit).forEach((key) => {
        fromData[key] = fromDataInit[key]
    })

    if (currencyList.value.length === 0) {
        getWithdrawApi().then((data) => {
            // coin_id相等的时候 coin_block字段添加到对象的children
            let currency = {}
            data.forEach((el) => {
                if (currency[el.coin_id]) {
                    currency[el.coin_id].children.push({
                        name: el.block,
                        id: el.id,
                    })
                } else {
                    currency[el.coin_id] = {
                        id: el.coin_id,
                        name: el.coin_name,
                        children: [{ name: el.block, id: el.id }],
                    }
                }
            })
            currencyList.value = Object.values(currency)
        })
    }
}
const depositVisible = ref(false)
const fromRechargeDataInit = {
    coin_id: "",
    coin_label: "",
    child_name: "",
    child_address: "",
}
const fromRechargeData = reactive({
    ...fromRechargeDataInit,
})
const codeUrl = ref("")
const currencyRechargeList = ref([])
const childRechargeList = ref([])
const isRechargeDisabled = useDisabled(fromRechargeData)
const selectRechargeChange = (item) => {
    fromRechargeData.coin_id = item.id
    fromRechargeData.coin_label = item.name
    childRechargeList.value = item.children
    codeUrl.value = ""
    selectRechargeChildChange(item.children[0] || {})
}
const selectRechargeChildChange = (item) => {
    fromRechargeData.child_name = item.name
    fromRechargeData.child_address = item.id
    QRCode.toDataURL(item.id).then((dataUrl) => {
        codeUrl.value = dataUrl
    })
}
const getRechargeData = () => {
    // 重置
    Object.keys(fromRechargeDataInit).forEach((key) => {
        fromRechargeData[key] = fromRechargeDataInit[key]
    })
    if (currencyRechargeList.value.length === 0) {
        getRechargeCoinListApi().then((data) => {
            // coin_id相等的时候 coin_block字段添加到对象的children
            let currency = {}
            data.forEach((el) => {
                if (currency[el.coin_id]) {
                    currency[el.coin_id].children.push({
                        name: el.coin_block,
                        id: el.address,
                    })
                } else {
                    currency[el.coin_id] = {
                        id: el.coin_id,
                        name: el.coin_name,
                        children: [{ name: el.coin_block, id: el.address }],
                    }
                }
            })
            currencyRechargeList.value = Object.values(currency)
        })
    }
}

const openHandle = (item) => {
    switch (item.path) {
        case "/Withdrawal":
            if (!userInfo.value.has_trade_password) {
                dialogVisible.value = true
                return
            }
            getWithDrawData()
            WithdrawalVisible.value = true
            break
        case "/Recharge":
            getRechargeData()
            depositVisible.value = true
            break
        case "/Transform":
            Object.keys(transferDataInit).forEach((key) => {
                transferData[key] = transferDataInit[key]
            })
            transferVisible.value = true
            break
    }
}
const fromDataInit = {
    wallet_address: "",
    amount: "",
    coin_id: "",
    coin_label: "",
    child_name: "",
    trade_pwd: "",
    coin_id_p: "",
}
const fromData = reactive({
    ...fromDataInit,
})
const isDisabled = useDisabled(fromData)
const WithdrawalVisible = ref(false)
const childList = ref([])
const selectChange = (item) => {
    fromData.coin_label = item.name
    childList.value = item.children
    selectChildChange(item.children[0] || {})
}
const selectChildChange = (item) => {
    fromData.child_name = item.name
    fromData.coin_id = item.id
}
const coinValue = computed(() => {
    return getSpotBalance(fromData.coin_label) || 0
})
const errorObj = ref({})
const submitForm = () => {
    return withdrawalApi(fromData)
        .then(() => {
            successMessage(t("common.opeSuccess"))
            getWalletData([1, 2])
            getTotal()
            WithdrawalVisible.value = false
        })
        .catch((error) => {
            errorObj.value = error
        })
        .finally(() => { })
}

// 划转
const transferVisible = ref(false)
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
onMounted(() => {
    getTransferBalanceApi().then((data) => {
        contactTotal.value = data
    })
})
const total = computed(() => {
    return friendlyNumber(
        transferData.account === 0 ? walletInfo.value.total : contactTotal.value
    )
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
const sureHandle = () => {
    let to = "spot"
    if (transferData.account === 0) {
        to = "derivative"
    }
    return transferApi({ amount: transferData.amount, to: to }).then(() => {
        transferVisible.value = false
        successMessage(t("common.opeSuccess"))
        getWalletData([1, 2])
        getTotal()
    }).catch(err => {
        errorObj.value = err
    })
}
</script>
<template>
    <div class="btn-box">
        <MyButton v-for="item in opeMoneyList" :key="item.path" @click="openHandle(item)" class="ml-3" size="small">
            <img :src="item.img" class="svg-icon" alt="" />
            {{ item.name }}
        </MyButton>
    </div>

    <!-- 存款 -->
    <my-dialog v-model="depositVisible" :title="t('recharge.title')" width="553px" :showFooter="false"
        @close="depositVisible = false">
        <div class="from-label">
            {{ t("withdrawal.label1") }}
            <span class="money-tip">{{ $t("withdrawal.tip.tip1") }}：{{ coinValue }}
                {{ fromData.coin_label }}</span>
        </div>
        <el-select v-model="fromRechargeData.coin_id" :placeholder="t('withdrawal.pla1')">
            <el-option v-for="item in currencyRechargeList" :key="item.id" :label="item.name" :value="item.id"
                @click.stop="selectRechargeChange(item)" />
        </el-select>
        <div class="from-label">
            {{ t("recharge.pla2") }}
        </div>
        <el-select v-model="fromRechargeData.child_address" :placeholder="t('recharge.pla2')">
            <el-option v-for="item in childRechargeList" :key="item.id" :label="item.name" :value="item.id"
                @click.stop="selectRechargeChildChange(item)" />
        </el-select>
        <div class="flex flex-col items-center" v-if="fromRechargeData.child_address">
            <div class="title-tip">
                {{ $t("recharge.tip1") }}{{ fromData.child_name
                }}{{ $t("recharge.tip2") }}
            </div>
            <img v-if="codeUrl" class="code-img" :src="codeUrl" />
            <div class="address">{{ $t("recharge.address") }}</div>
            <div class="address-value">
                {{ fromRechargeData.child_address }}
            </div>
        </div>
        <MyButton @click="copy(fromRechargeData.child_address)" :disabled="isRechargeDisabled" size="medium"
            class="mt-6">{{ t("recharge.copy") }}</MyButton>
    </my-dialog>

    <!-- 取款 -->
    <my-dialog v-model="WithdrawalVisible" :title="t('withdrawal.title')" width="553px" :showFooter="false"
        @close="WithdrawalVisible = false">
        <div class="my-dialog-body">
            <div class="from-label">
                {{ t("withdrawal.label1") }}
                <span class="money-tip">{{ $t("withdrawal.tip.tip1") }}：{{ coinValue }}
                    {{ fromData.coin_label }}</span>
            </div>
            <el-select v-model="fromData.coin_id_p" :placeholder="t('withdrawal.pla1')">
                <el-option v-for="item in currencyList" :key="item.id" :label="item.name" :value="item.id"
                    @click.stop="selectChange(item)" />
            </el-select>
            <div class="from-label">
                {{ t("withdrawal.label6") }}
            </div>
            <el-select v-model="fromData.coin_id" :placeholder="t('withdrawal.pla6')">
                <el-option v-for="item in childList" :key="item.id" :label="item.name" :value="item.id"
                    @click.stop="selectChildChange(item)" />
            </el-select>
            <MyInput :fromLabel="$t('withdrawal.label4')" v-model="fromData.wallet_address"
                :placeholder="$t('withdrawal.pla4')" propName="wallet_address" :errorObj="errorObj" />
            <MyInput  v-model="fromData.amount" :placeholder="$t('withdrawal.pla2')"
                :fromLabel="$t('withdrawal.label2')" :errorObj="errorObj" propName="amount" />
            <MyInput  v-model="fromData.trade_pwd" :placeholder="$t('withdrawal.pla7')"
                :fromLabel="$t('withdrawal.payPwd')" :errorObj="errorObj" propName="trade_pwd" />
            <MyButton :clickFn="submitForm" :disabled="isDisabled" size="medium">{{ t("common.text1") }}</MyButton>
        </div>
    </my-dialog>
    <!-- 划转 -->
    <my-dialog v-model="transferVisible" :title="t('withdrawal.title')" width="553px" :showFooter="false"
        @close="transferVisible = false">
        <div class="my-dialog-body">
            <div class="from-label">
                {{ t("transform.title2") }}
            </div>
            <el-select v-model="transferData.amountKey" disabled :placeholder="t('withdrawal.pla1')">
                <el-option v-for="item in transferList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div class="from-label">
                {{ t("transform.title1") }}
            </div>
            <div class="flex items-center">
                <el-select v-model="transferData.account" :placeholder="t('transform.pla1')">
                    <el-option v-for="item in accountList1" :key="item.id" :label="item.name" :value="item.id"
                        @click.stop="accountChange" />
                </el-select>
                <img src="./img/btn3.svg" class="w-6 h-6 ml-3 mr-3 mb-4 flex-shrink-0 cursor-pointer" @click="change"
                    alt="" />
                <el-select v-model="transferData.account1" :placeholder="t('transform.pla2')">
                    <el-option v-for="item in accountList2" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </div>
            <MyInput  v-model="transferData.amount" :placeholder="$t('transform.pla4')"
                :fromLabel="$t('transform.label4')" :errorObj="errorObj" propName="amount" hasSuffix>
                <template #suffix>
                    <span class="all-btn" @click="transferData.amount = total">{{ $t("contractOpe.bond.all")
                        }}</span>
                </template>
            </MyInput>
            <div class="from-label">
                {{ $t("withdrawal.tip.tip1") }}：{{ total }}USDC
            </div>
            <MyButton :clickFn="sureHandle" :disabled="isTransferDisabled" size="medium">{{ $t("transform.btn1") }}
            </MyButton>
        </div>
    </my-dialog>
    <my-dialog v-model="dialogVisible" :title="t('common.text3')" width="343px" :closeIcon="true"
        @confirm="handleConfirm" @close="dialogVisible = false">
        <div class="my-dialog-body">
            {{ t("withdrawal.payError") }}
        </div>
    </my-dialog>
</template>

<style lang="scss" scoped>
.btn-box {
    margin-left: auto;
    display: flex;
    flex-shrink: 0;

    .svg-icon {
        width: 24px;
        height: 24px;
        margin-right: 6px;
    }
}

.money-tip {
    font-weight: 600;
    font-size: 14px;
    color: #c5c5c5;
    margin-left: auto;
    font-family: DIN;
}

.title-tip {
    font-weight: 400;
    font-size: 16px;
    color: #fff;
    line-height: 18px;
    text-align: center;
    font-style: normal;
    text-transform: none;
    margin-bottom: 12px;
    margin-top: 8px;
}

.address {
    font-weight: 500;
    font-size: 14px;
    color: #8b939a;
    line-height: 20px;
    font-style: normal;
    text-transform: none;
    margin-top: 16px;
    width: 100%;
    text-align: center;
}

.address-value {
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    line-height: 20px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-top: 10px;
    word-break: break-all;
}

.code-img {
    min-width: 100px;
    min-height: 100px;
    border-radius: 8px;
}

.all-btn {
    font-weight: 400;
    font-size: 15px;
    color: #00b481;
    line-height: 18px;
    margin-left: 12px;
    cursor: pointer;
}
</style>
