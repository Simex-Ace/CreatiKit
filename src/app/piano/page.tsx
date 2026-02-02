'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePianoSound, KEY_TO_NOTE, NOTE_FREQUENCIES, AudioEvent } from '../../components/piano/usePianoSound';
import { Piano } from '../../components/piano/Piano';
import { useI18n } from '@/contexts/I18nContext';

// 录音元数据接口
interface RecordingMetadata {
  bpm: number;
  duration: number;
  createdAt: string;
  notes: AudioEvent[];
}

export default function PianoPage() {
  const { t } = useI18n();
  
  // 音频相关状态
  const {
    playNote,
    stopNote,
    stopAllNotes,
    initializeAudio,
    isReady,
    isLoading,
    setSustain,
    sustain,
    getCurrentTime
  } = usePianoSound();
  
  // 应用状态
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordingEvents, setRecordingEvents] = useState<AudioEvent[]>([]);
  const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  
  // 显示通知
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({show: true, message, type});
    setTimeout(() => {
      setNotification(prev => ({...prev, show: false}));
    }, 3000);
  }, []);
  
  // 引用
  const recordingStartTimeRef = useRef<number>(0);
  const noteStartTimesRef = useRef<Map<string, number>>(new Map());
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化音频系统
  const initAudioSystem = useCallback(async () => {
    if (!audioInitialized) {
      try {
        await initializeAudio();
        setAudioInitialized(true);
      } catch (error) {
        console.error('初始化音频系统失败:', error instanceof Error ? error.message : String(error));
      }
    }
  }, [initializeAudio, audioInitialized]);

  // 处理琴键按下
  const handleKeyDown = useCallback((note: string, frequency: number) => {
    if (!activeNotes.has(note)) {
      // 确保音频已初始化
      initAudioSystem().then(() => {
        playNote(note);
        setActiveNotes(prev => new Set(prev).add(note));
        
        // 录音逻辑
        if (isRecording) {
          const currentTime = getCurrentTime() - recordingStartTimeRef.current;
          noteStartTimesRef.current.set(note, currentTime);
        }
      });
    }
  }, [activeNotes, playNote, initAudioSystem, isRecording, getCurrentTime]);

  // 处理琴键释放
  const handleKeyUp = useCallback((note: string) => {
    stopNote(note);
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    
    // 录音逻辑
    if (isRecording && noteStartTimesRef.current.has(note)) {
      const startTime = noteStartTimesRef.current.get(note)!;
      const endTime = getCurrentTime() - recordingStartTimeRef.current;
      const duration = endTime - startTime;
      
      setRecordingEvents(prev => [...prev, {
        note,
        startTime,
        duration
      }]);
      
      noteStartTimesRef.current.delete(note);
    }
  }, [stopNote, isRecording, getCurrentTime]);

  // 切换八度
  const changeOctave = useCallback((direction: 'up' | 'down') => {
    setCurrentOctave(prev => {
      if (direction === 'up' && prev < 5) return prev + 1;
      if (direction === 'down' && prev > 3) return prev - 1;
      return prev;
    });
  }, []);

  // 开始录音
  const startRecording = useCallback(() => {
    if (!audioInitialized) {
      showNotification(t('pianoPage.initAudioFirst'), 'error');
      return;
    }
    
    setIsRecording(true);
    setRecordingEvents([]);
    recordingStartTimeRef.current = getCurrentTime();
    noteStartTimesRef.current.clear();
    
    // 视觉反馈
    document.title = '🎤 正在录音...';
  }, [audioInitialized, getCurrentTime, showNotification]);

  // 停止录音
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    // 确保所有正在播放的音符都被记录
    const endTime = getCurrentTime() - recordingStartTimeRef.current;
    noteStartTimesRef.current.forEach((startTime, note) => {
      const duration = endTime - startTime;
      setRecordingEvents(prev => [...prev, {
        note,
        startTime,
        duration
      }]);
    });
    
    noteStartTimesRef.current.clear();
    document.title = '在线电子钢琴 - 迷你音乐工作站';
  }, [getCurrentTime]);

  // 播放录音
  const playBackRecording = useCallback(() => {
    if (!audioInitialized || recordingEvents.length === 0) {
      console.warn('无法播放录音:', { audioInitialized, eventsLength: recordingEvents.length });
      return;
    }
    
    console.log('开始播放录音，音符数量:', recordingEvents.length);
    setIsPlayingBack(true);
    
    // 按时间排序事件
    const sortedEvents = [...recordingEvents].sort((a, b) => a.startTime - b.startTime);
    let currentEventIndex = 0;
    
    // 确保音频上下文处于运行状态
    initAudioSystem().then(() => {
      const playbackStartTime = Date.now();
      
      const processEvents = () => {
        if (currentEventIndex >= sortedEvents.length) {
          // 播放结束
          console.log('录音播放完成');
          setIsPlayingBack(false);
          setActiveNotes(new Set());
          return;
        }
        
        const elapsed = (Date.now() - playbackStartTime) / 1000; // 转换为秒
        
        // 处理所有应该开始的事件
        while (currentEventIndex < sortedEvents.length && sortedEvents[currentEventIndex].startTime <= elapsed) {
          const event = sortedEvents[currentEventIndex];
          
          // 验证音符有效性
          if (!NOTE_FREQUENCIES[event.note]) {
            console.warn('跳过无效音符:', event.note);
            currentEventIndex++;
            continue;
          }
          
          console.log(`播放音符 ${event.note}，持续时间: ${event.duration}秒`);
          
          // 播放音符
          playNote(event.note).catch(err => {
            console.error(`播放音符 ${event.note} 失败:`, err);
          });
          
          setActiveNotes(prev => new Set(prev).add(event.note));
          
          // 设置音符停止时间
          setTimeout(() => {
            stopNote(event.note);
            setActiveNotes(prev => {
              const newSet = new Set(prev);
              newSet.delete(event.note);
              return newSet;
            });
          }, event.duration * 1000);
          
          currentEventIndex++;
        }
        
        // 继续处理下一批事件
        if (currentEventIndex < sortedEvents.length) {
          playbackTimerRef.current = setTimeout(processEvents, 10);
        }
      };
      
      processEvents();
    }).catch(error => {
        console.error('音频初始化失败，无法播放录音:', error);
        setIsPlayingBack(false);
        showNotification(t('pianoPage.cannotPlayRecording'), 'error');
      });
  }, [audioInitialized, recordingEvents, playNote, stopNote, initAudioSystem, showNotification]);
  
  // 停止回放
  const stopPlayback = useCallback(() => {
    setIsPlayingBack(false);
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setActiveNotes(new Set());
    // 停止所有音符，确保没有残留声音
    stopAllNotes();
  }, [stopAllNotes]);

  // 保存录音到本地
  const saveRecording = useCallback(() => {
    if (recordingEvents.length === 0) {
      showNotification(t('pianoPage.noRecordingToSave'), 'error');
      return;
    }
    
    // 计算录音持续时间
    const duration = recordingEvents.reduce((max, event) => 
      Math.max(max, event.startTime + event.duration), 0);
    
    // 创建元数据对象
    const metadata: RecordingMetadata = {
      bpm: 120, // 默认BPM
      duration,
      createdAt: new Date().toISOString(),
      notes: recordingEvents
    };
    
    // 序列化为JSON
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = `piano-recording-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordingEvents]);

  // 导入录音
  const importRecording = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [showNotification]);

  // 处理文件选择
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 检查文件扩展名
        if (!file.name.endsWith('.json')) {
          showNotification(t('pianoPage.selectJsonFile'), 'error');
          event.target.value = '';
          return;
        }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const metadata: RecordingMetadata = JSON.parse(content);
        
        // 详细验证数据格式
        if (!metadata || typeof metadata !== 'object') {
          throw new Error(t('pianoPage.invalidFileFormat'));
        }
        
        if (!metadata.notes || !Array.isArray(metadata.notes)) {
          throw new Error(t('pianoPage.missingNotesData'));
        }
        
        // 验证每个音符事件的格式
        const validNotes = metadata.notes.filter(event => {
          return event && 
                 typeof event.note === 'string' && 
                 NOTE_FREQUENCIES[event.note] !== undefined && 
                 typeof event.startTime === 'number' && 
                 typeof event.duration === 'number' && 
                 event.startTime >= 0 && 
                 event.duration > 0;
        });
        
        if (validNotes.length === 0) {
          throw new Error(t('pianoPage.noValidNotes'));
        }
        
        // 确保音频已初始化
        initAudioSystem().then(() => {
          setRecordingEvents(validNotes);
          
          // 改进用户体验，使用更友好的提示和更强的视觉反馈
          const playButton = document.querySelector('button[onclick*="playBackRecording"]') as HTMLButtonElement;
          if (playButton) {
            // 聚焦到播放按钮，提示用户可以播放
            playButton.focus();
            playButton.classList.add('ring-2', 'ring-blue-400');
            setTimeout(() => {
              playButton.classList.remove('ring-2', 'ring-blue-400');
            }, 2000);
          }
          
          showNotification(t('pianoPage.importSuccess', { count: validNotes.length }));
          console.log('导入的录音数据:', validNotes);
        }).catch(error => {
          console.error('初始化音频失败:', error);
          showNotification(t('pianoPage.importSuccessButInitFailed'), 'error');
        });
      } catch (error) {
        console.error('导入文件解析错误:', error);
        showNotification(`${t('pianoPage.importFailed')}: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入，允许重新选择同一文件
    event.target.value = '';
  }, [initAudioSystem]);

  // 处理全局键盘事件
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // 八度切换
      if (event.key.toLowerCase() === 'z' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        changeOctave('down');
        return;
      }
      if (event.key.toLowerCase() === 'x' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        changeOctave('up');
        return;
      }
      
      // 延音踏板
      if (event.code === 'Space') {
        event.preventDefault();
        setSustain(true);
        return;
      }
      
      // 正常音符播放
      const note = KEY_TO_NOTE[event.key.toLowerCase()] || KEY_TO_NOTE[event.code];
      if (note && NOTE_FREQUENCIES[note]) {
        event.preventDefault();
        handleKeyDown(note, NOTE_FREQUENCIES[note]);
      }
    };

    const handleGlobalKeyUp = (event: KeyboardEvent) => {
      // 延音踏板释放
      if (event.code === 'Space') {
        setSustain(false);
        return;
      }
      
      // 正常音符释放
      const note = KEY_TO_NOTE[event.key.toLowerCase()] || KEY_TO_NOTE[event.code];
      if (note && NOTE_FREQUENCIES[note] && activeNotes.has(note)) {
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
  }, [handleKeyDown, handleKeyUp, activeNotes, currentOctave, changeOctave, setSustain]);

  // 监听音频就绪状态变化
  useEffect(() => {
    if (isReady && !audioInitialized) {
      setAudioInitialized(true);
    }
  }, [isReady, audioInitialized]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 停止回放
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
      // 组件卸载时停止所有音符，确保没有残留声音
      stopAllNotes();
    };
  }, [stopAllNotes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 transition-colors duration-300">
      {/* 自定义通知组件 */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题区域 */}
        <header className="mb-6 text-center">
          <div className="inline-block bg-blue-600 text-white p-3 rounded-full mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="18" r="3" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{t('pianoPage.title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('pianoPage.subtitle')}</p>
        </header>

        {/* 控制区域 */}
        <div className="bg-white shadow-lg rounded-xl p-4 mb-6 flex flex-wrap gap-3 justify-center items-center">
          {/* 八度控制 */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <button
              onClick={() => changeOctave('down')}
              disabled={currentOctave <= 3}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400"
            >
              ↓
            </button>
            <span className="font-semibold">{t('pianoPage.octave')}: {currentOctave}</span>
            <button
              onClick={() => changeOctave('up')}
              disabled={currentOctave >= 5}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400"
            >
              ↑
            </button>
            <span className="text-xs text-gray-500 ml-2">[Z/X键]</span>
          </div>

          {/* 延音踏板指示器 */}
          <div className={`px-4 py-2 rounded-lg font-medium transition-colors ${sustain ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
            🎹 {t('pianoPage.sustainPedal')}: {sustain ? t('pianoPage.pressed') : t('pianoPage.released')} <span className="text-xs ml-1">[空格键]</span>
          </div>

          {/* 录音控制 */}
          <div className="flex gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={!audioInitialized || isPlayingBack}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400"
              >
                🎤 {t('pianoPage.startRecording')}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 animate-pulse"
              >
                ⏹️ {t('pianoPage.stopRecording')} ({t('pianoPage.notesCount', { count: recordingEvents.length })})
              </button>
            )}
          </div>

          {/* 回放控制 */}
          <div className="flex gap-2">
            {!isPlayingBack ? (
              <button
                onClick={playBackRecording}
                disabled={!audioInitialized || recordingEvents.length === 0 || isRecording}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400"
              >
                ▶️ {t('pianoPage.play')} ({t('pianoPage.notesCount', { count: recordingEvents.length })})
              </button>
            ) : (
              <button
                onClick={stopPlayback}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                ⏹️ {t('pianoPage.stopPlayback')}
              </button>
            )}
          </div>

          {/* 文件操作 */}
          <div className="flex gap-2">
            <button
              onClick={saveRecording}
              disabled={recordingEvents.length === 0}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400"
            >
              💾 {t('pianoPage.saveRecording')}
            </button>
            <button
              onClick={importRecording}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2"
            >
              📂 {t('pianoPage.importRecording')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* 主内容卡片 */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 transform hover:shadow-2xl transition-all duration-300">
          <div className="p-6 sm:p-8">
            <div 
              className="flex flex-col items-center justify-center min-h-[400px]"
              onClick={initAudioSystem}
            >
              {isLoading && (
                <div className="text-center mb-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-blue-600">{t('pianoPage.loadingPiano')}</p>
                </div>
              )}
              
              {!audioInitialized && !isLoading && (
                <div className="text-center p-8 mb-4 cursor-pointer">
                  <p className="text-blue-600 font-medium">{t('pianoPage.clickToInitAudio')}</p>
                  <p className="text-gray-500 text-sm mt-2">{t('pianoPage.needInteraction')}</p>
                </div>
              )}
              
              <Piano 
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                activeNotes={activeNotes}
                disabled={!audioInitialized || isPlayingBack}
              />
              
              <div className="mt-8 text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">{t('pianoPage.keyboardMapping')}</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">s</span>
                    <span className="ml-2">C4 (中央C)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">d</span>
                    <span className="ml-2">C#4 (升Do)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">f</span>
                    <span className="ml-2">D4 (Re)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">g</span>
                    <span className="ml-2">D#4 (升Re)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">h</span>
                    <span className="ml-2">E4 (Mi)</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">j</span>
                    <span className="ml-2">F4 (Fa)</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">音符直接映射到对应的键位，无需八度切换</p>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">快捷键说明</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Z: 降低八度</div>
                    <div>X: 升高八度</div>
                    <div>空格键: 延音踏板</div>
                    <div>点击任意位置: 初始化音频</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}