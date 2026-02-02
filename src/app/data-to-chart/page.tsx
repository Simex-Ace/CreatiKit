'use client';
import { useState, useEffect, useRef } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ZAxis
} from 'recharts';

// 导入必要的库
import html2canvas from 'html2canvas';
import { useI18n } from '@/contexts/I18nContext';

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area';

const DataToChartPage = () => {
  const { t } = useI18n();
  // 状态管理
  const [input, setInput] = useState('name,value\n产品A,100\n产品B,200\n产品C,150\n产品D,300\n产品E,250');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xField, setXField] = useState('name');
  const [yField, setYField] = useState('value');
  const [zField, setZField] = useState<string>(''); // 用于散点图的第三个维度
  const [groupField, setGroupField] = useState<string>(''); // 新增分组字段
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [chartTitle, setChartTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 使用useRef引用图表容器
  const chartRef = useRef<HTMLDivElement>(null);
  // 文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 图表容器尺寸状态管理
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 400 });

  // 使用ResizeObserver监测图表容器尺寸变化
  useEffect(() => {
    if (!chartRef.current) return;

    // 初始设置尺寸
    const initialRect = chartRef.current.getBoundingClientRect();
    setChartDimensions({ 
      width: initialRect.width || 800, 
      height: 400 
    });

    // 创建ResizeObserver实例
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && entries[0].contentRect) {
        const { width } = entries[0].contentRect;
        setChartDimensions(prev => ({ ...prev, width }));
      }
    });

    // 开始观察容器
    resizeObserver.observe(chartRef.current);

    // 清理函数
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // 解析数据
  const parseData = () => {
    if (!input.trim()) {
      setError('');
      setColumns([]);
      setData([]);
      return;
    }

    try {
      let result: any[] = [];
      let headers: string[] = [];
      
      // 尝试解析为JSON
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 获取所有字段名
          headers = Object.keys(parsed[0]);
          
          // 精细判断数值类型，确保数值列真的被解析为数字
          result = parsed.map(item => {
            const processed: any = {};
            for (const [key, value] of Object.entries(item)) {
              if (typeof value === 'string') {
                const numValue = Number(value);
                // 确保是有效的数字且不是NaN
                if (!isNaN(numValue) && isFinite(numValue)) {
                  processed[key] = numValue;
                } else {
                  processed[key] = value;
                }
              } else {
                processed[key] = value;
              }
            }
            return processed;
          });
        } else {
          throw new Error();
        }
      } catch {
        // 解析为CSV
        const lines = input.trim().split('\n');
        if (lines.length < 2) throw new Error('数据格式错误');
        
        headers = lines[0].split(',').map(h => h.trim());
        result = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, i) => {
            if (values[i] !== undefined) {
              const val = values[i].trim();
              // 精细判断数值类型
              const numValue = Number(val);
              if (!isNaN(numValue) && isFinite(numValue)) {
                row[header] = numValue;
              } else {
                row[header] = val;
              }
            }
          });
          return row;
        });
      }
      
      setData(result);
      setColumns(headers);
      setError('');
      
      // 自动设置字段
      if (headers.length > 0 && !xField) setXField(headers[0]);
      if (headers.length > 1 && !yField) setYField(headers[1]);
      if (headers.length > 2 && !zField) setZField(headers[2]);
    } catch {
      setError(t('dataToChartPage.enterValidData'));
      setData([]);
      setColumns([]);
    }
  };

  // 监听输入变化
  useEffect(() => {
    const timer = setTimeout(() => parseData(), 300);
    return () => clearTimeout(timer);
  }, [input]);

  // 加载示例数据 - 提供更有代表性的多维数据
  const loadSample = () => {
    const sampleCSV = `产品,销售额,区域,季度
产品A,100,华南区,Q1
产品B,200,华东区,Q1
产品C,150,华北区,Q1
产品D,300,华南区,Q2
产品E,250,华东区,Q2
产品A,200,华北区,Q2
产品B,350,华南区,Q3
产品C,220,华东区,Q3
产品D,180,华北区,Q3
产品E,280,华南区,Q4
产品A,320,华东区,Q4
产品B,400,华北区,Q4`;
    
    setInput(sampleCSV);
    setChartTitle('销售数据分析');
  };
  
  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInput(content);
        // 重置文件输入以允许再次上传相同的文件
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      setError('文件读取失败，请重试');
      // 重置文件输入
      event.target.value = '';
    };
    reader.readAsText(file);
  };
  
  // 触发文件选择对话框
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // 导出图表
  const exportChart = async () => {
    if (!data.length || !chartRef.current) return;
    
    try {
      setIsLoading(true);
      
      // 使用html2canvas进行截图
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // 提高导出图片质量
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: chartRef.current.offsetWidth,
        windowHeight: chartRef.current.offsetHeight
      });
      
      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `chart-${chartType}-${timestamp}.png`;
      
      // 使用浏览器原生下载方式 - 这种方式会触发浏览器的'另存为'对话框
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          // 添加一个额外的属性来确保触发'另存为'对话框
          link.setAttribute('type', 'application/octet-stream');
          document.body.appendChild(link);
          link.click();
          
          // 清理
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }
      }, 'image/png');
    } catch (error) {
      console.error('导出失败:', error);
      // 可以考虑添加更友好的错误提示，但不使用alert
    } finally {
      setIsLoading(false);
    }
  };
  
  // 为饼图准备数据 - 确保返回正确格式的 {name, value} 数据
  const preparePieData = () => {
    if (!xField || !yField || !data.length) return [];
    
    // 处理数据但不移除任何项，确保所有数据都能显示
    return data.map(item => ({
      name: String(item[xField] || 'Unknown'),
      // 确保值字段被正确转换为数字
      value: typeof item[yField] === 'number' ? item[yField] : Number(item[yField] || 0)
    }));
  };
  
  // 按分组字段对数据进行分组
  const groupDataByField = (data: any[], groupField: string): Map<string, any[]> => {
    const grouped = new Map<string, any[]>();
    
    data.forEach(item => {
      const groupKey = String(item[groupField]);
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey)!.push(item);
    });
    
    return grouped;
  };
  
  // 为散点图准备数据
  const prepareScatterData = () => {
    return data.map(item => ({
      x: item[xField] || 0,
      y: item[yField] || 0,
      z: zField && item[zField] ? item[zField] : 1,
      name: String(item[xField])
    }));
  };
  
  // 数据透视函数 - 将扁平数据转换为Recharts需要的宽表格格式
  const pivotDataForGrouping = () => {
    if (!groupField || !xField || !yField || !data.length) return [];
    
    const pivoted: Record<string, any> = {};
    const groupNames = new Set<string>();
    
    // 遍历数据，构建透视表
    data.forEach(item => {
      const xValue = String(item[xField]);
      const groupKey = String(item[groupField]);
      const yValue = Number(item[yField]) || 0;
      
      // 记录所有分组名称
      groupNames.add(groupKey);
      
      // 如果该X轴值不存在，创建新对象
      if (!pivoted[xValue]) {
        pivoted[xValue] = { [xField]: item[xField] };
      }
      
      // 设置该分组的值
      pivoted[xValue][groupKey] = yValue;
    });
    
    // 将对象转换为数组，并确保每个对象都有所有分组的值（缺失的设为0）
    return Object.values(pivoted).map(item => {
      const completeItem = { ...item };
      groupNames.forEach(groupName => {
        if (completeItem[groupName] === undefined) {
          completeItem[groupName] = 0;
        }
      });
      return completeItem;
    });
  };
  
  // 获取分组名称列表
  const getGroupNames = () => {
    if (!groupField) return [];
    const groupNames = new Set<string>();
    data.forEach(item => {
      if (item[groupField] !== undefined) {
        groupNames.add(String(item[groupField]));
      }
    });
    return Array.from(groupNames);
  };
  
  // 饼图颜色 - 使用更现代的配色方案
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // 添加页面标题和初始化chartTitle
  useEffect(() => {
    document.title = t('dataToChartPage.title') + ' - CreatiKit';
    if (!chartTitle) {
      setChartTitle(t('dataToChartPage.chartTitle'));
    }
  }, [t, chartTitle]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题区域 */}
        <header className="mb-8 text-center">
          <div className="inline-block bg-blue-600 text-white p-3 rounded-full mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{t('dataToChartPage.title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('dataToChartPage.subtitle')}</p>
        </header>
        
        {/* 主内容卡片 */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 transform hover:shadow-2xl transition-all duration-300">
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 数据输入和配置区域 */}
              <div className="md:col-span-1 space-y-6">
                {/* 数据输入区域 */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {t('dataToChartPage.inputData')}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex gap-3">
                      <button
                        onClick={loadSample}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        {t('dataToChartPage.loadSample')}
                      </button>
                      <button
                        onClick={triggerFileUpload}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        {t('dataToChartPage.importFile')}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv,.json"
                        className="hidden"
                      />
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('dataToChartPage.inputPlaceholder')}
                      className="w-full h-48 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      disabled={isLoading}
                    />
                    {error && (
                      <div className="text-red-500 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 图表标题输入 */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('dataToChartPage.chartTitle')}
                  </label>
                  <input
                    id="chart-title"
                    type="text"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                    placeholder={t('dataToChartPage.chartTitlePlaceholder')}
                  />
                </div>
                
                {/* 图表配置区域 */}
                {columns.length > 0 && (
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm animate-slide-up">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                      </svg>
                      {t('dataToChartPage.chartConfig')}
                    </h3>
                    
                    <div className="space-y-5">
                      {/* 图表类型选择 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('dataToChartPage.chartType')}</label>
                        <div className="flex flex-wrap gap-2">
                          {(['bar', 'line', 'pie', 'scatter', 'area'] as ChartType[]).map(type => (
                            <button
                              key={type}
                              onClick={() => setChartType(type)}
                              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 transform ${chartType === type 
                                ? 'bg-blue-600 text-white shadow-md scale-105' 
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-sm'}`}
                            >
                              {type === 'bar' && t('dataToChartPage.bar')}
                              {type === 'line' && t('dataToChartPage.line')}
                              {type === 'pie' && t('dataToChartPage.pie')}
                              {type === 'scatter' && t('dataToChartPage.scatter')}
                              {type === 'area' && t('dataToChartPage.area')}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* X轴/分类字段选择 */}
                       <div>
                         <label htmlFor="x-field" className="block text-sm font-medium text-gray-700 mb-2">
                           {chartType === 'pie' ? t('dataToChartPage.categoryField') : chartType === 'scatter' ? t('dataToChartPage.xValueField') : t('dataToChartPage.xAxisField')}
                         </label>
                         <select
                           id="x-field"
                           value={xField}
                           onChange={(e) => setXField(e.target.value)}
                           className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 appearance-none bg-white pr-8"
                         >
                           {columns.map(col => (
                             <option key={col} value={col}>{col}</option>
                           ))}
                         </select>
                       </div>
                        
                       {/* Y轴/值字段选择（非饼图） */}
                       {chartType !== 'pie' && (
                         <div>
                           <label htmlFor="y-field" className="block text-sm font-medium text-gray-700 mb-2">
                             {chartType === 'scatter' ? t('dataToChartPage.yValueField') : t('dataToChartPage.yAxisField')}
                           </label>
                           <select
                             id="y-field"
                             value={yField}
                             onChange={(e) => setYField(e.target.value)}
                             className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 appearance-none bg-white pr-8"
                           >
                             {columns.map(col => (
                               <option key={col} value={col}>{col}</option>
                             ))}
                           </select>
                         </div>
                       )}
                       
                       {/* Y轴/值字段选择（饼图专用） */}
                       {chartType === 'pie' && (
                         <div>
                           <label htmlFor="pie-value-field" className="block text-sm font-medium text-gray-700 mb-2">
                             {t('dataToChartPage.valueField')}
                           </label>
                           <select
                             id="pie-value-field"
                             value={yField}
                             onChange={(e) => setYField(e.target.value)}
                             className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 appearance-none bg-white pr-8"
                           >
                             {columns.filter(col => col !== xField).map(col => (
                               <option key={col} value={col}>{col}</option>
                             ))}
                           </select>
                         </div>
                       )}
                      
                      {/* 散点图的Z值字段选择 */}
                       {chartType === 'scatter' && columns.length > 2 && (
                         <div>
                           <label htmlFor="z-field" className="block text-sm font-medium text-gray-700 mb-2">
                             {t('dataToChartPage.pointSizeField')}
                           </label>
                           <select
                             id="z-field"
                             value={zField}
                             onChange={(e) => setZField(e.target.value)}
                             className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 appearance-none bg-white pr-8"
                           >
                             <option value="">{t('dataToChartPage.notUsed')}</option>
                             {columns.filter(col => col !== xField && col !== yField).map(col => (
                               <option key={col} value={col}>{col}</option>
                             ))}
                           </select>
                         </div>
                       )}
                       
                       {/* 分组字段选择 - 仅支持多系列图表 */}
                       {chartType !== 'pie' && chartType !== 'scatter' && (
                         <div>
                           <label htmlFor="group-field" className="block text-sm font-medium text-gray-700 mb-2">
                             {t('dataToChartPage.groupField')}
                           </label>
                           <select
                             id="group-field"
                             value={groupField}
                             onChange={(e) => setGroupField(e.target.value)}
                             className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 appearance-none bg-white pr-8"
                           >
                             <option value="">{t('dataToChartPage.noGroup')}</option>
                             {columns.filter(col => col !== xField && col !== yField).map(col => (
                               <option key={col} value={col}>{col}</option>
                             ))}
                           </select>
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 图表预览区域 */}
              <div className="md:col-span-2">
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md h-full">
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v18h18"/>
                          <path d="M18 17V9"/>
                          <path d="M13 17V5"/>
                          <path d="M8 17v-3"/>
                        </svg>
                        图表预览
                      </div>
                      <button 
                        onClick={exportChart} 
                        disabled={!data.length || isLoading}
                        className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${!data.length || isLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            导出中...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            导出图片
                          </>
                        )}
                      </button>
                    </h3>
                  </div>
                  
                  <div className="p-5 min-h-[450px] flex items-center justify-center" ref={chartRef}>
                    {data.length > 0 ? (
                      chartType === 'bar' ? (
                        <RechartsBarChart 
                          width={chartDimensions.width} 
                          height={chartDimensions.height}
                          data={groupField ? pivotDataForGrouping() : data} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          barGap={8}
                          barCategoryGap="15%"
                        >
                             <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                             <XAxis 
                               dataKey={xField} 
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                               axisLine={{ stroke: '#e5e7eb' }}
                               tickLine={false}
                             />
                             <YAxis 
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                               axisLine={{ stroke: '#e5e7eb' }}
                               tickLine={false}
                               width={60}
                             />
                             <Tooltip 
                               contentStyle={{
                                 backgroundColor: 'white',
                                 border: '1px solid #e5e7eb',
                                 borderRadius: '8px',
                                 boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                                 padding: '8px 12px',
                                 fontSize: '12px'
                               }}
                               cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                             />
                             <Legend 
                               wrapperStyle={{ paddingTop: 10 }}
                               formatter={(value) => <span style={{ fontSize: '12px', color: '#4b5563' }}>{value}</span>}
                             />
                             {groupField ? (
                               // 使用数据透视后的分组柱状图 - 正确的Recharts分组方式
                               getGroupNames().map((groupName, index) => (
                                 <Bar 
                                   key={groupName}
                                   dataKey={groupName}
                                   fill={COLORS[index % COLORS.length]}
                                   name={groupName}
                                   radius={[4, 4, 0, 0]}
                                   barSize={25}
                                   animationDuration={1500}
                                 />
                               ))
                             ) : (
                               // 单系列柱状图
                               <Bar 
                                 dataKey={yField} 
                                 fill="#3b82f6" 
                                 name={yField}
                                 radius={[4, 4, 0, 0]}
                                 barSize={35}
                                 animationDuration={1500}
                               />
                             )}
                         </RechartsBarChart>
                      ) : chartType === 'line' ? (
                        <LineChart 
                          width={chartDimensions.width} 
                          height={chartDimensions.height}
                          data={groupField ? pivotDataForGrouping() : data} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                             <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                             <XAxis 
                               dataKey={xField} 
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                               axisLine={{ stroke: '#e5e7eb' }}
                               tickLine={false}
                             />
                             <YAxis 
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                               axisLine={{ stroke: '#e5e7eb' }}
                               tickLine={false}
                               width={60}
                             />
                             <Tooltip 
                               contentStyle={{
                                 backgroundColor: 'white',
                                 border: '1px solid #e5e7eb',
                                 borderRadius: '8px',
                                 boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                                 padding: '8px 12px',
                                 fontSize: '12px'
                               }}
                             />
                             <Legend 
                               wrapperStyle={{ paddingTop: 10 }}
                               formatter={(value) => <span style={{ fontSize: '12px', color: '#4b5563' }}>{value}</span>}
                             />
                             {groupField ? (
                               // 使用数据透视后的多线折线图 - 正确的Recharts分组方式
                               getGroupNames().map((groupName, index) => (
                                 <Line 
                                   key={groupName}
                                   type="monotone" 
                                   dataKey={groupName}
                                   stroke={COLORS[index % COLORS.length]} 
                                   name={groupName}
                                   strokeWidth={3}
                                   dot={{ r: 5, fill: 'white', strokeWidth: 2 }} 
                                   activeDot={{ r: 7, strokeWidth: 0, fill: COLORS[index % COLORS.length] }}
                                   animationDuration={1500}
                                 />
                               ))
                             ) : (
                               // 单线折线图
                               <Line 
                                 type="monotone" 
                                 dataKey={yField} 
                                 stroke="#3b82f6" 
                                 name={yField}
                                 strokeWidth={3}
                                 dot={{ r: 5, fill: 'white', strokeWidth: 2 }} 
                                 activeDot={{ r: 7, strokeWidth: 0, fill: '#3b82f6' }}
                                 animationDuration={1500}
                               />
                             )}
                         </LineChart>
                      ) : chartType === 'pie' ? (
                        <RechartsPieChart width={chartDimensions.width} height={chartDimensions.height}>
                          <Pie
                            data={preparePieData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent, value }) => {
                              const percentage = ((percent || 0) as number * 100).toFixed(0);
                              // 只显示有值的标签，添加类型断言
                              return (value as number) > 0 ? `${name} (${value}, ${percentage}%)` : name;
                            }}
                            outerRadius={120} // 减小半径使图表更紧凑
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={2}
                            animationDuration={1500}
                            animationBegin={300}
                          >
                               {preparePieData().map((entry, index) => (
                                 <Cell 
                                   key={`cell-${index}`} 
                                   fill={COLORS[index % COLORS.length]}
                                   stroke="white"
                                   strokeWidth={2}
                                 />
                               ))}
                             </Pie>
                             <Tooltip 
                               formatter={(value: any, name: any) => {
                                 // 计算百分比
                                 const total = preparePieData().reduce((sum, item) => sum + (item.value || 0), 0);
                                 const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                 return [`${value} (${percentage}%)`, name];
                               }}
                               contentStyle={{
                                 backgroundColor: 'white',
                                 border: '1px solid #e5e7eb',
                                 borderRadius: '8px',
                                 boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                                 padding: '8px 12px',
                                 fontSize: '12px'
                               }}
                             />
                             <Legend 
                               verticalAlign="bottom" 
                               height={60}
                               formatter={(value) => <span style={{ fontSize: '14px', color: '#4b5563', paddingRight: '12px' }}>{value}</span>}
                             />
                         </RechartsPieChart>
                      ) : chartType === 'scatter' ? (
                        <ScatterChart
                          width={chartDimensions.width}
                          height={chartDimensions.height}
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis 
                              type="number" 
                              dataKey="x" 
                              name={xField}
                              tick={{ fontSize: 12, fill: '#6b7280' }}
                              axisLine={{ stroke: '#e5e7eb' }}
                              tickLine={false}
                              label={{ value: xField, position: 'insideBottomRight', offset: -10 }}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="y" 
                              name={yField}
                              tick={{ fontSize: 12, fill: '#6b7280' }}
                              axisLine={{ stroke: '#e5e7eb' }}
                              tickLine={false}
                              label={{ value: yField, angle: -90, position: 'insideLeft' }}
                            />
                            {zField && (
                              <ZAxis 
                                type="number" 
                                dataKey="z" 
                                range={[60, 400]} 
                                name={zField}
                              />
                            )}
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              formatter={(value: any, name: any) => {
                                if (name === 'x') return [value, xField];
                                if (name === 'y') return [value, yField];
                                if (name === 'z' && zField) return [value, zField];
                                return [value, name];
                              }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                                padding: '8px 12px',
                                fontSize: '12px'
                              }}
                            />
                            <Legend />
                            <Scatter 
                              name="数据点" 
                              data={prepareScatterData()} 
                              fill="#3b82f6"
                              animationDuration={1500}
                            />
                        </ScatterChart>
                      ) : chartType === 'area' ? (
                        <AreaChart
                          width={chartDimensions.width}
                          height={chartDimensions.height}
                          data={groupField ? pivotDataForGrouping() : data}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                             <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                             <XAxis 
                               dataKey={xField} 
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                               axisLine={{ stroke: '#e5e7eb' }}
                               tickLine={false}
                             />
                             <YAxis 
                               tick={{ fontSize: 12, fill: '#6b7280' }}
                               axisLine={{ stroke: '#e5e7eb' }}
                               tickLine={false}
                               width={60}
                             />
                             <Tooltip 
                               contentStyle={{
                                 backgroundColor: 'white',
                                 border: '1px solid #e5e7eb',
                                 borderRadius: '8px',
                                 boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                                 padding: '8px 12px',
                                 fontSize: '12px'
                               }}
                             />
                             <Legend 
                               wrapperStyle={{ paddingTop: 10 }}
                               formatter={(value) => <span style={{ fontSize: '12px', color: '#4b5563' }}>{value}</span>}
                             />
                             {groupField ? (
                               // 使用数据透视后的多系列面积图 - 正确的Recharts分组方式
                               <>
                                 {/* 外部定义所有渐变 */}
                                 <defs>
                                   {getGroupNames().map((groupName, index) => (
                                     <linearGradient key={`grad-${groupName}`} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                                       <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                                     </linearGradient>
                                   ))}
                                 </defs>
                                 {/* 渲染每个分组的面积图 */}
                                 {getGroupNames().map((groupName, index) => (
                                   <Area 
                                     key={groupName}
                                     type="monotone" 
                                     dataKey={groupName}
                                     name={groupName}
                                     stroke={COLORS[index % COLORS.length]} 
                                     fill={`url(#color${index})`} 
                                     fillOpacity={0.3}
                                     strokeWidth={3}
                                     animationDuration={1500}
                                   />
                                 ))}
                               </>
                             ) : (
                               // 单系列面积图
                               <>
                                 <Area 
                                   type="monotone" 
                                   dataKey={yField} 
                                   name={yField}
                                   stroke="#3b82f6" 
                                   fill="url(#colorValue)" 
                                   fillOpacity={0.3}
                                   strokeWidth={3}
                                   animationDuration={1500}
                                 />
                                 <defs>
                                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                   </linearGradient>
                                 </defs>
                               </>
                             )}
                         </AreaChart>
                      ) : null
                    ) : (
                      <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb',
                        border: '2px dashed #e5e7eb',
                        borderRadius: '12px'
                      }}>
                        <div className="text-center p-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-800 mb-2">请输入数据以生成图表</h3>
                          <p className="text-gray-500">支持CSV或JSON格式，点击「加载示例」按钮查看示例数据</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部提示信息 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>CreatiKit © 2024 | 数据可视化工具</p>
        </div>
      </div>
    </div>
  );
};

export default DataToChartPage;