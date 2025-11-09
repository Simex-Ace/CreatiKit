import React from 'react';
import { NOTE_FREQUENCIES, KEY_TO_NOTE } from './usePianoSound';

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
}

// 生成完整的88键钢琴音符列表
const generateCompletePianoNotes = () => {
  const notes: PianoKey[] = [];
  
  // 完整钢琴音域: A0-C8
  const octaveRange = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  
  // 对于每个八度，生成相应的音符
  octaveRange.forEach(octave => {
    if (octave === 0) {
      // A0, A#0, B0
      ['A', 'A#', 'B'].forEach(noteName => {
        const fullName = `${noteName}${octave}`;
        notes.push({
          name: fullName,
          key: Object.keys(KEY_TO_NOTE).find(key => KEY_TO_NOTE[key] === fullName),
          isBlack: noteName.includes('#'),
          width: 1
        });
      });
    } else if (octave === 8) {
      // 只有C8
      notes.push({
        name: 'C8',
        key: Object.keys(KEY_TO_NOTE).find(key => KEY_TO_NOTE[key] === 'C8'),
        isBlack: false,
        width: 1
      });
    } else {
      // 其他八度完整的12个音符
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach(noteName => {
        const fullName = `${noteName}${octave}`;
        notes.push({
          name: fullName,
          key: Object.keys(KEY_TO_NOTE).find(key => KEY_TO_NOTE[key] === fullName),
          isBlack: noteName.includes('#'),
          width: 1
        });
      });
    }
  });
  
  return notes;
};

// 获取音符的八度编号
const getOctave = (note: string): number => {
  const match = note.match(/\d+/);
  return match ? parseInt(match[0]) : 4;
};

export const Piano: React.FC<PianoProps> = ({
  onKeyDown,
  onKeyUp,
  activeNotes,
  disabled = false
}) => {

  // 使用完整的88键音符列表
  const notes = generateCompletePianoNotes();

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

  // 获取音符的视觉重要性级别
  const getNoteImportance = (note: PianoKey): 'primary' | 'secondary' | 'tertiary' => {
    const octave = getOctave(note.name);
    // 中央C区域最重要
    if (octave >= 3 && octave <= 5) return 'primary';
    // 次重要区域
    if (octave >= 2 && octave <= 6) return 'secondary';
    // 最高和最低音区
    return 'tertiary';
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* 88键钢琴指示器 */}
      <div className="text-center mb-2 text-sm text-gray-600 font-medium">
        标准88键钢琴 (A0 - C8)
      </div>
      
      {/* 八度标记 */}
        <div className="relative mb-1 h-6">
          {notes
            .filter(note => !note.isBlack && note.name.startsWith('C'))
            .map((note) => {
              const octave = getOctave(note.name);
              const noteIndex = notes.indexOf(note);
              const prevWhiteKeys = notes.slice(0, noteIndex).filter(n => !n.isBlack);
              const position = prevWhiteKeys.length;
            
            return (
              <div
                key={`octave-${octave}`}
                className="absolute"
                style={{
                  left: `${(position + 0.5) * 45}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <span className={`text-xs ${octave === 4 ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                  {octave}
                </span>
              </div>
            );
          })}
      </div>
      
      {/* 钢琴键盘容器 */}
      <div className="relative" style={{ height: '220px', minWidth: `${notes.filter(n => !n.isBlack).length * 45}px` }}>
        {/* 渲染白键 */}
        <div className="flex h-full">
          {notes
            .filter(note => !note.isBlack)
            .map((note, index) => {
              const importance = getNoteImportance(note);
              const isCentralC = note.name === 'C4';
              
              return (
                <div
                  key={note.name}
                  className={`relative border border-gray-300 rounded-b-lg flex flex-col items-center justify-end p-2 transition-all duration-100 ${activeNotes.has(note.name)
                    ? 'bg-blue-100 shadow-inner transform translate-y-2' 
                    : importance === 'primary' 
                      ? 'bg-white hover:bg-gray-50 cursor-pointer' 
                      : importance === 'secondary' 
                        ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
                        : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'}`}
                  style={{
                    width: '45px',
                    // 中央C做特殊标记
                    borderBottom: isCentralC ? '3px solid blue' : '1px solid #e5e7eb'
                  }}
                  onMouseDown={() => handleMouseDown(note.name)}
                  onMouseUp={() => handleMouseUp(note.name)}
                  onMouseLeave={() => handleMouseUp(note.name)}
                  onTouchStart={(e) => handleTouchStart(note.name, e)}
                  onTouchEnd={() => handleTouchEnd(note.name)}
                >
                  <span className={`font-mono text-xs ${importance === 'primary' ? 'text-gray-700' : 'text-gray-500'}`}>
                    {note.name}
                  </span>
                  {note.key && (
                    <span className={`text-xs mt-1 ${activeNotes.has(note.name) ? 'text-blue-600' : 'text-gray-400'}`}>
                      {note.key.length > 1 ? note.key.slice(0, 1) : note.key}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* 渲染黑键（绝对定位在白键上方） */}
        <div className="absolute top-0 left-0 right-0 h-[65%] pointer-events-none">
          {notes
            .filter(note => note.isBlack)
            .map((note) => {
              // 计算黑键的位置
              const noteIndex = notes.indexOf(note);
              const prevWhiteKeys = notes.slice(0, noteIndex).filter(n => !n.isBlack);
              const position = prevWhiteKeys.length;
              
              const importance = getNoteImportance(note);
              
              return (
                <div
                  key={note.name}
                  className={`absolute pointer-events-auto border border-gray-800 rounded-b-lg flex flex-col items-center justify-end p-1 transition-all duration-100 ${activeNotes.has(note.name)
                    ? 'bg-blue-700 shadow-inner transform translate-y-2' 
                    : importance === 'primary' 
                      ? 'bg-black hover:bg-gray-800 cursor-pointer' 
                      : importance === 'secondary' 
                        ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer' 
                        : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}`}
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
                      {note.key.length > 1 ? note.key.slice(0, 1) : note.key}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      
      {/* 键盘使用提示 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        提示：可以使用键盘按键或鼠标/触摸屏点击钢琴键进行演奏
      </div>
    </div>
  );
};