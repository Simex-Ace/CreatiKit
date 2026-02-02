'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Download, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';

// 导入emoji-mart相关组件和数据
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const EmojiCollection: React.FC = () => {
  const { t } = useI18n();
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [recentCopies, setRecentCopies] = useState<string[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<any>(null);
  const [downloadSize, setDownloadSize] = useState('64');

  // 处理emoji选择
  const handleEmojiSelect = (emoji: any) => {
    setSelectedEmoji(emoji);
    
    navigator.clipboard.writeText(emoji.native).then(() => {
      setCopiedEmoji(emoji.native);
      setTimeout(() => setCopiedEmoji(null), 2000);
      
      // 添加到最近复制
      setRecentCopies(prev => {
        const newCopies = [emoji.native, ...prev.filter(e => e !== emoji.native)].slice(0, 20);
        localStorage.setItem('recentEmojis', JSON.stringify(newCopies));
        return newCopies;
      });
    });
  };

  // 获取emoji分类信息
  const getEmojiCategory = (emoji: { category?: string }) => {
    const categories = {
      smileys_people: 'Smileys & People',
      animals_nature: 'Animals & Nature',
      food_drink: 'Food & Drink',
      travel_places: 'Travel & Places',
      activities: 'Activities',
      objects: 'Objects',
      symbols: 'Symbols',
      flags: 'Flags'
    };
    return emoji.category && categories[emoji.category as keyof typeof categories] || 'Other';
  };

  // 下载emoji图片
  const downloadEmoji = async (format: 'png' | 'svg') => {
    if (!selectedEmoji) return;
    
    try {
      // 创建canvas来渲染emoji
      const canvas = document.createElement('canvas');
      const size = parseInt(downloadSize);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // 设置字体大小为canvas的80%以确保完整显示
        const fontSize = size * 0.8;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedEmoji.native, size / 2, size / 2);
        
        // 转换为图片并下载
        if (format === 'png') {
          const link = document.createElement('a');
          link.download = `emoji-${selectedEmoji.id}-${size}px.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } else if (format === 'svg') {
          // 创建SVG内容
          const svgContent = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
              <text x="50%" y="50%" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">
                ${selectedEmoji.native}
              </text>
            </svg>
          `;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const link = document.createElement('a');
          link.download = `emoji-${selectedEmoji.id}-${size}px.svg`;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      }
    } catch (error) {
      console.error(t('emojiCollectionPage.downloadFailed'), error);
    }
  };



  // 加载本地存储的数据
  useEffect(() => {
    const storedRecent = localStorage.getItem('recentEmojis');
    if (storedRecent) {
      setRecentCopies(JSON.parse(storedRecent));
    }
  }, []);

  // Clock组件
  const Clock: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  // 复制成功提示
  const CopySuccessIndicator: React.FC = () => {
    if (!copiedEmoji) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
        <Check size={18} />
        <span>{t('emojiCollectionPage.copied')}: {copiedEmoji}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-2">
            {t('emojiCollectionPage.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('emojiCollectionPage.subtitle')}
          </p>
        </div>

        {/* 最近使用 */}
        <div className="mb-8">
          {recentCopies.length > 0 && (
            <div className="relative group">
              <Button variant="secondary" size="sm" className="flex items-center gap-1">
                <Clock size={16} />
                {t('emojiCollectionPage.recent')}
              </Button>
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden hidden group-hover:block">
                <div className="p-2 border-b dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('emojiCollectionPage.recent')}</p>
                </div>
                <div className="grid grid-cols-8 gap-1 p-2 max-h-60 overflow-y-auto">
                  {recentCopies.map((emoji, index) => (
                    <button
                      key={index}
                      className="text-xl p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => navigator.clipboard.writeText(emoji).then(() => {
                        setCopiedEmoji(emoji);
                        setTimeout(() => setCopiedEmoji(null), 2000);
                      })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 主内容区域 - 采用网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左侧：Emoji选择器 */}
          <Card className="p-4 lg:col-span-2">
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              previewPosition="none"

              theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              emojiButtonProps={{ 
                className: 'transition-all duration-200 hover:scale-110' 
              }}
            />
          </Card>
          
          {/* 右侧：工作台 */}
          <Card className="p-6 lg:col-span-3">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">{t('emojiCollectionPage.workbench')}</h3>
            
            {selectedEmoji ? (
              <div className="space-y-6">
                {/* 1. 大尺寸高清预览 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">{t('emojiCollectionPage.preview')}</h4>
                  <div className="text-[18rem] mb-4">
                    {selectedEmoji.native}
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedEmoji.native);
                      setCopiedEmoji(selectedEmoji.native);
                      setTimeout(() => setCopiedEmoji(null), 2000);
                    }}
                  >
                    <Copy size={14} />
                    {t('emojiCollectionPage.copyChar')}
                  </Button>
                </div>
                
                {/* 2. 实用信息展示 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('emojiCollectionPage.info')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4 text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('emojiCollectionPage.officialName')}:</span>
                      <span className="font-medium">{selectedEmoji.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('emojiCollectionPage.unicodeVersion')}:</span>
                      <span>Unicode 15.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('emojiCollectionPage.category')}:</span>
                      <span>{getEmojiCategory(selectedEmoji)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('emojiCollectionPage.character')}:</span>
                      <span className="font-mono">{selectedEmoji.native}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('emojiCollectionPage.shortcode')}:</span>
                      <span className="font-mono">:{selectedEmoji.id}:</span>
                    </div>
                  </div>
                </div>
                
                {/* 3. 图片格式下载 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('emojiCollectionPage.download')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-5">
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">{t('emojiCollectionPage.selectSize')}:</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setDownloadSize('32')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${downloadSize === '32' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                          32px
                        </button>
                        <button 
                          onClick={() => setDownloadSize('64')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${downloadSize === '64' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                          64px
                        </button>
                        <button 
                          onClick={() => setDownloadSize('128')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${downloadSize === '128' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                        >
                          128px
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600" 
                        onClick={() => downloadEmoji('png')}
                      >
                        <Download size={16} />
                        {t('emojiCollectionPage.pngFormat')}
                      </Button>
                      <Button 
                        className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600" 
                        onClick={() => downloadEmoji('svg')}
                      >
                        <Download size={16} />
                        {t('emojiCollectionPage.svgFormat')}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {t('emojiCollectionPage.downloadHint')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-4xl mb-4">👈</div>
                <p>{t('emojiCollectionPage.clickEmoji')}</p>
              </div>
            )}
          </Card>
        </div>

        {/* 功能提示 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('emojiCollectionPage.tips')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">💡</div>
              <div>
                <h4 className="font-medium">{t('emojiCollectionPage.oneClickCopy')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emojiCollectionPage.oneClickCopyDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">🔎</div>
              <div>
                <h4 className="font-medium">{t('emojiCollectionPage.quickSearch')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emojiCollectionPage.quickSearchDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">📋</div>
              <div>
                <h4 className="font-medium">{t('emojiCollectionPage.recentUse')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emojiCollectionPage.recentUseDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">🎨</div>
              <div>
                <h4 className="font-medium">{t('emojiCollectionPage.fullLibrary')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emojiCollectionPage.fullLibraryDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">🔍</div>
              <div>
                <h4 className="font-medium">{t('emojiCollectionPage.highResPreview')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emojiCollectionPage.highResPreviewDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xl">💾</div>
              <div>
                <h4 className="font-medium">{t('emojiCollectionPage.imageDownload')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emojiCollectionPage.imageDownloadDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 页脚说明 */}
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>{t('emojiCollectionPage.footerDesc1')}</p>
          <p className="mt-2">{t('emojiCollectionPage.footerDesc2')}</p>
        </div>
      </div>
      
      {/* 复制成功提示 */}
      <CopySuccessIndicator />
    </div>
  );
};

export default EmojiCollection;