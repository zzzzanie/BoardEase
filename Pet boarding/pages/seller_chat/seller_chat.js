// pages/seller_chat/seller_chat.js
const app = getApp(); // Import app instance

Page({
  data: {
    chats: [],
    currentUserRole: 'seller' // 明确此页面是为卖家设计的
  },

  onLoad: function () {
    // 确保从全局获取的仍然是卖家角色，以防万一
    if (app.globalData.userRole !== 'seller') {
        // 如果不是卖家，可以提示错误或重定向
        console.warn('非卖家用户访问卖家聊天页面。');
        wx.showToast({ title: '权限不足', icon: 'none' });
        setTimeout(() => { wx.navigateBack(); }, 1000);
        return;
    }
    this.loadChatList();
  },

  onShow: function() {
    this.loadChatList(); // 页面显示时刷新列表
  },

  loadChatList: function () {
    console.log('加载卖家聊天列表');
    // 卖家视角: Chats with pet owners
    let mockChats = [
      { 
        id: 'c3_owner_seller_chat_o1', 
        name: '王小明', 
        avatar: '/images/default_avatar.png', 
        lastMessage: '那就好，谢谢您的照顾', // 更新为与chat_detail.js中的最后一条用户消息一致
        time: '10:00', 
        unreadCount: 2, 
        type: 'owner', 
        petName: '小黄', 
        orderId: 'o2',
        status: '寄养中' // 新增状态字段
      },
      { 
        id: 'c4_owner_seller_chat_o2', 
        name: '李阿姨', 
        avatar: '/images/default_avatar.png', 
        lastMessage: '寄养费用支付了，麻烦您查收', // 更新为与chat_detail.js中的消息一致
        time: '昨天', 
        unreadCount: 0, 
        type: 'owner', 
        petName: '大花', 
        orderId: 'o1',
        status: '待支付' // 新增状态字段
      }
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
    const chat = this.data.chats.find(c => c.id === e.currentTarget.dataset.id);
    if (!chat) return;

    const url = `/pages/chat_detail/chat_detail?id=${chat.id}&type=${chat.type}&petName=${chat.petName}&orderId=${chat.orderId}`;

    wx.navigateTo({
      url: url
    });
  }
});