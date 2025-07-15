const today = new Date();
const pad = n => n < 10 ? '0' + n : n;
const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

// 初始化云开发环境
wx.cloud.init({
  env: 'cloudbase-5gkjpend4a9022ba'
});

Page({
  data: {
    // 区域
    regions: ['不限', '福田区', '南山区', '罗湖区', '宝安区', '龙岗区', '龙华区', '盐田区', '坪山区', '光明区', '大鹏新区'],
    regionIndex: 0,
    address: '科兴科学园',
    // 日期 - 修改：结束日期初始为空
    minDate: formatDate(today),
    maxDate: formatDate(oneYearLater),
    checkInDate: formatDate(today),
    checkOutDate: '', // 初始为空
    days: 0, // 初始为0
    // 预算 - 修改为默认最高值
    budgetValue: 300,
    // 寄养方式及特征
    fosterTypeOptions: [
      { label: '独立房间', value: '独立房间' },
      { label: '宠物医院', value: '宠物医院' },
      { label: '家庭寄养', value: '家庭寄养' },
      { label: '多宠寄养', value: '多宠寄养' },
      { label: '全天监控', value: '全天监控' },
      { label: '定期返图', value: '定期返图' },
      { label: '点评高分', value: 'highScore' },
      { label: '长期折扣', value: 'longDiscount' }
    ],
    selectedFosterTypes: [],
    // 宠物选择
    pets: [],
    selectedPet: null,
    showPetPicker: false,
    showBasicInsuranceModal: false,
    // 商家列表
    merchants: [],
    filteredMerchants: []
  },

  onLoad() {
    this.getMerchantsFromCloud();
    this.updateDays();
    this.loadPets();
  },

  // 从云数据库中获取商家数据
  getMerchantsFromCloud() {
    wx.showLoading({ title: '加载商家信息...' });
    
    const db = wx.cloud.database();
    db.collection('merchants').get({
      success: res => {
        console.log('商家数据加载成功:', res.data);
        this.setData({
          merchants: res.data || []
        });
        this.filterMerchants();
        wx.hideLoading();
      },
      fail: err => {
        console.error('获取商家数据失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '商家信息加载失败',
          icon: 'none'
        });
        
        // 如果加载失败，使用模拟数据作为备用
        this.setMockMerchants();
      }
    });
  },

  // 设置模拟商家数据（当云数据库加载失败时使用）
  setMockMerchants() {
    const mockMerchants = [
      {
        id: 1,
        name: '萌宠诊所',
        logo: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/logo_1.png',
        img: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/logo_1.png',
        certified: true,
        petTypes: '全猫种',
        fosterType: '独立房间、宠物医院',
        fosterTypeArr: ['独立房间', '宠物医院'],
        maxPet: 8,
        desc: '宠物医院资质，安全放心。',
        address: '深圳市南山区科技园南区科兴科学园A栋1楼',
        district: '南山区',
        fullDesc: '我们是一家专业的宠物医疗寄养机构，拥有独立的寄养房间和24小时监控系统。',
        cannotFoster: '患有传染病的宠物、攻击性强的宠物、未接种疫苗的宠物',
        environment: [
          'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/env_1_1.png',
          'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/env_1_2.png',
          'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/env_1_3.png'
        ],
        reviews: [
          { user: '张女士', score: 5, content: '医生很专业，环境很干净，我家狗狗很喜欢这里！', date: '2024-01-15' },
          { user: '李先生', score: 4, content: '服务不错，就是价格稍贵，但值得信赖。', date: '2024-01-10' }
        ],
        price: 60,
        price2: 140,
        distance: '1.2km',
        score: '4.5',
        highScore: true,
        longDiscount: false,
        unavailableDates: [],
        services: [
          { name: '基础寄养', price: 60, desc: '标准寄养服务，包含基础护理' },
          { name: '豪华寄养', price: 95, desc: '升级寄养服务，包含专业护理和营养餐' },
          { name: 'VIP寄养', price: 140, desc: '高端寄养服务，包含一对一护理和豪华套房' }
        ]
      }
    ];
    
    this.setData({
      merchants: mockMerchants
    });
    this.filterMerchants();
  },

  // 计算天数
  updateDays() {
    if (!this.data.checkInDate || !this.data.checkOutDate) {
      this.setData({ days: 0 });
      return;
    }
    const s = new Date(this.data.checkInDate);
    const e = new Date(this.data.checkOutDate);
    const days = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    this.setData({ days });
  },

  // 加载宠物数据
  loadPets() {
    wx.showLoading({ title: '加载宠物信息...' });
    
    wx.cloud.database().collection('pet').get({
      success: (res) => {
        console.log('宠物数据加载成功:', res.data);
        this.setData({
          pets: res.data || []
        });
        wx.hideLoading();
      },
      fail: (err) => {
        console.error('宠物数据加载失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '宠物信息加载失败',
          icon: 'none'
        });
        
        // 如果加载失败，使用模拟数据
        this.setMockPets();
      }
    });
  },

  // 设置模拟宠物数据（当云数据库加载失败时使用）
  setMockPets() {
    const mockPets = [
      {
        _id: 'pet1',
        nickname: '小白',
        size: '小型',
        type: '猫',
        avatar: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/default_pet_avatar.png'
      },
      {
        _id: 'pet2',
        nickname: '旺财',
        size: '中型',
        type: '狗',
        avatar: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/default_pet_avatar_2.png'
      },
      {
        _id: 'pet3',
        nickname: '咪咪',
        size: '小型',
        type: '猫',
        avatar: 'https://636c-cloudbase-5gkjpend4a9022ba-1366660379.tcb.qcloud.la/default_pet_avatar.png'
      }
    ];
    
    this.setData({
      pets: mockPets
    });
  },



  // 检查日期是否在商家不可接单日期范围内
  isDateUnavailable(merchant, checkInDate, checkOutDate) {
    if (!merchant.unavailableDates || merchant.unavailableDates.length === 0) {
      return false;
    }
    
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    for (let date of merchant.unavailableDates) {
      const unavailableDate = new Date(date);
      // 如果不可接单日期在寄养期间内，则不可选择该商家
      if (unavailableDate >= start && unavailableDate <= end) {
        return true;
      }
    }
    
    return false;
  },

  // 地址输入
  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },

  // 区域选择
  onRegionChange(e) {
    this.setData({ regionIndex: e.detail.value });
    this.filterMerchants();
  },

  // 切换位置（可选，弹出区域选择）
  onSwitchDistrict() {
    wx.showActionSheet({
      itemList: this.data.regions,
      success: (res) => {
        this.setData({ regionIndex: res.tapIndex });
        this.filterMerchants();
      }
    });
  },

  // 入住日期
  onCheckInDateChange(e) {
    const checkInDate = e.detail.value;
    const checkOutDate = this.data.checkOutDate;
    
    // 如果结束日期不为空，检查开始日期是否晚于结束日期
    if (checkOutDate && checkInDate > checkOutDate) {
      wx.showToast({ 
        title: '入住日期不能晚于接回日期', 
        icon: 'none' 
      });
      return;
    }
    
    this.setData({ checkInDate }, () => {
      this.updateDays();
      this.filterMerchants();
    });
  },
  // 接回日期
  onCheckOutDateChange(e) {
    const checkOutDate = e.detail.value;
    const checkInDate = this.data.checkInDate;
    
    // 检查结束日期是否早于开始日期
    if (checkOutDate < checkInDate) {
      wx.showToast({ 
        title: '接回日期不能早于入住日期', 
        icon: 'none' 
      });
      return;
    }
    
    this.setData({ checkOutDate }, () => {
      this.updateDays();
      this.filterMerchants();
    });
  },

  // 预算滑动条
  onBudgetSliderChange(e) {
    this.setData({ budgetValue: Number(e.detail.value) });
    this.filterMerchants();
  },

  // 寄养方式条件筛选（多选，点击切换）
  onToggleFosterType(e) {
    console.log('点击事件触发:', e); // 调试信息
    const value = e.currentTarget.dataset.value;
    console.log('点击的值:', value); // 调试信息
    console.log('当前选中状态:', this.data.selectedFosterTypes); // 调试信息
    
    let selected = this.data.selectedFosterTypes.slice();
    const idx = selected.indexOf(value);
    console.log('查找索引:', idx); // 调试信息
    
    if (idx > -1) {
      selected.splice(idx, 1);
      console.log('移除项目'); // 调试信息
    } else {
      selected.push(value);
      console.log('添加项目'); // 调试信息
    }
    console.log('选中状态更新:', selected); // 调试信息
    
    this.setData({ selectedFosterTypes: selected }, () => {
      console.log('setData完成，当前选中状态:', this.data.selectedFosterTypes); // 调试信息
      this.filterMerchants(); // 更新选中状态后立即重新筛选
    });
  },

  // 移除已选择的筛选条件
  onRemoveFilter(e) {
    const value = e.currentTarget.dataset.value;
    let selected = this.data.selectedFosterTypes.slice();
    const idx = selected.indexOf(value);
    if (idx > -1) {
      selected.splice(idx, 1);
      this.setData({ selectedFosterTypes: selected }, () => {
        this.filterMerchants();
      });
    }
  },

  // 选择寄养宝贝
  onChoosePet() {
    if (this.data.pets.length === 0) {
      wx.showToast({
        title: '暂无宠物信息',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showPetPicker: true
    });
  },

  // 关闭宠物选择器
  onClosePetPicker() {
    this.setData({
      showPetPicker: false
    });
  },

  // 选择宠物
  onSelectPet(e) {
    const petId = e.currentTarget.dataset.id;
    const selectedPet = this.data.pets.find(pet => pet._id === petId);
    
    if (selectedPet) {
      this.setData({
        selectedPet,
        showPetPicker: false
      });
      
      // 将选中的宠物信息存储到Storage中，供后续页面使用
      wx.setStorageSync('selectedPet', selectedPet);
    }
  },

  // 显示基础保险详情
  onShowBasicInsurance() {
    this.setData({ showBasicInsuranceModal: true });
  },

  // 关闭基础保险弹窗
  onCloseBasicInsuranceModal() {
    this.setData({ showBasicInsuranceModal: false });
  },

  // 查找按钮
  onSearch() {
    // 检查是否选择了接回日期
    if (!this.data.checkOutDate) {
      wx.showToast({
        title: '请选择接回日期',
        icon: 'none'
      });
      return;
    }
    
    this.filterMerchants();
  },

  // 商家筛选
  filterMerchants() {
    const { merchants, regionIndex, regions, budgetValue, selectedFosterTypes, checkInDate, checkOutDate, selectedPet } = this.data;
    let filtered = merchants.filter(m => {
      // 区域
      if (regionIndex !== 0 && regions[regionIndex] !== '不限' && m.district !== regions[regionIndex]) {
        return false;
      }
      // 预算
      if (m.price > budgetValue) return false;
      
      // 宠物类型筛选（如果商家数据中有petTypes字段）
      if (selectedPet && selectedPet.type && m.petTypes) {
        const petType = selectedPet.type;
        const petTypesStr = m.petTypes || '';
        
        // 判断宠物是猫还是狗
        const catBreeds = ['美短', '英短', '布偶', '波斯猫', '暹罗', '美国短毛'];
        const dogBreeds = ['金毛', '比熊', '柯基', '柴犬', '拉布拉多'];
        
        let isCat = false;
        let isDog = false;
        
        // 检查宠物品种
        if (catBreeds.includes(petType)) {
          isCat = true;
        } else if (dogBreeds.includes(petType)) {
          isDog = true;
        }
        
        // 根据宠物类型过滤商家
        if (isCat) {
          // 如果选的是猫，排除全犬种的商家
          if (petTypesStr.includes('全犬种')) {
            return false;
          }
        } else if (isDog) {
          // 如果选的是狗，排除全猫种的商家
          if (petTypesStr.includes('全猫种')) {
            return false;
          }
        }
      }
      
      // 日期筛选：如果选择了开始和结束日期，检查商家是否在不可接单日期范围内
      if (checkInDate && checkOutDate && m.unavailableDates) {
        if (this.isDateUnavailable(m, checkInDate, checkOutDate)) {
          console.log(`商家 ${m.name} 在 ${checkInDate} 至 ${checkOutDate} 期间不可接单`);
          return false;
        }
      }
      
      // 寄养方式和特征
      if (selectedFosterTypes.length > 0) {
        let match = true;
        for (let type of selectedFosterTypes) {
          if (
            type === 'highScore' && !m.highScore ||
            type === 'longDiscount' && !m.longDiscount ||
            (type !== 'highScore' && type !== 'longDiscount' && m.fosterTypeArr && m.fosterTypeArr.indexOf(type) === -1)
          ) {
            match = false;
            break;
          }
        }
        if (!match) return false;
      }
      return true;
    });
    
    console.log(`筛选结果：共 ${filtered.length} 个商家符合条件`);
    this.setData({ filteredMerchants: filtered });
  },

  // 跳转到商家详情
  onMerchantTap(e) {
    // 检查是否选择了寄养宝贝
    if (!this.data.selectedPet) {
      wx.showToast({
        title: '请先选择寄养宝贝',
        icon: 'none'
      });
      return;
    }
    
    const id = e.currentTarget.dataset.id;
    const merchant = this.data.filteredMerchants.find(m => m.id == id);
    
    // 将筛选条件传递给商家详情页
    const filterData = {
      checkInDate: this.data.checkInDate,
      checkOutDate: this.data.checkOutDate,
      days: this.data.days
    };
    
    wx.setStorageSync('filterData', filterData);
    
    wx.navigateTo({
      url: `/pages/merchant_detail/merchant_detail?merchant=${encodeURIComponent(JSON.stringify(merchant))}`
    });
  },

  // 返回首页
  onBack() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});