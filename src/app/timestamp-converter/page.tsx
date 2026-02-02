'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RefreshCw, ArrowDownUp, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useI18n } from '@/contexts/I18nContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 配置dayjs插件
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function TimestampConverter() {
  const { t } = useI18n();
  // 状态管理
  const [dateInput, setDateInput] = useState('');
  const [timestampInput, setTimestampInput] = useState('');
  const [isTimestampMs, setIsTimestampMs] = useState(false); // 秒/毫秒切换
  const [selectedTimezone, setSelectedTimezone] = useState('local'); // 时区选择
  const [result, setResult] = useState({
    timestamp: '',
    date: '',
    relative: ''
  });
  const [activeTab, setActiveTab] = useState('date'); // 默认显示日期输入
  
  // Toast提示
  const { toast } = useToast();

  // 常用时区列表
  const timezones = [
    { value: 'local', label: t('timestampConverterPage.localTimezone') },
    { value: 'UTC', label: 'UTC' },
    { value: 'Asia/Shanghai', label: '中国标准时间 (CST)' },
    { value: 'America/New_York', label: '东部标准时间 (EST)' },
    { value: 'America/Los_Angeles', label: '太平洋标准时间 (PST)' },
    { value: 'Europe/London', label: '格林威治标准时间 (GMT)' },
    { value: 'Europe/Paris', label: '欧洲中部时间 (CET)' },
    { value: 'Asia/Tokyo', label: '日本标准时间 (JST)' },
    { value: 'Australia/Sydney', label: '澳大利亚东部时间 (AEST)' }
  ];

  // 日期格式
  const dateFormat = 'YYYY-MM-DD HH:mm:ss';

  // 日期时间转换为时间戳
  const convertDateToTimestamp = () => {
    if (!dateInput.trim()) {
      toast({ title: t('timestampConverterPage.enterDateTime'), variant: 'destructive' });
      return;
    }

    try {
      let date;
      if (selectedTimezone === 'local') {
        date = dayjs(dateInput);
      } else {
        date = dayjs.tz(dateInput, selectedTimezone);
      }

      if (!date.isValid()) {
        toast({ title: t('timestampConverterPage.invalidDateTime'), variant: 'destructive' });
        return;
      }

      const timestamp = isTimestampMs ? date.valueOf() : Math.floor(date.valueOf() / 1000);
      const relative = date.fromNow();
      
      setResult({
        timestamp: timestamp.toString(),
        date: date.format(dateFormat),
        relative
      });
      
      setTimestampInput(timestamp.toString());
    } catch (error) {
      toast({ title: t('timestampConverterPage.convertFailed'), variant: 'destructive' });
    }
  };

  // 时间戳转换为日期时间
  const convertTimestampToDate = () => {
    if (!timestampInput.trim()) {
      toast({ title: t('timestampConverterPage.enterTimestamp'), variant: 'destructive' });
      return;
    }

    try {
      let timestamp = Number(timestampInput);
      
      // 验证时间戳
      if (isNaN(timestamp)) {
        toast({ title: t('timestampConverterPage.invalidTimestamp'), variant: 'destructive' });
        return;
      }

      // 如果是秒级时间戳但没有设置为秒模式，自动转换为毫秒
      if (!isTimestampMs && timestamp.toString().length <= 10) {
        timestamp *= 1000;
      }

      let date;
      if (selectedTimezone === 'local') {
        date = dayjs(timestamp);
      } else {
        date = dayjs.tz(timestamp, selectedTimezone);
      }

      if (!date.isValid()) {
        toast({ title: t('timestampConverterPage.invalidTimestamp'), variant: 'destructive' });
        return;
      }

      const relative = date.fromNow();
      
      setResult({
        timestamp: (isTimestampMs ? timestamp : Math.floor(timestamp / 1000)).toString(),
        date: date.format(dateFormat),
        relative
      });
      
      setDateInput(date.format(dateFormat));
    } catch (error) {
      toast({ title: t('timestampConverterPage.convertFailed'), variant: 'destructive' });
    }
  };

  // 复制结果
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ title: t('timestampConverterPage.copied', { label }) });
      })
      .catch(() => {
        toast({ title: t('timestampConverterPage.copyFailed'), variant: 'destructive' });
      });
  };

  // 切换秒/毫秒
  const toggleTimestampUnit = () => {
    setIsTimestampMs(!isTimestampMs);
    // 如果有时间戳结果，自动转换单位
    if (result.timestamp) {
      const timestamp = Number(result.timestamp);
      if (isTimestampMs) {
        // 毫秒转秒
        setResult(prev => ({
          ...prev,
          timestamp: Math.floor(timestamp / 1000).toString()
        }));
        setTimestampInput(Math.floor(timestamp / 1000).toString());
      } else {
        // 秒转毫秒
        setResult(prev => ({
          ...prev,
          timestamp: (timestamp * 1000).toString()
        }));
        setTimestampInput((timestamp * 1000).toString());
      }
    }
  };

  // 填充当前时间
  const fillCurrentTime = () => {
    const now = dayjs();
    const formattedDate = now.format(dateFormat);
    const timestamp = isTimestampMs ? now.valueOf() : Math.floor(now.valueOf() / 1000);
    
    setDateInput(formattedDate);
    setTimestampInput(timestamp.toString());
    
    setResult({
      timestamp: timestamp.toString(),
      date: formattedDate,
      relative: now.fromNow()
    });
  };

  // 清空所有输入和结果
  const clearAll = () => {
    setDateInput('');
    setTimestampInput('');
    setResult({
      timestamp: '',
      date: '',
      relative: ''
    });
  };

  // 监听输入变化，自动切换输入类型
  useEffect(() => {
    // 尝试检测输入是日期还是时间戳
    if (activeTab === 'date' && dateInput.trim()) {
      const isTimestampLike = /^\d{9,13}$/.test(dateInput.trim());
      if (isTimestampLike) {
        setActiveTab('timestamp');
        setTimestampInput(dateInput.trim());
        setDateInput('');
      }
    }
  }, [dateInput, activeTab]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{t('timestampConverterPage.title')}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{t('timestampConverterPage.subtitle')}</p>

      <Card className="p-6 mb-6">
        {/* 输入区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="date" className="flex items-center text-gray-900 dark:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              {t('timestampConverterPage.tabDate')}
            </TabsTrigger>
            <TabsTrigger value="timestamp" className="flex items-center text-gray-900 dark:text-white">
              <Clock className="mr-2 h-4 w-4" />
              {t('timestampConverterPage.tabTimestamp')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="date" className="space-y-4">
            <div className="space-y-2 mb-8">
            <div className="flex justify-between items-center">
              <Label htmlFor="date-input" className="text-gray-900 dark:text-white">{t('timestampConverterPage.dateTime')}</Label>
              <Button variant="ghost" size="sm" onClick={fillCurrentTime} className="text-gray-900 dark:text-white">
                {t('timestampConverterPage.currentTime')}
              </Button>
            </div>
              <Input
                id="date-input"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder={t('timestampConverterPage.datePlaceholder')}
                className="text-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="timestamp" className="space-y-4">
            <div className="space-y-2 mb-8">
              <div className="flex justify-between items-center">
                <Label htmlFor="timestamp-input" className="text-gray-900 dark:text-white">{t('timestampConverterPage.timestamp')}</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ms-toggle" className="text-sm cursor-pointer flex items-center text-gray-900 dark:text-white">
                    <input
                      id="ms-toggle"
                      type="checkbox"
                      checked={isTimestampMs}
                      onChange={toggleTimestampUnit}
                      className="mr-2 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    {t('timestampConverterPage.milliseconds')}
                  </Label>
                </div>
              </div>
              <Input
                id="timestamp-input"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder={t('timestampConverterPage.timestampPlaceholder', { example: isTimestampMs ? '1761770400000' : '1761770400' })}
                className="text-lg"
              />
            </div>
          </TabsContent>
          </Tabs>

          {/* 时区选择 */}
          <div className="space-y-2 mb-8">
            <Label htmlFor="timezone-select" className="text-gray-900 dark:text-white">{t('timestampConverterPage.timezone')}</Label>
            <select
              id="timezone-select"
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1"
            onClick={activeTab === 'date' ? convertDateToTimestamp : convertTimestampToDate}
          >
            {t('timestampConverterPage.convert')}
          </Button>
          <Button 
            variant="secondary"
            onClick={clearAll}
          >
            {t('timestampConverterPage.clear')}
          </Button>
          <Button 
            variant="ghost"
            onClick={() => {
              setActiveTab(activeTab === 'date' ? 'timestamp' : 'date');
            }}
          >
            <ArrowDownUp className="mr-1 h-4 w-4" />
            {t('timestampConverterPage.switchInput')}
          </Button>
        </div>
      </Card>

      {/* 结果显示 */}
      {result.timestamp || result.date ? (
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('timestampConverterPage.results')}</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* 时间戳结果 */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <div>
                  <div className="font-medium mb-1 text-gray-900 dark:text-white">{t('timestampConverterPage.timestampResult', { unit: isTimestampMs ? t('timestampConverterPage.milliseconds') : t('timestampConverterPage.seconds') })}</div>
                  <div className="text-sm font-mono break-all text-gray-700 dark:text-gray-200">{result.timestamp}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white"
                  onClick={() => copyToClipboard(result.timestamp, t('timestampConverterPage.timestamp'))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 日期时间结果 */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <div>
                  <div className="font-medium mb-1 text-gray-900 dark:text-white">{t('timestampConverterPage.dateTimeResult')}</div>
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-200">{result.date}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white"
                  onClick={() => copyToClipboard(result.date, t('timestampConverterPage.dateTime'))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 相对时间结果 */}
            <div className="relative group md:col-span-2">
              <div className="flex justify-between items-center bg-blue-100 dark:bg-blue-900/40 rounded-lg p-4 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors">
                <div>
                  <div className="font-medium mb-1 text-gray-900 dark:text-white">{t('timestampConverterPage.relativeTime')}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{result.relative}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white"
                  onClick={() => copyToClipboard(result.relative, t('timestampConverterPage.relativeTime'))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 转换信息 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-sm text-gray-700 dark:text-gray-200">
            <p className="text-gray-900 dark:text-white">• {t('timestampConverterPage.info1', { timezone: selectedTimezone === 'local' ? t('timestampConverterPage.localTimezone') : selectedTimezone })}</p>
            <p className="text-gray-900 dark:text-white">• {t('timestampConverterPage.info2')}</p>
            <p className="text-gray-900 dark:text-white">• {t('timestampConverterPage.info3')}</p>
          </div>
        </Card>
      ) : null}

      {/* 快捷工具 */}
      <Card className="p-6 mt-6 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('timestampConverterPage.quickTools')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              const now = dayjs();
              setTimestampInput((isTimestampMs ? now.valueOf() : Math.floor(now.valueOf() / 1000)).toString());
              setActiveTab('timestamp');
            }}
          >
            {t('timestampConverterPage.currentTimestamp')}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              const yesterday = dayjs().subtract(1, 'day');
              setDateInput(yesterday.format(dateFormat));
              setActiveTab('date');
            }}
          >
            {t('timestampConverterPage.yesterday')}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              const tomorrow = dayjs().add(1, 'day');
              setDateInput(tomorrow.format(dateFormat));
              setActiveTab('date');
            }}
          >
            {t('timestampConverterPage.tomorrow')}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              setIsTimestampMs(!isTimestampMs);
            }}
          >
            {t('timestampConverterPage.switchMode', { unit: isTimestampMs ? t('timestampConverterPage.seconds') : t('timestampConverterPage.milliseconds') })}
          </Button>
        </div>
      </Card>
    </div>
  );
}