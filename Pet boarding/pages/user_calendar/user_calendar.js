// pages/user_calendar/user_calendar.js
Page({
  data: {
    currentYear: 0,
    currentMonth: 0,
    dates: [], // 日历日期数组
    selectedDate: '', // 选中日期 'YYYY-MM-DD'
    selectedDateEvents: [] // 选中日期的事件
  },

  onLoad: function () {
    this.initCalendar();
  },

  initCalendar: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() 返回 0-11
    const todayStr = this.formatDate(now);
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: todayStr // 默认选中今天
    });

    // 动态调整模拟事件的日期，使其落在当前月份
    this.generateDynamicMockEvents(year, month); // <-- 新增此行
    
    this.generateCalendarDates(year, month);
    this.loadEventsForDate(todayStr); // 默认加载今天的事件
  },

  // 新增：根据当前月份动态生成模拟事件
  generateDynamicMockEvents: function(year, month) {
    const events = [];
    const currentMonthDays = new Date(year, month, 0).getDate(); // 当前月总天数

    // 确保有今天的事件 (如果今天在当前月份)
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      const todayStr = this.formatDate(today);
      events.push({ id: 'e4', date: todayStr, time: '14:00', description: '宠物疫苗购买' });
      events.push({ id: 'e5', date: todayStr, time: '18:00', description: '预约宠物美容' });
    }

    // 假设本月有其他事件，例如每月5号和15号
    if (currentMonthDays >= 5) {
      const date5th = this.formatDate(new Date(year, month - 1, 5));
      events.push({ id: 'e1', date: date5th, time: '10:00', description: '宠物小黄寄养开始' });
    }
    if (currentMonthDays >= 15) {
      const date15th = this.formatDate(new Date(year, month - 1, 15));
      events.push({ id: 'e2', date: date15th, time: '16:00', description: '宠物小黄寄养结束' });
    }

    // 假设下个月初也有事件，用于演示下月有事件点
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonthFirstDay = this.formatDate(new Date(nextYear, nextMonth - 1, 1));
    events.push({ id: 'e3', date: nextMonthFirstDay, time: '09:00', description: '宠物疫苗提醒 (下月初)' });

    this.mockEvents = events; // 更新模拟事件数据
  },

  generateCalendarDates: function (year, month) {
    // ... (此函数代码保持不变，因为它已经根据日期动态生成日历了) ...
    const dates = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0-6 星期日-星期六

    // 填充上月日期
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDate = new Date(year, month - 1, 0);
      prevMonthDate.setDate(prevMonthDate.getDate() - i + 1);
      dates.push({ day: prevMonthDate.getDate(), date: '', isCurrentMonth: false, hasEvent: false });
    }

    // 填充本月日期
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const dateStr = this.formatDate(new Date(year, month - 1, i));
      // 模拟事件，实际从后端获取
      const hasEvent = this.mockEvents.some(event => event.date === dateStr);
      dates.push({ day: i, date: dateStr, isCurrentMonth: true, hasEvent: hasEvent });
    }

    // 填充下月日期 (补齐6周，或至少5周)
    const initialCells = dates.length;
    const totalRows = Math.ceil(initialCells / 7);
    const remainingCells = (totalRows * 7) - initialCells; 
    
    for (let i = 1; i <= remainingCells; i++) {
      dates.push({ day: i, date: '', isCurrentMonth: false, hasEvent: false });
    }

    this.setData({ dates: dates });
  },

  // mockEvents: [ ] 这一行可以移除，因为它现在是动态生成的

  loadEventsForDate: function (date) {
    console.log('加载日期事件:', date);
    // 从动态生成的 mockEvents 中过滤
    const events = this.mockEvents.filter(event => event.date === date); 
    this.setData({ selectedDateEvents: events });
  },

  selectDate: function (e) {
    const selectedDate = e.currentTarget.dataset.date;
    if (selectedDate) {
      this.setData({ selectedDate: selectedDate });
      this.loadEventsForDate(selectedDate);
    }
  },

  prevMonth: function () {
    let year = this.data.currentYear;
    let month = this.data.currentMonth - 1;
    if (month === 0) {
      month = 12;
      year--;
    }
    this.setData({ currentYear: year, currentMonth: month });
    this.generateDynamicMockEvents(year, month); // <-- 切换月份时重新生成模拟事件
    this.generateCalendarDates(year, month);
    // 切换月份后，默认选中该月的第一天（或保持原选中日期，如果它在该月）
    const newSelectedDate = this.formatDate(new Date(year, month - 1, 1));
    this.setData({ selectedDate: newSelectedDate });
    this.loadEventsForDate(newSelectedDate); 
  },

  nextMonth: function () {
    let year = this.data.currentYear;
    let month = this.data.currentMonth + 1;
    if (month === 13) {
      month = 1;
      year++;
    }
    this.setData({ currentYear: year, currentMonth: month });
    this.generateDynamicMockEvents(year, month); // <-- 切换月份时重新生成模拟事件
    this.generateCalendarDates(year, month);
    // 切换月份后，默认选中该月的第一天
    const newSelectedDate = this.formatDate(new Date(year, month - 1, 1));
    this.setData({ selectedDate: newSelectedDate });
    this.loadEventsForDate(newSelectedDate); 
  },

  goToAddSchedule: function() {
    wx.navigateTo({
      url: `/pages/daily_schedule/daily_schedule?date=${this.data.selectedDate}` 
    });
  },

  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});