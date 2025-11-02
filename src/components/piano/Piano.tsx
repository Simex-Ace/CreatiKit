import React from 'react';
import { NOTE_FREQUENCIES, KEY_TO_NOTE } from './usePianoSound';

interface PianoProps {
  onKeyDown: (note: string, frequency: number) => void;
  onKeyUp: (note: string) => void;
  activeNotes: Set<string>;
  disabled?: boolean;
}

export const Piano: React.FC<PianoProps> = ({ onKeyDown, onKeyUp, activeNotes, disabled = false }) => {
  // 定义一个八度的音符（从C4到C5）
  const notes = [
    { name: 'C4', key: 'A', isBlack: false, width: 1 },
    { name: 'C#4', key: 'W', isBlack: true, width: 0.6, offset: 0.3 },
    { name: 'D4', key: 'S', isBlack: false, width: 1 },
    { name: 'D#4', key: 'E', isBlack: true, width: 0.6, offset: 0.3 },
    { name: 'E4', key: 'D', isBlack: false, width: 1 },
    { name: 'F4', key: 'F', isBlack: false, width: 1 },
    { name: 'F#4', key: 'T', isBlack: true, width: 0.6, offset: 0.3 },
    { name: 'G4', key: 'G', isBlack: false, width: 1 },
    { name: 'G#4', key: 'Y', isBlack: true, width: 0.6, offset: 0.3 },
    { name: 'A4', key: 'H', isBlack: false, width: 1 },
    { name: 'A#4', key: 'U', isBlack: true, width: 0.6, offset: 0.3 },
    { name: 'B4', key: 'J', isBlack: false, width: 1 },
    { name: 'C5', key: 'K', isBlack: false, width: 1 }
  ];

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative" style={{ height: '300px' }}>
        {/* 渲染白键 */}
        <div className="flex h-full">
          {notes
            .filter(note => !note.isBlack)
            .map((note, index) => (
              <div
                key={note.name}
                className={`relative border border-gray-300 rounded-b-lg flex flex-col items-center justify-end p-3 transition-all duration-100 ${activeNotes.has(note.name)
                  ? 'bg-blue-100 shadow-inner transform translate-y-2' 
                  : 'bg-white hover:bg-gray-50'}`}
                style={{ width: `${note.width * 80}px` }}
                onMouseDown={() => handleMouseDown(note.name)}
                onMouseUp={() => handleMouseUp(note.name)}
                onMouseLeave={() => handleMouseUp(note.name)}
                onTouchStart={(e) => handleTouchStart(note.name, e)}
                onTouchEnd={() => handleTouchEnd(note.name)}
              >
                <span className="text-gray-600 font-mono text-sm mb-2">{note.name}</span>
                <span className="text-gray-400 text-xs">{note.key}</span>
              </div>
            ))}
        </div>

        {/* 渲染黑键（绝对定位在白键上方） */}
        <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none">
          {notes
            .filter(note => note.isBlack)
            .map((note, index) => {
              // 计算黑键的位置
              const prevWhiteKeys = notes.filter((n, i) => i < index && !n.isBlack);
              const position = prevWhiteKeys.reduce((sum, n) => sum + n.width, 0) + (note.offset || 0);
              
              return (
                <div
                  key={note.name}
                  className={`absolute pointer-events-auto border border-gray-800 rounded-b-lg flex flex-col items-center justify-end p-2 transition-all duration-100 ${activeNotes.has(note.name)
                    ? 'bg-blue-700 shadow-inner transform translate-y-2' 
                    : 'bg-black hover:bg-gray-800'}`}
                  style={{
                    left: `${position * 80}px`,
                    width: `${note.width * 80}px`
                  }}
                  onMouseDown={() => handleMouseDown(note.name)}
                  onMouseUp={() => handleMouseUp(note.name)}
                  onMouseLeave={() => handleMouseUp(note.name)}
                  onTouchStart={(e) => handleTouchStart(note.name, e)}
                  onTouchEnd={() => handleTouchEnd(note.name)}
                >
                  <span className="text-white text-xs font-mono">{note.key}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};