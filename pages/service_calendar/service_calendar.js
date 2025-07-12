Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    dates: [],
    selectedDate: '',
    serviceId: '',
    serviceInfo: null,
    hasSlot: false,
    isPastDate: false,
    slotData: {},
    formData: {
      capacity: 0,
      price: 0,
      status: 'available'
    },
    slotCache: {},
    statusOptions: [
      { value: 'available', label: '可预约' },
      { value: 'locked', label: '锁定' }
    ],
    slotStatusText: {
      available: '可预约',
      locked: '锁定',
      expired: '已过期'
    }
  },

  onLoad: function (options) {
    this.setData({ 
      serviceId: options.serviceId,
      slotCache: {}
    });
    this.initCalendar();
    this.loadServiceInfo();
  },

  initCalendar: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = this.formatDate(now);
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: todayStr
    });
    
    this.generateCalendarDates(year, month);
    this.selectDate({ currentTarget: { dataset: { date: todayStr } } });
  },

  loadServiceInfo: function() {
    wx.cloud.callFunction({
      name: 'services',
      data: {
          type: 'getService',
          data: {
            serviceId: this.data.serviceId
          }
      },
      success: res => {
        this.setData({ serviceInfo: res.result.data }, () => {
          // 确保 serviceInfo 更新后，重新加载当前选中的日期数据
          if (this.data.selectedDate) {
            this.selectDate({ currentTarget: { dataset: { date: this.data.selectedDate } } });
          }
        });
      },
      fail: err => {
        console.error('获取服务信息失败:', err);
      }
    });
  },

  generateCalendarDates: function (year, month) {
    const dates = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 填充上月日期
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDate = new Date(year, month - 1, 0);
      prevMonthDate.setDate(prevMonthDate.getDate() - i + 1);
      const dateStr = this.formatDate(prevMonthDate);
      dates.push({ 
        day: prevMonthDate.getDate(), 
        date: dateStr, 
        isCurrentMonth: false,
        hasSlot: false
      });
    }

    // 填充本月日期
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month - 1, i);
      const dateStr = this.formatDate(date);
      
      dates.push({ 
        day: i, 
        date: dateStr, 
        isCurrentMonth: true,
        hasSlot: false
      });
    }

    // 填充下月日期
    const initialCells = dates.length;
    const totalRows = Math.ceil(initialCells / 7);
    const remainingCells = (totalRows * 7) - initialCells; 
    
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(year, month, i);
      const dateStr = this.formatDate(nextMonthDate);
      dates.push({ 
        day: i, 
        date: dateStr, 
        isCurrentMonth: false,
        hasSlot: false
      });
    }

    this.loadMonthSlots(year, month);
    this.setData({ dates: dates });
  },

  handleCapacityChange: function(e) {
    this.setData({
      'formData.capacity': e.detail.value
    });
  },

  handlePriceChange: function(e) {
    this.setData({
      'formData.price': e.detail.value
    });
  },

  handleStatusChange: function(e) {
    this.setData({
      'formData.status': e.detail.value
    });
  },

  submitSlot: function() {
    const { serviceId, selectedDate, slotData, formData, hasSlot } = this.data;

    const [year, month] = selectedDate.split('-');
    const cacheKey = `${year}-${String(month).padStart(2, '0')}`
  
    const requestData = hasSlot ? {
      type: 'updateServiceSlot',
      data: {
        serviceSlotId: slotData.serviceSlotId,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        status: formData.status
      }
    } : {
      type: 'createServiceSlot',
      data: {
        serviceId: serviceId, 
        date: selectedDate,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        status: formData.status
      }
    };
  
    wx.cloud.callFunction({
      name: 'services',
      data: requestData,
      success: res => {
        wx.showToast({ 
          title: hasSlot ? '更新成功' : '创建成功', 
          icon: 'success' 
        });

        const newSlotData = res.result.data
  
        this.setData({ 
          hasSlot: true,
          slotData: newSlotData
        });
  
        this.processSlotData(newSlotData, selectedDate);

        // 更新slotCache
        const slotsForMonth = this.data.slotCache[cacheKey] || [];
        const indexToRemove = slotsForMonth.findIndex(slot => 
          slot.startDateTime.includes(selectedDate)
        );
        if (indexToRemove !== -1) {
          slotsForMonth.splice(indexToRemove, 1);
        }
        slotsForMonth.push(newSlotData);

        // 更新dates-hasSlot
        const newDates = this.data.dates.map(item =>
          item.date === selectedDate
            ? { ...item, hasSlot: true }
            : item
        );

        this.setData({
          dates: newDates,
          [`slotCache.${cacheKey}`]: slotsForMonth
        });

      },
      fail: err => {
        console.error('云函数 ServiceSlot 失败:', err);
        wx.showToast({ 
          title: hasSlot ? '更新失败' : '创建失败', 
          icon: 'none' 
        });
      }
    });
  },

  checkIsPastDate: function(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today;
  },

  prevMonth: function () {
    let year = this.data.currentYear;
    let month = this.data.currentMonth - 1;
    if (month === 0) {
      month = 12;
      year--;
    }
    this.setData({ currentYear: year, currentMonth: month });
    this.generateCalendarDates(year, month);
  },

  nextMonth: function () {
    let year = this.data.currentYear;
    let month = this.data.currentMonth + 1;
    if (month === 13) {
      month = 1;
      year++;
    }
    this.setData({ currentYear: year, currentMonth: month });
    this.generateCalendarDates(year, month);
  },

  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  processSlotData(slotData, date) {
    const isPast = this.checkIsPastDate(date);
    const hasSlot = !!slotData;

    const formData = hasSlot ? {
      capacity: slotData.capacity,
      price: slotData.price,
      status: slotData.status
    } : {
      capacity: this.data.serviceInfo?.baseCapacity || 0,
      price: this.data.serviceInfo?.basePrice || 0,
      status: 'available'
    };

    this.setData({
      hasSlot: hasSlot,
      isPastDate: isPast,
      formData: formData
    });
  },

  async selectDate(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;
  
    this.setData({ selectedDate: date });

    const [year, month] = date.split('-');
    const cacheKey = `${year}-${String(month).padStart(2, '0')}`
    const targetSlot = this.data.slotCache[cacheKey]?.find(slot => 
      slot.startDateTime.includes(date)
    );

    this.setData({
      slotData: targetSlot || ''
    })

    this.processSlotData(this.data.slotData, date);
  },

  async loadMonthSlots(year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    end.setHours(23, 59, 59, 999);
  
    const res = await wx.cloud.callFunction({
      name: 'services',
      data: {
        type: 'getMonthSlots',
        data: {
          serviceId: this.data.serviceId,
          start: start.getTime(),
          end: end.getTime()
        }
      }
    });
    
    // 更新 dates 中的 hasSlot
    let resultData = res.result.data
    const hasSlotDates = resultData.map(item => item.startDateTime.slice(0, 10));
    const newDates = this.data.dates.map(item => ({
      ...item,
      hasSlot: hasSlotDates.includes(item.date)
    }));

    this.setData({ 
      dates: newDates,
      slotCache: {
        ...this.data.slotCache,
        [`${year}-${String(month).padStart(2, '0')}`]: res.result.data
      }
    });
  }
});