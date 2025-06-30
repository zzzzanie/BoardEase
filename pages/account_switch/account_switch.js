// pages/account_switch/account_switch.js
const app = getApp();

Page({
  data: {

  },

  switchAccount: function () {
    wx.showModal({
      title: '切换账号',
      content: '您确定要切换当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：
          // 1. 清除当前用户的登录状态和信息
          app.globalData.userToken = null;
          app.globalData.userInfo = null;
          app.globalData.userRole = null;
          wx.clearStorageSync(); // 清除所有本地缓存，包括用户Token等

          // 2. 跳转到登录页面，让用户重新选择或输入账号
          wx.reLaunch({
            url: '/pages/login/login' // 假设您有一个登录页面
          });
          wx.showToast({ title: '已跳转至登录页', icon: 'none' });
        }
      }
    });
  },

  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '您确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际开发中：
          // 1. 清除当前用户的登录状态和信息
          app.globalData.userToken = null;
          app.globalData.userInfo = null;
          app.globalData.userRole = null;
          wx.clearStorageSync(); // 清除所有本地缓存

          // 2. 跳转到小程序的首页或一个公共的欢迎页
          wx.reLaunch({
            url: '/pages/index/index' // 退出后通常回到首页或登录页
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  }
});