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
    
    // 对不可接单日期进行排序
    if (merchant.unavailableDates && merchant.unavailableDates.length > 0) {
      merchant.unavailableDates.sort((a, b) => new Date(a) - new Date(b));
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
  }
});