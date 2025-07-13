// pages/daily_schedule/daily_schedule.js
Page({
  data: {
    date: '', 
    schedules: [],
    newSchedule: {
      time: '',
      content: ''
    }
  },

  onLoad: function (options) {
    const date = options.date || this.formatDate(new Date());
    this.setData({ date: date });
    wx.setNavigationBarTitle({
      title: `${date.substring(5)}日程` 
    });
    this.loadSchedules(date);
  },

  loadSchedules: function (date) {
    // 实际：根据日期从后端获取日程
    console.log('加载日程 for date:', date);
    wx.showLoading({ title: '加载中...' });
    // 模拟数据
    let mockSchedules = [];
    if (date === '2025-06-22') {
      mockSchedules = [
        { id: 'sch1', time: '14:00', description: '宠物疫苗购买' },
        { id: 'sch2', time: '18:00', description: '预约宠物美容' }
      ];
    } else if (date === '2025-06-25') {
      mockSchedules = [
        { id: 'sch3', time: '10:00', description: '宠物小黄寄养开始' }
      ];
    }
    setTimeout(() => {
      this.setData({ schedules: mockSchedules });
      wx.hideLoading();
    }, 300);
  },

  bindTimeChange: function (e) {
    this.setData({
      'newSchedule.time': e.detail.value
    });
  },

  bindContentInput: function (e) {
    this.setData({
      'newSchedule.content': e.detail.value
    });
  },

  addSchedule: function () {
    const { date, newSchedule } = this.data;
    if (!newSchedule.time || !newSchedule.content.trim()) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 实际：调用后端API添加日程
    console.log('添加日程:', date, newSchedule);
    wx.showLoading({ title: '添加中...' });
    setTimeout(() => {
      const newId = `sch${this.data.schedules.length + 1}`;
      this.setData({
        schedules: [...this.data.schedules, { id: newId, time: newSchedule.time, description: newSchedule.content }],
        newSchedule: { time: '', content: '' } 
      });
      wx.hideLoading();
      wx.showToast({ title: '添加成功', icon: 'success' });
    }, 500);
  },

  deleteSchedule: function (e) {
    const idToDelete = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除日程',
      content: '确定要删除此日程吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际：调用后端API删除日程
          console.log('删除日程ID:', idToDelete);
          this.setData({
                schedules: this.data.schedules.filter(item => item.id !== idToDelete)
          });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  formatDate: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
  }
});