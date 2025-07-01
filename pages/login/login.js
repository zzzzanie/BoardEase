// pages/login/login.js
const app = getApp();

Page({
  data: {},

  // 宠物主人登录
  ownerLogin: function() {
    // 先设置角色
    app.globalData.userRole = 'owner';
    wx.setStorageSync('currentUserRole', 'owner');

    // 通知角色变化
    if (app.notifyUserRoleChange) {
      app.notifyUserRoleChange('owner');
    }

    wx.showToast({ 
      title: '登录成功', 
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转，确保 Toast 显示完成
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index',
            success: () => {
              // 确保页面跳转完成后更新 tabBar
              if (app.updateCustomTabBar) {
                app.updateCustomTabBar();
              }
            }
          });
        }, 500);
      }
    });
  },

  // 卖家登录
  sellerLogin: function() {
    // 先设置角色
    app.globalData.userRole = 'seller';
    wx.setStorageSync('currentUserRole', 'seller');

    // 通知角色变化
    if (app.notifyUserRoleChange) {
      app.notifyUserRoleChange('seller');
    }

    wx.showToast({ 
      title: '登录成功', 
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转，确保 Toast 显示完成
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/seller_orders/seller_orders',
            success: () => {
              // 确保页面跳转完成后更新 tabBar
              if (app.updateCustomTabBar) {
                app.updateCustomTabBar();
              }
            }
          });
        }, 500);
      }
    });
  }
});