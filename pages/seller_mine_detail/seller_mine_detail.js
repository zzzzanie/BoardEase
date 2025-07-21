// pages/seller_mine_detail/seller_mine_detail.js
// 这个页面现在是卖家详细信息/店铺信息/资质认证的【编辑】页面
Page({
  data: {
    personalInfo: {
      avatar: '',
      name: '',
      phone: ''
    },
    shopInfo: {
      logo: '',
      shopName: '',
      description: '',
      address: '',
      openingHours: '',
      isApproved: false, // 认证状态
      businessLicenseUrl: '', // 营业执照图片URL
      environmentImages: [] // 店内环境图片URLs
    },
    qualifications: {
      certificateImages: [] // 资质证书图片URLs
    }
  },

  onLoad: function (options) {
    // 假设这里接收到卖家ID，然后加载数据
    this.loadSellerDataForEdit(); 
    wx.setNavigationBarTitle({
      title: '我的信息编辑'
    });
  },

  onShow: function() {
    // 每次进入页面刷新数据，确保从mine页面返回后数据显示最新
    this.loadSellerDataForEdit();
  },

  // 加载需要编辑的卖家数据
  loadSellerDataForEdit: function() {
    console.log('加载卖家编辑页面数据...');
    wx.showLoading({ title: '加载中...' });
    // 模拟数据加载，这些数据将用于填充表单
    setTimeout(() => {
      this.setData({
        personalInfo: {
          avatar: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_seller_avatar_1.png',
          name: '张店长',
          phone: '13888888888'
        },
        shopInfo: {
          logo: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_shop_logo.png',
          shopName: '萌宠之家寄养服务',
          description: '提供专业的家庭式寄养服务，让您的爱宠享受家的温暖。',
          address: '某市某区某街道某小区101号',
          openingHours: '9:00 - 18:00',
          isApproved: true,
          businessLicenseUrl: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_license.png', // 模拟数据
          environmentImages: [ // 模拟数据
            'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_pet_gallery_1.png',
            'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_pet_gallery_2.png',
            'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_pet_gallery_3.png'
          ]
        },
        qualifications: {
          certificateImages: [ // 模拟数据
            'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_cert_1.png',
            'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/example_cert_2.png'
          ]
        }
      });
      wx.hideLoading();
    }, 500);
  },

  // 卖家端通用的输入框更新函数
  onInput: function(e) {
    const { section, field } = e.currentTarget.dataset;
    const value = e.detail.value;
    if (section === 'personal') {
      this.setData({ [`personalInfo.${field}`]: value });
    } else if (section === 'shop') {
      this.setData({ [`shopInfo.${field}`]: value });
    }
  },

  // 卖家端通用单图上传
  chooseImageUpload: function(e) {
    const { section, field } = e.currentTarget.dataset;
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        if (section === 'personal') {
          this.setData({ [`personalInfo.${field}`]: tempFilePath });
        } else if (section === 'shop') {
          this.setData({ [`shopInfo.${field}`]: tempFilePath });
        }
        // 实际：上传图片到服务器，获取URL
        wx.showToast({ title: '图片选择成功，请点击保存', icon: 'none' });
      },
      fail: (err) => { console.error("选择图片失败:", err); wx.showToast({ title: '选择图片失败', icon: 'none' }); }
    });
  },

  // 卖家端通用多图上传
  chooseMultiImageUpload: function(e) {
    const { section, field } = e.currentTarget.dataset;
    let currentImages = [];
    let maxCount = 9; // 默认最大9张

    if (section === 'shop' && field === 'environmentImages') {
      currentImages = this.data.shopInfo.environmentImages;
      maxCount = 9;
    } else if (section === 'qualifications' && field === 'certificateImages') {
      currentImages = this.data.qualifications.certificateImages;
      maxCount = 5;
    }

    if (currentImages.length >= maxCount) {
      wx.showToast({ title: `最多只能上传${maxCount}张图片`, icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: maxCount - currentImages.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newMediaFiles = res.tempFiles.map(file => file.tempFilePath);
        if (section === 'shop') {
          this.setData({ [`shopInfo.${field}`]: currentImages.concat(newMediaFiles) });
        } else if (section === 'qualifications') {
          this.setData({ [`qualifications.${field}`]: currentImages.concat(newMediaFiles) });
        }
        wx.showToast({ title: '图片选择成功，请点击保存', icon: 'none' });
        // 实际：批量上传图片到服务器
      },
      fail: (err) => { console.error("选择图片失败:", err); wx.showToast({ title: '选择图片失败', icon: 'none' }); }
    });
  },

  // 卖家端图片预览
  previewImage: function(e) {
    const src = e.currentTarget.dataset.src;
    const { section, field } = e.currentTarget.dataset;
    let urlsToPreview = [];

    if (section === 'shop' && field === 'businessLicenseUrl') {
        urlsToPreview = [this.data.shopInfo.businessLicenseUrl];
    } else if (section === 'shop' && field === 'environmentImages') {
        urlsToPreview = this.data.shopInfo.environmentImages;
    } else if (section === 'qualifications' && field === 'certificateImages') {
        urlsToPreview = this.data.qualifications.certificateImages;
    } else if (section === 'personal' && field === 'avatar') {
        urlsToPreview = [this.data.personalInfo.avatar];
    }

    wx.previewImage({
      current: src,
      urls: urlsToPreview.filter(url => url) 
    });
  },

  // 卖家端删除图片
  deleteMedia: function(e) {
    const { section, field, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除确认',
      content: '确定要删除此图片吗？',
      success: (res) => {
        if (res.confirm) {
          if (section === 'shop') {
            if (field === 'businessLicenseUrl' && index === 'single') {
              this.setData({ 'shopInfo.businessLicenseUrl': '' });
            } else if (field === 'environmentImages') {
              const images = [...this.data.shopInfo.environmentImages];
              images.splice(index, 1);
              this.setData({ 'shopInfo.environmentImages': images });
            }
          } else if (section === 'qualifications') {
            const images = [...this.data.qualifications.certificateImages];
            images.splice(index, 1);
            this.setData({ 'qualifications.certificateImages': images });
          }
          else if (section === 'personal' && field === 'avatar') {
            this.setData({ 'personalInfo.avatar': '' });
          }
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  // 卖家端选择位置
  chooseLocation: function () {
    wx.chooseLocation({
      success: (res) => {
        console.log('选择的地理位置:', res);
        this.setData({
          'shopInfo.address': res.address + (res.name ? ` (${res.name})` : '')
        });
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
        wx.showToast({ title: '选择位置失败', icon: 'none' });
      }
    });
  },

  // 卖家端提交个人信息
  submitPersonalInfo: function (e) {
    const data = this.data.personalInfo;
    console.log('提交的个人信息:', data);
    wx.showToast({ title: '个人信息保存成功', icon: 'success' });
    // 实际：调用后端API更新个人信息
    setTimeout(() => { wx.navigateBack(); }, 1000); // 保存后返回
  },

  // 卖家端提交店铺信息
  submitShopInfo: function (e) {
    const data = this.data.shopInfo;
    console.log('提交的店铺信息:', data);
    wx.showToast({ title: '店铺信息保存成功', icon: 'success' });
    // 实际：调用后端API更新店铺信息
    setTimeout(() => { wx.navigateBack(); }, 1000); // 保存后返回
  },

  // 卖家端提交资质认证
  submitQualifications: function (e) {
    const data = this.data.qualifications;
    console.log('提交的资质认证:', data);
    wx.showToast({ title: '资质认证保存成功', icon: 'success' });
    // 实际：调用后端API更新资质认证
    setTimeout(() => { wx.navigateBack(); }, 1000); // 保存后返回
  }
});