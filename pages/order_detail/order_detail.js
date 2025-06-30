// pages/order_detail/order_detail.js
Page({
  data: {
    order: {}
  },

  onLoad: function (options) {
    const orderId = options.id;
    if (orderId) {
      this.loadOrderDetail(orderId);
    } else {
      wx.showToast({ title: '订单ID缺失', icon: 'none' });
      setTimeout(() => { wx.navigateBack(); }, 1500);
    }
  },

  loadOrderDetail: function (orderId) {
    // 实际：调用后端API获取订单详情
    console.log('加载订单详情 for ID:', orderId);
    wx.showLoading({ title: '加载中...' });
    setTimeout(() => {
      this.setData({
        order: {
          id: orderId,
          orderNumber: '202506220001',
          status: 'active', // pending, active, completed, cancelled
          statusText: '服务进行中',
          shopName: '阳光宠物之家',
          serviceTitle: '专业家庭寄养服务 (小型犬)',
          serviceCover: '/images/example_service_1.png',
          pricePerDay: '80',
          duration: 7,
          totalPrice: '560.00',
          orderTime: '2025-06-20 10:30',
          serviceStartDate: '2025-06-22',
          serviceEndDate: '2025-06-28',
          petName: '小黄',
          contactName: '王小明',
          contactPhone: '13812345678',
          sellerId: 'seller001' 
        }
      });
      wx.hideLoading();
    }, 500);
  },

  cancelOrder: function () {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际：调用后端API取消订单
          console.log('取消订单:', this.data.order.id);
          wx.showToast({ title: '订单已取消', icon: 'success' });
          setTimeout(() => { wx.navigateBack(); }, 1000);
        }
      }
    });
  },

  contactSeller: function () {
    // 实际：跳转到与卖家的聊天页面，并带上卖家ID
    console.log('联系卖家:', this.data.order.sellerId);
    wx.navigateTo({
      url: `/pages/chat_detail/chat_detail?userId=${this.data.order.sellerId}`
    });
  },

  goToRateOrder: function () {
    // 实际：跳转到评价页面
    console.log('去评价订单:', this.data.order.id);
    wx.navigateTo({
      url: `/pages/rate_order/rate_order?orderId=${this.data.order.id}` 
    });
  }
});