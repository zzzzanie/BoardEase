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

    let petData = {};
    let fosterRecordsData = [];

    // --- 根据 petId 返回不同的模拟数据 ---
    if (petId === 'p1') {
      petData = {
        id: 'p1',
        name: '小黄',
        gender: 'male',
        age: '1岁以内',
        isNeutered: false,
        avatar: '/images/default_pet_avatar.png', // 确保你有这张图
        species: '中华田园犬',
        birthdate: '2024-03-15',
        character: '活泼好动，喜欢和人玩，有点调皮。',
        healthStatus: '良好，已完成所有基础疫苗和驱虫。'
      };
      fosterRecordsData = [
        { id: 'r1-1', startDate: '2024-05-01', endDate: '2024-05-07', sellerName: '阳光宠物之家' },
        { id: 'r1-2', startDate: '2024-01-10', endDate: '2024-01-15', sellerName: '萌宠乐园' }
      ];
    } else if (petId === 'p2') {
      petData = {
        id: 'p2',
        name: '大花',
        gender: 'female',
        age: '2岁以上',
        isNeutered: true,
        avatar: '/images/default_pet_avatar_2.png', // 确保你有这张图
        species: '布偶猫',
        birthdate: '2023-01-20',
        character: '安静粘人，喜欢晒太阳，对陌生人有点害羞。',
        healthStatus: '健康，定期体检，已绝育并植入芯片。'
      };
      fosterRecordsData = [
        { id: 'r2-1', startDate: '2024-06-01', endDate: '2024-06-05', sellerName: '喵喵之家' },
        { id: 'r2-2', startDate: '2024-03-20', endDate: '2024-03-25', sellerName: '宠物港湾' }
      ];
    } else {
      // 如果ID不匹配任何模拟数据，可以显示一个默认或错误状态
      console.warn('未找到匹配的宠物数据，ID:', petId);
      petData = {
        id: petId,
        name: '未知宠物',
        gender: '',
        age: '',
        isNeutered: false,
        avatar: '/images/default_pet_avatar.png',
        species: '未知',
        birthdate: '未知',
        character: '无',
        healthStatus: '无'
      };
      fosterRecordsData = [];
    }

    // 模拟网络请求延迟
    setTimeout(() => {
      this.setData({
        pet: petData,
        fosterRecords: fosterRecordsData
      });
      console.log('宠物档案加载完成:', this.data.pet.name);
    }, 500);
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