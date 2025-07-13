const today = new Date();
const pad = n => n < 10 ? '0' + n : n;
const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

// 初始化云开发环境
wx.cloud.init();

Page({
  data: {
    merchant: {},
    selectedService: {},
    selectedServiceIndex: 0,
    checkInDate: formatDate(today),
    checkOutDate: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // 默认7天后
    minDate: formatDate(today),
    maxDate: formatDate(oneYearLater),
    days: 7, // 默认7天
    petInfo: null,
    petInfoDisplay: '',
    userName: '',
    userPhone: '',
    insuranceChecked: true,
    showProInsuranceModal: false,
    remark: '',
    serviceFee: 0,
    platformFee: 0,
    insuranceFee: 9.9,
    totalFee: 0,
    // 新增：长期折扣、优惠券、积分
    longDiscountAmount: 0,
    showCouponModal: false,
    selectedCoupon: null,
    couponDiscountAmount: 0,
    userPoints: 500, // 默认500积分
    usePoints: false,
    pointsDiscountAmount: 0
  },

  onLoad(options) {
    // 获取 foster 页面的日期
    let checkInDate = options.checkInDate;
    let checkOutDate = options.checkOutDate;
    
    // 如果没有参数，尝试从Storage获取
    if (!checkInDate || !checkOutDate) {
      const filterData = wx.getStorageSync('filterData') || {};
      checkInDate = filterData.checkInDate || formatDate(today);
      checkOutDate = filterData.checkOutDate || formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
    }

    // 获取商家和服务项目
    let merchant = {};
    if (options.merchant) {
      merchant = JSON.parse(decodeURIComponent(options.merchant));
    } else {
      merchant = wx.getStorageSync('selectedMerchant') || {};
    }
    let selectedServiceIndex = Number(options.serviceIndex) || 0;
    const selectedService = merchant.services ? merchant.services[selectedServiceIndex] : {};

    // 获取 foster 页面的宠物信息（假设 foster/pet_archive 选择后用 Storage 传递）
    let petInfo = wx.getStorageSync('selectedPet') || null;
    let petInfoDisplay = petInfo
      ? `${petInfo.nickname}，${petInfo.type}，${petInfo.gender}`
      : '未选择';

    // 计算天数和费用
    const days = this.calcDays(checkInDate, checkOutDate);
    let serviceFee = selectedService.price * days;
    let longDiscountAmount = 0;
    
    // 检查长期折扣（汪汪医院或宠物驿站，超过15天给予10%折扣）
    if (days >= 15 && (merchant.name === '汪汪医院' || merchant.name === '宠物驿站')) {
      longDiscountAmount = serviceFee * 0.1; // 10%折扣
      serviceFee = serviceFee * 0.9;
    }
    
    const platformFee = (serviceFee * 0.005).toFixed(2);
    const insuranceFee = '9.90'; // 默认勾选保险，所以初始费用为9.90
    const totalFee = (parseFloat(serviceFee) + parseFloat(platformFee) + parseFloat(insuranceFee)).toFixed(2);

    this.setData({
      merchant,
      selectedService,
      selectedServiceIndex,
      checkInDate,
      checkOutDate,
      days,
      petInfo,
      petInfoDisplay,
      serviceFee: serviceFee.toFixed(2),
      platformFee,
      insuranceFee,
      longDiscountAmount: longDiscountAmount.toFixed(2)
    }, () => {
      // 重新计算总费用（包含所有折扣）
      this.calculateTotalFee();
    });
  },

  // 计算天数
  calcDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
  },

  // 入住日期修改
  onCheckInDateChange(e) {
    const checkInDate = e.detail.value;
    const checkOutDate = this.data.checkOutDate;
    
    // 判断入住日期是否晚于接回日期
    if (checkInDate > checkOutDate) {
      wx.showToast({ 
        title: '入住日期不能晚于接回日期', 
        icon: 'none' 
      });
      return;
    }
    
    const days = this.calcDays(checkInDate, checkOutDate);
    this.updateFee(this.data.selectedServiceIndex, checkInDate, checkOutDate, days, this.data.insuranceChecked);
  },
  // 接回日期修改
  onCheckOutDateChange(e) {
    const checkOutDate = e.detail.value;
    const checkInDate = this.data.checkInDate;
    
    // 判断接回日期是否早于入住日期
    if (checkOutDate < checkInDate) {
      wx.showToast({ 
        title: '接回日期不能早于入住日期', 
        icon: 'none' 
      });
      return;
    }
    
    const days = this.calcDays(checkInDate, checkOutDate);
    this.updateFee(this.data.selectedServiceIndex, checkInDate, checkOutDate, days, this.data.insuranceChecked);
  },

  // 服务项目选择
  onSelectService(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.updateFee(index, this.data.checkInDate, this.data.checkOutDate, this.data.days, this.data.insuranceChecked);
  },

  // 保险选择
  onInsuranceChange(e) {
    const checked = e.detail.value.length > 0;
    this.updateFee(this.data.selectedServiceIndex, this.data.checkInDate, this.data.checkOutDate, this.data.days, checked);
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 用户姓名输入
  onUserNameInput(e) {
    this.setData({ userName: e.detail.value });
  },

  // 用户手机号输入
  onUserPhoneInput(e) {
    this.setData({ userPhone: e.detail.value });
  },

  // 显示专业保险详情
  onShowProInsurance() {
    this.setData({ showProInsuranceModal: true });
  },

  // 关闭专业保险弹窗
  onCloseProInsuranceModal() {
    this.setData({ showProInsuranceModal: false });
  },

  // 显示优惠券选择弹窗
  onShowCouponModal() {
    this.setData({ showCouponModal: true });
  },

  // 关闭优惠券选择弹窗
  onCloseCouponModal() {
    this.setData({ showCouponModal: false });
  },

  // 选择优惠券
  onSelectCoupon(e) {
    const couponType = e.currentTarget.dataset.type;
    const selectedCoupon = {
      type: couponType,
      name: couponType === 'newUser' ? '新人折扣' : '拉新折扣',
      discount: 0.05 // 5%折扣
    };
    
    this.setData({ 
      selectedCoupon,
      showCouponModal: false
    });
    
    this.calculateTotalFee();
  },

  // 取消优惠券
  onCancelCoupon() {
    this.setData({ 
      selectedCoupon: null,
      couponDiscountAmount: 0
    });
    
    this.calculateTotalFee();
  },

  // 积分使用切换
  onTogglePoints() {
    const usePoints = !this.data.usePoints;
    this.setData({ usePoints });
    this.calculateTotalFee();
  },

  // 计算总费用（包含所有折扣）
  calculateTotalFee() {
    const { 
      serviceFee, 
      platformFee, 
      insuranceFee, 
      longDiscountAmount, 
      selectedCoupon, 
      usePoints, 
      userPoints 
    } = this.data;
    
    let totalFee = parseFloat(serviceFee) + parseFloat(platformFee) + parseFloat(insuranceFee);
    
    // 减去长期折扣
    if (parseFloat(longDiscountAmount) > 0) {
      totalFee -= parseFloat(longDiscountAmount);
    }
    
    // 减去优惠券折扣
    let couponDiscountAmount = 0;
    if (selectedCoupon) {
      couponDiscountAmount = totalFee * selectedCoupon.discount;
      totalFee -= couponDiscountAmount;
    }
    
    // 减去积分折扣
    let pointsDiscountAmount = 0;
    if (usePoints && userPoints >= 500) {
      pointsDiscountAmount = 5; // 500积分抵扣5元
      totalFee -= pointsDiscountAmount;
    }
    
    this.setData({
      totalFee: totalFee.toFixed(2),
      couponDiscountAmount: couponDiscountAmount.toFixed(2),
      pointsDiscountAmount: pointsDiscountAmount.toFixed(2)
    });
  },

  // 统一更新费用
  updateFee(serviceIndex, checkInDate, checkOutDate, days, insuranceChecked) {
    const selectedService = this.data.merchant.services[serviceIndex];
    let serviceFee = selectedService.price * days;
    let longDiscountAmount = 0;
    
    // 检查长期折扣（汪汪医院或宠物驿站，超过15天给予10%折扣）
    if (days >= 15 && (this.data.merchant.name === '汪汪医院' || this.data.merchant.name === '宠物驿站')) {
      longDiscountAmount = serviceFee * 0.1; // 10%折扣
      serviceFee = serviceFee * 0.9;
    }
    
    const platformFee = Math.round(serviceFee * 0.005 * 100) / 100;
    const insuranceFee = insuranceChecked ? 9.9 : 0;
    const totalFee = (serviceFee + platformFee + insuranceFee).toFixed(2);
    this.setData({
      selectedServiceIndex: serviceIndex,
      selectedService,
      checkInDate,
      checkOutDate,
      days,
      serviceFee: serviceFee.toFixed(2),
      platformFee,
      insuranceFee,
      insuranceChecked,
      longDiscountAmount: longDiscountAmount.toFixed(2)
    }, () => {
      // 重新计算总费用（包含所有折扣）
      this.calculateTotalFee();
    });
  },

  // 提交订单
  onSubmitOrder() {
    if (!this.data.userName || !this.data.userPhone) {
      wx.showToast({ title: '请填写姓名和联系方式', icon: 'none' });
      return;
    }

    // 计算订单时长
    const start = new Date(this.data.checkInDate);
    const end = new Date(this.data.checkOutDate);
    const orderTime = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    // 组织要上传到云数据库的订单信息
    const orderData1 = {
      // 这里 _id 由云数据库自动生成，不用手动设置
      discount: 0, // 假设无折扣
      endDateTime: this.data.checkOutDate,
      orderNote: this.data.remark,
      orderTime: orderTime,
      payment: 'wechat', // 初始状态未支付
      //petId: this.data.petInfo.petId,
      serviceId:this.data.selectedService.serviceId,
      startDateTime: this.data.checkInDate,
      status: 'processing',
      subTotal: parseFloat(this.data.serviceFee) + parseFloat(this.data.platformFee),
      totalPrice: parseFloat(this.data.totalFee)
    };

    const selectedServiceIndex = this.data.selectedServiceIndex;
    const orderData2 = {
      merchantName: this.data.merchant.name,
      serviceName: this.data.selectedService.name,
      checkInDate: this.data.checkInDate,
      checkOutDate: this.data.checkOutDate,
      days: orderTime,
      petInfoDisplay: this.data.petInfoDisplay,
      userName: this.data.userName,
      userPhone:this.data.userPhone ,
      totalFee: parseFloat(this.data.totalFee)
    }

    // 将订单信息插入到云数据库的 orders 集合中
    wx.cloud.database().collection('orders').add({
      data: orderData1,
      success: res => {
        console.log('订单插入成功', res);
        wx.setStorageSync('lastOrder', orderData2);
        wx.navigateTo({
          url: '/pages/order_success/order_success'
        });
      },
      fail: err => {
        console.error('订单插入失败', err);
        wx.showToast({ title: '订单提交失败，请稍后重试', icon: 'none' });
      }
    });
  }
});