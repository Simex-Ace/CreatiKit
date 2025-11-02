import { useState, useRef, useCallback, useEffect } from 'react';

// 音符频率映射表
export const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63,
  'C#4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'A4': 440.00,
  'A#4': 466.16,
  'B4': 493.88,
  'C5': 523.25
};

// 键盘映射到音符
export const KEY_TO_NOTE: Record<string, string> = {
  'a': 'C4',
  'w': 'C#4',
  's': 'D4',
  'e': 'D#4',
  'd': 'E4',
  'f': 'F4',
  't': 'F#4',
  'g': 'G4',
  'y': 'G#4',
  'h': 'A4',
  'u': 'A#4',
  'j': 'B4',
  'k': 'C5'
};

interface UsePianoSoundReturn {
  playNote: (note: string) => Promise<void>;
  stopNote: () => void;
  isReady: boolean;
  initializeAudio: () => Promise<boolean>;
}

export function usePianoSound(): UsePianoSoundReturn {
  const [isReady, setIsReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 清理函数 - 组件卸载时释放资源
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // 忽略错误
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 简化版初始化 - 直接创建音频上下文
  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      console.log('======= 最简单的音频初始化 =======');
      
      // 创建音频上下文
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('创建AudioContext成功:', audioContextRef.current.state);
      }
      
      // 立即尝试恢复
      if (audioContextRef.current.state === 'suspended') {
        console.log('尝试恢复音频上下文...');
        await audioContextRef.current.resume();
        console.log('恢复后状态:', audioContextRef.current.state);
      }
      
      // 播放测试音
      if (audioContextRef.current.state === 'running') {
        console.log('播放初始化测试音...');
        const testOsc = audioContextRef.current.createOscillator();
        const testGain = audioContextRef.current.createGain();
        testOsc.type = 'square';
        testOsc.frequency.value = 440;
        testGain.gain.value = 1.0;
        testOsc.connect(testGain);
        testGain.connect(audioContextRef.current.destination);
        testOsc.start();
        testOsc.stop(audioContextRef.current.currentTime + 0.2);
        console.log('测试音已播放');
      }
      
      setIsReady(audioContextRef.current.state === 'running');
      return audioContextRef.current.state === 'running';
    } catch (error) {
      console.error('初始化失败:', error);
      setIsReady(false);
      return false;
    }
  }, []);

  // 最简单的音符播放函数
  const playNote = useCallback(async (note: string): Promise<void> => {
    try {
      console.log('======================================================');
      console.log('直接播放音符:', note);
      
      // 确保音频上下文已创建
      if (!audioContextRef.current) {
        console.log('创建新的AudioContext...');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('创建完成，API类型:', audioContextRef.current.constructor.name);
      }
      
      // 确保音频上下文已运行
      if (audioContextRef.current.state === 'suspended') {
        console.log('恢复音频上下文...');
        await audioContextRef.current.resume();
        console.log('恢复后状态:', audioContextRef.current.state);
      }
      
      console.log('音频状态:', audioContextRef.current.state);
      
      // 获取频率
      const frequency = NOTE_FREQUENCIES[note];
      if (!frequency) {
        console.error('无效音符:', note);
        return;
      }
      
      // 停止当前音符
      if (oscillatorRef.current) {
          try {
            console.log('停止之前的振荡器');
            oscillatorRef.current.stop();
          } catch (e) {
            console.log('振荡器停止时出错:', e instanceof Error ? e.message : String(e));
          }
          oscillatorRef.current = null;
        }
      
      // 创建新的音频节点
      console.log('创建新的音频节点，频率:', frequency);
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      // 设置为方波，最大音量
      oscillator.type = 'square'; // 使用方波，比正弦波更容易听到
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 1.0; // 最大音量
      
      // 添加音量渐变，确保不会有爆音
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.0, audioContextRef.current.currentTime + 0.01);
      
      // 连接并播放
      console.log('连接音频节点...');
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      console.log('启动振荡器...');
      oscillator.start();
      
      // 设置2秒后自动停止
      oscillator.stop(audioContextRef.current.currentTime + 2.0);
      
      // 存储引用
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      
      console.log('音符播放设置完成，频率:', frequency, 'Hz');
      console.log('======================================================');
      
      // 添加视觉反馈 - 闪烁浏览器标签
      if (document.visibilityState === 'visible') {
        const originalTitle = document.title;
        document.title = '🔊 ' + note + ' 播放中...';
        setTimeout(() => {
          document.title = originalTitle;
        }, 300);
      }
      
    } catch (error) {
      console.error('播放音符失败:', error instanceof Error ? error.message : String(error));
    }
  }, []);

  // 停止音符
  const stopNote = useCallback(() => {
    try {
      if (oscillatorRef.current) {
        console.log('停止音符');
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
        gainNodeRef.current = null;
      }
    } catch (error) {
      console.error('停止音符失败:', error);
    }
  }, []);

  return {
    playNote,
    stopNote,
    isReady,
    initializeAudio
  };
}