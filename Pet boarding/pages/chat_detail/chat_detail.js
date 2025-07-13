// pages/chat_detail/chat_detail.js
const app = getApp(); // 获取全局 app 实例

Page({
  data: {
    chatId: null,
    messages: [],
    inputContent: '',
    myAvatar: '', // 动态设置
    otherUserAvatar: '', // 动态设置
    otherUserName: '', 
    currentUserRole: '', // 当前用户的角色
    petName: '', // 新增：宠物名称
    orderId: '', // 新增：订单ID
    chatType: '' // 新增：聊天类型
  },

  onLoad: function (options) {
    const chatId = options.id;
    const userRole = app.globalData.userRole; // 获取当前用户的全局角色
    const petName = options.petName || ''; // 获取宠物名称
    const orderId = options.orderId || ''; // 获取订单ID
    const chatType = options.type || ''; // 获取聊天类型

    this.setData({ 
      chatId: chatId,
      currentUserRole: userRole,
      petName: petName,
      orderId: orderId,
      chatType: chatType
    });

    // 根据当前用户角色设置头像
    if (userRole === 'owner') {
      this.setData({
        myAvatar: '/images/default_avatar.png', // 宠物主人自己的头像
        otherUserAvatar: '/images/example_seller_avatar_1.png' // 对方（卖家）的头像
      });
    } else if (userRole === 'seller') {
      this.setData({
        myAvatar: '/images/example_seller_avatar_1.png', // 卖家自己的头像
        otherUserAvatar: '/images/default_avatar.png' // 对方（宠物主人）的头像
      });
    } else {
        // 默认情况或未登录
        this.setData({
            myAvatar: '/images/default_avatar.png',
            otherUserAvatar: '/images/default_avatar.png'
        });
    }

    // 设置对方名称和导航栏标题
    let userName = '未知用户';
    let navTitle = '';

    if (userRole === 'seller') {
      // 卖家查看时，显示"宠物主人 - 宠物名称"
      if (chatId === 'c3_owner_seller_chat_o1') {
        userName = '王小明';
      } else if (chatId === 'c4_owner_seller_chat_o2') {
        userName = '李阿姨';
      }
      navTitle = petName ? `${userName} - ${petName}` : userName;
    } else {
      // 宠物主人查看时，显示商家名称
      if (chatId === 'c1' || options.sellerId === 'seller001') { 
        userName = '宠物店老板张三';
      } else if (chatId === 'c2' || options.sellerId === 'seller002') { 
        userName = '李四寄养师';
      }
      navTitle = userName;
    }
    
    this.setData({ otherUserName: userName }); 

    wx.setNavigationBarTitle({
      title: navTitle
    });

    this.loadChatMessages(chatId, userRole); // 传入 userRole
  },

  loadChatMessages: function (chatId, currentUserRole) {
    console.log('加载聊天记录 for chatId:', chatId, '当前用户角色:', currentUserRole);
    
    // 根据chatId选择不同的模拟消息
    let mockRawMessages = [];
    
    if (chatId === 'c3_owner_seller_chat_o1') {
      // 王小明的小黄相关对话
      mockRawMessages = [
        { id: 'msg1', authorRole: 'owner', content: '您好，我是小黄的主人' },
        { id: 'msg2', authorRole: 'seller', content: '您好，小黄在这里很乖，每天都按时吃饭' },
        { id: 'msg3', authorRole: 'owner', content: '那就好，谢谢您的照顾' },
        { id: 'msg4', authorRole: 'seller', content: '不客气，这是我们应该做的' }
      ];
    } else if (chatId === 'c4_owner_seller_chat_o2') {
      // 李阿姨的大花相关对话
      mockRawMessages = [
        { id: 'msg1', authorRole: 'owner', content: '寄养费用支付了，麻烦您查收' },
        { id: 'msg2', authorRole: 'seller', content: '好的，已收到，大花一切都好' }
      ];
    } else {
      // 默认对话
      mockRawMessages = [
        { id: 'msg1', authorRole: 'owner', content: '您好，请问您明天下午方便寄养小狗吗？' }, 
        { id: 'msg2', authorRole: 'seller', content: '您好，明天下午可以的，请问是几点到呢？' },   
        { id: 'msg3', authorRole: 'owner', content: '大概下午2点左右，谢谢！' }, 
        { id: 'msg4', authorRole: 'seller', content: '好的，期待您的光临。' }
      ];
    }

    // 根据当前用户角色，动态设置 isMyMessage
    const processedMessages = mockRawMessages.map(msg => {
        return {
            ...msg,
            isMyMessage: msg.authorRole === currentUserRole
        };
    });

    setTimeout(() => {
      this.setData({
        messages: processedMessages
      });
      // 滚动到底部
      this.scrollToBottom();
    }, 500);
  },

  onInputContent: function (e) {
    this.setData({ inputContent: e.detail.value });
  },

  sendMessage: function () {
    if (!this.data.inputContent.trim()) {
      wx.showToast({ title: '消息不能为空', icon: 'none' });
      return;
    }

    const newMessage = {
      id: `msg${this.data.messages.length + 1}`,
      authorRole: this.data.currentUserRole,
      isMyMessage: true,
      content: this.data.inputContent.trim()
    };

    this.setData({
      messages: [...this.data.messages, newMessage],
      inputContent: '' 
    });

    console.log('发送消息:', newMessage.content);
    this.scrollToBottom();
  },

  scrollToBottom: function () {
    wx.pageScrollTo({
      selector: '.chat-messages',
      duration: 300,
      scrollTop: 99999 
    });
  }
});