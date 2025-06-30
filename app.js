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
    userRole: 'owner',   // **关键：存储用户角色。初始可以设置为 'owner' 或 null，
                         //  实际项目中通过后端登录接口获取并设置。
                         //  可选值：'owner' (宠物主人), 'seller' (卖家)**
    systemInfo: null,    // 存储系统信息
    tabBarConfig: {      // 存储不同角色的tabBar配置
      owner: {
        color: "#999999",
        selectedColor: "#FF7F50",
        list: [
          {
            pagePath: "pages/index/index",
            text: "首页",
            iconPath: "/images/tab_home_normal.png",
            selectedIconPath: "/images/tab_home_selected.png"
          },
          {
            pagePath: "pages/foster/foster",
            text: "寄养",
            iconPath: "/images/tab_foster_normal.png",
            selectedIconPath: "/images/tab_foster_selected.png"
          },
          {
            pagePath: "pages/mine/mine",
            text: "我的",
            iconPath: "/images/tab_mine_normal.png",
            selectedIconPath: "/images/tab_mine_selected.png"
          }
        ]
      },
      seller: {
        color: "#999999",
        selectedColor: "#FF7F50",
        list: [
          {
            pagePath: "pages/seller_orders/seller_orders",
            text: "订单管理",
            iconPath: "/images/tab_order_normal.png",
            selectedIconPath: "/images/tab_order_selected.png"
          },
          {
            pagePath: "pages/service_management/service_management",
            text: "服务管理",
            iconPath: "/images/tab_service_normal.png",
            selectedIconPath: "/images/tab_service_selected.png"
          },
          {
            pagePath: "pages/mine/mine",
            text: "我的",
            iconPath: "/images/tab_mine_normal.png",
            selectedIconPath: "/images/tab_mine_selected.png"
          }
        ]
      }
    }
  },

  // 模拟登录和设置用户角色（实际项目中请替换为真实后端交互）
  checkLoginAndSetRole: function() {
    // 假设从本地存储或通过API获取到用户的角色
    // 这里我们简单模拟，实际请根据您的业务逻辑判断
    // 示例：
    // let storedRole = wx.getStorageSync('currentUserRole');
    // if (storedRole) {
    //   this.globalData.userRole = storedRole;
    // } else {
    //   // 如果没有存储角色，默认是宠物主人
    //   this.globalData.userRole = 'owner'; 
    //   // 或者引导用户登录选择身份
    // }
    
    // 为了演示方便，这里直接设置一个默认角色
    // 您可以在登录成功后，根据后端返回的用户信息，设置 'owner' 或 'seller'
    // this.globalData.userRole = 'owner'; // 默认设置为宠物主人
    // this.globalData.userRole = 'seller'; // 调试时可以切换为卖家
    console.log('当前用户角色：', this.globalData.userRole);
    // 设置对应角色的tabBar
    this.setTabBar(this.globalData.userRole);
  },

  // 设置tabBar的方法
  setTabBar: function(role) {
    if (!role || !this.globalData.tabBarConfig[role]) return;
    
    const tabConfig = this.globalData.tabBarConfig[role];
    
    // 设置tabBar的样式
    wx.setTabBarStyle({
      color: tabConfig.color,
      selectedColor: tabConfig.selectedColor,
      backgroundColor: "#ffffff",
      borderStyle: "black"
    });

    // 设置每个tab的内容
    tabConfig.list.forEach((item, index) => {
      wx.setTabBarItem({
        index: index,
        text: item.text,
        iconPath: item.iconPath,
        selectedIconPath: item.selectedIconPath
      });
    });
  },

  // 切换用户角色的方法
  switchRole: function(newRole) {
    if (newRole && this.globalData.tabBarConfig[newRole]) {
      this.globalData.userRole = newRole;
      this.setTabBar(newRole);
      // 切换到对应角色的首页
      const firstPage = this.globalData.tabBarConfig[newRole].list[0].pagePath;
      wx.switchTab({
        url: '/' + firstPage
      });
    }
  },

  // 全局方法，例如封装请求
  request: function(options) {
    // ... (保持不变或根据需要调整)
  }
});