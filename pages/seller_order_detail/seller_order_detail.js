Page({
  data: {
    // 订单详情字段
    servicePrice: 0,
    serviceDays: 0,
    orderNo: "",
    orderTime: "",
    serviceDateRange: "",
    petName: "",
    contactName: "",
    contactPhone: "",
    totalPrice: 0,
    allOrders: [
      {
        id: 'order001',
        servicePrice: 80,
        serviceDays: 1,
        orderNo: "202506220001",
        orderTime: "2025-06-20 10:30",
        serviceDateRange: "2025-06-24 14:00 - 2025-06-25 14:00",
        petName: "大橘",
        contactName: "小红",
        contactPhone: "13812345678",
        totalPrice: 80
      },
      {
        id: 'order002',
        servicePrice: 60,
        serviceDays: 1,
        orderNo: "202506220002",
        orderTime: "2025-06-19 09:00",
        serviceDateRange: "2025-06-20 08:00 - 2025-06-20 10:00",
        petName: "牛奶",
        contactName: "大壮",
        contactPhone: "13887654321",
        totalPrice: 60
      },
      {
        id: 'order003',
        servicePrice: 80,
        serviceDays: 1,
        orderNo: "202506220003",
        orderTime: "2025-06-18 09:00",
        serviceDateRange: "2025-06-18 09:00 - 2025-06-19 09:00",
        petName: "小白",
        contactName: "小明",
        contactPhone: "13811112222",
        totalPrice: 80
      },
      {
        id: 'order004',
        servicePrice: 60,
        serviceDays: 1,
        orderNo: "202506220004",
        orderTime: "2025-06-15 07:00",
        serviceDateRange: "2025-06-15 07:00 - 2025-06-15 09:00",
        petName: "旺财",
        contactName: "小李",
        contactPhone: "13822223333",
        totalPrice: 60
      }
    ]
  },

  onLoad: function (options) {
    const orderId = options.id;
    this.fetchOrderDetail(orderId);
  },

  // 从云数据库获取订单详情
  fetchOrderDetail(orderId) {
    const that = this;
    wx.cloud = wx.cloud || {};
    if (!wx.cloud.database) {
      wx.showToast({ title: '请在小程序后台开启云开发', icon: 'none' });
      return;
    }
    const db = wx.cloud.database();
    db.collection('orders').doc(orderId).get({
      success: function(res) {
        if (res.data) {
          that.setData(res.data);
        } else {
          wx.showToast({ title: '未找到订单', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.showToast({ title: '订单加载失败', icon: 'none' });
        console.error('订单详情获取失败', err);
      }
    });
  }
});