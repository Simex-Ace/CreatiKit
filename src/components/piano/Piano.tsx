import React from 'react';
import { NOTE_FREQUENCIES } from './usePianoSound';

interface PianoKey {
  name: string;
  key?: string;
  isBlack: boolean;
  width: number;
  offset?: number;
}

interface PianoProps {
  onKeyDown: (note: string, frequency: number) => void;
  onKeyUp: (note: string) => void;
  activeNotes: Set<string>;
  disabled?: boolean;
  currentOctave: number;
  showOctaves?: number;
}

export const Piano: React.FC<PianoProps> = ({
  onKeyDown,
  onKeyUp,
  activeNotes,
  disabled = false,
  currentOctave = 4,
  showOctaves = 3
}) => {
  // 生成指定范围的音符
  const generateNotes = () => {
    const notes: PianoKey[] = [];
    const startOctave = Math.max(3, currentOctave - Math.floor((showOctaves - 1) / 2));
    const endOctave = Math.min(5, startOctave + showOctaves - 1);
    
    // 一个八度的音符名称
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // 键盘映射（基于当前八度）
    const baseKeyMap: Record<string, string> = {
      'C': 'a', 'C#': 'w', 'D': 's', 'D#': 'e', 'E': 'd', 'F': 'f',
      'F#': 't', 'G': 'g', 'G#': 'y', 'A': 'h', 'A#': 'u', 'B': 'j'
    };
    
    // 为每个八度生成音符
    for (let currentOct = startOctave; currentOct <= endOctave; currentOct++) {
      noteNames.forEach((noteName, index) => {
        const fullName = `${noteName}${currentOct}`;
        const isBlack = noteName.includes('#');
        
        // 为当前八度的音符分配键盘映射
        let key = undefined;
        if (currentOct === currentOctave) {
          key = baseKeyMap[noteName]?.toUpperCase();
        }
        
        notes.push({
          name: fullName,
          key,
          isBlack,
          width: 1,
          offset: isBlack ? 0.3 : 0
        });
      });
    }
    
    // 添加额外的C6音符
    if (endOctave === 5) {
      notes.push({
        name: 'C6',
        key: currentOctave === 5 ? ';' : undefined,
        isBlack: false,
        width: 1
      });
    }
    
    return notes;
  };

  const notes = generateNotes();

  // 处理鼠标按下
  const handleMouseDown = (note: string) => {
    if (disabled || !NOTE_FREQUENCIES[note]) return;
    onKeyDown(note, NOTE_FREQUENCIES[note]);
  };

  // 处理鼠标释放
  const handleMouseUp = (note: string) => {
    if (disabled) return;
    onKeyUp(note);
  };

  // 处理触摸开始
  const handleTouchStart = (note: string, event: React.TouchEvent) => {
    event.preventDefault(); // 防止触摸事件导致的滚动
    if (disabled || !NOTE_FREQUENCIES[note]) return;
    onKeyDown(note, NOTE_FREQUENCIES[note]);
  };

  // 处理触摸结束
  const handleTouchEnd = (note: string) => {
    if (disabled) return;
    onKeyUp(note);
  };

  // 获取当前八度显示的范围
  const getOctaveRangeText = () => {
    const startOctave = Math.max(3, currentOctave - Math.floor((showOctaves - 1) / 2));
    const endOctave = Math.min(5, startOctave + showOctaves - 1);
    return `C${startOctave} - C${endOctave + 1}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* 八度范围指示器 */}
      <div className="text-center mb-2 text-sm text-gray-500">
        {getOctaveRangeText()}
      </div>
      
      <div className="relative" style={{ height: '200px', minWidth: `${notes.filter(n => !n.isBlack).length * 45}px` }}>
        {/* 渲染白键 */}
        <div className="flex h-full">
          {notes
            .filter(note => !note.isBlack)
            .map((note, index) => {
              const isCurrentOctave = parseInt(note.name.slice(-1)) === currentOctave;
              
              return (
                <div
                  key={note.name}
                  className={`relative border border-gray-300 rounded-b-lg flex flex-col items-center justify-end p-2 transition-all duration-100 ${activeNotes.has(note.name)
                    ? 'bg-blue-100 shadow-inner transform translate-y-2' 
                    : isCurrentOctave ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'}`}
                  style={{ width: '45px' }}
                  onMouseDown={() => handleMouseDown(note.name)}
                  onMouseUp={() => handleMouseUp(note.name)}
                  onMouseLeave={() => handleMouseUp(note.name)}
                  onTouchStart={(e) => handleTouchStart(note.name, e)}
                  onTouchEnd={() => handleTouchEnd(note.name)}
                >
                  <span className={`font-mono text-xs ${isCurrentOctave ? 'text-gray-600' : 'text-gray-400'}`}>
                    {note.name}
                  </span>
                  {note.key && (
                    <span className={`text-xs mt-1 ${activeNotes.has(note.name) ? 'text-blue-600' : 'text-gray-400'}`}>
                      {note.key}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* 渲染黑键（绝对定位在白键上方） */}
        <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none">
          {notes
            .filter(note => note.isBlack)
            .map((note) => {
              // 计算黑键的位置
              const noteIndex = notes.indexOf(note);
              const prevWhiteKeys = notes.slice(0, noteIndex).filter(n => !n.isBlack);
              const position = prevWhiteKeys.length;
              
              const isCurrentOctave = parseInt(note.name.slice(-1)) === currentOctave;
              
              return (
                <div
                  key={note.name}
                  className={`absolute pointer-events-auto border border-gray-800 rounded-b-lg flex flex-col items-center justify-end p-1 transition-all duration-100 ${activeNotes.has(note.name)
                    ? 'bg-blue-700 shadow-inner transform translate-y-2' 
                    : isCurrentOctave ? 'bg-black hover:bg-gray-800 cursor-pointer' : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'}`}
                  style={{
                    left: `${(position - 0.25) * 45}px`,
                    width: '30px',
                    zIndex: 10
                  }}
                  onMouseDown={() => handleMouseDown(note.name)}
                  onMouseUp={() => handleMouseUp(note.name)}
                  onMouseLeave={() => handleMouseUp(note.name)}
                  onTouchStart={(e) => handleTouchStart(note.name, e)}
                  onTouchEnd={() => handleTouchEnd(note.name)}
                >
                  {note.key && (
                    <span className={`text-white text-xs font-mono ${activeNotes.has(note.name) ? 'opacity-100' : 'opacity-70'}`}>
                      {note.key}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};