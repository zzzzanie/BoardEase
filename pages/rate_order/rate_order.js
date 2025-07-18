// pages/rate_order/rate_order.js
Page({
  data: {
    order: {},
    rating: 5,
    comment: ''
  },

  onLoad: function (options) {
    const orderId = options.orderId;
    if (orderId) {
      this.loadOrder(orderId);
    }
  },

  loadOrder: function (orderId) {
    const db = wx.cloud.database();
    db.collection('orders').doc(orderId).get({
      success: res => {
        if (res.data) {
          this.setData({ order: res.data });
        }
      }
    });
  },

  onStarTap: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ rating: index + 1 });
  },

  onCommentInput: function (e) {
    this.setData({ comment: e.detail.value });
  },

  submitRating: function () {
    if (!this.data.comment.trim()) {
      wx.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }
    // 实际开发中：可将评价内容和评分写入数据库的评价表或订单表
    wx.showToast({ title: '评价提交成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1200);
  }
});