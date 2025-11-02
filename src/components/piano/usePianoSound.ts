import { useState, useRef, useCallback, useEffect } from 'react';

// 扩展的音符频率映射表 (3个八度)
export const NOTE_FREQUENCIES: Record<string, number> = {
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
  // C4 八度
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
  'C6': 1046.50
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
  'k': 'C5',
  'o': 'C#5',
  'l': 'D5',
  'p': 'D#5',
  ';': 'E5'
};

// ADSR音量包络配置
interface ADSRConfig {
  attack: number; // 上升时间（秒）
  decay: number;  // 衰减时间（秒）
  sustain: number; // 延音音量级别 (0-1)
  release: number; // 释放时间（秒）
}

// 音频事件接口
export interface AudioEvent {
  note: string;
  startTime: number;
  duration: number;
}

interface UsePianoSoundReturn {
  playNote: (note: string) => Promise<void>;
  stopNote: (note: string) => void;
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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSourcesRef = useRef<Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>>(new Map());
  const sustainPedalReleasedTimeRef = useRef<number | null>(null);
  
  // ADSR配置
  const adsrConfig: ADSRConfig = {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3
  };

  // 预加载音频采样
  const loadAudioSamples = useCallback(async () => {
    if (!audioContextRef.current) return;
    
    setIsLoading(true);
    const context = audioContextRef.current;
    const notes = Object.keys(NOTE_FREQUENCIES);
    
    try {
      // 直接跳过音频文件加载，所有音符都将使用振荡器作为音频源
      console.log('Using oscillator fallback for all notes as audio samples are not available');
      // 不需要为audioBuffersRef设置任何值，这样playNote中的振荡器回退机制将始终被触发
    } catch (error) {
      console.error('Error in audio samples setup:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化音频系统
  const initializeAudio = useCallback(async (): Promise<boolean> => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await loadAudioSamples();
      
      setIsReady(audioContextRef.current.state === 'running');
      return audioContextRef.current.state === 'running';
    } catch (error) {
      console.error('Audio initialization failed:', error);
      setIsReady(false);
      return false;
    }
  }, [loadAudioSamples]);

  // 实现ADSR音量包络
  const applyADSR = useCallback((gainNode: GainNode, now: number) => {
    const { attack, decay, sustain } = adsrConfig;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
  }, [adsrConfig]);

  // 播放音符
  const playNote = useCallback(async (note: string): Promise<void> => {
    try {
      if (!audioContextRef.current) {
        await initializeAudio();
        if (!audioContextRef.current) {
          throw new Error('Audio context not initialized');
        }
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const context = audioContextRef.current;
      const now = context.currentTime;
      
      // 先停止正在播放的相同音符（避免调用stopNote造成循环依赖）
      const activeSource = activeSourcesRef.current.get(note);
      if (activeSource) {
        try {
          activeSource.source.stop();
        } catch (e) {}
        activeSourcesRef.current.delete(note);
      }
      
      // 直接使用振荡器作为音频源，不再尝试使用AudioBufferSourceNode
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.frequency.setValueAtTime(NOTE_FREQUENCIES[note] || 440, now);
      oscillator.type = 'triangle'; // 使用triangle波形获得更接近钢琴的音色
      
      applyADSR(gainNode, now);
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.start();
      
      // 将振荡器视为 AudioBufferSourceNode 存入 Map，运行时类型兼容即可
      activeSourcesRef.current.set(note, { source: oscillator as unknown as AudioBufferSourceNode, gainNode });
      
      // 设置5秒后停止，防止内存泄漏
      oscillator.stop(now + 5);
      
    } catch (error) {
      console.error('Failed to play note:', note, error);
    }
  }, [initializeAudio, applyADSR])

  // 停止音符
  const stopNote = useCallback((note: string) => {
    try {
      const activeSource = activeSourcesRef.current.get(note);
      if (activeSource) {
        const { source, gainNode } = activeSource;
        const context = audioContextRef.current;
        
        if (context) {
          const now = context.currentTime;
          
          if (sustain) {
            if (!sustainPedalReleasedTimeRef.current) {
              return;
            }
            const releaseTime = sustainPedalReleasedTimeRef.current;
            const releaseDuration = Math.min(adsrConfig.release, now - releaseTime);
            
            gainNode.gain.setValueAtTime(gainNode.gain.value, releaseTime);
            gainNode.gain.linearRampToValueAtTime(0, releaseTime + releaseDuration);
            
            setTimeout(() => {
              try {
                source.stop();
              } catch (e) {}
              activeSourcesRef.current.delete(note);
            }, releaseDuration * 1000);
          } else {
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + adsrConfig.release);
            
            setTimeout(() => {
              try {
                source.stop();
              } catch (e) {}
              activeSourcesRef.current.delete(note);
            }, adsrConfig.release * 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error stopping note:', note, error);
    }
  }, [sustain, adsrConfig]);

  // 处理延音踏板状态变化
  useEffect(() => {
    if (!sustain && sustainPedalReleasedTimeRef.current === null) {
      sustainPedalReleasedTimeRef.current = audioContextRef.current?.currentTime || 0;
      
      activeSourcesRef.current.forEach((_, note) => {
        stopNote(note);
      });
    } else if (sustain) {
      sustainPedalReleasedTimeRef.current = null;
    }
  }, [sustain, stopNote]);

  // 获取当前时间
  const getCurrentTime = useCallback((): number => {
    return audioContextRef.current?.currentTime || 0;
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      activeSourcesRef.current.forEach(({ source }) => {
        try {
          source.stop();
        } catch (e) {}
      });
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playNote,
    stopNote,
    initializeAudio,
    isReady,
    isLoading,
    setSustain,
    sustain,
    getCurrentTime
  };
}