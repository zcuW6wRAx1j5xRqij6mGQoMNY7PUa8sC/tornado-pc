import { http } from '@/utils/http'

// 现货交易列表
export const getSpotListApi = params => {
    return http.request('get', '/api/app/market/spot', { params })
}

// 合约交易
export const getContractListApi = params => {
    return http.request('get', '/api/app/market/futures', { params })
}
// 获取图表数据
export const getChartDataApi = data => {
    return http.request('post', '/api/app/market/symbol/line', { data })
}
// 首页推荐交易对
export const getHomeRecommendApi = params => {
    return http.request('get', '/api/app/market/recommend', { params })
}

// 现货订单
export const getSpotOrderApi = params => {
    return http.request('get', '/api/app/order/spot', { params })
}
// 取消现货订单
export const cancelSpotOrderApi = data => {
    return http.request('post', '/api/app/order/spot/cancel', { data })
}

// 支持的货币列表
export const getCoinsListApi = params => {
    return http.request('get', '/api/app/market/coins', { params })
}

// k线历史数据
export const getKlineApi = params => {
    return http.request('get', '/api/app/market/symbol/kline', { params })
}

// 现货钱包列表
export const getSpotWalletApi = params => {
    return http.request('get', '/api/app/wallet/spot', { params })
}

// 现货钱包流水
export const getSpotWalletFlowApi = params => {
    return http.request('get', '/api/app/wallet/spot/flow', { params })
}

// 合约钱包流水
export const getDerivativeWalletFlowApi = params => {
    return http.request('get', '/api/app/wallet/derivative/flow', { params })
}

// 合约钱包
export const getDerivativeWalletApi = params => {
    return http.request('get', '/api/app/wallet/derivative', { params })
}

// 新增现货订单
export const addSpotOrderApi = data => {
    return http.request('post', '/api/app/order/spot', { data })
}
// 提现历史记录
export const withdrawHistoryApi = params => {
    return http.request('get', '/api/app/wallet/withdraw/history', { params })
}
// 获取支持充值的货币列表
export const getDepositCoinsApi = params => {
    return http.request('get', '/api/app/wallet/deposit/coins', { params })
}
// 快速充币提交
export const walletDepositApi = data => {
    return http.request('post', '/api/app/wallet/deposit', { data })
}


// 获取交易对详情
export const getSymbolDetailApi = params => {
    return http.request('get', '/api/app/market/symbol', { params })
}

// 收藏列表
export const getCollectListApi = params => {
    return http.request('get', '/api/app/market/collections', { params })
}
// 收藏
export const addCollectApi = data => {
    return http.request('post', '/api/app/market/collection', { data })
}
// 新增合约订单
export const addContractOrderApi = data => {
    return http.request('post', '/api/app/order/futures', { data })
}
// 合约订单
export const getContractOrderApi = params => {
    return http.request('get', '/api/app/order/futures', { params })
}
// 合约订单取消
export const cancelContractOrderApi = data => {
    return http.request('post', '/api/app/order/futures/cancel', { data })
}
// 平仓合约订单
export const closeContractOrderApi = data => {
    return http.request('post', '/api/app/order/futures/close', { data })
}
//保证金的增加和减少
export const updateMarginApi = data => {
    return http.request('post', '/api/app/order/futures/modify/position', { data })
}

// 修改止盈止损
export const updateStopProfitApi = data => {
    return http.request('post', '/api/app/order/futures/modify/sltp', { data })
}

// 关于我们
export const aboutUsApi = () => {
    return http.request('get', '/api/app/protocol/aboutme')
}

// 用户协议
export const userAgreementApi = () => {
    return http.request('get', '/api/app/protocol/terms')
}

// 隐私协议
export const privacyPolicyApi = () => {
    return http.request('get', '/api/app/protocol/privacy')
}

// IEO列表
export const getIEOListApi = params => {
    return http.request('get', '/api/app/ieo', { params })
}

// 我的IEO订单
export const getMyIEOOrderApi = params => {
    return http.request('get', '/api/app/ieo/orders', { params })
}

// 购买IEO
export const buyIEOApi = data => {
    return http.request('post', '/api/app/ieo/order/buy', { data })
}
// 导师列表
export const getTeacherListApi = params => {
    return http.request('get', '/api/app/active/mentos', { params })
}

// 导师投票
export const voteTeacherApi = data => {
    return http.request('post', '/api/app/active/mento', { data })
}

// 理财-产品列表
export const financialProductListApi = params => {
    return http.request('get', '/api/app/financial/products', { params })
}

// 理财-购买
export const financialProductBuyApi = params => {
    return http.request('post', '/api/app/financial/order/buy', { params })
}

// 理财-赎回
export const financialProductRedeemApi = params => {
    return http.request('post', '/api/app/financial/order/redeem', { params })
}

// 理财-订单列表
export const financialProductOrderListApi = params => {
    return http.request('get', '/api/app/financial/orders', { params })
}

// 理财-详情
export const financialProductDetailApi = params => {
    return http.request('get', '/api/app/financial/product/detail', { params })
}
// otc列表
export const getOTCListApi = params => {
    return http.request('get', '/api/app/otc/products', { params })
}

// otc订单
export const getOTCOrderApi = params => {
    return http.request('get', '/api/app/otc/orders', { params })
}
// otc买卖
export const otcTradeApi = data => {
    return http.request('post', '/api/app/otc/trade', { data })
}
// 首页推荐数据
export const recommendListApi = params => {
    return http.request('get', '/api/app/market/recommend', { params })
}