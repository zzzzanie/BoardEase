// pages/user_favorites/user_favorites.js
Page({
  data: {
    favorites: []
  },

  onLoad: function () {
    this.loadFavorites();
  },

  loadFavorites: function () {
    console.log('加载我的收藏');
    const db = wx.cloud.database();
    db.collection('merchants').where({
      name: db.command.in(['萌宠诊所', '汪汪医院'])
    }).get({
      success: res => {
        this.setData({ favorites: res.data });
      },
      fail: err => {
        console.error('获取收藏商户失败', err);
        wx.showToast({ title: '收藏加载失败', icon: 'none' });
        this.setData({ favorites: [] });
      }
    });
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