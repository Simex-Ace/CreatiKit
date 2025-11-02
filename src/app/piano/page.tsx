'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePianoSound, KEY_TO_NOTE, NOTE_FREQUENCIES } from '@/components/piano/usePianoSound';
import { Piano } from '@/components/piano/Piano';

export default function PianoPage() {
  const { playNote, stopNote, isReady, initializeAudio } = usePianoSound();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [audioInitialized, setAudioInitialized] = useState(false);

  // 初始化音频系统
  const initAudioSystem = useCallback(async () => {
    if (!audioInitialized) {
      try {
        await initializeAudio();
        setAudioInitialized(true);
      } catch (error) {
        console.error('初始化音频系统失败:', error);
      }
    }
  }, [initializeAudio, audioInitialized]);

  // 处理琴键按下
  const handleKeyDown = useCallback((note: string, frequency: number) => {
    if (!activeNotes.has(note)) {
      // 确保音频已初始化
      initAudioSystem().then(() => {
        playNote(note); // 传递音符名称而不是频率
        setActiveNotes(prev => new Set(prev).add(note));
      });
    }
  }, [activeNotes, playNote, initAudioSystem]);

  // 处理琴键释放
  const handleKeyUp = useCallback((note: string) => {
    stopNote();
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, [stopNote]);

  // 手动测试音频按钮点击处理
  const handleTestAudio = async () => {
    console.log('手动测试音频功能...');
    try {
      await initializeAudio();
      setAudioInitialized(true);
      console.log('音频初始化成功');
      await playNote('A4');
    } catch (error) {
      console.error('音频测试失败:', error);
    }
  };

  // 处理全局键盘事件
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const note = KEY_TO_NOTE[event.key.toLowerCase()];
      console.log('键盘按下:', event.key, '音符:', note);
      if (note && NOTE_FREQUENCIES[note]) {
        // 阻止默认行为
        event.preventDefault();
        handleKeyDown(note, NOTE_FREQUENCIES[note]);
      }
    };

    const handleGlobalKeyUp = (event: KeyboardEvent) => {
      const note = KEY_TO_NOTE[event.key.toLowerCase()];
      console.log('键盘释放:', event.key, '音符:', note);
      if (note && activeNotes.has(note)) {
        event.preventDefault();
        handleKeyUp(note);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, activeNotes]);

  // 监听音频就绪状态变化
  useEffect(() => {
    if (isReady && !audioInitialized) {
      setAudioInitialized(true);
    }
  }, [isReady, audioInitialized]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题区域 */}
        <header className="mb-8 text-center">
          <div className="inline-block bg-blue-600 text-white p-3 rounded-full mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="18" r="3" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">在线电子钢琴</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">使用鼠标点击或电脑键盘弹奏钢琴，体验真实的钢琴音色</p>
          
          {/* 手动测试音频按钮 */}
          <div className="mt-4">
            <button 
              onClick={handleTestAudio}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium text-white transition-colors"
            >
              🎵 测试音频 (点击初始化并播放A4音符)
            </button>
          </div>
        </header>

        {/* 主内容卡片 */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 transform hover:shadow-2xl transition-all duration-300">
          <div className="p-6 sm:p-8">
            <div 
            className="flex flex-col items-center justify-center min-h-[400px]"
            onClick={initAudioSystem}
          >
              {!audioInitialized && (
                <div className="text-center p-8 mb-4 cursor-pointer">
                  <p className="text-blue-600 font-medium">点击此处初始化音频系统</p>
                  <p className="text-gray-500 text-sm mt-2">需要您的交互来激活音频功能</p>
                </div>
              )}
              
              <Piano 
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                activeNotes={activeNotes}
                disabled={!audioInitialized}
              />
              
              <div className="mt-8 text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">键盘映射</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">A</span>
                    <span className="ml-2">C4 (Do)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">W</span>
                    <span className="ml-2">C#4 (升Do)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">S</span>
                    <span className="ml-2">D4 (Re)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">E</span>
                    <span className="ml-2">D#4 (升Re)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">D</span>
                    <span className="ml-2">E4 (Mi)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">F</span>
                    <span className="ml-2">F4 (Fa)</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">继续使用 G, H, J, K, L 等键来演奏更高的音符</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}