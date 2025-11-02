const fs = require('fs');
const path = require('path');

// 要检查的文件列表
const filesToCheck = [
  'src/components/piano/usePianoSound.ts',
  'src/components/piano/Piano.tsx',
  'src/app/piano/page.tsx'
];

console.log('开始检查语法...');

filesToCheck.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 使用Function构造函数进行简单的语法检查
    // 注意：这不会执行代码，只会检查语法
    new Function(content);
    
    console.log(`✓ ${filePath}: 语法正确`);
  } catch (error) {
    console.error(`✗ ${filePath}: 发现语法错误`);
    console.error(error.message);
  }
});

console.log('语法检查完成');