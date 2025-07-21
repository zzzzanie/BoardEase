// pages/add_pet/add_pet.js
Page({
  data: {
    isEditMode: false, // 判断是添加还是编辑模式
    petId: null,
    formData: {
      avatar: '',
      name: '',
      species: '',
      gender: 'male',
      age: '',
      isNeutered: false,
      character: '',
      healthStatus: ''
    },
    submitButtonText: '提交' // 新增：按钮默认文本
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        isEditMode: true,
        petId: options.id,
        submitButtonText: '保存' // 编辑模式下显示“保存”
      });
      this.loadPetData(options.id);
      wx.setNavigationBarTitle({
        title: '编辑宠物'
      });
    } else {
      wx.setNavigationBarTitle({
        title: '添加新宠物'
      });
      // 确保 formData 已经是默认空值
      this.setData({
        formData: {
          avatar: '', name: '', species: '', gender: 'male', age: '',
          isNeutered: false, character: '', healthStatus: ''
        },
        submitButtonText: '提交' // 添加模式下显示“提交”
      });
    }
  },
  // 实时更新 formData 的通用输入框事件处理函数
  onInput: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
    console.log(`formData.${field} 更新为:`, e.detail.value); // 调试用
  },

  // radio-group 的改变事件处理函数
  onRadioChange: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
    console.log(`formData.${field} 更新为:`, e.detail.value); // 调试用
  },

  // switch 的改变事件处理函数
  onSwitchChange: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
    console.log(`formData.${field} 更新为:`, e.detail.value); // 调试用
  },

  loadPetData: function (id) {
    // 实际开发中：根据ID调用后端API获取宠物详情填充表单
    console.log('加载宠物数据进行编辑，ID:', id);
    wx.showLoading({ title: '加载宠物数据...' });
    // 模拟数据
    setTimeout(() => {
      let loadedData = {};
      if (id === 'p1') { // 模拟加载小黄的数据
        loadedData = {
          avatar: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/default_pet_avatar.png',
          name: '小黄',
          species: '中华田园犬',
          gender: 'male',
          age: '1岁以内',
          isNeutered: false,
          character: '活泼好动，喜欢和人玩，有点调皮。',
          healthStatus: '良好，已完成所有基础疫苗和驱虫。'
        };
      } else if (id === 'p2') { // 模拟加载大花的数据
        loadedData = {
          avatar: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/images/default_pet_avatar_2.png',
          name: '大花',
          species: '布偶猫',
          gender: 'female',
          age: '2岁以上',
          isNeutered: true,
          character: '安静粘人，喜欢晒太阳，对陌生人有点害羞。',
          healthStatus: '健康，定期体检，已绝育并植入芯片。'
        };
      } else {
        console.warn('未找到匹配宠物ID的模拟数据，ID:', id);
        loadedData = { // 默认空数据
          avatar: '', name: '', species: '', gender: 'male', age: '',
          isNeutered: false, character: '', healthStatus: ''
        };
      }

      this.setData({
        formData: loadedData
      });
      wx.hideLoading();
      console.log('宠物数据加载完成:', this.data.formData);
    }, 500);
  },

  chooseImage: function () {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          'formData.avatar': tempFilePath
        });
        // 实际开发中：需要将图片上传到服务器，获取图片URL
        console.log('图片选择成功，临时路径:', tempFilePath);
        // wx.uploadFile({ ... });
      },
      fail: (err) => {
        console.error("选择图片失败:", err);
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  submitPet: function (e) {
    // ⚠️ 注意：form-type="submit" 提交的 e.detail.value 只包含带有 name 属性的组件值。
    // formData.avatar 不会通过 e.detail.value 传递，因为它没有 name 属性。
    // formData.isNeutered 的值来自 switch，如果name="isNeutered"，它会包含在e.detail.value中，
    // 但为了确保万无一失，我们直接使用 this.data.formData 的最新状态。

    const finalData = this.data.formData; // 获取最新的 formData 状态

    // 进行简单的表单验证
    if (!finalData.name) {
      wx.showToast({ title: '请输入宠物昵称', icon: 'none' });
      return;
    }
    if (!finalData.species) {
      wx.showToast({ title: '请输入宠物品种', icon: 'none' });
      return;
    }
    // 可以在这里添加更多验证逻辑

    console.log('最终提交的宠物数据:', finalData);

    wx.showLoading({ title: '保存中...' });

    // 实际开发中：
    if (this.data.isEditMode) {
      // 调用后端API更新宠物信息 (PUT/POST)
      console.log('更新宠物信息，ID:', this.data.petId, '数据:', finalData);
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({ title: '宠物信息更新成功', icon: 'success' });
        // 成功后返回上一页或我的宠物档案页
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }, 1500);
    } else {
      // 调用后端API添加新宠物 (POST)
      console.log('添加新宠物，数据:', finalData);
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({ title: '新宠物添加成功', icon: 'success' });
        // 成功后返回上一页或我的宠物档案页
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }, 1500);
    }
  }
});