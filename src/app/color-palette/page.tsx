'use client'

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ColorHarmony } from '@/components/color-palette/color-harmony';
import { Eye, EyeOff, Copy, Check, Upload, Download, Plus, Minus, RefreshCw, X } from 'lucide-react';
import { HexColorPicker } from '@/components/ui/color-picker/hex-color-picker';
import { Eyedropper } from '@/components/ui/color-picker/eyedropper';
import { ColorHarmonyGenerator } from '@/components/ui/color-picker/color-harmony';
import { ContrastChecker } from '@/components/ui/color-picker/contrast-checker';
import { CodeExporter } from '@/components/ui/color-picker/code-exporter';

export default function ColorPalette() {
  // 状态管理
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [colorPalette, setColorPalette] = useState<string[]>(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']);
  const [activeTab, setActiveTab] = useState('picker');
  const [contrastColor, setContrastColor] = useState('#FFFFFF');
  const [harmonyType, setHarmonyType] = useState('analogous');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEyeDropperActive, setIsEyeDropperActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 添加颜色到调色板
  const addColorToPalette = (color: string) => {
    if (!colorPalette.includes(color)) {
      setColorPalette([...colorPalette, color].slice(-5)); // 最多保留5种颜色
    }
  };

  // 从调色板移除颜色
  const removeColorFromPalette = (color: string) => {
    setColorPalette(colorPalette.filter(c => c !== color));
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 从图片中提取颜色
  const extractColorsFromImage = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 调整画布大小
      const maxSize = 400;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, width, height).data;
      const pixelCount = width * height;
      const colorMap = new Map<string, number>();
      
      // 统计颜色频率
      for (let i = 0; i < pixelCount; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        // 忽略透明像素
        if (a < 128) continue;
        
        // 转换为十六进制
        const hex = `#${[r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
        
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
      
      // 排序并获取前5种最常见的颜色
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => color);
      
      if (sortedColors.length > 0) {
        setColorPalette(sortedColors);
        setSelectedColor(sortedColors[0]);
      }
    };
    img.src = imageSrc;
  };

  // 当上传图片后提取颜色
  useEffect(() => {
    if (uploadedImage) {
      extractColorsFromImage(uploadedImage);
    }
  }, [uploadedImage]);

  // 清空调色板
  const clearPalette = () => {
    setColorPalette([]);
    setSelectedColor('#3B82F6');
  };

  // 生成随机颜色
  const generateRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setSelectedColor(randomColor);
    addColorToPalette(randomColor);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          专业调色板
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧面板：颜色选择和取色 */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">颜色选择</h2>
                
                <div className="flex flex-col items-center space-y-6">
                  {/* 颜色预览 */}
                  <div 
                    className="w-full h-32 rounded-lg shadow-lg transition-all duration-300" 
                    style={{ backgroundColor: selectedColor }}
                  />
                  
                  {/* 颜色输入 */}
                  <div className="w-full">
                    <Label htmlFor="hex-color">十六进制颜色</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input 
                        id="hex-color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="font-mono"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon"
                              onClick={() => copyToClipboard(selectedColor)}
                            >
                              {copied ? <Check size={18} /> : <Copy size={18} />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{copied ? '已复制!' : '复制颜色值'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* 颜色滑块 */}
                  <HexColorPicker 
                    color={selectedColor} 
                    onChange={setSelectedColor}
                  />
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button 
                      onClick={() => addColorToPalette(selectedColor)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      添加到调色板
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={generateRandomColor}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      随机颜色
                    </Button>
                    
                    {/* 取色器按钮 */}
                    <Eyedropper 
                      onColorPick={(color) => {
                        setSelectedColor(color);
                        addColorToPalette(color);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* 图片取色 */}
            <Card>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">图片取色</h2>
                
                <div className="space-y-4">
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                    {uploadedImage ? (
                      <div className="space-y-2">
                        <img 
                          src={uploadedImage} 
                          alt="上传的图片" 
                          className="max-h-80 mx-auto rounded-lg object-contain"
                        />
                        <Button 
                          variant="secondary"
                          onClick={() => setUploadedImage(null)}
                          className="mt-2"
                        >
                          移除图片
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          拖放图片或点击上传
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          支持 JPG, PNG, WEBP 格式
                        </p>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button 
                          variant="secondary"
                          onClick={() => imageInputRef.current?.click()}
                          className="mt-4"
                        >
                          选择图片
                        </Button>
                      </div>
                    )}
                  </div>
                  <canvas 
                    ref={canvasRef} 
                    className="hidden"
                  />
                </div>
              </div>
            </Card>
          </div>
          
          {/* 右侧面板：功能标签页 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 调色板展示 */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">我的调色板</h2>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={clearPalette}
                    className="text-sm"
                  >
                    清空
                  </Button>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {colorPalette.length > 0 ? (
                    colorPalette.map((color, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`w-full aspect-square rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 relative overflow-hidden`}
                              style={{ backgroundColor: color }}
                              onClick={() => setSelectedColor(color)}
                            >
                              <button
                                className="absolute top-1 right-1 bg-black/30 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeColorFromPalette(color);
                                }}
                              >
                                <X size={12} />
                              </button>
                              <div className="absolute bottom-1 left-1 right-1 text-center text-xs font-mono truncate">
                                {color}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <div className="col-span-5 text-center py-8 text-gray-500 dark:text-gray-400">
                      调色板为空，请添加颜色
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* 功能标签页 */}
            <Tabs defaultValue="harmony" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="harmony">配色方案</TabsTrigger>
                <TabsTrigger value="contrast">对比度检查</TabsTrigger>
                <TabsTrigger value="code">代码导出</TabsTrigger>
              </TabsList>
              
              {/* 配色方案生成 */}
              <TabsContent value="harmony" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>配色方案生成器</CardTitle>
                    <CardDescription>基于色彩学规则自动生成和谐的配色方案</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ColorHarmony 
                      baseColor={selectedColor}
                      onColorSelect={setColorPalette}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* 对比度检查 */}
              <TabsContent value="contrast" className="space-y-4">
                <Card>
                  <div className="p-6">
                    <ContrastChecker 
                      foregroundColor={selectedColor}
                      backgroundColor={contrastColor}
                      onForegroundColorChange={setSelectedColor}
                      onBackgroundColorChange={setContrastColor}
                    />
                  </div>
                </Card>
              </TabsContent>
              
              {/* 代码导出 */}
              <TabsContent value="code" className="space-y-4">
                <Card>
                  <div className="p-6">
                    <CodeExporter 
                      colors={colorPalette}
                      primaryColor={selectedColor}
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}