const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const crypto = require('crypto')
const db = cloud.database()
const _ = db.command

/**
 * 获取服务列表
 */
async function getServices(data, openid) {
  // 页码必须 >= 1，默认1
  const page = Math.max(1, parseInt(data.page) || 1);
  // 每页数量必须 1~20，默认10
  const pageSize = Math.min(20, Math.max(1, parseInt(data.pageSize) || 10));
  const countRes = await db.collection('services')
    .where({
      status: _.neq('deleted'),
      _openid: openid
    })
    .count()
  
  const listRes = await db.collection('services')
    .where({
      status: _.neq('deleted'),
      _openid: openid
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('createTime', 'desc')
    .get()
  
  return {
    errCode: 0,
    errMsg: '',
    data: {
      list: listRes.data,
      total: countRes.total,
      page: page,
      pageSize: pageSize
    }
  }
}

/**
 * 删除服务（标记删除状态）
 */
async function deleteService(data) {
  const { serviceId } = data

  return await db.collection('services')
  .where({ serviceId: serviceId })
  .update({
    data: {
      status: 'deleted',
      updateTime: db.serverDate()
    }
  })
}

/**
 * 更新服务状态
 */
async function updateServiceStatus(data) {
  const { serviceId, status } = data

  return await db.collection('services')
  .where({ serviceId: serviceId })
  .update({
    data: {
      status: status,
      updateTime: db.serverDate()
    }
  })
}

/**
 * 创建服务
 */
async function createService(data, openid) {
  const { formData } = data

  const hash = crypto
    .createHash('sha256') // 使用 SHA-256 算法
    .update(openid + Date.now().toString()) // 组合 openid + 时间戳
    .digest('hex')
  const serviceId = `srv_${hash.substring(0, 12)}`

  return await db.collection('services').add({
    data: {
      ...formData,
      _openid: openid,  // [test]
      providerId: openid,
      serviceId: serviceId,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      status: 'published'
    }
  })
}

/**
 * 创建ServiceSlot
 */
async function createServiceSlot(data, openid) {
  const { serviceId, date, capacity, price, status } = data

  const hash = crypto
    .createHash('sha256') // 使用 SHA-256 算法
    .update(openid + Date.now().toString()) // 组合 openid + 时间戳
    .digest('hex')
  const serviceSlotId = `slot_${hash.substring(0, 12)}`

  const startDate = new Date(date);
  startDate.setHours(14, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const res = await db.collection('serviceSlots').add({
    data: {
      serviceId: serviceId,
      serviceSlotId: serviceSlotId,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      startDateTime: startDate,
      endDateTime: endDate,
      capacity: capacity,
      price: price,
      bookedCount: 0,
      status: status
    }
  });

  const newRecord = await db.collection('serviceSlots')
    .doc(res._id)
    .get();

  return {
    data: newRecord.data
  }

}

/**
 * 更新服务
 */
async function updateService(data, openid) {
  const { serviceId, formData } = data

  return await db.collection('services')
  .where({ serviceId: serviceId })
  .update({
    data: {
      ...formData,
      updateTime: db.serverDate()
    }
  })
}

/**
 * 更新ServiceSlot
 */
async function updateServiceSlot(data, openid) {
  const { serviceSlotId, capacity, price, status } = data
  
  const res = await db.collection('serviceSlots')
  .where({ serviceSlotId: serviceSlotId })
  .update({
    data: {
      capacity: capacity,
      price: price,
      status: status,
      updateTime: db.serverDate()
    }
  });

  const queryRes = await db.collection('serviceSlots')
    .where({ serviceSlotId: serviceSlotId })
    .get();

  return {
    data: queryRes.data[0]
  }
}

/**
 * 获取服务详情
 */
async function getService(data) {
  const { serviceId } = data

  const res = await db.collection('services')
    .where({
      serviceId: serviceId
    })
    .get();
  return {
    data: res.data[0]
  }
}

/**
 * 获取MonthSlots详情
 */
async function getMonthSlots(data) {
  const { serviceId, start, end } = data

  const res = await db.collection('serviceSlots')
    .where({
      serviceId: serviceId,
      startDateTime: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    })
    .get();
  return { 
    data: res.data 
  };
}

/**
 * 更新过期serviceSlots
 */
async function updateExpiredSlots() {
  const now = new Date();
  
  try {
    const result = await db.collection('serviceSlots')
      .where({
        startDateTime: _.lt(now),
        status: _.neq('expired')
      })
      .update({
        data: {
          status: 'expired'
        }
      })
    
    return {
      success: true,
      updated: result.stats.updated
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, data } = event
  const { OPENID, SOURCE } = cloud.getWXContext()
  
  try {
    switch (type) {
      case 'getServices':
        return await getServices(data, OPENID)
      case 'deleteService':
        return await deleteService(data)
      case 'updateServiceStatus':
        return await updateServiceStatus(data)
      case 'createService':
        return await createService(data, OPENID)
      case 'updateService':
        return await updateService(data, OPENID)
      case 'createServiceSlot':
        return await createServiceSlot(data, OPENID)
      case 'updateServiceSlot':
        return await updateServiceSlot(data, OPENID)
      case 'getService':
        return await getService(data)
      case 'getMonthSlots':
        return await getMonthSlots(data);
      default:
        if (SOURCE === 'wx_trigger') {
          return await updateExpiredSlots()
        }
        throw new Error(`未知的操作类型: ${type}`)
    }
  } catch (err) {
    console.error('云函数执行错误:', err)
    throw err
  }
}