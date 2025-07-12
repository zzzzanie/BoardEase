Page({
  data: {
    isEditMode: false,
    serviceId: null,
    formData: {
      name: '',
      petType: '',
      petSize: '',
      description: '',
      basePrice: '',
      baseCapacity: '',
      tags: [],
      // coverImg: '',
      // mediaFiles: [] // 存储图片/视频的临时路径或URL
    },
    tagsInput: '',
    petTypeIndex: 0, // 默认选中第一个
    petSizeIndex: 0, // 默认选中第一个
    petTypes: [
      { id: '1', name: '狗狗' },
      { id: '2', name: '猫咪' },
      { id: '3', name: '水族' },
      { id: '4', name: '小宠' },
    ],
    petSizes: [
      { id: '1', name: '小型' },
      { id: '2', name: '中型' },
      { id: '3', name: '大型' },
    ],
  },

  onLoad: function (options) {
    if (options.serviceId) {
      this.setData({
        isEditMode: true,
        serviceId: options.serviceId
      });
      this.loadServiceData(options.serviceId); // 编辑模式加载服务数据
    }
  },

  loadServiceData: async function (serviceId) {
    wx.showLoading({ title: '加载中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'services',
        data: {
          type: 'getService',
          data: {
            serviceId: serviceId
          }
        }
      });
  
      const data = res.result.data; 
      if (!data) {
        throw new Error('服务数据不存在');
      }
  
      const petTypeIndex = this.data.petTypes.findIndex(item => item.name === data.petType);
      const petSizeIndex = this.data.petSizes.findIndex(item => item.name === data.petSize);

      const tagsString = this.arrayToString(data.tags); 
  
      this.setData({
        'formData.name': data.name,
        'formData.petType': data.petType,
        'formData.petSize': data.petSize,
        'formData.description': data.description,
        'formData.basePrice': data.basePrice.toString(),
        'formData.baseCapacity': data.baseCapacity.toString(),
        'formData.tags': data.tags || [],
        'petTypeIndex': petTypeIndex >= 0 ? petTypeIndex : 0,
        'petSizeIndex': petSizeIndex >= 0 ? petSizeIndex : 0,
        'tagsInput': tagsString
      });

    } catch (err) {
        console.error('加载失败:', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
        wx.hideLoading();
    }
  },

  bindPetTypeChange: function (e) {
    this.setData({
      'petTypeIndex': e.detail.value,
      'formData.petType': this.data.petTypes[e.detail.value].name,
      'petSizeIndex': 0,
      'formData.petSize': ''
    });
  },

  bindPetSizeChange: function(e) {
    this.setData({
      'petSizeIndex': e.detail.value,
      'formData.petSize': this.data.petSizes[e.detail.value].name
    });
  },

  handleTagsInput: function(e) {
    this.setData({
      tagsInput: e.detail.value
    });
  },

  arrayToString: function(tagsArray) {
    return tagsArray.join(' ');
  },

  stringToArray: function(tagsString) {
    return [...new Set(
      tagsString.trim().split(/\s+/).filter(tag => tag.length > 0)
    )];
  },

  // chooseCoverImage: function () {
  //   wx.chooseMedia({
  //     count: 1, mediaType: ['image'], sourceType: ['album', 'camera'],
  //     success: (res) => {
  //       const tempFilePath = res.tempFiles[0].tempFilePath;
  //       this.setData({ 'formData.coverImg': tempFilePath });
  //       // 实际：上传图片到服务器，获取URL
  //     }
  //   });
  // },

  // chooseMedia: function () {
  //   const currentCount = this.data.formData.mediaFiles.length;
  //   if (currentCount >= 9) {
  //     wx.showToast({ title: '最多只能上传9张图片/视频', icon: 'none' });
  //     return;
  //   }
  //   wx.chooseMedia({
  //     count: 9 - currentCount, // 可选数量
  //     mediaType: ['image', 'video'],
  //     sourceType: ['album', 'camera'],
  //     success: (res) => {
  //       const newMediaFiles = res.tempFiles.map(file => file.tempFilePath);
  //       this.setData({
  //         'formData.mediaFiles': this.data.formData.mediaFiles.concat(newMediaFiles)
  //       });
  //       // 实际：批量上传图片/视频到服务器
  //     }
  //   });
  // },

  // previewMedia: function (e) {
  //   const src = e.currentTarget.dataset.src;
  //   // 判断是图片还是视频，分别预览
  //   if (src.endsWith('.mp4') || src.endsWith('.mov')) {
  //     wx.navigateTo({
  //       url: `/pages/video_player/video_player?src=${src}` // 假设有视频播放页
  //     });
  //   } else {
  //     wx.previewImage({
  //       current: src,
  //       urls: this.data.formData.mediaFiles.filter(item => !(item.endsWith('.mp4') || item.endsWith('.mov'))) // 过滤出图片
  //     });
  //   }
  // },

  // deleteMedia: function (e) {
  //   const index = e.currentTarget.dataset.index;
  //   const mediaFiles = this.data.formData.mediaFiles;
  //   mediaFiles.splice(index, 1);
  //   this.setData({ 'formData.mediaFiles': mediaFiles });
  // },

  refreshPrevPage() {
    const pages = getCurrentPages();
    if (pages.length < 2) return;

    const prevPage = pages[pages.length - 2];
    if (prevPage && typeof prevPage.loadServices === 'function') {
      prevPage.loadServices();
    }
  },

  submitService: async function(e) {
    if (!this.validateForm(e.detail.value)) return;
    const tagsArray = this.stringToArray(this.data.tagsInput);
  
    const formData = {
      name: e.detail.value.name.trim(),
      petType: this.data.formData.petType,
      petSize: this.data.formData.petSize,
      description: e.detail.value.description.trim(),
      basePrice: parseFloat(e.detail.value.basePrice),
      baseCapacity: parseInt(e.detail.value.baseCapacity),
      tags: tagsArray || [],
    };
  
    wx.showLoading({ title: '提交中...', mask: true });
  
    try {
      const res = await wx.cloud.callFunction({
        name: 'services',
        data: {
          type: this.data.isEditMode ? 'updateService' : 'createService',
          data: this.data.isEditMode ? {
            serviceId: this.data.serviceId,
            formData: formData
          } : {
            formData: formData
          }
        }
      });
  
      wx.showToast({ title: this.data.isEditMode ? '更新成功' : '创建成功' });
      this.refreshPrevPage();
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      console.error('提交失败:', err);
      wx.showToast({
        title: `提交失败: ${err.message || '未知错误'}`,
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 表单验证
  validateForm: function (data) {
    if (!data.name) {
      wx.showToast({ title: '请填写服务名称', icon: 'none' });
      return false;
    }
    if (!data.basePrice || isNaN(data.basePrice)) {
      wx.showToast({ title: '请输入有效价格', icon: 'none' });
      return false;
    }
    if (!data.baseCapacity || isNaN(data.baseCapacity)) {
      wx.showToast({ title: '请输入有效容量', icon: 'none' });
      return false;
    }
    return true;
  }
});