const fs = require('fs');

// 读取导出的pet.jsonl
const lines = fs.readFileSync('pet.jsonl', 'utf-8').split('\n').filter(Boolean);
const pets = lines.map(line => JSON.parse(line));

// 合并逻辑
const merged = {};
for (const pet of pets) {
  const key = pet.petId || pet.nickname; // 优先petId
  if (!merged[key]) {
    merged[key] = { ...pet };
  } else {
    // 合并字段，优先保留非空/最长/最新
    for (const field in pet) {
      if (!merged[key][field] || (typeof pet[field] === 'string' && pet[field].length > (merged[key][field] || '').length)) {
        merged[key][field] = pet[field];
      }
    }
  }
}

// 写回新文件
const output = Object.values(merged).map(obj => JSON.stringify(obj)).join('\n');
fs.writeFileSync('pet_merged.jsonl', output, 'utf-8');
console.log('合并完成，结果已保存为pet_merged.jsonl');