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

  fetchOrderDetail(orderId) {
    const that = this;
    const app = getApp();
    if (!app.globalData.db) {
      wx.showToast({ title: '请在小程序后台开启云开发', icon: 'none' });
      return;
    }
    const db = app.globalData.db;
    db.collection('orders').doc(orderId).get({
      success: function(res) {
        if (res.data) {
          const order = res.data;
          // 状态映射
          const statusMap = {
            unprocessed: '未处理',
            processing: '处理中',
            completed: '已完成',
            rejected: '已拒绝',
            pending: '待处理'
          };
          // 查服务
          db.collection('services').where({ serviceId: order.serviceId }).get({
            success: function(serviceRes) {
              const service = serviceRes.data[0] || {};
              // 查宠物
              db.collection('pet').where({ petId: order.petId }).get({
                success: function(petRes) {
                  const pet = petRes.data[0] || {};
                  const userWechatId = pet.wechatId;
                  if (userWechatId) {
                    db.collection('users').where({ wechatId: userWechatId }).get({
                      success: function(userRes) {
                        const user = userRes.data[0] || {};
                        that.setData({
                          serviceName: service.name || '未知服务',
                          servicePrice: service.basePrice || '',
                          serviceDays: order.orderTime || '',
                          serviceType: service.petType || '',
                          serviceDateRange: `${that.formatDate(order.startDateTime)} - ${that.formatDate(order.endDateTime)}`,
                          petName: pet.nickname || '',
                          petImage: pet.avatar || '',
                          contactName: user.name || order.contactName || '',
                          contactPhone: user.phone || order.contactPhone || '',
                          userAvatar: user.avatar || '',
                          userEmail: user.emailAddress || '',
                          userWechatId: user.wechatId || '',
                          totalPrice: order.totalPrice,
                          payment: order.payment,
                          orderNote: order.orderNote || '',
                          discount: order.discount,
                          subTotal: order.subTotal,
                          status: order.status,
                          statusText: statusMap[order.status] || order.status,
                          orderNo: order._id,
                          orderTime: that.formatDate(order.startDateTime)
                        });
                      },
                      fail: function() {
                        that.setData({
                          serviceName: service.name || '未知服务',
                          contactName: order.contactName || '',
                          contactPhone: order.contactPhone || ''
                        });
                      }
                    });
                  } else {
                    that.setData({
                      serviceName: service.name || '未知服务',
                      contactName: order.contactName || '',
                      contactPhone: order.contactPhone || ''
                    });
                  }
                },
                fail: function() { that.setData({ serviceName: service.name || '未知服务' }); }
              });
            },
            fail: function() { that.setData({ serviceName: '未知服务' }); }
          });
        } else {
          wx.showToast({ title: '未找到订单', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.showToast({ title: '订单加载失败', icon: 'none' });
        console.error('订单详情获取失败', err);
      }
    });
  },

  formatDate: function(dateObj) {
    if (!dateObj) return '';
    try {
      const d = new Date(dateObj.$date || dateObj);
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    } catch(e) { return ''; }
  },

  // 接单
  onAcceptOrder: function() {
    const orderId = this.data.orderNo;
    const app = getApp();
    const db = app.globalData.db;
    db.collection('orders').doc(orderId).update({
      data: { status: 'processing' },
      success: () => {
        wx.showToast({ title: '接单成功', icon: 'success', duration: 2000 });
        this.fetchOrderDetail(orderId);
      }
    });
  },
  // 拒单
  onRejectOrder: function() {
    const orderId = this.data.orderNo;
    const app = getApp();
    const db = app.globalData.db;
    wx.showModal({
      title: '确认拒单',
      content: '确定要拒绝这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('orders').doc(orderId).remove({
            success: () => {
              wx.showToast({ title: '已拒绝订单', icon: 'success', duration: 2000 });
              wx.navigateBack();
            }
          });
        }
      }
    });
  },
  // 完成订单
  onCompleteOrder: function() {
    const orderId = this.data.orderNo;
    const app = getApp();
    const db = app.globalData.db;
    db.collection('orders').doc(orderId).update({
      data: { status: 'completed' },
      success: () => {
        wx.showToast({ title: '订单已完成', icon: 'success', duration: 2000 });
        this.fetchOrderDetail(orderId);
      }
    });
  },
});