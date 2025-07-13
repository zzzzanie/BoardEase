// pages/seller_service_add/seller_service_add.js
Page({
  data: {
    isEditMode: false,
    serviceId: null,
    formData: {
      title: '',
      description: '',
      price: '',
      petTypeIndex: 0, // 默认选中第一个
      coverImg: '',
      mediaFiles: [] // 存储图片/视频的临时路径或URL
    },
    petTypes: [
      { id: 'all', name: '所有类型宠物' },
      { id: 'dog', name: '犬类' },
      { id: 'cat', name: '猫咪' },
      { id: 'other', name: '其他小型宠物' }
    ]
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        isEditMode: true,
        serviceId: options.id
      });
      this.loadServiceData(options.id); // 编辑模式加载服务数据
    }
  },

  loadServiceData: function (id) {
    // 实际开发中：根据ID调用后端API获取服务详情填充表单
    console.log('加载服务数据进行编辑，ID:', id);
    // 模拟数据
    setTimeout(() => {
      this.setData({
        formData: {
          title: '专业家庭寄养服务 (小型犬)',
          description: '提供舒适的家庭环境，专业照护，每日遛弯，拍照记录。',
          price: '80',
          petTypeIndex: 1, // 假设犬类是索引1
          coverImg: '/images/example_service_1.png',
          mediaFiles: [
            '/images/example_service_1.png',
            '/images/example_pet_gallery_1.png',
            '/images/example_pet_gallery_2.png'
          ]
        }
      });
    }, 500);
  },

  bindPetTypeChange: function (e) {
    this.setData({
      'formData.petTypeIndex': e.detail.value
    });
  },

  chooseCoverImage: function () {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ 'formData.coverImg': tempFilePath });
        // 实际：上传图片到服务器，获取URL
      }
    });
  },

  chooseMedia: function () {
    const currentCount = this.data.formData.mediaFiles.length;
    if (currentCount >= 9) {
      wx.showToast({ title: '最多只能上传9张图片/视频', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 9 - currentCount, // 可选数量
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newMediaFiles = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          'formData.mediaFiles': this.data.formData.mediaFiles.concat(newMediaFiles)
        });
        // 实际：批量上传图片/视频到服务器
      }
    });
  },

  previewMedia: function (e) {
    const src = e.currentTarget.dataset.src;
    // 判断是图片还是视频，分别预览
    if (src.endsWith('.mp4') || src.endsWith('.mov')) {
      wx.navigateTo({
        url: `/pages/video_player/video_player?src=${src}` // 假设有视频播放页
      });
    } else {
      wx.previewImage({
        current: src,
        urls: this.data.formData.mediaFiles.filter(item => !(item.endsWith('.mp4') || item.endsWith('.mov'))) // 过滤出图片
      });
    }
  },

  deleteMedia: function (e) {
    const index = e.currentTarget.dataset.index;
    const mediaFiles = this.data.formData.mediaFiles;
    mediaFiles.splice(index, 1);
    this.setData({ 'formData.mediaFiles': mediaFiles });
  },

  submitService: function (e) {
    const data = e.detail.value;
    data.coverImg = this.data.formData.coverImg;
    data.mediaFiles = this.data.formData.mediaFiles;
    data.petType = this.data.petTypes[this.data.formData.petTypeIndex].id; // 存储选中类型ID

    console.log('提交的服务数据:', data);

    // 实际开发中：
    if (this.data.isEditMode) {
      // 调用后端API更新服务 (PUT/POST)
      console.log('更新服务，ID:', this.data.serviceId, '数据:', data);
      wx.showToast({ title: '服务更新成功', icon: 'success' });
    } else {
      // 调用后端API发布新服务 (POST)
      console.log('发布新服务，数据:', data);
      wx.showToast({ title: '服务发布成功', icon: 'success' });
    }

    // 成功后返回服务管理页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
});