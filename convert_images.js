const fs = require('fs');
const path = require('path');

// 转换单个图片为base64
function convertImageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64 = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).substring(1);
        const mimeType = getMimeType(ext);
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error(`转换失败: ${imagePath}`, error.message);
        return null;
    }
}

// 获取MIME类型
function getMimeType(ext) {
    const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp'
    };
    return mimeTypes[ext.toLowerCase()] || 'image/png';
}

// 批量转换文件夹中的图片
function convertFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    const results = {};
    
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const ext = path.extname(file).toLowerCase();
        
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
            const base64 = convertImageToBase64(filePath);
            if (base64) {
                results[file] = base64;
                console.log(`✅ 转换成功: ${file}`);
            }
        }
    });
    
    return results;
}

// 生成微信小程序代码
function generateWxCode(results) {
    let code = '// 图片base64数据\n';
    code += 'const imageBase64 = {\n';
    
    Object.keys(results).forEach(file => {
        const varName = file.replace(/[^a-zA-Z0-9]/g, '_').replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
        code += `  ${varName}: '${results[file]}',\n`;
    });
    
    code += '};\n\n';
    code += '// 使用示例\n';
    code += '// <image src="{{imageBase64.icon_arrow_left}}" />\n';
    
    return code;
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('使用方法: node convert_images.js <图片文件夹路径>');
        console.log('示例: node convert_images.js ./images');
        return;
    }
    
    const folderPath = args[0];
    
    if (!fs.existsSync(folderPath)) {
        console.error('❌ 文件夹不存在:', folderPath);
        return;
    }
    
    console.log(`🔄 开始转换文件夹: ${folderPath}`);
    const results = convertFolder(folderPath);
    
    if (Object.keys(results).length === 0) {
        console.log('❌ 没有找到图片文件');
        return;
    }
    
    // 生成代码文件
    const code = generateWxCode(results);
    const outputFile = 'image_base64.js';
    fs.writeFileSync(outputFile, code);
    
    console.log(`\n✅ 转换完成！`);
    console.log(`📁 共转换 ${Object.keys(results).length} 个图片文件`);
    console.log(`📄 代码已保存到: ${outputFile}`);
    console.log(`\n使用方法:`);
    console.log(`1. 将 ${outputFile} 中的 imageBase64 对象复制到您的页面JS文件中`);
    console.log(`2. 在WXML中使用: <image src="{{imageBase64.文件名}}" />`);
}

main(); 