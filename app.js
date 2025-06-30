// app.js
App({
  onLaunch: function () {
    // 假设这里进行登录逻辑，并获取到用户的角色信息
    // 实际项目中，这通常涉及wx.login, 发送code到后端，后端返回token和用户信息（包括角色）
    this.checkLoginAndSetRole(); 

    // 检查小程序版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            wx.showToast({
              title: '新版本下载失败，请稍后再试',
              icon: 'none'
            });
          });
        }
      });
    }
  },

  onShow: function (options) {
    console.log('App Show', options);
    // 在这里可以再次检查登录状态和用户角色，确保实时性
    this.checkLoginAndSetRole();
  },

  onHide: function () {
    console.log('App Hide');
  },

  onError: function (msg) {
    console.error('App Error:', msg);
  },

  globalData: {
    userInfo: null,      // 存储用户基本信息
    userToken: null,     // 存储用户登录凭证
    userRole: 'owner',   // 存储用户角色：'owner' (宠物主人) 或 'seller' (商家)
    systemInfo: null     // 存储系统信息
  },

  // 模拟登录和设置用户角色（实际项目中请替换为真实后端交互）
  checkLoginAndSetRole: function() {
    // 从本地存储获取用户角色
    const storedRole = wx.getStorageSync('currentUserRole');
    if (storedRole) {
      this.globalData.userRole = storedRole;
    } else {
      // 如果没有存储角色，默认是宠物主人
      this.globalData.userRole = 'owner';
      wx.setStorageSync('currentUserRole', 'owner');
    }
    
    console.log('当前用户角色：', this.globalData.userRole);
    
    // 更新自定义tabBar的显示
    this.updateCustomTabBar();
  },

  // 更新自定义tabBar
  updateCustomTabBar: function() {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.getTabBar) {
        const tabBar = currentPage.getTabBar();
        if (tabBar) {
          tabBar.setData({
            userRole: this.globalData.userRole
          });
        }
      }
    }
  },

  // 切换用户角色的方法
  switchRole: function(newRole) {
    if (newRole && (newRole === 'owner' || newRole === 'seller')) {
      // 保存新角色
      this.globalData.userRole = newRole;
      wx.setStorageSync('currentUserRole', newRole);
      
      // 更新tabBar
      this.updateCustomTabBar();
      
      // 切换到对应角色的首页
      const firstPage = newRole === 'owner' ? '/pages/index/index' : '/pages/seller_orders/seller_orders';
      wx.switchTab({
        url: firstPage
      });
    }
  },

  // 全局方法，例如封装请求
  request: function(options) {
    // ... (保持不变或根据需要调整)
  }
});