// pages/user_chat/user_chat.js
const app = getApp(); 

Page({
  data: {
    chats: [],
    currentUserRole: '' // 此页面仅为宠物主人设计，但仍从全局获取角色，以防万一
  },

  onLoad: function () {
    this.setData({
      currentUserRole: app.globalData.userRole 
    });
    // 确保仅为宠物主人加载聊天列表
    if (this.data.currentUserRole === 'owner') {
        this.loadChatList();
    } else {
        // 如果非宠物主人访问此页面，可以提示或重定向
        console.warn('非宠物主人用户访问宠物主人聊天页面。');
        wx.showToast({ title: '权限不足', icon: 'none' });
        setTimeout(() => { wx.navigateBack(); }, 1000);
    }
  },

  onShow: function() {
    // 页面显示时刷新列表 (如果角色是宠物主人)
    if (this.data.currentUserRole === 'owner') {
        this.loadChatList();
    }
  },

  loadChatList: function () {
    console.log('加载宠物主人聊天列表');
    // 宠物主人视角: Chats with sellers
    let mockChats = [
      { id: 'c1_seller_pet_owner_chat', name: '宠物店老板张三', avatar: '/images/example_seller_avatar_1.png', lastMessage: '好的，期待您的光临。', time: '14:30', unreadCount: 1, type: 'seller' },
      { id: 'c2_seller_pet_owner_chat', name: '李四寄养师', avatar: '/images/example_seller_avatar_2.png', lastMessage: '您的狗狗已安全送达。', time: '昨天', unreadCount: 0, type: 'seller' }
    ];
    
    wx.showLoading({ title: '加载中...' });
    setTimeout(() => {
      this.setData({
        chats: mockChats
      });
      wx.hideLoading();
    }, 500);
  },

  goToChatDetail: function (e) {
    const chatId = e.currentTarget.dataset.id;
    const chatType = e.currentTarget.dataset.type; 
    const petName = e.currentTarget.dataset.petName || ''; 
    const orderId = e.currentTarget.dataset.orderId || ''; 

    let url = `/pages/chat_detail/chat_detail?id=${chatId}&type=${chatType}`;
    if (petName) {
      url += `&petName=${petName}`;
    }
    if (orderId) {
      url += `&orderId=${orderId}`;
    }

    wx.navigateTo({
      url: url
    });
  }
});