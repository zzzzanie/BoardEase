// pages/mine/mine.js
const app = getApp(); // 获取全局 app 实例

Page({
  data: {
    isOwner: true, // 默认显示宠物主人界面，会根据 globalData.userRole 动态更新

    // 宠物主人端数据
    userInfo: {
      avatarUrl: '', 
      nickName: '',
      userLevel: '3级铲屎官' // 默认等级
    },
    pets: [], // 我的宠物列表

    // 卖家端展示数据
    sellerDisplayInfo: {
      logoUrl: '',
      shopName: '',
      contactName: '',
      phone: '', // 个人联系电话
      address: '',
      openingHours: '',
      isApproved: false, // 认证状态
      qualificationStatus: '未上传' // 资质状态概览
    }
  },

  onLoad: function () {
    this.checkUserRole();
    if (!this.data.userInfo.nickName) {
      this.setData({
        'userInfo.nickName': '点击登录获取昵称'
      });
    }
  },

  onShow: function () {
    this.checkUserRole();
    if (this.data.isOwner) {
      this.loadPetsData(); 
    } else {
      this.loadSellerData(); // 卖家端加载展示数据
    }
  },

  checkUserRole: function() {
    const userRole = app.globalData.userRole;
    this.setData({
      isOwner: userRole === 'owner'
    });
    console.log('mine页面：当前用户角色为', userRole, '是否是宠物主人:', this.data.isOwner);
  },

  getUserProfileAndData: function() {
    wx.getUserProfile({
      desc: '用于展示个人信息', 
      success: (res) => {
        console.log('wx.getUserProfile 成功获取用户信息:', res.userInfo);
        this.setData({
          'userInfo.avatarUrl': res.userInfo.avatarUrl,
          'userInfo.nickName': res.userInfo.nickName
        });
      },
      fail: (err) => {
        console.error("获取用户信息失败：", err);
        wx.showToast({
          title: '您拒绝了授权',
          icon: 'none'
        });
        this.setData({
          'userInfo.avatarUrl': '/images/default_avatar.png',
          'userInfo.nickName': '微信用户' 
        });
      }
    });
  },

  loadPetsData: function() {
    setTimeout(() => {
      this.setData({
        pets: [
          { id: 'p1', name: '小黄', gender: 'male', age: '1岁以内', isNeutered: false, avatar: '/images/default_pet_avatar.png' },
          { id: 'p2', name: '大花', gender: 'female', age: '2岁以上', isNeutered: true, avatar: '/images/default_pet_avatar_2.png' }
        ]
      });
    }, 300);
  },

  // 卖家端加载【展示】数据
  loadSellerData: function() {
    console.log('加载卖家展示页面数据...');
    wx.showLoading({ title: '加载中...' });
    // 实际项目中，这里会调用后端API获取卖家的【概览信息】
    setTimeout(() => {
      this.setData({
        sellerDisplayInfo: {
          logoUrl: '/images/example_shop_logo.png',
          shopName: '萌宠之家寄养服务',
          contactName: '张店长',
          phone: '13812345678',
          address: '某市某区某街道123号（萌宠中心）',
          openingHours: '周一至周日 9:00-18:00',
          isApproved: true, // 认证状态
          qualificationStatus: '已上传3项资质' // 模拟资质状态
        }
      });
      wx.hideLoading();
    }, 500);
  },

  // ----------------- 宠物主人端事件处理 (保持不变) -----------------
  goToAddPet: function () {
    wx.navigateTo({ url: '/pages/add_pet/add_pet' });
  },
  goToPetDetail: function (e) {
    const petId = e.currentTarget.dataset.petId;
    console.log('点击了宠物项（非编辑按钮），ID:', petId, '跳转到详情页');
    wx.navigateTo({
      url: `/pages/pet_archive/pet_archive?id=${petId}`
    });
  },
  goToEditPetFromList: function(e) {
    const petId = e.currentTarget.dataset.petId;
    console.log('点击了宠物档案的小编辑按钮，ID:', petId, '直接跳转到编辑页');
    wx.navigateTo({
      url: `/pages/add_pet/add_pet?id=${petId}`
    });
  },
  goToUserFavorites: function () {
    wx.navigateTo({ url: '/pages/user_favorites/user_favorites' });
  },
  goToUserChat: function () {
    wx.navigateTo({ url: '/pages/user_chat/user_chat' });
  },
  goToUserWallet: function () {
    wx.navigateTo({ url: '/pages/user_wallet/user_wallet' });
  },
  goToUserOrders: function () {
    wx.navigateTo({ url: '/pages/user_orders/user_orders' });
  },
  goToUserCalendar: function () {
    wx.navigateTo({ url: '/pages/user_calendar/user_calendar' });
  },
  
  // ----------------- 卖家端功能入口 -----------------
  goToEditSellerInfo: function() {
    wx.navigateTo({
      url: '/pages/seller_mine_detail/seller_mine_detail' // 跳转到详细编辑页面
    });
  },
  goToSellerEarnings: function () {
    wx.navigateTo({ url: '/pages/seller_earnings/seller_earnings' });
  },
  goToChatManagement: function () {
    // 修正：卖家端的聊天管理跳转到新的 seller_chat 页面
    wx.navigateTo({ url: '/pages/seller_chat/seller_chat' }); 
  },
  goToEmployeeManagement: function () {
    wx.navigateTo({ url: '/pages/employee_management/employee_management' });
  },
  goToAccountSwitch: function () {
    wx.navigateTo({ url: '/pages/account_switch/account_switch' });
  }
});