// pages/seller_orders/seller_orders.js
Page({
  data: {
    currentTab: 'all', // all, new, confirmed, completed
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
    // 实际开发中：调用后端API获取对应状态的卖家订单列表
    console.log('加载卖家订单，状态:', status);
    wx.showLoading({ title: '加载中...' });

    // 模拟数据
    let mockOrders = [];
    if (status === 'all') {
      mockOrders = [
        { id: 'so1', userName: '小王', status: 'completed', statusText: '已完成', serviceTitle: '专业家庭寄养服务', serviceCover: '/images/example_service_1.png', duration: 7, totalPrice: '560.00' },
        { id: 'so2', userName: '李小姐', status: 'confirmed', statusText: '待服务', serviceTitle: '猫咪专属豪华寄宿', serviceCover: '/images/example_service_2.png', duration: 3, totalPrice: '360.00' },
        { id: 'so3', userName: '张先生', status: 'new', statusText: '新订单', serviceTitle: '狗狗短期托管', serviceCover: '/images/example_service_3.png', duration: 1, totalPrice: '100.00' }
      ];
    } else if (status === 'new') {
      mockOrders = [{ id: 'so3', userName: '张先生', status: 'new', statusText: '新订单', serviceTitle: '狗狗短期托管', serviceCover: '/images/example_service_3.png', duration: 1, totalPrice: '100.00' }];
    } else if (status === 'confirmed') {
      mockOrders = [{ id: 'so2', userName: '李小姐', status: 'confirmed', statusText: '待服务', serviceTitle: '猫咪专属豪华寄宿', serviceCover: '/images/example_service_2.png', duration: 3, totalPrice: '360.00' }];
    } else if (status === 'completed') {
      mockOrders = [{ id: 'so1', userName: '小王', status: 'completed', statusText: '已完成', serviceTitle: '专业家庭寄养服务', serviceCover: '/images/example_service_1.png', duration: 7, totalPrice: '560.00' }];
    }

    setTimeout(() => {
      this.setData({ orders: mockOrders });
      wx.hideLoading();
    }, 500);
  },

  goToOrderDetail: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/seller_order_detail/seller_order_detail?id=${orderId}` // 假设有卖家订单详情页
    });
  },

  confirmOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认订单',
      content: '确定要确认此订单并开始服务吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：调用后端API确认订单
          console.log('确认订单ID:', orderId);
          wx.showToast({ title: '订单已确认', icon: 'success' });
          this.loadOrders(this.data.currentTab); // 刷新当前tab的订单
        }
      }
    });
  },

  rejectOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '拒绝订单',
      content: '确定要拒绝此订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：调用后端API拒绝订单
          console.log('拒绝订单ID:', orderId);
          wx.showToast({ title: '订单已拒绝', icon: 'none' });
          this.loadOrders(this.data.currentTab); // 刷新当前tab的订单
        }
      }
    });
  },

  contactUser: function (e) {
    const orderId = e.currentTarget.dataset.id;
    // 实际开发中：获取用户ID，跳转到聊天页
    wx.showToast({ title: '跳转到与买家聊天', icon: 'none' });
    // wx.navigateTo({ url: `/pages/chat_detail/chat_detail?userId=${userId}` });
  }
});