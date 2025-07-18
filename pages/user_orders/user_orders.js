// pages/user_orders/user_orders.js
Page({
  data: {
    currentTab: 'all', // all, active, completed
    orders: [],
    allOrders: [] // 存储全部订单
  },

  onLoad: function (options) {
    if (options.type) {
      this.setData({
        currentTab: options.type
      });
    }
    this.loadOrders();
  },

  changeTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab === tab) return;
    this.setData({
      currentTab: tab
    });
    this.filterOrders(tab, this.data.allOrders);
  },

  loadOrders: function () {
    const db = wx.cloud.database();
    const wechatId = 'chenxm_pet';
    db.collection('pet').where({ wechatId }).get({
      success: petRes => {
        const petIds = petRes.data.map(p => p.petId);
        if (petIds.length === 0) {
          this.setData({ orders: [], allOrders: [] });
          return;
        }
        db.collection('orders').where({
          petId: db.command.in(petIds)
        }).get({
          success: orderRes => {
            console.log('所有订单数据:', orderRes.data); // 调试用，确保每条有 _id
            const allOrders = orderRes.data
              .filter(order => order.serviceTitle && order.serviceTitle.trim() !== '')
              .map(order => {
                let statusText = order.status;
                if (order.status === 'processing') statusText = '进行中';
                else if (order.status === 'unprocessed') statusText = '待确认';
                else if (order.status === 'completed') statusText = '已完成';
                return { ...order, statusText };
              });
            this.setData({ allOrders });
            this.filterOrders(this.data.currentTab, allOrders);
          },
          fail: err => {
            wx.showToast({ title: '订单加载失败', icon: 'none' });
            this.setData({ orders: [], allOrders: [] });
          }
        });
      },
      fail: err => {
        wx.showToast({ title: '宠物信息加载失败', icon: 'none' });
        this.setData({ orders: [], allOrders: [] });
      }
    });
  },

  filterOrders: function(tab, allOrders) {
    let filtered = allOrders;
    if (tab === 'active') {
      filtered = allOrders.filter(o => o.status === 'processing');
    } else if (tab === 'completed') {
      filtered = allOrders.filter(o => o.status === 'completed');
    }
    this.setData({ orders: filtered });
  },

  goToOrderDetail: function (e) {
    const _id = e.currentTarget.dataset.id; // 只用 _id
    console.log('跳转订单详情，_id:', _id);
    wx.navigateTo({
      url: `/pages/order_detail/order_detail?id=${_id}`
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
    const index = e.currentTarget.dataset.index;
    const sellerId = this.data.orders[index].sellerId;
    wx.navigateTo({
      url: `/pages/chat_detail/chat_detail?userId=${sellerId}`
    });
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