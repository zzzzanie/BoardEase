// pages/user_orders/user_orders.js
Page({
  data: {
    currentTab: 'all', // all, pending, active, completed
    orders: []
  },

  onLoad: function (options) {
    if (options.type) {
      this.setData({
        currentTab: options.type
      });
    }
    this.loadOrders(this.data.currentTab);
  },

  changeTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab === tab) return;
    this.setData({
      currentTab: tab,
      orders: [] // 清空现有订单，重新加载
    });
    this.loadOrders(tab);
  },

  loadOrders: function (status) {
    console.log('加载订单，状态:', status);
    wx.showLoading({ title: '加载中...' });

    let mockOrders = [];
    if (status === 'all') {
      mockOrders = [
        { id: 'o1', shopName: '阳光宠物之家', status: 'completed', statusText: '已完成', serviceTitle: '专业家庭寄养服务', serviceCover: '/images/example_service_1.png', duration: 7, totalPrice: '560.00' },
        { id: 'o2', shopName: '萌宠乐园', status: 'active', statusText: '进行中', serviceTitle: '猫咪专属豪华寄宿', serviceCover: '/images/example_service_2.png', duration: 3, totalPrice: '360.00' },
        { id: 'o3', shopName: '喵汪天堂', status: 'pending', statusText: '待确认', serviceTitle: '狗狗短期托管', serviceCover: '/images/example_service_3.png', duration: 1, totalPrice: '100.00' }
      ];
    } else if (status === 'pending') {
      mockOrders = [{ id: 'o3', shopName: '喵汪天堂', status: 'pending', statusText: '待确认', serviceTitle: '狗狗短期托管', serviceCover: '/images/example_service_3.png', duration: 1, totalPrice: '100.00' }];
    } else if (status === 'active') {
      mockOrders = [{ id: 'o2', shopName: '萌宠乐园', status: 'active', statusText: '进行中', serviceTitle: '猫咪专属豪华寄宿', serviceCover: '/images/example_service_2.png', duration: 3, totalPrice: '360.00' }];
    } else if (status === 'completed') {
      mockOrders = [{ id: 'o1', shopName: '阳光宠物之家', status: 'completed', statusText: '已完成', serviceTitle: '专业家庭寄养服务', serviceCover: '/images/example_service_1.png', duration: 7, totalPrice: '560.00' }];
    }

    setTimeout(() => {
      this.setData({ orders: mockOrders });
      wx.hideLoading();
    }, 500);
  },

  goToOrderDetail: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order_detail/order_detail?id=${orderId}` 
    });
  },

  cancelOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('取消订单ID:', orderId);
          wx.showToast({ title: '订单已取消', icon: 'success' });
          this.loadOrders(this.data.currentTab); 
        }
      }
    });
  },

  contactSeller: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showToast({ title: '跳转到与卖家聊天', icon: 'none' });
    // 实际项目中，这里需要获取 sellerId，然后跳转到聊天详情页
    // wx.navigateTo({ url: `/pages/chat_detail/chat_detail?sellerId=${sellerId}` });
  },

  // 确保 goToRateOrder 函数正确实现跳转
  goToRateOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    console.log('点击去评价订单，订单ID:', orderId);
    wx.navigateTo({
      url: `/pages/rate_order/rate_order?orderId=${orderId}` // 跳转到评价页面，并传递订单ID
    });
  }
});