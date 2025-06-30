Component({
  data: {
    selected: 0,
    userRole: 'owner', // 默认为宠物主人
    ownerList: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/images/tab_home_normal.png",
        selectedIconPath: "/images/tab_home_selected.png"
      },
      {
        pagePath: "/pages/foster/foster",
        text: "寄养",
        iconPath: "/images/tab_foster_normal.png",
        selectedIconPath: "/images/tab_foster_selected.png"
      },
      {
        pagePath: "/pages/mine/mine",
        text: "我的",
        iconPath: "/images/tab_mine_normal.png",
        selectedIconPath: "/images/tab_mine_selected.png"
      }
    ],
    sellerList: [
      {
        pagePath: "/pages/seller_orders/seller_orders",
        text: "订单管理",
        iconPath: "/images/tab_order_normal.png",
        selectedIconPath: "/images/tab_order_selected.png"
      },
      {
        pagePath: "/pages/service_management/service_management",
        text: "服务管理",
        iconPath: "/images/tab_service_normal.png",
        selectedIconPath: "/images/tab_service_selected.png"
      },
      {
        pagePath: "/pages/seller_management/seller_management",
        text: "我的",
        iconPath: "/images/tab_mine_normal.png",
        selectedIconPath: "/images/tab_mine_selected.png"
      }
    ]
  },
  lifetimes: {
    attached() {
      // 获取当前页面路径
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const url = `/${currentPage.route}`;
      
      // 获取用户角色
      const app = getApp();
      const role = app.globalData.userRole || 'owner';
      this.setData({ userRole: role });
      
      // 根据当前页面设置选中的tab
      const list = role === 'owner' ? this.data.ownerList : this.data.sellerList;
      const selected = list.findIndex(item => item.pagePath === url);
      this.setData({ selected: selected !== -1 ? selected : 0 });
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({ selected: data.index });
    }
  }
}); 