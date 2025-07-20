// 宠物寄养小程序首页逻辑
Page({
  data: {
    bannerImages: [
      '/images/example_banner_1.png',
      '/images/example_banner_2.png',
      '/images/example_banner_3.png'
    ],
    // 宠物列表数据
    petList: [], // 宠物列表数据
    petListEmptyMsg: '', // 宠物列表为空时的提示
    // 寄养师和商家数据将从providers集合获取
    topSitters: [], // 前5名寄养师
    topStores: []   // 前5名商家
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
    console.log('首页加载完成');
    this.loadPetList();
    this.loadTopProviders();
  },

  onShow: function() {
    // 页面显示时的逻辑
    this.loadPetList();
    this.loadTopProviders();
  },

  // 加载当前用户的宠物列表
  loadPetList: function() {
    const that = this;
    const app = getApp();
    // 现阶段首页宠物列表只读取wechatId为chenxm_pet的用户
    const wechatId = 'chenxm_pet';
    if (!app.globalData.db) {
      // 数据库未初始化
      this.setData({
        petList: [],
        petListEmptyMsg: '数据加载失败，请稍后重试'
      });
      return;
    }
    const db = app.globalData.db;
    db.collection('pet').where({ wechatId }).get({
      success: function(res) {
        if (res.data && res.data.length > 0) {
          // 映射字段到页面展示结构
          const petList = res.data.map(pet => ({
            id: pet.petId || pet._id,
            name: pet.nickname,
            gender: pet.gender,
            breed: pet.type,
            age: that.calcPetAge(pet.birthDate),
            image: pet.avatar
          }));
          that.setData({
            petList,
            petListEmptyMsg: ''
          });
        } else {
          that.setData({
            petList: [],
            petListEmptyMsg: '您还没有添加宠物，请前往添加~'
          });
        }
      },
      fail: function(err) {
        that.setData({
          petList: [],
          petListEmptyMsg: '宠物数据加载失败'
        });
      }
    });
  },

  // 计算宠物年龄（简单年数）
  calcPetAge: function(birthDate) {
    if (!birthDate) return '';
    try {
      const birth = new Date(birthDate.$date || birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        age--;
      }
      return age < 1 ? '1岁以内' : age + '岁';
    } catch (e) {
      return '';
    }
  },

  // 从providers集合加载寄养师和商家数据（只按已完成订单量排序）
  loadTopProviders: function() {
    const that = this;
    const app = getApp();
    if (!app.globalData.db) {
      this.loadMockData();
      return;
    }
    const db = app.globalData.db;
    // 获取寄养师
    db.collection('providers').where({ isHomeBased: true }).get({
      success: function(res) {
        that.countCompletedOrdersForProviders(res.data, 'topSitters');
      },
      fail: function() { that.loadMockData(); }
    });
    // 获取商家
    db.collection('providers').where({ isHomeBased: false }).get({
      success: function(res) {
        that.countCompletedOrdersForProviders(res.data, 'topStores');
      },
      fail: function() { that.loadMockData(); }
    });
  },

  // 统计每个provider已完成订单量并排序
  countCompletedOrdersForProviders: function(providers, setKey) {
    const that = this;
    const app = getApp();
    const db = app.globalData.db;
    if (!providers || providers.length === 0) {
      that.setData({ [setKey]: [] });
      return;
    }
    let finished = 0;
    providers.forEach((provider, idx) => {
      db.collection('orders').where({
        serviceId: db.command.exists(true),
        status: 'completed',
        // 关联服务表查providerId
      }).get({
        success: function(orderRes) {
          // 只统计该provider的订单
          // 需要先查services表，找到该provider的所有serviceId
          db.collection('services').where({ providerId: provider.providerId }).get({
            success: function(serviceRes) {
              const serviceIds = serviceRes.data.map(s => s.serviceId || s._id);
              const completedOrders = orderRes.data.filter(o => serviceIds.includes(o.serviceId));
              provider.orderCount = completedOrders.length;
              finished++;
              if (finished === providers.length) {
                // 全部统计完毕，排序
                const sorted = providers.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
                that.setData({ [setKey]: sorted.slice(0, 5) });
              }
            },
            fail: function() {
              provider.orderCount = 0;
              finished++;
              if (finished === providers.length) {
                const sorted = providers.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
                that.setData({ [setKey]: sorted.slice(0, 5) });
              }
            }
          });
        },
        fail: function() {
          provider.orderCount = 0;
          finished++;
          if (finished === providers.length) {
            const sorted = providers.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
            that.setData({ [setKey]: sorted.slice(0, 5) });
          }
        }
      });
    });
  },

  // 加载模拟数据（当数据库不可用时）
  loadMockData: function() {
    this.setData({
      topSitters: [
        {
          id: 1,
          name: '张阿姨',
          avatar: '/images/sitter1.jpg',
          avgRating: 4.8,
          orderCount: 156
        },
        {
          id: 2,
          name: '李师傅',
          avatar: '/images/sitter2.jpg',
          avgRating: 4.7,
          orderCount: 142
        },
        {
          id: 3,
          name: '王姐姐',
          avatar: '/images/sitter3.jpg',
          avgRating: 4.6,
          orderCount: 128
        },
        {
          id: 4,
          name: '刘叔叔',
          avatar: '/images/sitter4.jpg',
          avgRating: 4.5,
          orderCount: 115
        },
        {
          id: 5,
          name: '陈阿姨',
          avatar: '/images/default_avatar.png',
          avgRating: 4.4,
          orderCount: 98
        }
      ],
      topStores: [
        {
          id: 1,
          shopName: '爱宠诊所',
          logo: '/images/clinic1.jpg',
          avgRating: 4.8,
          orderCount: 89,
          address: '科兴科学园'
        },
        {
          id: 2,
          shopName: '萌宠医院',
          logo: '/images/clinic2.jpg',
          avgRating: 4.7,
          orderCount: 76,
          address: '南山科技园'
        },
        {
          id: 3,
          shopName: '宠物之家',
          logo: '/images/default_shop_logo.png',
          avgRating: 4.6,
          orderCount: 65,
          address: '福田中心区'
        },
        {
          id: 4,
          shopName: '喵汪乐园',
          logo: '/images/default_shop_logo.png',
          avgRating: 4.5,
          orderCount: 58,
          address: '宝安中心区'
        },
        {
          id: 5,
          shopName: '宠物驿站',
          logo: '/images/default_shop_logo.png',
          avgRating: 4.4,
          orderCount: 52,
          address: '龙岗中心区'
        }
      ]
    });
  },

  // 通知按钮点击事件
  onNotificationTap: function() {
    wx.navigateTo({
      url: '/pages/user_chat/user_chat'
    });
  },

  // 宠物卡片点击事件
  onPetCardTap: function(e) {
    const petId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pet_archive/pet_archive?id=${petId}`
    });
  },

  // 寄养师卡片点击事件
  onSitterCardTap: function(e) {
    const providerId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/foster/foster?id=${merchantId}`
    });
  },

  // 店铺卡片点击事件
  onStoreCardTap: function(e) {
    const providerId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/foster/foster?id=${merchantId}`
    });
  },

  // 更多按钮点击事件
  onMoreTap: function(e) {
    wx.switchTab({
      url: '/pages/foster/foster'
    });
  },
  
    // 添加按钮点击事件
    onAddTap: function(e) {
      wx.navigateTo({
        url: '/pages/add_pet/add_pet'
      });
    }
}); 