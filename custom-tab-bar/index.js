Component({
  data: {
    selected: 0,
    userRole: 'owner', // 默认为宠物主人
    ownerList: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_home_normal.png",
        selectedIconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_home_selected.png"
      },
      {
        pagePath: "/pages/foster/foster",
        text: "寄养",
        iconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_foster_normal.png",
        selectedIconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_foster_selected.png"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的",
        iconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_mine_normal.png",
        selectedIconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_mine_selected.png"
      }
    ],
    sellerList: [
      {
        pagePath: "/pages/seller_orders/seller_orders",
        text: "订单管理",
        iconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/icon_order.png",
        selectedIconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/icon_seller_order.png"
      },
      {
        pagePath: "/pages/service_management/service_management",
        text: "服务管理",
        iconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/icon_service_manage.png",
        selectedIconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/icon_service_manage.png"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的",
        iconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_mine_normal.png",
        selectedIconPath: "https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/tab_mine_selected.png"
      }
    ]
  },
  lifetimes: {
    attached() {
      // 获取当前角色
      const app = getApp();
      const role = app.globalData.userRole;
      this.setData({ userRole: role });

      // 监听角色变化
      if (app.watchUserRole) {
        app.watchUserRole((newRole) => {
          this.setData({ userRole: newRole });
        });
      }

      // 监听路由变化
      wx.onAppRoute(() => {
        const pages = getCurrentPages();
        if (!pages.length) return;

        const currentPage = pages[pages.length - 1];
        const route = '/' + currentPage.route;
        const list = this.data.userRole === 'owner' ? this.data.ownerList : this.data.sellerList;
        
        const index = list.findIndex(item => item.pagePath === route);
        if (index > -1) {
          this.setData({ selected: index });
        }
      });
    }
  },
  pageLifetimes: {
    show() {
      this.updateSelected();
    }
  },
  methods: {
    updateSelected() {
      const pages = getCurrentPages();
      if (!pages.length) return;

      const currentPage = pages[pages.length - 1];
      const route = '/' + currentPage.route;
      const list = this.data.userRole === 'owner' ? this.data.ownerList : this.data.sellerList;
      
      const index = list.findIndex(item => item.pagePath === route);
      if (index > -1) {
        this.setData({ selected: index });
      }
    },
    switchTab(e) {
      const dataset = e.currentTarget.dataset;
      const path = dataset.path;
      const index = dataset.index;

      // 如果点击当前页面，不做任何操作
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPath = '/' + currentPage.route;
      if (currentPath === path) return;

      // 更新选中状态并切换页面
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
}); 