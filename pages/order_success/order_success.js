Page({
  data: {
    orderId: '',
    merchantName: '',
    serviceName: '',
    checkInDate: '',
    checkOutDate: '',
    days: 1,
    petInfoDisplay: '',
    userName: '',
    userPhone: '',
    totalFee: 0
  },

  onLoad(options) {
    // 随机生成订单号
    const orderId = 'OD' + Date.now() + Math.floor(Math.random() * 1000);

    // 获取订单信息
    const order = wx.getStorageSync('lastOrder') || {};

    this.setData({
      orderId,
      merchantName: order.merchantName || '',
      serviceName: order.serviceName || '',
      checkInDate: order.checkInDate || '',
      checkOutDate: order.checkOutDate || '',
      days: order.days || 1,
      petInfoDisplay: order.petInfoDisplay || '',
      userName: order.userName || '',
      userPhone: order.userPhone || '',
      totalFee: order.totalFee || 0
    });
  },

  onBackHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});