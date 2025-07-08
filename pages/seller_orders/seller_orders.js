// pages/merchant/orders.js
Page({
  data: {
    activeTab: 'processing', // 当前激活的tab：'processing' | 'completed'
    orders: [], // 订单数据将从数据库获取
    processingOrders: [],
    completedOrders: []
  },

  onLoad: function (options) {
    this.fetchOrders();
    console.log('商户订单管理页面加载');
    const orderId = options.id;
    // 根据orderId获取订单详情
  },

  onShow: function () {
    this.fetchOrders();
  },

  // 从云数据库获取订单
  fetchOrders: function () {
    const that = this;
    wx.cloud = wx.cloud || {};
    if (!wx.cloud.database) {
      wx.showToast({ title: '请在小程序后台开启云开发', icon: 'none' });
      return;
    }
    const db = wx.cloud.database();
    // TODO: 如有 seller 身份，可用 provider_id 过滤
    db.collection('orders').get({
      success: function(res) {
        const orders = res.data;
        that.setData({ orders }, that.updateOrderLists);
      },
      fail: function(err) {
        wx.showToast({ title: '订单加载失败', icon: 'none' });
        console.error('订单获取失败', err);
      }
    });
  },

  // 新增：跳转到订单详情页
  navigateToDetail: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/seller_order_detail/seller_order_detail?id=${orderId}`
    });
  },
  // Tab切换事件
  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    }, this.updateOrderLists);
  },

  // 接单事件
  onAcceptOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    const orders = this.data.orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'processing' };
      }
      return order;
    });
    this.setData({ orders }, this.updateOrderLists);
    wx.showToast({
      title: '接单成功',
      icon: 'success',
      duration: 2000
    });
  },

  // 拒单事件
  onRejectOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认拒单',
      content: '确定要拒绝这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          const orders = this.data.orders.filter(order => order.id !== orderId);
          this.setData({ orders }, this.updateOrderLists);
          wx.showToast({
            title: '已拒绝订单',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  // 完成订单事件
  onCompleteOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    const orders = this.data.orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'completed' };
      }
      return order;
    });
    this.setData({ orders }, this.updateOrderLists);
    wx.showToast({
      title: '订单已完成',
      icon: 'success',
      duration: 2000
    });
  },

  // 查看详情事件
  onViewDetail: function (e) {
    this.navigateToDetail(e);
  },

  // 更新processingOrders和completedOrders
  updateOrderLists: function () {
    const processingOrders = this.data.orders.filter(
      o => o.status === 'pending' || o.status === 'processing'
    );
    const completedOrders = this.data.orders.filter(
      o => o.status === 'completed'
    );
    this.setData({ processingOrders, completedOrders });
  }
}); 