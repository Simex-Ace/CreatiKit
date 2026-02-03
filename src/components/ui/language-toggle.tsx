'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n, type Locale } from '@/contexts/I18nContext';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages: { code: Locale; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'A' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '日' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '한' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '文' },
];

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative transition-all duration-300 ease-out"
        aria-label="切换语言"
      >
        {/* 保留原有的图标设计 */}
        <div className="relative flex items-center justify-center">
          <span className="text-base font-bold leading-none">{currentLanguage.flag}</span>
          <span 
            className="absolute -top-0.5 -left-0.5 text-[9px] leading-none opacity-70"
            style={{ transform: 'rotate(-15deg)' }}
          >
            {currentLanguage.flag === 'A' ? '文' : currentLanguage.flag === '日' ? 'A' : currentLanguage.flag === '한' ? 'A' : 'A'}
          </span>
        </div>
      </Button>

      {/* 自定义下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉菜单 - 更精致紧凑的设计 */}
          <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-md border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1">
            <div className="p-1.5">
              {languages.map((language) => {
                const isSelected = locale === language.code;
                return (
                  <button
                    key={language.code}
                    onClick={() => {
                      setLocale(language.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-1.5 py-1.5 rounded-sm transition-colors mb-1.5 last:mb-0",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:bg-accent",
                      isSelected && "bg-accent text-accent-foreground"
                    )}
                  >
                    {/* 语言图标 - 更小更精致 */}
                    <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
                      <span className="text-sm font-bold">{language.flag}</span>
                      {language.flag === 'A' && (
                        <span className="absolute -top-0.5 -left-0.5 text-[7px] leading-none opacity-60" style={{ transform: 'rotate(-15deg)' }}>
                          文
                        </span>
                      )}
                      {language.flag === '文' && (
                        <span className="absolute -top-0.5 -left-0.5 text-[7px] leading-none opacity-60" style={{ transform: 'rotate(-15deg)' }}>
                          A
                        </span>
                      )}
                      {language.flag === '日' && (
                        <span className="absolute -top-0.5 -left-0.5 text-[7px] leading-none opacity-60" style={{ transform: 'rotate(-15deg)' }}>
                          A
                        </span>
                      )}
                      {language.flag === '한' && (
                        <span className="absolute -top-0.5 -left-0.5 text-[7px] leading-none opacity-60" style={{ transform: 'rotate(-15deg)' }}>
                          A
                        </span>
                      )}
                    </div>
                    
                    {/* 语言信息 - 单行显示 */}
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-sm font-medium text-foreground">
                        {language.nativeName}
                      </span>
                    </div>

                    {/* 选中指示器 - 简洁的勾选 */}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

