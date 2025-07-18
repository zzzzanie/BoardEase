// pages/pet_archive/pet_archive.js
Page({
  data: {
    pet: {},
    fosterRecords: []
  },

  onLoad: function (options) {
    const petId = options.id; // 接收从上一页传递过来的宠物ID
    if (petId) {
      this.loadPetDetail(petId); // 根据ID加载宠物详情
    } else {
      wx.showToast({
        title: '宠物ID缺失，无法加载档案',
        icon: 'none'
      });
      // 可以选择返回上一页或者显示一个空状态
      // setTimeout(() => { wx.navigateBack(); }, 1500);
    }
  },

  loadPetDetail: function (petId) {
    console.log('正在加载宠物ID:', petId, '的详情...');
    const db = wx.cloud.database();
    db.collection('pet').where({ petId }).get({
      success: res => {
        if (res.data && res.data.length > 0) {
          this.setData({
            pet: res.data[0],
            fosterRecords: [] // fosterRecords 仍用空或后续接入真实数据
          });
          console.log('宠物档案加载完成:', res.data[0].nickname);
        } else {
          wx.showToast({ title: '未找到该宠物', icon: 'none' });
          this.setData({ pet: {}, fosterRecords: [] });
        }
      },
      fail: err => {
        console.error('获取宠物详情失败', err);
        wx.showToast({ title: '宠物详情加载失败', icon: 'none' });
        this.setData({ pet: {}, fosterRecords: [] });
      }
    });
  },

  goToEditPet: function () {
    // 确保跳转时也传递当前宠物的ID，以便编辑页面加载正确的数据
    if (this.data.pet.id) {
      wx.navigateTo({
        url: `/pages/add_pet/add_pet?id=${this.data.pet.id}`
      });
    } else {
      wx.showToast({
        title: '宠物信息缺失，无法编辑',
        icon: 'none'
      });
    }
  }
});