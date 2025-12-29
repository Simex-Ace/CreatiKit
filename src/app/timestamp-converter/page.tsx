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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 配置dayjs插件
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function TimestampConverter() {
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
    { value: 'local', label: '本地时区' },
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
      toast({ title: '请输入日期时间', variant: 'destructive' });
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
        toast({ title: '无效的日期时间格式', variant: 'destructive' });
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
      toast({ title: '转换失败', variant: 'destructive' });
    }
  };

  // 时间戳转换为日期时间
  const convertTimestampToDate = () => {
    if (!timestampInput.trim()) {
      toast({ title: '请输入时间戳', variant: 'destructive' });
      return;
    }

    try {
      let timestamp = Number(timestampInput);
      
      // 验证时间戳
      if (isNaN(timestamp)) {
        toast({ title: '无效的时间戳', variant: 'destructive' });
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
        toast({ title: '无效的时间戳', variant: 'destructive' });
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
      toast({ title: '转换失败', variant: 'destructive' });
    }
  };

  // 复制结果
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ title: `${label} 已复制到剪贴板` });
      })
      .catch(() => {
        toast({ title: '复制失败', variant: 'destructive' });
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
      <h1 className="text-3xl font-bold mb-2">Unix 时间戳转换器</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">在标准日期时间和Unix时间戳之间进行转换，并显示相对时间</p>

      <Card className="p-6 mb-6">
        {/* 输入区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="date" className="flex items-center text-gray-900 dark:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              日期时间输入
            </TabsTrigger>
            <TabsTrigger value="timestamp" className="flex items-center text-gray-900 dark:text-white">
              <Clock className="mr-2 h-4 w-4" />
              时间戳输入
            </TabsTrigger>
          </TabsList>

          <TabsContent value="date" className="space-y-4">
            <div className="space-y-2 mb-8">
            <div className="flex justify-between items-center">
              <Label htmlFor="date-input" className="text-gray-900 dark:text-white">日期时间 (YYYY-MM-DD HH:mm:ss)</Label>
              <Button variant="ghost" size="sm" onClick={fillCurrentTime} className="text-gray-900 dark:text-white">
                当前时间
              </Button>
            </div>
              <Input
                id="date-input"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="例如: 2025-10-28 10:00:00"
                className="text-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="timestamp" className="space-y-4">
            <div className="space-y-2 mb-8">
              <div className="flex justify-between items-center">
                <Label htmlFor="timestamp-input" className="text-gray-900 dark:text-white">Unix 时间戳</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ms-toggle" className="text-sm cursor-pointer flex items-center text-gray-900 dark:text-white">
                    <input
                      id="ms-toggle"
                      type="checkbox"
                      checked={isTimestampMs}
                      onChange={toggleTimestampUnit}
                      className="mr-2 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    毫秒
                  </Label>
                </div>
              </div>
              <Input
                id="timestamp-input"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder={`例如: ${isTimestampMs ? '1761770400000' : '1761770400'}`}
                className="text-lg"
              />
            </div>
          </TabsContent>
          </Tabs>

          {/* 时区选择 */}
          <div className="space-y-2 mb-8">
            <Label htmlFor="timezone-select" className="text-gray-900 dark:text-white">时区选择</Label>
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
            转换
          </Button>
          <Button 
            variant="secondary"
            onClick={clearAll}
          >
            清空
          </Button>
          <Button 
            variant="ghost"
            onClick={() => {
              setActiveTab(activeTab === 'date' ? 'timestamp' : 'date');
            }}
          >
            <ArrowDownUp className="mr-1 h-4 w-4" />
            切换输入
          </Button>
        </div>
      </Card>

      {/* 结果显示 */}
      {result.timestamp || result.date ? (
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">转换结果</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* 时间戳结果 */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <div>
                  <div className="font-medium mb-1 text-gray-900 dark:text-white">Unix 时间戳 ({isTimestampMs ? '毫秒' : '秒'})</div>
                  <div className="text-sm font-mono break-all text-gray-700 dark:text-gray-200">{result.timestamp}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white"
                  onClick={() => copyToClipboard(result.timestamp, '时间戳')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 日期时间结果 */}
            <div className="relative group">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <div>
                  <div className="font-medium mb-1 text-gray-900 dark:text-white">标准日期时间</div>
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-200">{result.date}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white"
                  onClick={() => copyToClipboard(result.date, '日期时间')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 相对时间结果 */}
            <div className="relative group md:col-span-2">
              <div className="flex justify-between items-center bg-blue-100 dark:bg-blue-900/40 rounded-lg p-4 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors">
                <div>
                  <div className="font-medium mb-1 text-gray-900 dark:text-white">相对时间</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{result.relative}</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white"
                  onClick={() => copyToClipboard(result.relative, '相对时间')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 转换信息 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-sm text-gray-700 dark:text-gray-200">
            <p className="text-gray-900 dark:text-white">• 时间戳计算基于 {selectedTimezone === 'local' ? '您的本地时区' : selectedTimezone} 时区</p>
            <p className="text-gray-900 dark:text-white">• 相对时间会动态更新，显示与当前时间的差值</p>
            <p className="text-gray-900 dark:text-white">• 输入纯数字时会自动检测是否为时间戳</p>
          </div>
        </Card>
      ) : null}

      {/* 快捷工具 */}
      <Card className="p-6 mt-6 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">快捷工具</h2>
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
            当前时间戳
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
            昨天
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
            明天
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => {
              setIsTimestampMs(!isTimestampMs);
            }}
          >
            切换{isTimestampMs ? '秒' : '毫秒'}模式
          </Button>
        </div>
      </Card>
    </div>
  );
}