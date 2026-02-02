'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, Copy, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';
import { useI18n } from '@/contexts/I18nContext';
import CryptoJS from 'crypto-js';

export default function HashCalculator() {
  const { t } = useI18n();
  // 状态管理
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hashResults, setHashResults] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });
  
  // 选中的哈希算法
  const [selectedAlgorithms, setSelectedAlgorithms] = useState({
    md5: true,
    sha1: true,
    sha256: true,
    sha512: true,
  });

  // Toast和开发提示
  const { toast } = useToast();
  const { alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();

  // 计算文本哈希值
  const calculateTextHash = () => {
    if (!textInput.trim()) {
      toast({ title: t('hashCalculatorPage.enterText'), variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    const results = {
      md5: selectedAlgorithms.md5 ? CryptoJS.MD5(textInput).toString() : '',
      sha1: selectedAlgorithms.sha1 ? CryptoJS.SHA1(textInput).toString() : '',
      sha256: selectedAlgorithms.sha256 ? CryptoJS.SHA256(textInput).toString() : '',
      sha512: selectedAlgorithms.sha512 ? CryptoJS.SHA512(textInput).toString() : '',
    };

    setTimeout(() => {
      setHashResults(results);
      setIsProcessing(false);
      toast({ title: t('hashCalculatorPage.calculationComplete') });
    }, 300); // 添加一个小延迟以显示加载状态
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 计算文件哈希值
  const calculateFileHash = () => {
    if (!selectedFile) {
      toast({ title: t('hashCalculatorPage.uploadFile'), variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        
        const results = {
          md5: selectedAlgorithms.md5 ? CryptoJS.MD5(wordArray).toString() : '',
          sha1: selectedAlgorithms.sha1 ? CryptoJS.SHA1(wordArray).toString() : '',
          sha256: selectedAlgorithms.sha256 ? CryptoJS.SHA256(wordArray).toString() : '',
          sha512: selectedAlgorithms.sha512 ? CryptoJS.SHA512(wordArray).toString() : '',
        };

        setHashResults(results);
        setIsProcessing(false);
        toast({ title: t('hashCalculatorPage.fileCalculationComplete') });
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      toast({ title: t('hashCalculatorPage.fileReadFailed'), variant: 'destructive' });
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // 复制哈希值
  const copyToClipboard = (text: string, algorithm: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ title: t('hashCalculatorPage.copied', { algorithm: algorithm.toUpperCase() }) });
      })
      .catch(() => {
        toast({ title: t('hashCalculatorPage.copyFailed'), variant: 'destructive' });
      });
  };

  // 下载哈希值
  const downloadHashResults = () => {
    const content = Object.entries(hashResults)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hash_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: t('hashCalculatorPage.downloadSuccess') });
  };

  // 切换算法选择
  const toggleAlgorithm = (algorithm: keyof typeof selectedAlgorithms) => {
    setSelectedAlgorithms(prev => ({
      ...prev,
      [algorithm]: !prev[algorithm]
    }));
  };

  // 清空结果
  const clearResults = () => {
    setHashResults({
      md5: '',
      sha1: '',
      sha256: '',
      sha512: '',
    });
    setTextInput('');
    setSelectedFile(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{t('hashCalculatorPage.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('hashCalculatorPage.subtitle')}</p>

      <Card className="p-6 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="text">{t('hashCalculatorPage.tabText')}</TabsTrigger>
            <TabsTrigger value="file">{t('hashCalculatorPage.tabFile')}</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">{t('hashCalculatorPage.textInput')}</Label>
              <Textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t('hashCalculatorPage.textPlaceholder')}
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-secondary transition-colors cursor-pointer" onClick={() => document.getElementById('file-input')?.click()}>
              <input
                id="file-input"
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="mb-1 font-medium">{t('hashCalculatorPage.fileUpload')}</p>
              <p className="text-sm text-muted-foreground">{t('hashCalculatorPage.fileSupport')}</p>
              {selectedFile && (
                <p className="mt-2 text-sm text-primary">{t('hashCalculatorPage.selectedFile')}: {selectedFile.name}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 算法选择 */}
        <div className="mt-4">
          <Label className="block mb-2">{t('hashCalculatorPage.selectAlgorithms')}</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(selectedAlgorithms).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  id={`algorithm-${key}`}
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleAlgorithm(key as keyof typeof selectedAlgorithms)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <Label htmlFor={`algorithm-${key}`} className="capitalize cursor-pointer">{key.toUpperCase()}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button 
            className="flex-1"
            onClick={activeTab === 'text' ? calculateTextHash : calculateFileHash}
            disabled={isProcessing || (!Object.values(selectedAlgorithms).some(v => v))}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('hashCalculatorPage.calculating')}
              </>
            ) : (
              t('hashCalculatorPage.calculate')
            )}
          </Button>
          <Button 
            variant="secondary"
            onClick={clearResults}
            disabled={isProcessing}
          >
            {t('hashCalculatorPage.clear')}
          </Button>
        </div>
      </Card>

      {/* 结果显示 */}
      {(hashResults.md5 || hashResults.sha1 || hashResults.sha256 || hashResults.sha512) && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('hashCalculatorPage.results')}</h2>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={downloadHashResults}
            >
              <Download className="mr-1 h-4 w-4" />
              {t('hashCalculatorPage.download')}
            </Button>
          </div>

          <div className="space-y-3">
            {Object.entries(hashResults).map(([algorithm, value]) => {
              if (!value) return null;
              return (
                <div key={algorithm} className="group relative">
                  <div className="flex justify-between items-center bg-muted rounded-lg p-3 hover:bg-secondary transition-colors">
                    <div>
                      <div className="font-medium capitalize mb-1">{algorithm.toUpperCase()}</div>
                      <div className="text-sm font-mono break-all">{value}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(value, algorithm)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}