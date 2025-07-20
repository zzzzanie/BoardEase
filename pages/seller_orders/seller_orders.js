// pages/merchant/orders.js
Page({
  data: {
    activeTab: 'unprocessed', 
    orders: [], // 订单数据将从数据库获取
    unprocessedOrders: [],    
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
    const app = getApp();
    
    if (!app.globalData.db) {
      wx.showToast({ title: '请在小程序后台开启云开发', icon: 'none' });
      return;
    }
    
    const db = app.globalData.db;
    // 先查找该商家所有服务
    db.collection('services').where({ providerId: '200002' }).get({
      success: function(serviceRes) {
        const serviceIds = serviceRes.data.map(s => s.serviceId || s._id);
        if (serviceIds.length === 0) {
          that.setData({ orders: [] }, that.updateOrderLists);
          return;
        }
        // 再查找这些服务的所有订单
        db.collection('orders').where({ serviceId: db.command.in(serviceIds) }).get({
          success: function(res) {
            const orders = res.data;
            that.enrichOrders(orders);
          },
          fail: function(err) {
            wx.showToast({ title: '订单加载失败', icon: 'none' });
            console.error('订单获取失败', err);
          }
        });
      },
      fail: function(err) {
        wx.showToast({ title: '服务加载失败', icon: 'none' });
        that.setData({ orders: [] }, that.updateOrderLists);
      }
    });
  },

  // enrich orders with service and pet info
  enrichOrders: function(orders) {
    const that = this;
    const app = getApp();
    const db = app.globalData.db;
    const serviceIds = [...new Set(orders.map(o => o.serviceId).filter(Boolean))];
    const petIds = [...new Set(orders.map(o => o.petId).filter(Boolean))];
    // 查询服务
    db.collection('services').where({ serviceId: db.command.in(serviceIds) }).get({
      success: function(serviceRes) {
        const serviceMap = {};
        serviceRes.data.forEach(s => { serviceMap[s.serviceId] = s; });
        // 查询宠物
        db.collection('pet').where({ petId: db.command.in(petIds) }).get({
          success: function(petRes) {
            const petMap = {};
            petRes.data.forEach(p => { petMap[p.petId] = p; });
            // 收集所有wechatId
            const wechatIds = [...new Set(petRes.data.map(p => p.wechatId).filter(Boolean))];
            // 查询用户
            db.collection('users').where({ wechatId: db.command.in(wechatIds) }).get({
              success: function(userRes) {
                const userMap = {};
                userRes.data.forEach(u => { userMap[u.wechatId] = u; });
                // 合成订单展示数据
                const ordersWithInfo = orders.map(order => {
                  const service = serviceMap[order.serviceId] || {};
                  const pet = petMap[order.petId] || {};
                  const user = userMap[pet.wechatId] || {};
                  return {
                    id: order._id,
                    status: order.status,
                    isCustomized: order.isCustomized || false,
                    // 用户信息区
                    userInfo: {
                      /* avatar: user.avatar || pet.avatar || '', */
                      nickname: user.name || order.contactName || '',
                      phone: user.phone || '',
                      email: user.emailAddress || '',
                      wechatId: user.wechatId || pet.wechatId || ''
                    },
                    // 宠物信息区
                    petInfo: {
                      image: pet.avatar || '',
                      name: pet.nickname || '',
                      type: pet.type || '',
                      gender: pet.gender || '',
                      breed: pet.breed || '',
                    },
                    // 服务信息区
                    serviceInfo: {
                      type: service.petType || '',
                      time: `${that.formatDate(order.startDateTime)} - ${that.formatDate(order.endDateTime)}`
                    },
                    serviceName: service.name || '未知服务',
                    servicePrice: service.basePrice || '',
                    serviceDays: order.orderTime || '',
                    totalPrice: order.totalPrice,
                    payment: order.payment,
                    orderNote: order.orderNote || '',
                    discount: order.discount,
                    subTotal: order.subTotal,
                    orderNo: order._id,
                    orderTime: that.formatDate(order.startDateTime)
                  };
                });
                that.setData({ orders: ordersWithInfo }, that.updateOrderLists);
              },
              fail: function() { that.setData({ orders: [] }, that.updateOrderLists); }
            });
          },
          fail: function() { that.setData({ orders: [] }, that.updateOrderLists); }
        });
      },
      fail: function() { that.setData({ orders: [] }, that.updateOrderLists); }
    });
  },

  formatDate: function(dateObj) {
    if (!dateObj) return '';
    try {
      const d = new Date(dateObj.$date || dateObj);
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    } catch(e) { return ''; }
  },

  // 获取服务名称
  fetchServiceNames: function(orders) {
    const that = this;
    const app = getApp();
    const db = app.globalData.db;
    
    // 收集所有唯一的serviceId
    const serviceIds = [...new Set(orders.map(order => order.serviceId).filter(id => id))];
    
    if (serviceIds.length === 0) {
      // 如果没有serviceId，直接设置订单数据
      that.setData({ orders }, that.updateOrderLists);
      return;
    }
    
    // 批量查询服务信息
    db.collection('services')
      .where({
        _id: db.command.in(serviceIds)
      })
      .get({
        success: function(res) {
          // 创建serviceId到serviceName的映射
          const serviceMap = {};
          res.data.forEach(service => {
            serviceMap[service._id] = service.name;
          });
          
          // 为每个订单添加服务名称
          const ordersWithServiceNames = orders.map(order => {
            return {
              ...order,
              serviceName: serviceMap[order.serviceId] || '未知服务'
            };
          });
          
          that.setData({ orders: ordersWithServiceNames }, that.updateOrderLists);
        },
        fail: function(err) {
          console.error('获取服务名称失败:', err);
          // 即使获取服务名称失败，也要显示订单
          const ordersWithDefaultNames = orders.map(order => {
            return {
              ...order,
              serviceName: '未知服务'
            };
          });
          that.setData({ orders: ordersWithDefaultNames }, that.updateOrderLists);
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

  // 更新processingOrders和completedOrders和unprocessedOrders
  updateOrderLists: function () {
    const unprocessedOrders = this.data.orders.filter(
      o => o.status === 'unprocessed'
    );
    const processingOrders = this.data.orders.filter(
      o => o.status === 'pending' || o.status === 'processing'
    );
    const completedOrders = this.data.orders.filter(
      o => o.status === 'completed' || o.status === 'rejected'
    );
    this.setData({ unprocessedOrders, processingOrders, completedOrders });
  },

  // 接单事件（unprocessed->processing）
  onAcceptOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    const app = getApp();
    const db = app.globalData.db;
    db.collection('orders').doc(orderId).update({
      data: { status: 'processing' },
      success: () => {
        wx.showToast({ title: '接单成功', icon: 'success', duration: 2000 });
        this.fetchOrders();
      }
    });
  },

  // 拒单事件（unprocessed->rejected）
  onRejectOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    const app = getApp();
    const db = app.globalData.db;
    wx.showModal({
      title: '确认拒单',
      content: '确定要拒绝这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('orders').doc(orderId).update({
            data: { status: 'rejected' },
            success: () => {
              wx.showToast({ title: '已拒绝订单', icon: 'success', duration: 2000 });
              this.fetchOrders();
            }
          });
        }
      }
    });
  },

  // 完成订单事件（processing->completed）
  onCompleteOrder: function (e) {
    const orderId = e.currentTarget.dataset.id;
    const app = getApp();
    const db = app.globalData.db;
    db.collection('orders').doc(orderId).update({
      data: { status: 'completed' },
      success: () => {
        wx.showToast({ title: '订单已完成', icon: 'success', duration: 2000 });
        this.fetchOrders();
      }
    });
  },

  // 查看详情事件
  onViewDetail: function (e) {
    this.navigateToDetail(e);
  }
}); 