// 云开发 Node.js 脚本
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloudbase-5gkjpend4a9022ba' }) // 替换为你的环境ID

const db = cloud.database()
const _ = db.command

// 状态映射
const statusMap = {
  'unprocessed': '待确认',
  'active': '进行中',
  'completed': '已完成'
}

// 默认封面
const defaultCover = '/images/example_service_1.png'

// 批量补全 orders 字段
exports.main = async (event, context) => {
  // 1. 获取所有服务
  const servicesRes = await db.collection('services').get()
  const services = servicesRes.data.reduce((map, s) => {
    map[s.serviceId] = s
    return map
  }, {})

  // 2. 获取所有订单
  const ordersRes = await db.collection('orders').get()
  const orders = ordersRes.data

  // 3. 批量更新
  const tasks = orders.map(order => {
    const service = services[order.serviceId] || {}
    return db.collection('orders').doc(order._id).update({
      data: {
        serviceTitle: service.name || '',
        serviceCover: service.cover || defaultCover,
        statusText: statusMap[order.status] || order.status,
        shopName: service.shopName || '默认商家'
      }
    })
  })

  // 4. 执行所有更新
  return await Promise.all(tasks)
}
