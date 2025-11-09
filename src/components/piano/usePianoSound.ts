import { useState, useRef, useCallback, useEffect } from 'react';

// 完整的钢琴音域映射表 (88键，从A0到C8)
export const NOTE_FREQUENCIES: Record<string, number> = {
  // 最低八度 A0-C2
  'A0': 27.50,
  'A#0': 29.14,
  'B0': 30.87,
  'C1': 32.70,
  'C#1': 34.65,
  'D1': 36.71,
  'D#1': 38.89,
  'E1': 41.20,
  'F1': 43.65,
  'F#1': 46.25,
  'G1': 49.00,
  'G#1': 51.91,
  'A1': 55.00,
  'A#1': 58.27,
  'B1': 61.74,
  'C2': 65.41,
  
  // C2 八度
  'C#2': 69.30,
  'D2': 73.42,
  'D#2': 77.78,
  'E2': 82.41,
  'F2': 87.31,
  'F#2': 92.50,
  'G2': 98.00,
  'G#2': 103.83,
  'A2': 110.00,
  'A#2': 116.54,
  'B2': 123.47,
  
  // C3 八度
  'C3': 130.81,
  'C#3': 138.59,
  'D3': 146.83,
  'D#3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'A3': 220.00,
  'A#3': 233.08,
  'B3': 246.94,
  
  // C4 八度 (中央C)
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
  
  // C5 八度
  'C5': 523.25,
  'C#5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'E5': 659.25,
  'F5': 698.46,
  'F#5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'A5': 880.00,
  'A#5': 932.33,
  'B5': 987.77,
  
  // C6 八度
  'C6': 1046.50,
  'C#6': 1108.73,
  'D6': 1174.66,
  'D#6': 1244.51,
  'E6': 1318.51,
  'F6': 1396.91,
  'F#6': 1479.98,
  'G6': 1567.98,
  'G#6': 1661.22,
  'A6': 1760.00,
  'A#6': 1864.66,
  'B6': 1975.53,
  
  // C7 八度
  'C7': 2093.00,
  'C#7': 2217.46,
  'D7': 2349.32,
  'D#7': 2489.02,
  'E7': 2637.02,
  'F7': 2793.83,
  'F#7': 2959.96,
  'G7': 3135.96,
  'G#7': 3322.44,
  'A7': 3520.00,
  'A#7': 3729.31,
  'B7': 3951.07,
  
  // 最高音 C8
  'C8': 4186.01
};

// 键盘按键映射到钢琴音符
export const KEY_TO_NOTE: Record<string, string> = {
  // A0-C2 (最低音区)
  '`': 'A0',
  '1': 'A#0',
  '2': 'B0',
  '3': 'C1',
  '4': 'C#1',
  '5': 'D1',
  '6': 'D#1',
  '7': 'E1',
  '8': 'F1',
  '9': 'F#1',
  '0': 'G1',
  '-': 'G#1',
  '=': 'A1',
  'Backspace': 'A#1',
  '\t': 'B1',
  
  // C2-B3 (低音区)
  'q': 'C2',
  '!': 'C#2',
  'w': 'D2',
  '@': 'D#2',
  'e': 'E2',
  'r': 'F2',
  '#': 'F#2',
  't': 'G2',
  '$': 'G#2',
  'y': 'A2',
  '%': 'A#2',
  'u': 'B2',
  'i': 'C3',
  '^': 'C#3',
  'o': 'D3',
  '&': 'D#3',
  'p': 'E3',
  '[': 'F3',
  '*': 'F#3',
  ']': 'G3',
  '(': 'G#3',
  '\\': 'A3',
  ')': 'A#3',
  'a': 'B3',
  
  // C4-B5 (中音区)
  's': 'C4',  // 中央C
  'd': 'C#4',
  'f': 'D4',
  'g': 'D#4',
  'h': 'E4',
  'j': 'F4',
  'k': 'F#4',
  'l': 'G4',
  ';': 'G#4',
  "'": 'A4',
  'z': 'A#4',
  'x': 'B4',
  'c': 'C5',
  'v': 'C#5',
  'b': 'D5',
  'n': 'D#5',
  'm': 'E5',
  ',': 'F5',
  '.': 'F#5',
  '/': 'G5',
  'Enter': 'G#5',
  'ShiftLeft': 'A5',
  'ShiftRight': 'A#5',
  'AltLeft': 'B5',
  
  // C6-C8 (高音区)
  'PageUp': 'C6',
  'PageDown': 'C#6',
  'Home': 'D6',
  'End': 'D#6',
  'Insert': 'E6',
  'Delete': 'F6',
  'ArrowUp': 'F#6',
  'ArrowDown': 'G6',
  'ArrowLeft': 'G#6',
  'ArrowRight': 'A6',
  'NumLock': 'A#6',
  'NumpadDivide': 'B6',
  'NumpadMultiply': 'C7',
  'NumpadSubtract': 'C#7',
  'NumpadAdd': 'D7',
  'Numpad1': 'D#7',
  'Numpad2': 'E7',
  'Numpad3': 'F7',
  'Numpad4': 'F#7',
  'Numpad5': 'G7',
  'Numpad6': 'G#7',
  'Numpad7': 'A7',
  'Numpad8': 'A#7',
  'Numpad9': 'B7',
  'Numpad0': 'C8'
};

