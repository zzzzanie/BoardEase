// pages/seller_management/seller_management.js
Page({
  data: {
    services: []
  },

  onLoad: function () {
    this.loadServices();
  },

  onShow: function() {
    this.loadServices(); // 每次进入页面刷新服务列表
  },

  loadServices: function () {
    // 实际开发中：调用后端API获取卖家服务列表
    console.log('加载卖家服务列表');
    wx.showLoading({ title: '加载中...' });
    // 模拟数据
    setTimeout(() => {
      this.setData({
        services: [
          { id: 's1', title: '专业家庭寄养服务 (小型犬)', price: '80', status: 'active', statusText: '上架中', coverImg: '/images/example_service_1.png' },
          { id: 's2', title: '猫咪专属豪华寄宿', price: '120', status: 'inactive', statusText: '已下架', coverImg: '/images/example_service_2.png' },
          { id: 's3', title: '狗狗短期托管 (大型犬)', price: '100', status: 'active', statusText: '上架中', coverImg: '/images/example_service_3.png' }
        ]
      });
      wx.hideLoading();
    }, 500);
  },

  editService: function (e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/seller_service_add/seller_service_add?id=${serviceId}` // 复用发布服务页面进行编辑
    });
  },

  toggleServiceStatus: function (e) {
    const serviceId = e.currentTarget.dataset.id;
    const newStatus = e.currentTarget.dataset.status;
    const statusText = newStatus === 'active' ? '上架' : '下架';
    wx.showModal({
      title: '操作确认',
      content: `确定要${statusText}此服务吗？`,
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：调用后端API更新服务状态
          console.log(`${statusText}服务ID:`, serviceId);
          wx.showToast({ title: `${statusText}成功`, icon: 'success' });
          this.loadServices(); // 刷新列表
        }
      }
    });
  },

  deleteService: function (e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除服务',
      content: '确定要删除此服务吗？删除后不可恢复！',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：调用后端API删除服务
          console.log('删除服务ID:', serviceId);
          wx.showToast({ title: '删除成功', icon: 'success' });
          this.loadServices(); // 刷新列表
        }
      }
    });
  },

  goToAddService: function () {
    wx.navigateTo({
      url: '/pages/seller_service_add/seller_service_add'
    });
  }
});