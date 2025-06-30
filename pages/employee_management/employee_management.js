const app = getApp();

Page({
  data: {
    employees: [],
    showAddModal: false,
    showEditModal: false,
    currentEmployee: null,
    formData: {
      name: '',
      phone: '',
      position: '',
      joinDate: '',
      status: '在职'  // 在职 or 离职
    },
    positions: ['店长', '寄养师', '美容师', '前台', '实习生']
  },

  onLoad: function() {
    this.loadEmployeeList();
  },

  loadEmployeeList: function() {
    // 模拟从服务器获取员工列表
    const mockEmployees = [
      {
        id: 'e001',
        name: '张三',
        avatar: '/images/default_avatar.png',
        phone: '13800138001',
        position: '店长',
        joinDate: '2023-01-15',
        status: '在职'
      },
      {
        id: 'e002',
        name: '李四',
        avatar: '/images/default_avatar.png',
        phone: '13800138002',
        position: '寄养师',
        joinDate: '2023-03-01',
        status: '在职'
      },
      {
        id: 'e003',
        name: '王五',
        avatar: '/images/default_avatar.png',
        phone: '13800138003',
        position: '美容师',
        joinDate: '2023-06-15',
        status: '离职'
      }
    ];

    this.setData({
      employees: mockEmployees
    });
  },

  // 显示添加员工弹窗
  showAddEmployeeModal: function() {
    this.setData({
      showAddModal: true,
      formData: {
        name: '',
        phone: '',
        position: '',
        joinDate: '',
        status: '在职'
      }
    });
  },

  // 显示编辑员工弹窗
  showEditEmployeeModal: function(e) {
    const employee = this.data.employees.find(emp => emp.id === e.currentTarget.dataset.id);
    if (employee) {
      this.setData({
        showEditModal: true,
        currentEmployee: employee,
        formData: {
          name: employee.name,
          phone: employee.phone,
          position: employee.position,
          joinDate: employee.joinDate,
          status: employee.status
        }
      });
    }
  },

  // 关闭弹窗
  closeModal: function() {
    this.setData({
      showAddModal: false,
      showEditModal: false,
      currentEmployee: null,
      formData: {
        name: '',
        phone: '',
        position: '',
        joinDate: '',
        status: '在职'
      }
    });
  },

  // 表单输入处理
  onInput: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 选择日期
  bindDateChange: function(e) {
    this.setData({
      'formData.joinDate': e.detail.value
    });
  },

  // 选择职位
  bindPositionChange: function(e) {
    this.setData({
      'formData.position': this.data.positions[e.detail.value]
    });
  },

  // 添加员工
  addEmployee: function() {
    const { formData } = this.data;
    
    // 表单验证
    if (!this.validateForm(formData)) {
      return;
    }

    // 模拟添加员工
    const newEmployee = {
      id: `e${Date.now()}`,
      avatar: '/images/default_avatar.png',
      ...formData
    };

    this.setData({
      employees: [...this.data.employees, newEmployee],
      showAddModal: false
    });

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 更新员工信息
  updateEmployee: function() {
    const { formData, currentEmployee } = this.data;

    // 表单验证
    if (!this.validateForm(formData)) {
      return;
    }

    // 模拟更新员工信息
    const updatedEmployees = this.data.employees.map(emp => {
      if (emp.id === currentEmployee.id) {
        return {
          ...emp,
          ...formData
        };
      }
      return emp;
    });

    this.setData({
      employees: updatedEmployees,
      showEditModal: false
    });

    wx.showToast({
      title: '更新成功',
      icon: 'success'
    });
  },

  // 表单验证
  validateForm: function(formData) {
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return false;
    }
    if (!formData.phone.trim()) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return false;
    }
    if (!formData.position) {
      wx.showToast({
        title: '请选择职位',
        icon: 'none'
      });
      return false;
    }
    if (!formData.joinDate) {
      wx.showToast({
        title: '请选择入职日期',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  // 更改员工状态
  toggleEmployeeStatus: function(e) {
    const { id } = e.currentTarget.dataset;
    const updatedEmployees = this.data.employees.map(emp => {
      if (emp.id === id) {
        return {
          ...emp,
          status: emp.status === '在职' ? '离职' : '在职'
        };
      }
      return emp;
    });

    this.setData({
      employees: updatedEmployees
    });

    wx.showToast({
      title: '状态已更新',
      icon: 'success'
    });
  }
}); 