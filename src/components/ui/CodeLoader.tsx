'use client';

import { useEffect } from 'react';

interface CodeLoaderProps {
  onAnimationComplete: () => void;
}

export function CodeLoader({ onAnimationComplete }: CodeLoaderProps) {
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
        @keyframes codeType {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        
        @keyframes codePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .code-line {
          animation: codeType 0.8s ease-out forwards;
          display: block;
          opacity: 0;
        }
        
        .code-line:nth-child(2) { animation-delay: 0.2s; }
        .code-line:nth-child(3) { animation-delay: 0.4s; }
        .code-line:nth-child(4) { animation-delay: 0.6s; }
        .code-line:nth-child(5) { animation-delay: 0.8s; }
        
        .code-bracket {
          animation: codePulse 1.5s ease-in-out infinite;
          color: #7b68ee;
          font-weight: bold;
        }
        
        .code-key {
          color: #ff7300;
        }
        
        .code-value {
          color: #008000;
        }
        
        .code-punctuation {
          color: #696969;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-72 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre className="font-mono text-sm text-gray-800 overflow-hidden">
            <span className="code-line">{'<'}{'span'}{' '}<span className="code-key">className</span>=<span className="code-value">"loading"</span>{'>'}</span>
            <span className="code-line">{'  '}Preparing <span className="code-bracket">{`<`}</span><span className="code-key">CodeTools</span><span className="code-bracket">{`>`}</span></span>
            <span className="code-line">{'  '}{`<`}<span className="code-key">Syntax</span> <span className="code-bracket">{`/>`}</span></span>
            <span className="code-line">{'  '}{`<`}<span className="code-key">Formatting</span> <span className="code-bracket">{`/>`}</span></span>
            <span className="code-line">{'<'}/{'>'}</span>
          </pre>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">⚙️ 正在准备代码工具 ⚙️</h2>
          <p className="text-gray-600 mt-2">
            请稍候，正在加载格式化工具...
          </p>
        </div>
      </div>
    </>
  );
}