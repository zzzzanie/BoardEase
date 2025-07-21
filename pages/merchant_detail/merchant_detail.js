Page({
  data: {
    merchant: {},
    reviews: [],
    showReviewModal: false,
    showBasicInsuranceModal: false,
    selectedServiceIndex: 0
  },

  onLoad(options) {
    // 从参数中获取商家数据
    let merchant = {};
    if (options.merchant) {
      merchant = JSON.parse(decodeURIComponent(options.merchant));
    }
    
    // 如果没有传递商家数据，尝试从Storage获取
    if (!merchant || Object.keys(merchant).length === 0) {
      merchant = wx.getStorageSync('selectedMerchant') || {};
    }
    
    // 使用商家数据中的评价，如果没有则使用默认评价
    const reviews = merchant.reviews || [
      { id: 1, user: '小明', score: 4.8, content: '环境很干净，老板很有爱心，寄养期间每天都有照片和视频，非常放心！' },
      { id: 2, user: 'Lucy', score: 5.0, content: '服务很周到，狗狗回来后很健康，推荐！' },
      { id: 3, user: '阿猫', score: 4.6, content: '猫咪寄养体验很好，独立房间很安静，推荐给猫奴们。' },
      { id: 4, user: '王先生', score: 4.9, content: '寄养期间有任何问题都会及时沟通，服务态度一流。' }
    ];

    this.setData({
      merchant,
      reviews
    });
    
    // 从云数据库获取最新的服务信息
    this.getServicesFromCloud(merchant.merchantId);
  },

  // 从云数据库获取服务信息
  getServicesFromCloud(merchantId) {
    if (!merchantId) return;
    
    wx.showLoading({ title: '加载服务信息...' });
    
    const db = wx.cloud.database();
    db.collection('services').where({
      merchantId: merchantId
    }).get({
      success: res => {
        console.log('服务数据加载成功:', res.data);
        const services = res.data.map(service => ({
          name: service.name,
          price: service.basePrice,
          desc: service.description
        }));
        
        // 更新商家数据中的服务信息
        const merchant = this.data.merchant;
        merchant.services = services;
        
        this.setData({
          merchant
        });
        
        wx.hideLoading();
      },
      fail: err => {
        console.error('获取服务数据失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '服务信息加载失败',
          icon: 'none'
        });
      }
    });
  },


  // 选择服务项目
  onSelectService(e) {
    this.setData({ selectedServiceIndex: e.currentTarget.dataset.index });
  },

  // 查看全部评价
  onViewAllReviews() {
    this.setData({ showReviewModal: true });
  },
  onCloseReviewModal() {
    this.setData({ showReviewModal: false });
  },
  
  // 显示基础保险详情
  onShowBasicInsurance() {
    this.setData({ showBasicInsuranceModal: true });
  },
  
  // 关闭基础保险弹窗
  onCloseBasicInsuranceModal() {
    this.setData({ showBasicInsuranceModal: false });
  },
  
  stopPropagation() {},

  // 证书图片预览
  onPreviewCert(e) {
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls: [
        'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/example_cert_1.png',
        'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/example_cert_2.png',
        'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/example_license.png'
      ]
    });
  },

  // 跳转到订单确认页
  onBookNow() {
    const { merchant, selectedServiceIndex } = this.data;
    
    // 获取foster页面的日期信息
    const filterData = wx.getStorageSync('filterData') || {};
    const checkInDate = filterData.checkInDate || '';
    const checkOutDate = filterData.checkOutDate || '';
    
    wx.navigateTo({
      url: `/pages/confirm_order/confirm_order?merchant=${encodeURIComponent(JSON.stringify(merchant))}&serviceIndex=${selectedServiceIndex}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
    });
  },

  // 联系商家按钮
  onContactMerchant() {
    // 直接跳转到与寄养老板聊天详情页
    wx.navigateTo({
      url: '/pages/chat_detail/chat_detail?id=c1_seller_pet_owner_chat&type=seller'
    });
  }
});