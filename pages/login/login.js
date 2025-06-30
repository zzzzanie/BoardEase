// pages/login/login.js
const app = getApp();

Page({
  data:{},

  // 宠物主人登录
  ownerLogin: function() {
    app.globalData.userRole = 'owner';
    wx.showToast({ title: '登录成功 (宠物主人)', icon: 'success' });
    console.log('模拟宠物主人登录，角色设置为：', app.globalData.userRole);
    setTimeout(() => {
      // 使用 wx.reLaunch 可以关闭所有页面并打开到目标页面，模拟登录后的跳转
      wx.reLaunch({
        url: '/pages/index/index' 
      });
    }, 1000);
  },

  // 卖家登录
  sellerLogin: function() {
    app.globalData.userRole = 'seller';
    wx.showToast({ title: '登录成功 (卖家)', icon: 'success' });
    console.log('模拟卖家登录，角色设置为：', app.globalData.userRole);
    setTimeout(() => {
      // 使用 wx.reLaunch 可以关闭所有页面并打开到目标页面，模拟登录后的跳转
      wx.reLaunch({
        url: '/pages/index/index' 
      });
    }, 1000);
  }
});