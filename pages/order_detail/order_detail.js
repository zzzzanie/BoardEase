// pages/order_detail/order_detail.js
Page({
  data: {
    order: {}
  },

  onLoad: function (options) {
    const _id = options.id; // 只用 _id
    console.log('详情页收到的 _id:', _id);
    if (_id) {
      this.loadOrderDetail(_id);
    } else {
      wx.showToast({ title: '订单ID缺失', icon: 'none' });
      setTimeout(() => { wx.navigateBack(); }, 1500);
    }
  },

  // 工具函数：格式化日期为 yyyy-MM-dd
  formatDate: function(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  loadOrderDetail: function (_id) {
    console.log('查询订单详情，_id:', _id);
    wx.showLoading({ title: '加载中...' });
    const db = wx.cloud.database();
    db.collection('orders').doc(_id).get({
      success: res => {
        if (res.data) {
          // 格式化日期
          const order = res.data;
          order.startDateTime = this.formatDate(order.startDateTime);
          order.endDateTime = this.formatDate(order.endDateTime);
          this.setData({ order });
          // 根据petId查pet表获取宠物名称
          db.collection('pet').where({ petId: order.petId }).get({
            success: petRes => {
              const petName = (petRes.data && petRes.data.length > 0) ? petRes.data[0].nickname : '';
              this.setData({ order: { ...order, petName } });
              wx.hideLoading();
            },
            fail: err => {
              this.setData({ order: { ...order, petName: '' } });
              wx.hideLoading();
            }
          });
        } else {
          wx.showToast({ title: '未找到该订单', icon: 'none' });
          setTimeout(() => { wx.navigateBack(); }, 1500);
          wx.hideLoading();
        }
      },
      fail: err => {
        console.error('订单详情加载失败，err:', err);
        wx.hideLoading();
        wx.showToast({ title: '订单详情加载失败', icon: 'none' });
        setTimeout(() => { wx.navigateBack(); }, 1500);
      }
    });
  },

  cancelOrder: function () {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际：调用后端API取消订单
          wx.showToast({ title: '订单已取消', icon: 'success' });
          setTimeout(() => { wx.navigateBack(); }, 1000);
        }
      }
    });
  },

  contactSeller: function () {
    // 跳转到与卖家的聊天页面，并带上卖家ID
    wx.navigateTo({
      url: `/pages/chat_detail/chat_detail?userId=${this.data.order.sellerId}`
    });
  },

  goToRateOrder: function () {
    // 实际：跳转到评价页面
    wx.navigateTo({
      url: `/pages/rate_order/rate_order?orderId=${this.data.order._id}`
    });
  }
});