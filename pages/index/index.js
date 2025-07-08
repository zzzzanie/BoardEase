// 宠物寄养小程序首页逻辑
Page({
  data: {
    // 宠物列表数据
    petList: [
      {
        id: 1,
        name: '小白',
        gender: 'male',
        breed: '英短',
        age: 2,
        image: '/images/pet1.jpg'
      },
      {
        id: 2,
        name: '咪咪',
        gender: 'female',
        breed: '美短',
        age: 1,
        image: '/images/pet2.jpg'
      }
    ],
    
    // 寄养师和商家数据将从providers集合获取
    topSitters: [], // 前5名寄养师
    topStores: []   // 前5名商家
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
    console.log('首页加载完成');
    this.loadTopProviders();
  },

  onShow: function() {
    // 页面显示时的逻辑
    this.loadTopProviders();
  },

  // 从providers集合加载寄养师和商家数据
  loadTopProviders: function() {
    const that = this;
    const app = getApp();
    
    if (!app.globalData.db) {
      console.log('数据库未初始化，使用模拟数据');
      this.loadMockData();
      return;
    }

    const db = app.globalData.db;
    
    // 获取寄养师数据 (isHomeBased = true)
    db.collection('providers')
      .where({
        isHomeBased: true
      })
      .get({
        success: function(res) {
          const sitters = that.calculateProviderStats(res.data);
          that.setData({
            topSitters: sitters.slice(0, 5) // 取前5名
          });
        },
        fail: function(err) {
          console.error('获取寄养师数据失败:', err);
          that.loadMockData();
        }
      });

    // 获取商家数据 (isHomeBased = false)
    db.collection('providers')
      .where({
        isHomeBased: false
      })
      .get({
        success: function(res) {
          const stores = that.calculateProviderStats(res.data);
          that.setData({
            topStores: stores.slice(0, 5) // 取前5名
          });
        },
        fail: function(err) {
          console.error('获取商家数据失败:', err);
          that.loadMockData();
        }
      });
  },

  // 计算提供商统计信息（评分和接单量）
  calculateProviderStats: function(providers) {
    const that = this;
    const app = getApp();
    const db = app.globalData.db;
    
    // 为每个provider计算平均评分和接单量
    const providersWithStats = providers.map(provider => {
      // 获取该provider的订单数量
      db.collection('orders')
        .where({
          provider_id: provider._id
        })
        .count({
          success: function(res) {
            provider.orderCount = res.total;
          },
          fail: function(err) {
            console.error('获取订单数量失败:', err);
            provider.orderCount = 0;
          }
        });

      // 获取该provider的评论平均分
      db.collection('reviews')
        .where({
          provider_id: provider._id
        })
        .get({
          success: function(res) {
            if (res.data.length > 0) {
              const totalRating = res.data.reduce((sum, review) => sum + review.rating, 0);
              provider.avgRating = (totalRating / res.data.length).toFixed(1);
            } else {
              provider.avgRating = 0;
            }
          },
          fail: function(err) {
            console.error('获取评分失败:', err);
            provider.avgRating = 0;
          }
        });

      return provider;
    });

    // 排序：评分降序 > 接单量降序
    return providersWithStats.sort((a, b) => {
      if (a.avgRating !== b.avgRating) {
        return b.avgRating - a.avgRating;
      }
      return b.orderCount - a.orderCount;
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
      url: '/pages/chat_detail/chat_detail'
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
    const sitterId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/foster/foster?id=${sitterId}` // 后续可替换为寄养师详情页
    });
  },

  // 店铺卡片点击事件
  onStoreCardTap: function(e) {
    const storeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/foster/foster?id=${storeId}` // 后续可替换为店铺详情页
    });
  },

  // 更多按钮点击事件
  onMoreTap: function(e) {
    wx.switchTab({
      url: '/pages/foster/foster'
    });
  },

  // 自定义导航点击事件
  onTabTap: function(e) {
    const page = e.currentTarget.dataset.page;
    
    switch(page) {
      case 'home':
        // 已经在首页，不需要跳转
        break;
      case 'boarding':
        wx.navigateTo({
          url: '/pages/user/boarding/boarding'
        });
        break;
      case 'profile':
        wx.navigateTo({
          url: '/pages/user/profile/profile'
        });
        break;
    }
  }
}); 