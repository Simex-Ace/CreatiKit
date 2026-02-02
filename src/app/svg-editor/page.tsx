'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Download, Upload, Trash2, Move, PenTool, Shapes, Circle, Square, Minus, Type, MousePointer2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useI18n } from '@/contexts/I18nContext';

type Tool = 'select' | 'path' | 'circle' | 'rect' | 'line' | 'text';

interface SVGElement {
  id: string;
  type: string;
  attributes: Record<string, string>;
}

export default function SVGEditor() {
  const { t } = useI18n();
  const [tool, setTool] = useState<Tool>('select');
  const [svgElements, setSvgElements] = useState<SVGElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [svgCode, setSvgCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pathPoints, setPathPoints] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  
  const svgRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  // 生成SVG代码
  const generateSVGCode = () => {
    const elements = svgElements.map(el => {
      const attrs = Object.entries(el.attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      return `<${el.type} ${attrs} />`;
    }).join('\n  ');

    return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  ${elements}
</svg>`;
  };

  // 更新SVG代码
  useEffect(() => {
    setSvgCode(generateSVGCode());
  }, [svgElements]);

  // 将屏幕坐标转换为SVG坐标
  const screenToSVG = (screenX: number, screenY: number): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const rect = svgRef.current.getBoundingClientRect();
    const svg = svgRef.current;
    const viewBox = svg.viewBox.baseVal;
    const svgWidth = svg.clientWidth || 800;
    const svgHeight = svg.clientHeight || 600;
    const viewBoxWidth = viewBox.width || 800;
    const viewBoxHeight = viewBox.height || 600;
    
    const x = ((screenX - rect.left) / svgWidth) * viewBoxWidth;
    const y = ((screenY - rect.top) / svgHeight) * viewBoxHeight;
    
    return { x, y };
  };

  // 处理鼠标点击（绘制）
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const { x, y } = screenToSVG(e.clientX, e.clientY);

    // select工具：点击空白处取消选择
    if (tool === 'select') {
      // 如果点击的不是元素，取消选择
      if (e.target === svgRef.current) {
        setSelectedElement(null);
      }
      return;
    }

    switch (tool) {
      case 'circle':
        addCircle(x, y);
        break;
      case 'rect':
        addRect(x, y);
        break;
      case 'line':
        if (!isDrawing) {
          setIsDrawing(true);
          setPathPoints([`M ${x} ${y}`]);
        } else {
          const lastPoint = pathPoints[pathPoints.length - 1];
          const newPoint = `L ${x} ${y}`;
          setPathPoints([...pathPoints, newPoint]);
          addPath([...pathPoints, newPoint]);
          setIsDrawing(false);
          setPathPoints([]);
        }
        break;
      case 'path':
        if (!isDrawing) {
          setIsDrawing(true);
          setPathPoints([`M ${x} ${y}`]);
        } else {
          setPathPoints([...pathPoints, `L ${x} ${y}`]);
        }
        break;
      case 'text':
        addText(x, y);
        break;
    }
  };

  // 添加圆形
  const addCircle = (x: number, y: number) => {
    const id = `circle-${Date.now()}`;
    const newElement: SVGElement = {
      id,
      type: 'circle',
      attributes: {
        cx: x.toString(),
        cy: y.toString(),
        r: '30',
        fill: fillColor,
        stroke: strokeColor,
        'stroke-width': strokeWidth.toString(),
      },
    };
    setSvgElements([...svgElements, newElement]);
    setSelectedElement(id);
  };

  // 添加矩形
  const addRect = (x: number, y: number) => {
    const id = `rect-${Date.now()}`;
    const newElement: SVGElement = {
      id,
      type: 'rect',
      attributes: {
        x: (x - 30).toString(),
        y: (y - 30).toString(),
        width: '60',
        height: '60',
        fill: fillColor,
        stroke: strokeColor,
        'stroke-width': strokeWidth.toString(),
      },
    };
    setSvgElements([...svgElements, newElement]);
    setSelectedElement(id);
  };

  // 添加路径
  const addPath = (points: string[]) => {
    const id = `path-${Date.now()}`;
    const newElement: SVGElement = {
      id,
      type: 'path',
      attributes: {
        d: points.join(' '),
        fill: 'none',
        stroke: strokeColor,
        'stroke-width': strokeWidth.toString(),
      },
    };
    setSvgElements([...svgElements, newElement]);
    setSelectedElement(id);
    setIsDrawing(false);
    setPathPoints([]);
  };

  // 添加文本
  const addText = (x: number, y: number) => {
    const id = `text-${Date.now()}`;
    const newElement: SVGElement = {
      id,
      type: 'text',
      attributes: {
        x: x.toString(),
        y: y.toString(),
        fill: fillColor,
        'font-size': '24',
        textContent: '',
      },
    };
    setSvgElements([...svgElements, newElement]);
    setSelectedElement(id);
    // 立即进入编辑模式
    setEditingText(id);
    setTextInput('');
  };

  // 删除选中元素
  const deleteSelected = () => {
    if (selectedElement) {
      setSvgElements(svgElements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  // 复制SVG代码
  const handleCopy = () => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    toast({
      title: t('svgEditorPage.copied'),
      description: t('svgEditorPage.copiedDescription'),
      variant: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // 下载SVG文件
  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'drawing.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入SVG
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const svgText = event.target?.result as string;
      setSvgCode(svgText);
      
      // 解析SVG并提取元素
      try {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        // 检查解析错误
        const parserError = svgDoc.querySelector('parsererror');
        if (parserError) {
          toast({
            title: t('svgEditorPage.parseFailed'),
            description: t('svgEditorPage.parseFailedDescription'),
            variant: 'destructive',
          });
          return;
        }
        
        const svgElement = svgDoc.querySelector('svg');
        
        if (svgElement) {
          // 获取原始SVG的viewBox，如果存在则应用到画布
          const originalViewBox = svgElement.getAttribute('viewBox');
          // 延迟设置viewBox，确保ref已准备好
          setTimeout(() => {
            if (svgRef.current) {
              if (originalViewBox) {
                svgRef.current.setAttribute('viewBox', originalViewBox);
              } else {
                // 如果没有viewBox，尝试从width和height获取，移除单位
                const width = svgElement.getAttribute('width') || '800';
                const height = svgElement.getAttribute('height') || '600';
                const w = width.replace(/[^\d.]/g, '') || '800';
                const h = height.replace(/[^\d.]/g, '') || '600';
                svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
              }
            }
          }, 100);
          
          const newElements: SVGElement[] = [];
          
          // 递归提取所有子元素（包括嵌套的g元素）
          const extractElements = (element: Element) => {
            Array.from(element.children).forEach((child) => {
              const tagName = child.tagName.toLowerCase();
              
              // 如果是g元素，递归处理其子元素
              if (tagName === 'g') {
                extractElements(child);
                return;
              }
              
              // 提取可编辑的元素
              if (['circle', 'rect', 'path', 'line', 'text', 'ellipse', 'polygon', 'polyline'].includes(tagName)) {
                const attributes: Record<string, string> = {};
                Array.from(child.attributes).forEach(attr => {
                  attributes[attr.name] = attr.value;
                });
                
                // 保存文本内容
                if (tagName === 'text') {
                  attributes['textContent'] = child.textContent || child.innerHTML || '';
                  // 确保必要的属性存在
                  if (!attributes['x']) {
                    attributes['x'] = '400';
                  }
                  if (!attributes['y']) {
                    attributes['y'] = '300';
                  }
                }
                
                newElements.push({
                  id: `${tagName}-${Date.now()}-${newElements.length}`,
                  type: tagName,
                  attributes,
                });
              }
            });
          };
          
          extractElements(svgElement);
          
          if (newElements.length > 0) {
            setSvgElements(newElements);
            toast({
              title: t('svgEditorPage.importSuccess'),
              description: t('svgEditorPage.importSuccessDescription', { count: newElements.length }),
              variant: 'success',
            });
          } else {
            console.warn('未找到可编辑的SVG元素，原始SVG:', svgText);
            toast({
              title: t('svgEditorPage.importWarning'),
              description: t('svgEditorPage.importWarningDescription'),
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: t('svgEditorPage.importFailed'),
            description: t('svgEditorPage.importFailedNoRoot'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('SVG导入错误:', error);
        toast({
          title: t('svgEditorPage.importFailed'),
          description: t('svgEditorPage.importFailedParse', { error: error instanceof Error ? error.message : '未知错误' }),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  // 完成路径绘制
  const finishPath = () => {
    if (pathPoints.length > 1) {
      addPath(pathPoints);
    }
    setIsDrawing(false);
    setPathPoints([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Shapes className="h-8 w-8" />
          {t('svgEditorPage.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('svgEditorPage.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 工具栏 */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-center">{t('svgEditorPage.tools')}</h2>
          
          <div className="space-y-4">
            {/* 工具选择 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('svgEditorPage.drawingTools')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={tool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTool('select');
                    if (pathPoints.length > 0) finishPath();
                  }}
                  title={t('svgEditorPage.selectTooltip')}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <MousePointer2 className="h-4 w-4" />
                  <span className="text-xs">{t('svgEditorPage.select')}</span>
                </Button>
                <Button
                  variant={tool === 'path' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTool('path');
                    if (pathPoints.length > 0) finishPath();
                  }}
                  title={t('svgEditorPage.pathTooltip')}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <PenTool className="h-4 w-4" />
                  <span className="text-xs">{t('svgEditorPage.path')}</span>
                </Button>
                <Button
                  variant={tool === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTool('circle');
                    if (pathPoints.length > 0) finishPath();
                  }}
                  title={t('svgEditorPage.circleTooltip')}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Circle className="h-4 w-4" />
                  <span className="text-xs">{t('svgEditorPage.circle')}</span>
                </Button>
                <Button
                  variant={tool === 'rect' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTool('rect');
                    if (pathPoints.length > 0) finishPath();
                  }}
                  title={t('svgEditorPage.rectTooltip')}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Square className="h-4 w-4" />
                  <span className="text-xs">{t('svgEditorPage.rect')}</span>
                </Button>
                <Button
                  variant={tool === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTool('line');
                    if (pathPoints.length > 0) finishPath();
                  }}
                  title={t('svgEditorPage.lineTooltip')}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Minus className="h-4 w-4" />
                  <span className="text-xs">{t('svgEditorPage.line')}</span>
                </Button>
                <Button
                  variant={tool === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setTool('text');
                    if (pathPoints.length > 0) finishPath();
                  }}
                  title={t('svgEditorPage.textTooltip')}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Type className="h-4 w-4" />
                  <span className="text-xs">{t('svgEditorPage.text')}</span>
                </Button>
              </div>
            </div>

            {/* 颜色设置 */}
            <div className="space-y-2">
              <Label>{t('svgEditorPage.fillColor')}</Label>
              <Input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('svgEditorPage.strokeColor')}</Label>
              <Input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
              />
            </div>

            {/* 描边宽度 */}
            <div className="space-y-2">
              <Label>{t('svgEditorPage.strokeWidth')}: {strokeWidth}</Label>
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
                max={20}
                min={1}
                step={1}
              />
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2 pt-4">
              <Button variant="outline" className="w-full" onClick={deleteSelected} disabled={!selectedElement}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('svgEditorPage.deleteSelected')}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSvgElements([])}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('svgEditorPage.clearCanvas')}
              </Button>
              <Label className="block">
                <Input
                  type="file"
                  accept=".svg"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('svgEditorPage.importSVG')}
                  </span>
                </Button>
              </Label>
              <Button variant="outline" className="w-full" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {t('svgEditorPage.copyCode')}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('svgEditorPage.downloadSVG')}
              </Button>
            </div>

            {/* 提示 */}
            {tool === 'path' && isDrawing && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                {t('svgEditorPage.drawingPathHint')}
              </div>
            )}
          </div>
        </Card>

        {/* 画布 */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-center">{t('svgEditorPage.canvas')}</h2>
          <div className="border rounded-lg overflow-hidden bg-white flex items-center justify-center" style={{ minHeight: '600px' }}>
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
              onClick={handleSvgClick}
              onMouseMove={(e) => {
                // 处理路径绘制时的鼠标移动
                if (tool === 'path' && isDrawing && svgRef.current) {
                  const { x, y } = screenToSVG(e.clientX, e.clientY);
                  if (pathPoints.length > 0) {
                    const lastPoint = pathPoints[pathPoints.length - 1];
                    if (lastPoint.startsWith('M')) {
                      setPathPoints([...pathPoints, `L ${x} ${y}`]);
                    } else {
                      const newPoints = [...pathPoints];
                      newPoints[newPoints.length - 1] = `L ${x} ${y}`;
                      setPathPoints(newPoints);
                    }
                  }
                }
                // 处理拖拽移动
                if (tool === 'select' && isDragging && selectedElement) {
                  const { x, y } = screenToSVG(e.clientX, e.clientY);
                  const el = svgElements.find(e => e.id === selectedElement);
                  if (el) {
                    const newX = x - dragOffset.x;
                    const newY = y - dragOffset.y;
                    const updatedElements = svgElements.map(element => {
                      if (element.id === selectedElement) {
                        const newAttrs = { ...element.attributes };
                        if (element.type === 'circle') {
                          newAttrs.cx = newX.toString();
                          newAttrs.cy = newY.toString();
                        } else if (element.type === 'rect') {
                          const width = parseFloat(element.attributes.width || '60');
                          const height = parseFloat(element.attributes.height || '60');
                          newAttrs.x = (newX - width / 2).toString();
                          newAttrs.y = (newY - height / 2).toString();
                        } else if (element.type === 'text') {
                          newAttrs.x = newX.toString();
                          newAttrs.y = newY.toString();
                        } else if (element.type === 'path') {
                          // 移动path的所有点
                          const d = element.attributes.d || '';
                          const points = d.match(/[ML]\s*([\d.-]+)\s*([\d.-]+)/g) || [];
                          const firstPoint = points[0]?.match(/[ML]\s*([\d.-]+)\s*([\d.-]+)/);
                          if (firstPoint) {
                            const offsetX = newX - parseFloat(firstPoint[1]);
                            const offsetY = newY - parseFloat(firstPoint[2]);
                            const newD = points.map((point, idx) => {
                              const match = point.match(/[ML]\s*([\d.-]+)\s*([\d.-]+)/);
                              if (match) {
                                const px = parseFloat(match[1]) + offsetX;
                                const py = parseFloat(match[2]) + offsetY;
                                return `${point[0]} ${px} ${py}`;
                              }
                              return point;
                            }).join(' ');
                            newAttrs.d = newD;
                          }
                        }
                        return { ...element, attributes: newAttrs };
                      }
                      return element;
                    });
                    setSvgElements(updatedElements);
                  }
                }
              }}
              onMouseUp={() => {
                if (isDragging) {
                  setIsDragging(false);
                }
              }}
              onMouseLeave={() => {
                if (isDragging) {
                  setIsDragging(false);
                }
              }}
              className="cursor-crosshair w-full"
              style={{ display: 'block' }}
            >
              {svgElements.map((el) => {
                const isSelected = selectedElement === el.id;
                const commonProps = {
                  key: el.id,
                  style: {
                    cursor: tool === 'select' ? (isSelected ? 'move' : 'pointer') : 'default',
                    opacity: isSelected ? 0.8 : 1,
                    outline: isSelected ? '2px dashed #3b82f6' : 'none',
                    outlineOffset: isSelected ? '2px' : '0',
                  },
                  onMouseDown: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (tool === 'select') {
                      setSelectedElement(el.id);
                      // 如果是文字元素，单击也进入编辑模式
                      if (el.type === 'text') {
                        setEditingText(el.id);
                        setTextInput(el.attributes.textContent || '');
                        return;
                      }
                      const { x, y } = screenToSVG(e.clientX, e.clientY);
                      // 计算元素中心点
                      let elX = 0, elY = 0;
                      if (el.type === 'circle') {
                        elX = parseFloat(el.attributes.cx || '0');
                        elY = parseFloat(el.attributes.cy || '0');
                      } else if (el.type === 'rect') {
                        elX = parseFloat(el.attributes.x || '0') + parseFloat(el.attributes.width || '0') / 2;
                        elY = parseFloat(el.attributes.y || '0') + parseFloat(el.attributes.height || '0') / 2;
                      } else if (el.type === 'path') {
                        // 对于path，使用第一个点的坐标
                        const d = el.attributes.d || '';
                        const match = d.match(/M\s*([\d.-]+)\s*([\d.-]+)/);
                        if (match) {
                          elX = parseFloat(match[1]);
                          elY = parseFloat(match[2]);
                        }
                      }
                      setDragOffset({ x: x - elX, y: y - elY });
                      setIsDragging(true);
                    } else {
                      setSelectedElement(el.id);
                      // 非select工具时，点击文字元素也进入编辑模式
                      if (el.type === 'text') {
                        setEditingText(el.id);
                        setTextInput(el.attributes.textContent || '');
                      }
                    }
                  },
                };

                // 将 attributes 对象转换为 props
                const attrs: any = {};
                Object.entries(el.attributes).forEach(([key, value]) => {
                  // React SVG 属性名处理
                  // 某些属性需要保持 kebab-case，某些需要转换为 camelCase
                  if (key === 'stroke-width') {
                    attrs.strokeWidth = value;
                  } else if (key === 'fill-rule') {
                    attrs.fillRule = value;
                  } else if (key === 'clip-rule') {
                    attrs.clipRule = value;
                  } else if (key.startsWith('data-') || key.startsWith('aria-')) {
                    // 保持 data- 和 aria- 属性不变
                    attrs[key] = value;
                  } else {
                    // 其他属性转换为 camelCase
                    const propKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    attrs[propKey] = value;
                  }
                });

                switch (el.type) {
                  case 'circle':
                    return <circle {...attrs} {...commonProps} />;
                  case 'rect':
                    return <rect {...attrs} {...commonProps} />;
                  case 'path':
                    return <path {...attrs} {...commonProps} />;
                  case 'line':
                    return <line {...attrs} {...commonProps} />;
                  case 'text':
                    const textContent = el.attributes['textContent'] || el.attributes['text'] || '';
                    return (
                      <text {...attrs} {...commonProps}>
                        {editingText === el.id ? (
                          <tspan>{textInput || ''}</tspan>
                        ) : (
                          textContent
                        )}
                      </text>
                    );
                  case 'ellipse':
                    return <ellipse {...attrs} {...commonProps} />;
                  case 'polygon':
                    return <polygon {...attrs} {...commonProps} />;
                  case 'polyline':
                    return <polyline {...attrs} {...commonProps} />;
                  default:
                    return null;
                }
              })}
              {isDrawing && pathPoints.length > 0 && (
                <path
                  d={pathPoints.join(' ')}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray="5,5"
                />
              )}
            </svg>
          </div>
          {isDrawing && (
            <div className="mt-4 flex gap-2">
              <Button onClick={finishPath}>{t('common.finish')}</Button>
              <Button variant="outline" onClick={() => {
                setIsDrawing(false);
                setPathPoints([]);
              }}>{t('common.cancel')}</Button>
            </div>
          )}
          {editingText && (
            <div className="mt-4 space-y-2">
              <Label>{t('common.editText')}</Label>
              <div className="flex gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const updatedElements = svgElements.map(el => {
                        if (el.id === editingText) {
                          return { ...el, attributes: { ...el.attributes, textContent: textInput } };
                        }
                        return el;
                      });
                      setSvgElements(updatedElements);
                      setEditingText(null);
                    } else if (e.key === 'Escape') {
                      // 如果文字为空，删除元素
                      if (!textInput.trim()) {
                        setSvgElements(svgElements.filter(el => el.id !== editingText));
                        setSelectedElement(null);
                      }
                      setEditingText(null);
                    }
                  }}
                  placeholder={t('common.enterText')}
                  autoFocus
                  className="flex-1"
                />
                <Button onClick={() => {
                  if (!textInput.trim()) {
                    // 如果文字为空，删除元素
                    setSvgElements(svgElements.filter(el => el.id !== editingText));
                    setSelectedElement(null);
                    setEditingText(null);
                    return;
                  }
                  const updatedElements = svgElements.map(el => {
                    if (el.id === editingText) {
                      return { ...el, attributes: { ...el.attributes, textContent: textInput } };
                    }
                    return el;
                  });
                  setSvgElements(updatedElements);
                  setEditingText(null);
                }}>{t('common.confirm')}</Button>
                <Button variant="outline" onClick={() => {
                  // 如果文字为空，删除元素
                  if (!textInput.trim()) {
                    setSvgElements(svgElements.filter(el => el.id !== editingText));
                    setSelectedElement(null);
                  }
                  setEditingText(null);
                }}>{t('common.cancel')}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('common.pressEnterConfirm')}</p>
            </div>
          )}
        </Card>
      </div>

      {/* SVG代码 */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('common.svgCode')}</h2>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {t('common.copy')}
          </Button>
        </div>
        <Textarea
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          className="font-mono text-sm"
          rows={10}
        />
      </Card>
    </div>
  );
}

