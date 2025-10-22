'use client';

import { useEffect } from 'react';

interface MarkdownEditorLoaderProps {
  onAnimationComplete: () => void;
}

export function MarkdownEditorLoader({ onAnimationComplete }: MarkdownEditorLoaderProps) {
  useEffect(() => {
    // 缩短动画时间：1秒
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <>
      <style jsx global>{`
        @keyframes markdownFade {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes markdownPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .markdown-element {
          animation: markdownFade 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .markdown-element:nth-child(2) { animation-delay: 0.2s; }
        .markdown-element:nth-child(3) { animation-delay: 0.4s; }
        .markdown-element:nth-child(4) { animation-delay: 0.6s; }
        
        .markdown-icon {
          animation: markdownPulse 1.2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-72 mb-6 border border-indigo-100">
          <div className="markdown-element mb-3">
            <h3 className="text-xl font-bold text-indigo-600"># 正在加载</h3>
          </div>
          <div className="markdown-element mb-3">
            <p className="text-gray-700">**Markdown** 编辑器</p>
          </div>
          <div className="markdown-element mb-3">
            <div className="flex items-center">
              <span className="text-gray-600">-</span>
              <span className="text-gray-700 ml-2">支持实时预览</span>
            </div>
          </div>
          <div className="markdown-element">
            <pre className="bg-gray-100 p-2 rounded text-xs text-gray-600">
              ```markdown
              正在准备格式化工具...
              ```
            </pre>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-indigo-600">📝 正在准备Markdown编辑器 📝</h2>
          <p className="text-gray-600 mt-2">
            <span className="markdown-icon">✨</span> 支持丰富的文本格式化功能 <span className="markdown-icon">✨</span>
          </p>
        </div>
      </div>
    </>
  );
}