// pages/user_favorites/user_favorites.js
Page({
  data: {
    favorites: []
  },

  onLoad: function () {
    this.loadFavorites();
  },

  loadFavorites: function () {
    // 实际开发中：调用后端API获取用户收藏列表
    console.log('加载我的收藏');
    // 模拟数据
    setTimeout(() => {
      this.setData({
        favorites: [
          { id: 's1', title: '专业家庭寄养服务', price: '80', shopName: '爱宠之家', coverImg: '/images/example_service_1.png' },
          { id: 's2', title: '猫咪专属豪华寄宿', price: '120', shopName: '喵星人乐园', coverImg: '/images/example_service_2.png' }
        ]
      });
    }, 500);
  },

  goToServiceDetail: function (e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/service_detail/service_detail?id=${serviceId}` // 假设有服务详情页
    });
  },

  removeFavorite: function (e) {
    const idToRemove = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏此服务吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：调用后端API取消收藏
          console.log('取消收藏服务ID:', idToRemove);
          this.setData({
            favorites: this.data.favorites.filter(item => item.id !== idToRemove)
          });
          wx.showToast({ title: '取消成功', icon: 'success' });
        }
      }
    });
  }
});