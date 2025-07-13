// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloudbase-5gkjpend4a9022ba', // 在云开发控制台获取
        traceUser: true,
      })
      console.log('云开发初始化成功')
      // 初始化后再赋值
      this.globalData.db = wx.cloud.database()
    }

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
    this.checkLoginAndSetRole();
  },

  onHide: function () {
    console.log('App Hide');
  },

  onError: function (msg) {
    console.error('App Error:', msg);
  },

  globalData: {
    db: null, // 初始化为null，onLaunch后赋值
    userRoleCallbacks: []
  },

  watchUserRole: function(callback) {
    if (typeof callback === 'function') {
      this.globalData.userRoleCallbacks.push(callback);
    }
  },

  notifyUserRoleChange: function(newRole) {
    this.globalData.userRoleCallbacks.forEach(callback => {
      callback(newRole);
    });
  },

  checkLoginAndSetRole: function() {
    const storedRole = wx.getStorageSync('currentUserRole');
    if (storedRole) {
      this.globalData.userRole = storedRole;
    } else {
      this.globalData.userRole = 'owner';
      wx.setStorageSync('currentUserRole', 'owner');
    }
    console.log('当前用户角色：', this.globalData.userRole);
  },

  switchRole: function(newRole) {
    if (newRole && (newRole === 'owner' || newRole === 'seller')) {
      // 先保存新角色
      this.globalData.userRole = newRole;
      wx.setStorageSync('currentUserRole', newRole);

      // 通知角色变化
      this.notifyUserRoleChange(newRole);

      // 延迟执行页面跳转，确保角色切换完成
      setTimeout(() => {
        const firstPage = newRole === 'owner' ? '/pages/index/index' : '/pages/seller_orders/seller_orders';
        wx.reLaunch({
          url: firstPage,
          complete: () => {
            console.log('角色切换完成，已跳转到:', firstPage);
          }
        });
      }, 100);
    }
  }
});

