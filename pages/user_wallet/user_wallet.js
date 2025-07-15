// pages/user_wallet/user_wallet.js
Page({
  data: {
    balance: '0.00',
    transactions: [],
    coupons: [
      { type: 'newUser', name: '新人折扣', desc: '新用户专享5%折扣', discount: 5 },
      { type: 'referral', name: '拉新折扣', desc: '推荐好友注册获得5%折扣', discount: 5 }
    ]
  },

  onLoad: function () {
    this.loadWalletData();
  },

  loadWalletData: function () {
    // 实际开发中：调用后端API获取钱包数据
    console.log('加载钱包数据');
    // 模拟数据
    setTimeout(() => {
      this.setData({
        balance: '125.50',
        transactions: [
          { id: 't1', description: '订单支付 - 寄养服务', amount: '80.00', type: 'expense', time: '2025-06-20 10:00' },
          { id: 't2', description: '充值', amount: '200.00', type: 'income', time: '2025-06-18 15:30' },
          { id: 't3', description: '订单支付 - 宠物零食', amount: '30.50', type: 'expense', time: '2025-06-15 11:00' }
        ]
      });
    }, 500);
  },

  goToRecharge: function () {
    wx.navigateTo({
      url: '/pages/wallet_recharge/wallet_recharge' // 假设有充值页面
    });
  },

  goToWithdrawal: function () {
    wx.navigateTo({
      url: '/pages/wallet_withdrawal/wallet_withdrawal' // 假设有提现页面
    });
  },

  onUseCoupon: function(e) {
    console.log('点击了立即使用', e);
    wx.switchTab({
      url: '/pages/foster/foster'
    });
  }
});