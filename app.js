// app.js
App({
  onLaunch: function () {
    // env 参数说明：
    //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
    //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
    //   如不填则使用默认环境（第一个创建的环境）
    this.globalData.env = "";
    wx.cloud.init({
      env: this.globalData.env,
      traceUser: true,
    });

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
    this.checkLoginAndSetRole();
  },

  onHide: function () {
    console.log('App Hide');
  },

  onError: function (msg) {
    console.error('App Error:', msg);
  },

  globalData: {
    userInfo: null,
    userToken: null,
    userRole: 'owner',
    systemInfo: null,
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