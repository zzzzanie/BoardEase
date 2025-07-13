// pages/seller_settings/seller_settings.js
const today = new Date();
const pad = n => n < 10 ? '0' + n : n;
const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

Page({
  data: {
    selectedDate: '',
    minDate: formatDate(today),
    maxDate: formatDate(oneMonthLater),
    unavailableDates: [],
    autoAccept: true,
    notifications: true
  },

  onLoad(options) {
    this.loadSettings();
  },

  onShow() {
    this.loadSettings();
  },

  // 加载设置
  loadSettings() {
    // 从本地存储或云端加载设置
    const settings = wx.getStorageSync('sellerSettings') || {};
    this.setData({
      unavailableDates: settings.unavailableDates || [],
      autoAccept: settings.autoAccept !== false, // 默认开启
      notifications: settings.notifications !== false // 默认开启
    });
  },

  // 选择日期
  onDateSelect(e) {
    this.setData({
      selectedDate: e.detail.value
    });
  },

  // 添加不可接单日期
  onAddUnavailableDate() {
    const { selectedDate, unavailableDates } = this.data;
    
    if (!selectedDate) {
      wx.showToast({
        title: '请先选择日期',
        icon: 'none'
      });
      return;
    }

    // 检查日期是否已经存在
    if (unavailableDates.includes(selectedDate)) {
      wx.showToast({
        title: '该日期已设置为不可接单',
        icon: 'none'
      });
      return;
    }

    // 检查日期是否在今天之前
    const selected = new Date(selectedDate);
    if (selected < today) {
      wx.showToast({
        title: '不能设置过去的日期',
        icon: 'none'
      });
      return;
    }

    const newUnavailableDates = [...unavailableDates, selectedDate].sort();
    this.setData({
      unavailableDates: newUnavailableDates,
      selectedDate: ''
    });

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 删除不可接单日期
  onRemoveUnavailableDate(e) {
    const dateToRemove = e.currentTarget.dataset.date;
    const { unavailableDates } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${dateToRemove} 这个不可接单日期吗？`,
      success: (res) => {
        if (res.confirm) {
          const newUnavailableDates = unavailableDates.filter(date => date !== dateToRemove);
          this.setData({
            unavailableDates: newUnavailableDates
          });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 设置所有周末不可接单
  onSetWeekends() {
    wx.showModal({
      title: '批量设置',
      content: '确定要设置未来一个月内所有周末为不可接单日期吗？',
      success: (res) => {
        if (res.confirm) {
          const weekendDates = this.generateWeekendDates();
          this.setData({
            unavailableDates: weekendDates
          });
          
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 设置所有工作日不可接单
  onSetWeekdays() {
    wx.showModal({
      title: '批量设置',
      content: '确定要设置未来一个月内所有工作日为不可接单日期吗？',
      success: (res) => {
        if (res.confirm) {
          const weekdayDates = this.generateWeekdayDates();
          this.setData({
            unavailableDates: weekdayDates
          });
          
          wx.showToast({
            title: '设置成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空所有不可接单日期
  onClearAllDates() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有不可接单日期吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            unavailableDates: []
          });
          
          wx.showToast({
            title: '清空成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 生成周末日期
  generateWeekendDates() {
    const weekendDates = [];
    const current = new Date(today);
    
    while (current <= oneMonthLater) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 0是周日，6是周六
        weekendDates.push(formatDate(current));
      }
      current.setDate(current.getDate() + 1);
    }
    
    return weekendDates;
  },

  // 生成工作日日期
  generateWeekdayDates() {
    const weekdayDates = [];
    const current = new Date(today);
    
    while (current <= oneMonthLater) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 1-5是周一到周五
        weekdayDates.push(formatDate(current));
      }
      current.setDate(current.getDate() + 1);
    }
    
    return weekdayDates;
  },

  // 自动接单开关
  onAutoAcceptChange(e) {
    this.setData({
      autoAccept: e.detail.value
    });
  },

  // 通知开关
  onNotificationsChange(e) {
    this.setData({
      notifications: e.detail.value
    });
  },

  // 保存设置
  onSaveSettings() {
    const { unavailableDates, autoAccept, notifications } = this.data;
    
    const settings = {
      unavailableDates,
      autoAccept,
      notifications,
      lastUpdated: new Date().toISOString()
    };

    // 保存到本地存储
    wx.setStorageSync('sellerSettings', settings);
    
    // 这里可以添加保存到云端的逻辑
    // wx.cloud.database().collection('sellerSettings').doc('current').set({
    //   data: settings
    // });

    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    });
  }
});