// 测试订单数据
const fs = require('fs');

// 读取orders.json文件
const data = fs.readFileSync('c:/Users/刘雨葭/Desktop/orders.json', 'utf8');

// 按行分割
const lines = data.trim().split('\n');

// 解析每一行JSON
const orders = lines.map(line => {
  try {
    return JSON.parse(line);
  } catch (e) {
    console.error('解析失败的行:', line);
    return null;
  }
}).filter(Boolean);

console.log('总订单数:', orders.length);

// 按状态分组
const statusGroups = {};
orders.forEach(order => {
  const status = order.status;
  if (!statusGroups[status]) {
    statusGroups[status] = [];
  }
  statusGroups[status].push(order);
});

console.log('按状态分组的订单:');
Object.keys(statusGroups).forEach(status => {
  console.log(`${status}: ${statusGroups[status].length} 个订单`);
  if (status === 'unprocessed') {
    console.log('unprocessed订单详情:', statusGroups[status]);
  }
});

// 检查serviceId和petId
const serviceIds = [...new Set(orders.map(o => o.serviceId).filter(Boolean))];
const petIds = [...new Set(orders.map(o => o.petId).filter(Boolean))];

console.log('唯一的serviceIds:', serviceIds);
console.log('唯一的petIds:', petIds); 