// 生成完整的88键钢琴键配置
export const PIANO_KEYS = [
  // A0-C2 (最低音区)
  { note: 'A0', isSharp: false, keyName: '`' },
  { note: 'A#0', isSharp: true, keyName: '1' },
  { note: 'B0', isSharp: false, keyName: '2' },
  { note: 'C1', isSharp: false, keyName: '3' },
  { note: 'C#1', isSharp: true, keyName: '4' },
  { note: 'D1', isSharp: false, keyName: '5' },
  { note: 'D#1', isSharp: true, keyName: '6' },
  { note: 'E1', isSharp: false, keyName: '7' },
  { note: 'F1', isSharp: false, keyName: '8' },
  { note: 'F#1', isSharp: true, keyName: '9' },
  { note: 'G1', isSharp: false, keyName: '0' },
  { note: 'G#1', isSharp: true, keyName: '-' },
  { note: 'A1', isSharp: false, keyName: '=' },
  { note: 'A#1', isSharp: true, keyName: 'Backspace' },
  { note: 'B1', isSharp: false, keyName: '\t' },
  
  // C2-B3 (低音区)
  { note: 'C2', isSharp: false, keyName: 'q' },
  { note: 'C#2', isSharp: true, keyName: '!' },
  { note: 'D2', isSharp: false, keyName: 'w' },
  { note: 'D#2', isSharp: true, keyName: '@' },
  { note: 'E2', isSharp: false, keyName: 'e' },
  { note: 'F2', isSharp: false, keyName: 'r' },
  { note: 'F#2', isSharp: true, keyName: '#' },
  { note: 'G2', isSharp: false, keyName: 't' },
  { note: 'G#2', isSharp: true, keyName: '$' },
  { note: 'A2', isSharp: false, keyName: 'y' },
  { note: 'A#2', isSharp: true, keyName: '%' },
  { note: 'B2', isSharp: false, keyName: 'u' },
  { note: 'C3', isSharp: false, keyName: 'i' },
  { note: 'C#3', isSharp: true, keyName: '^' },
  { note: 'D3', isSharp: false, keyName: 'o' },
  { note: 'D#3', isSharp: true, keyName: '&' },
  { note: 'E3', isSharp: false, keyName: 'p' },
  { note: 'F3', isSharp: false, keyName: '[' },
  { note: 'F#3', isSharp: true, keyName: '*' },
  { note: 'G3', isSharp: false, keyName: ']' },
  { note: 'G#3', isSharp: true, keyName: '(' },
  { note: 'A3', isSharp: false, keyName: '\\' },
  { note: 'A#3', isSharp: true, keyName: ')' },
  { note: 'B3', isSharp: false, keyName: 'a' },
  
  // C4-B5 (中音区 - 中央C)
  { note: 'C4', isSharp: false, keyName: 's' },  // 中央C
  { note: 'C#4', isSharp: true, keyName: 'd' },
  { note: 'D4', isSharp: false, keyName: 'f' },
  { note: 'D#4', isSharp: true, keyName: 'g' },
  { note: 'E4', isSharp: false, keyName: 'h' },
  { note: 'F4', isSharp: false, keyName: 'j' },
  { note: 'F#4', isSharp: true, keyName: 'k' },
  { note: 'G4', isSharp: false, keyName: 'l' },
  { note: 'G#4', isSharp: true, keyName: ';' },
  { note: 'A4', isSharp: false, keyName: "'" },
  { note: 'A#4', isSharp: true, keyName: 'z' },
  { note: 'B4', isSharp: false, keyName: 'x' },
  { note: 'C5', isSharp: false, keyName: 'c' },
  { note: 'C#5', isSharp: true, keyName: 'v' },
  { note: 'D5', isSharp: false, keyName: 'b' },
  { note: 'D#5', isSharp: true, keyName: 'n' },
  { note: 'E5', isSharp: false, keyName: 'm' },
  { note: 'F5', isSharp: false, keyName: ',' },
  { note: 'F#5', isSharp: true, keyName: '.' },
  { note: 'G5', isSharp: false, keyName: '/' },
  { note: 'G#5', isSharp: true, keyName: 'Enter' },
  { note: 'A5', isSharp: false, keyName: 'ShiftLeft' },
  { note: 'A#5', isSharp: true, keyName: 'ShiftRight' },
  { note: 'B5', isSharp: false, keyName: 'AltLeft' },
  
  // C6-C8 (高音区)
  { note: 'C6', isSharp: false, keyName: 'PageUp' },
  { note: 'C#6', isSharp: true, keyName: 'PageDown' },
  { note: 'D6', isSharp: false, keyName: 'Home' },
  { note: 'D#6', isSharp: true, keyName: 'End' },
  { note: 'E6', isSharp: false, keyName: 'Insert' },
  { note: 'F6', isSharp: false, keyName: 'Delete' },
  { note: 'F#6', isSharp: true, keyName: 'ArrowUp' },
  { note: 'G6', isSharp: false, keyName: 'ArrowDown' },
  { note: 'G#6', isSharp: true, keyName: 'ArrowLeft' },
  { note: 'A6', isSharp: false, keyName: 'ArrowRight' },
  { note: 'A#6', isSharp: true, keyName: 'NumLock' },
  { note: 'B6', isSharp: false, keyName: 'NumpadDivide' },
  { note: 'C7', isSharp: false, keyName: 'NumpadMultiply' },
  { note: 'C#7', isSharp: true, keyName: 'NumpadSubtract' },
  { note: 'D7', isSharp: false, keyName: 'NumpadAdd' },
  { note: 'D#7', isSharp: true, keyName: 'Numpad1' },
  { note: 'E7', isSharp: false, keyName: 'Numpad2' },
  { note: 'F7', isSharp: false, keyName: 'Numpad3' },
  { note: 'F#7', isSharp: true, keyName: 'Numpad4' },
  { note: 'G7', isSharp: false, keyName: 'Numpad5' },
  { note: 'G#7', isSharp: true, keyName: 'Numpad6' },
  { note: 'A7', isSharp: false, keyName: 'Numpad7' },
  { note: 'A#7', isSharp: true, keyName: 'Numpad8' },
  { note: 'B7', isSharp: false, keyName: 'Numpad9' },
  { note: 'C8', isSharp: false, keyName: 'Numpad0' }
];

