// pages/seller_mine/seller_mine.js
Page({
  data: {
    shopInfo: {
      logoUrl: '',        // 店铺Logo
      shopName: '',       // 店铺名称
      isApproved: false   // 店铺是否已认证
    },
    orderCounts: {
      totalOrders: 0,     // 全部订单数量
      newOrders: 0        // 新订单数量
    },
    earnings: {
      totalEarnings: '0.00' // 累计收益
    }
  },

  onLoad: function () {
    this.getShopInfo();
    this.getOrderAndEarningsData();
  },

  // 获取店铺信息
  getShopInfo: function () {
    // 模拟从后端获取店铺信息
    // 实际项目中，这里需要调用API获取店铺数据
    setTimeout(() => {
      this.setData({
        shopInfo: {
          logoUrl: '/images/example_shop_logo.png', // 示例图片
          shopName: '萌宠之家寄养服务',
          isApproved: true // 假设已认证
        }
      });
    }, 500);
  },

  // 获取订单数量和收益数据
  getOrderAndEarningsData: function () {
    // 模拟从后端获取数据
    // 实际项目中，这里需要调用API获取统计数据
    setTimeout(() => {
      this.setData({
        orderCounts: {
          totalOrders: 125,
          newOrders: 8
        },
        earnings: {
          totalEarnings: '2568.50'
        }
      });
    }, 500);
  },

  // 跳转到管理店铺页
  goToEditShopInfo: function () {
    wx.navigateTo({
      url: '/pages/edit_shop_info/edit_shop_info' // 假设有管理店铺页面
    });
  },

  // 跳转到卖家订单列表页
  goToSellerOrders: function (e) {
    const orderType = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/seller_orders/seller_orders?type=${orderType}` // 假设有卖家订单列表页面
    });
  },

  // 跳转到收益详情页
  goToEarnings: function () {
    wx.navigateTo({
      url: '/pages/earnings/earnings' // 假设有收益详情页面
    });
  },

  // 跳转到服务管理页
  goToServiceManagement: function () {
    wx.navigateTo({
      url: '/pages/service_management/service_management' // 假设有服务管理页面
    });
  },

  // 跳转到发布新服务页
  goToAddService: function () {
    wx.navigateTo({
      url: '/pages/add_service/add_service' // 假设有发布新服务页面
    });
  },

  // 跳转到店铺评价页
  goToShopReviews: function () {
    wx.navigateTo({
      url: '/pages/shop_reviews/shop_reviews' // 假设有店铺评价页面
    });
  },

  // 跳转到收益提现页
  goToWithdrawal: function () {
    wx.navigateTo({
      url: '/pages/withdrawal/withdrawal' // 假设有收益提现页面
    });
  },

  // 跳转到卖家设置页
  goToSellerSettings: function () {
    wx.navigateTo({
      url: '/pages/seller_settings/seller_settings' // 假设有卖家设置页面
    });
  },

  // 跳转到卖家帮助与客服页
  goToSellerHelp: function () {
    wx.navigateTo({
      url: '/pages/seller_help/seller_help' // 假设有卖家帮助与客服页面
    });
  },

  // 跳转到员工管理页面
  goToEmployeeManagement: function () {
    wx.navigateTo({
      url: '/pages/employee_management/employee_management'
    });
  },

  onShow: function() {
    // 可以在这里刷新店铺信息、订单和收益数据
    this.getShopInfo();
    this.getOrderAndEarningsData();
  }
});