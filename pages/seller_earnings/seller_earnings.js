// pages/seller_earnings/seller_earnings.js
Page({
  data: {
    withdrawableAmount: '0.00',
    earningsDetails: []
  },

  onLoad: function () {
    this.loadEarningsData();
  },

  loadEarningsData: function () {
    // 实际开发中：调用后端API获取收益数据和明细
    console.log('加载卖家收益数据');
    wx.showLoading({ title: '加载中...' });
    setTimeout(() => {
      this.setData({
        withdrawableAmount: '850.25',
        earningsDetails: [
          { id: 'e1', description: '订单收入 - 寄养服务 (O1)', amount: '500.00', type: 'income', time: '2025-06-22 10:00' },
          { id: 'e2', description: '提现成功', amount: '200.00', type: 'expense', time: '2025-06-20 15:30' },
          { id: 'e3', description: '订单收入 - 寄养服务 (O2)', amount: '350.25', type: 'income', time: '2025-06-18 11:00' }
        ]
      });
      wx.hideLoading();
    }, 500);
  },

  goToWithdraw: function () {
    // 实际开发中：跳转到提现页面，可能需要输入提现金额、银行卡信息等
    wx.showModal({
      title: '提现提示',
      content: `您当前可提现金额为 ¥${this.data.withdrawableAmount}，是否确认提现？`,
      success: (res) => {
        if (res.confirm) {
          // 调用后端API进行提现操作
          console.log('执行提现操作');
          wx.showToast({ title: '提现请求已提交', icon: 'success' });
          // 提现成功后，刷新数据
          // this.loadEarningsData();
        }
      }
    });
  }
});