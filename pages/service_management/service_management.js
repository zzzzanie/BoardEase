Page({
  data: {
    services: [],
    loading: true,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    total: 0, // 总数量
    serviceStatusText: {
      published: '上架中',
      unpublished: '已下架',
      deleted: '已删除'
    }
  },

  onLoad: function(options) {
    this.loadServices();
  },

  // 加载服务数据
  async loadServices() {
    this.setData({ loading: true })
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'services',
        data: {
          type: 'getServices',
          data: {
            page: this.data.currentPage,
            pageSize: this.data.pageSize
          }
        }
      })
      
      if (res.result.errCode === 0) {
        this.setData({
          services: res.result.data.list,
          total: res.result.data.total,
          currentPage: res.result.data.page,
          pageSize: res.result.data.pageSize,
          totalPages: Math.ceil(res.result.data.total / res.result.data.pageSize),
          loading: false
        });
      } else {
        throw new Error(res.result.errMsg);
      }
    } catch (err) {
      console.error('加载失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 翻页
  handlePageChange(e) {
    const type = e.currentTarget.dataset.type
    let page = this.data.currentPage
    
    if (type === 'prev' && page > 1) {
      page--
    } else if (type === 'next' && page < this.data.totalPages) {
      page++
    } else {
      return
    }
    
    this.setData({ currentPage: page }, () => {
      this.loadServices()
    })
  },

  // 跳转到编辑页面
  navigateToEdit: function(e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/seller_service_add/seller_service_add?serviceId=${serviceId}`
    });
  },

  // 跳转到服务日历页面
  navigateToCal: function(e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/service_calendar/service_calendar?serviceId=${serviceId}`
    });
  },

  // 跳转到新增页面
  navigateToAdd: function() {
    wx.navigateTo({
      url: '/pages/seller_service_add/seller_service_add'
    });
  },

  // 删除服务
  async handleDelete(e) {
    const serviceId = e.currentTarget.dataset.id
    
    try {
      await wx.showModal({
        title: '确认删除',
        content: '确定要删除这个服务吗？'
      })
      
      await wx.cloud.callFunction({
        name: 'services',
        data: {
          type: 'deleteService',
          data: { 
            serviceId: serviceId 
          }
        }
      })
      
      wx.showToast({ title: '删除成功', icon: 'success' })
      this.loadServices()
    } catch (err) {
      console.error('删除失败:', err)
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },

  // 更新服务状态
  async updateServiceStatus(e) {
    const serviceId = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    
    try {
      await wx.cloud.callFunction({
        name: 'services',
        data: {
          type: 'updateServiceStatus',
          data: { 
            serviceId: serviceId,
            status:status 
          }
        }
      })
      
      wx.showToast({ title: '状态更新成功', icon: 'success' })
      this.loadServices()
    } catch (err) {
      console.error('状态更新失败:', err)
      wx.showToast({ title: '状态更新失败', icon: 'none' })
    }
  },
});