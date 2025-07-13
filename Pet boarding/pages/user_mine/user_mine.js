// pages/user_mine/user_mine.js
Page({
  data: {
    userInfo: {
      avatarUrl: '', // 用户头像
      nickName: ''   // 用户昵称
    }
  },

  onLoad: function () {
    this.getUserProfile(); // 获取用户头像和昵称
  },

  // 获取用户个人信息（建议使用wx.getUserProfile）
  getUserProfile: function () {
    wx.getUserProfile({
      desc: '用于展示个人信息', // 声明获取用户个人信息后的用途，后续会弹框询问
      success: (res) => {
        console.log("用户信息：", res.userInfo);
        this.setData({
          userInfo: res.userInfo
        });
      },
      fail: (err) => {
        console.error("获取用户信息失败：", err);
        // 可以设置一个默认的头像和昵称
        this.setData({
          userInfo: {
            avatarUrl: '/images/default_avatar.png',
            nickName: '微信用户'
          }
        });
      }
    });
  },

  // 跳转到编辑资料页
  goToEditProfile: function () {
    wx.navigateTo({
      url: '/pages/edit_profile/edit_profile' // 假设有编辑资料页面
    });
  },

  // 跳转到订单列表页
  goToOrders: function (e) {
    const orderType = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/orders/orders?type=${orderType}` // 假设有订单列表页面
    });
  },

  // 跳转到我的宠物管理页
  goToMyPets: function () {
    wx.navigateTo({
      url: '/pages/my_pets/my_pets' // 假设有我的宠物管理页面
    });
  },

  // 跳转到添加宠物页
  goToAddPet: function () {
    wx.navigateTo({
      url: '/pages/add_pet/add_pet' // 假设有添加宠物页面
    });
  },

  // 跳转到我的收藏页
  goToFavorites: function () {
    wx.navigateTo({
      url: '/pages/favorites/favorites' // 假设有我的收藏页面
    });
  },

  // 跳转到设置页
  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/settings/settings' // 假设有设置页面
    });
  },

  // 跳转到帮助与反馈页
  goToHelp: function () {
    wx.navigateTo({
      url: '/pages/help/help' // 假设有帮助与反馈页面
    });
  },

  // 生命周期回调—监听页面显示
  onShow: function () {
    // 可以在这里刷新用户数据，例如当编辑资料页返回后
    // this.getUserProfile();
  }
});