// 音频事件接口
export interface AudioEvent {
  note: string;
  startTime: number;
  duration: number;
}

interface UsePianoSoundReturn {
  playNote: (note: string) => Promise<void>;
  stopNote: (note: string) => void;
  stopAllNotes: () => void;
  initializeAudio: () => Promise<boolean>;
  isReady: boolean;
  isLoading: boolean;
  setSustain: (sustain: boolean) => void;
  sustain: boolean;
  getCurrentTime: () => number;
}

export function usePianoSound(): UsePianoSoundReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sustain, setSustain] = useState(false);
  
  // 核心引用
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Map<string, { source: OscillatorNode; gainNode: GainNode }>>(new Map());
  const activeKeysRef = useRef<Set<string>>(new Set());

  // 初始化音频系统
  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Starting audio initialization...');
      
      // 检查浏览器支持
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('Web Audio API is not supported in this browser');
        setIsReady(false);
        return false;
      }
      
      if (!audioContextRef.current) {
        console.log('Creating new AudioContext');
        audioContextRef.current = new AudioContextClass();
        console.log('AudioContext created with state:', audioContextRef.current.state);
      }
      
      if (audioContextRef.current.state === 'suspended') {
        console.log('AudioContext is suspended, attempting to resume...');
        await audioContextRef.current.resume();
        console.log('AudioContext resumed to state:', audioContextRef.current.state);
      }
      
      const isRunning = audioContextRef.current.state === 'running';
      setIsReady(isRunning);
      console.log('Audio initialization complete, isReady:', isRunning);
      return isRunning;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      setIsReady(false);
      return false;
    }
  }, []);

  // 移除ADSR逻辑，使用简单的音量控制

  // 强制停止音符 - 钢琴版本，停止所有相关振荡器
  const forceStopNote = useCallback((note: string) => {
    console.log(`Force stopping note: ${note}`);
    const activeSource = activeSourcesRef.current.get(note);
    if (activeSource) {
      // 获取所有振荡器
      const allOscillators = (activeSource as any).oscillators || [activeSource];
      
      // 停止每个振荡器
      allOscillators.forEach((osc: any) => {
        try {
          osc.source.stop();
        } catch (e) {
          // 忽略已经停止的错误
          console.log(`Oscillator for ${note} already stopped or error:`, String(e));
        }
      });
      
      // 从映射中删除
      activeSourcesRef.current.delete(note);
      activeKeysRef.current.delete(note);
    }
  }, []);

  // 播放音符 - 钢琴模拟版本，包含多音叠加和泛音
  const playNote = useCallback(async (note: string, velocity: number = 0.8): Promise<void> => {
    try {
      console.log(`Attempting to play note: ${note}`);
      
      // 确保在用户交互时初始化音频上下文
      if (!audioContextRef.current || audioContextRef.current.state !== 'running') {
        const success = await initializeAudio();
        if (!success) {
          console.error('Failed to initialize audio context');
          return;
        }
      }
      
      const context = audioContextRef.current!;
      const frequency = NOTE_FREQUENCIES[note];
      
      if (!frequency) {
        console.error(`Invalid note: ${note}`);
        return;
      }
      
      // 先停止相同的音符
      forceStopNote(note);
      
      // 创建主波形和泛音振荡器数组
      const oscillators: { source: OscillatorNode; gainNode: GainNode }[] = [];
      const now = context.currentTime;
      
      // 添加一个高通滤波器来增强明亮度
      const highPassFilter = context.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 150; // 过滤掉过多的低频，增强清晰度
      highPassFilter.Q.value = 0.7; // 适中的Q值
      
      // 计算音量（基于力度）
      const baseVolume = 0.3 * Math.min(1, Math.max(0.1, velocity)); // 进一步增加基础音量
      
      // 创建主波形（使用正弦波，更明亮的音色）
      const mainOsc = context.createOscillator();
      const mainGain = context.createGain();
      mainOsc.frequency.value = frequency;
      mainOsc.type = 'sine';
      
      // 主波形音量包络 - 更快的起音使声音更清脆
      mainGain.gain.setValueAtTime(0, now);
      mainGain.gain.linearRampToValueAtTime(baseVolume * 1.2, now + 0.005); // 极快起音，增强清晰度
      mainGain.gain.exponentialRampToValueAtTime(baseVolume * 1.0, now + 0.05); // 轻微衰减
      mainGain.gain.exponentialRampToValueAtTime(baseVolume * 0.4, now + 2.5); // 中期衰减
      mainGain.gain.exponentialRampToValueAtTime(baseVolume * 0.08, now + 7); // 长时间延音
      
      // 连接到滤波器再输出，增强明亮度
      mainOsc.connect(mainGain);
      mainGain.connect(highPassFilter);
      highPassFilter.connect(context.destination);
      mainOsc.start();
      oscillators.push({ source: mainOsc, gainNode: mainGain });
      
      // 添加第一泛音（2倍频率，增强明亮度）
      const overtone1Osc = context.createOscillator();
      const overtone1Gain = context.createGain();
      overtone1Osc.frequency.value = frequency * 2;
      overtone1Osc.type = 'sine';
      
      // 进一步增强第一泛音强度，增加明亮度
      overtone1Gain.gain.setValueAtTime(0, now);
      overtone1Gain.gain.linearRampToValueAtTime(baseVolume * 0.65, now + 0.01); // 更高的泛音音量
      overtone1Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.45, now + 0.3);
      overtone1Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.12, now + 5);
      
      overtone1Osc.connect(overtone1Gain);
      overtone1Gain.connect(context.destination);
      overtone1Osc.start();
      oscillators.push({ source: overtone1Osc, gainNode: overtone1Gain });
      
      // 添加第二泛音（3倍频率，略微失谐）
      const overtone2Osc = context.createOscillator();
      const overtone2Gain = context.createGain();
      overtone2Osc.frequency.value = frequency * 3 * 0.998; // 轻微失谐增加真实感
      overtone2Osc.type = 'sine';
      
      // 大幅增强第二泛音强度，提升高频谐波
      overtone2Gain.gain.setValueAtTime(0, now);
      overtone2Gain.gain.linearRampToValueAtTime(baseVolume * 0.45, now + 0.015); // 显著提高泛音音量
      overtone2Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.25, now + 0.4);
      overtone2Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.07, now + 4);
      
      overtone2Osc.connect(overtone2Gain);
      overtone2Gain.connect(context.destination);
      overtone2Osc.start();
      oscillators.push({ source: overtone2Osc, gainNode: overtone2Gain });
      
      // 添加第三泛音（4倍频率，增强亮度）
      const overtone3Osc = context.createOscillator();
      const overtone3Gain = context.createGain();
      overtone3Osc.frequency.value = frequency * 4;
      overtone3Osc.type = 'sine';
      
      // 增强第三泛音，增加高频亮度
      overtone3Gain.gain.setValueAtTime(0, now);
      overtone3Gain.gain.linearRampToValueAtTime(baseVolume * 0.3, now + 0.015); // 提高泛音音量
      overtone3Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.12, now + 0.3);
      overtone3Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.04, now + 3);
      
      overtone3Osc.connect(overtone3Gain);
      overtone3Gain.connect(context.destination);
      overtone3Osc.start();
      oscillators.push({ source: overtone3Osc, gainNode: overtone3Gain });
      
      // 添加第四泛音（5倍频率，增加超高音谐波）
      if (frequency < 1500) { // 高音区不需要额外泛音
        const overtone4Osc = context.createOscillator();
        const overtone4Gain = context.createGain();
        overtone4Osc.frequency.value = frequency * 5;
        overtone4Osc.type = 'sine';
        
        // 增强第四泛音，显著提升超高音区域
        overtone4Gain.gain.setValueAtTime(0, now);
        overtone4Gain.gain.linearRampToValueAtTime(baseVolume * 0.2, now + 0.015); // 大幅提高泛音音量
        overtone4Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.06, now + 0.2);
        overtone4Gain.gain.exponentialRampToValueAtTime(baseVolume * 0.01, now + 2);
        
        overtone4Osc.connect(overtone4Gain);
        overtone4Gain.connect(context.destination);
        overtone4Osc.start();
        oscillators.push({ source: overtone4Osc, gainNode: overtone4Gain });
      }
      
      // 添加共鸣效果（低音弦共鸣）
      if (frequency < 200) { // 只对低音添加共鸣
        const resonanceOsc = context.createOscillator();
        const resonanceGain = context.createGain();
        resonanceOsc.frequency.value = frequency / 2; // 低八度共鸣
        resonanceOsc.type = 'sine';
        
        // 略微降低共鸣音量，突出高音明亮度
        resonanceGain.gain.setValueAtTime(0, now);
        resonanceGain.gain.linearRampToValueAtTime(baseVolume * 0.06, now + 0.05);
        resonanceGain.gain.exponentialRampToValueAtTime(baseVolume * 0.01, now + 10);
        
        resonanceOsc.connect(resonanceGain);
        resonanceGain.connect(context.destination);
        resonanceOsc.start();
        oscillators.push({ source: resonanceOsc, gainNode: resonanceGain });
      }
      
      console.log(`Playing ${note} with frequency ${frequency}Hz`);
      
      // 存储引用
      activeSourcesRef.current.set(note, { source: oscillators[0].source, gainNode: oscillators[0].gainNode });
      activeKeysRef.current.add(note);
      
      // 存储所有振荡器引用，用于停止
      (activeSourcesRef.current.get(note) as any).oscillators = oscillators;
      
      // 15秒后自动停止（增加延音时间）
      setTimeout(() => {
        if (activeSourcesRef.current.has(note)) {
          const noteData = activeSourcesRef.current.get(note);
          const noteOscillators = (noteData as any).oscillators || [noteData];
          
          // 平滑停止所有振荡器
          noteOscillators.forEach((osc: any) => {
            const now = context.currentTime;
            osc.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2);
          });
          
          setTimeout(() => forceStopNote(note), 2000);
        }
      }, 15000);
      
    } catch (error) {
      console.error('Failed to play note:', note, error);
    }
  }, [initializeAudio, forceStopNote]);

  // 停止音符 - 钢琴版本，优雅淡出所有泛音
  const stopNote = useCallback((note: string) => {
    console.log(`Stopping note: ${note}`);
    const context = audioContextRef.current;
    const activeSource = activeSourcesRef.current.get(note);
    
    if (context && activeSource) {
      try {
        const now = context.currentTime;
        const allOscillators = (activeSource as any).oscillators || [activeSource];
        
        // 为每个振荡器应用不同的淡出时间，创造更自然的衰减
        allOscillators.forEach((osc: any, index: number) => {
          // 主音衰减较慢，泛音衰减较快
          const fadeOutTime = index === 0 ? 1.2 : 0.8 - (index * 0.1);
          osc.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeOutTime);
        });
        
        // 淡出完成后停止
        setTimeout(() => forceStopNote(note), 1500);
      } catch (e) {
        console.log(`Error during smooth stop for ${note}:`, String(e));
        forceStopNote(note);
      }
    } else {
      forceStopNote(note);
    }
  }, [forceStopNote]);

  // 停止所有音符 - 钢琴版本，优雅淡出所有音符
  const stopAllNotes = useCallback(() => {
    console.log('Stopping all notes');
    // 清除所有活动键
    activeKeysRef.current.clear();
    
    const context = audioContextRef.current;
    if (context) {
      const now = context.currentTime;
      
      // 对每个音符应用平滑淡出
      Array.from(activeSourcesRef.current.keys()).forEach((note, index) => {
        const activeSource = activeSourcesRef.current.get(note);
        if (activeSource) {
          try {
            const allOscillators = (activeSource as any).oscillators || [activeSource];
            allOscillators.forEach((osc: any, oscIndex: number) => {
              // 添加小的延迟，让停止更自然
              const delay = index * 0.01;
              const fadeOutTime = 0.8 - (oscIndex * 0.1);
              osc.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + fadeOutTime);
            });
            
            setTimeout(() => forceStopNote(note), 1000 + (index * 10));
          } catch (e) {
            console.log(`Error during stop all for ${note}:`, String(e));
            forceStopNote(note);
          }
        }
      });
    } else {
      // 备用方案：直接强制停止
      Array.from(activeSourcesRef.current.keys()).forEach(note => {
        forceStopNote(note);
      });
    }
  }, [forceStopNote]);

  // 处理延音踏板状态变化 - 简化版本
  useEffect(() => {
    if (!sustain) {
      // 延音踏板释放时，停止所有未按下的音符
      Array.from(activeSourcesRef.current.keys()).forEach(note => {
        if (!activeKeysRef.current.has(note)) {
          stopNote(note);
        }
      });
    }
  }, [sustain, stopNote]);

  // 全局键盘事件监听，确保窗口失去焦点时停止所有音符
  useEffect(() => {
    const handleWindowBlur = () => {
      console.log('Window blur detected, stopping all notes');
      // 当窗口失去焦点时，停止所有音符
      stopAllNotes();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('Page hidden, stopping all notes');
        // 当页面不可见时，停止所有音符
        stopAllNotes();
      }
    };
    
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stopAllNotes]);

  // 获取当前时间
  const getCurrentTime = useCallback((): number => {
    return audioContextRef.current?.currentTime || 0;
  }, []);
  
  // 添加音频初始化触发器 - 在组件挂载时创建一个用户交互事件监听器
  useEffect(() => {
    const handleUserInteraction = async () => {
      console.log('User interaction detected, initializing audio...');
      await initializeAudio();
      // 只初始化一次
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
    
    // 添加事件监听器以捕获用户交互
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [initializeAudio]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 停止所有音符
      stopAllNotes();
      
      // 关闭音频上下文
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllNotes]);

  return {
    playNote,
    stopNote,
    stopAllNotes,
    initializeAudio,
    isReady,
    isLoading: false, // 保持API兼容性
    setSustain,
    sustain,
    getCurrentTime
  };
}