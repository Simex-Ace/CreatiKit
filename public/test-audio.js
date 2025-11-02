// 极简音频测试脚本
console.log('=== 极简音频测试脚本加载 ===');

// 为页面添加按钮
function addTestButton() {
    const button = document.createElement('button');
    button.textContent = '🎹 播放测试音';
    button.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `;
    
    // 添加点击事件
    button.addEventListener('click', playTestSound);
    document.body.appendChild(button);
    console.log('测试按钮已添加');
}

// 播放测试声音
function playTestSound() {
    try {
        console.log('开始播放测试音...');
        
        // 创建音频上下文
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        console.log('创建音频上下文成功:', context.state);
        
        // 恢复上下文（如果被暂停）
        if (context.state === 'suspended') {
            console.log('恢复音频上下文...');
            context.resume().then(() => {
                console.log('音频上下文恢复成功:', context.state);
                createAndPlayOscillator(context);
            }).catch(err => {
                console.error('恢复失败:', err);
            });
        } else {
            createAndPlayOscillator(context);
        }
        
    } catch (error) {
        console.error('播放测试音失败:', error);
        alert('音频播放失败: ' + error.message);
    }
}

// 创建并播放振荡器
function createAndPlayOscillator(context) {
    try {
        // 创建振荡器和增益节点
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        
        // 设置参数
        oscillator.type = 'square'; // 方波
        oscillator.frequency.value = 440; // A4
        gain.gain.value = 1.0; // 最大音量
        
        // 连接
        oscillator.connect(gain);
        gain.connect(context.destination);
        
        console.log('启动振荡器...');
        oscillator.start();
        
        // 200ms后停止
        oscillator.stop(context.currentTime + 0.2);
        console.log('测试音已播放，200ms后自动停止');
        
    } catch (error) {
        console.error('创建振荡器失败:', error);
    }
}

// 页面加载后执行
window.addEventListener('load', () => {
    console.log('页面加载完成，准备添加测试按钮');
    addTestButton();
});

// 暴露全局函数供调试使用
window.playTestSound = playTestSound;