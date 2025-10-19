'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Download, Upload, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';

export default function ImageCompressor() {
  const [images, setImages] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<{ file: File; originalSize: number; compressedSize: number }[]>([]);
  const [quality, setQuality] = useState<number[]>([80]);
  const [format, setFormat] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [compressedImagePreviews, setCompressedImagePreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('upload'); // 使用状态控制标签页
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 清理URL对象，避免内存泄漏
    useEffect(() => {
      return () => {
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        compressedImagePreviews.forEach(url => URL.revokeObjectURL(url));
      };
    }, []); // 只在组件卸载时清理一次，避免在标签页切换时清理
    
    // 标签页切换时重新创建预览URL
    useEffect(() => {
      if (activeTab === 'upload' && images.length > 0) {
        // 确保有足够的预览URL
        const updatedPreviews = [...imagePreviews];
        let needUpdate = false;
        
        images.forEach((image, index) => {
          if (!updatedPreviews[index]) {
            updatedPreviews[index] = URL.createObjectURL(image);
            needUpdate = true;
          }
        });
        
        if (needUpdate) {
          setImagePreviews(updatedPreviews);
        }
      } else if (activeTab === 'results' && compressedImages.length > 0) {
        // 确保有足够的压缩后预览URL
        const updatedPreviews = [...compressedImagePreviews];
        let needUpdate = false;
        
        compressedImages.forEach((image, index) => {
          if (!updatedPreviews[index]) {
            updatedPreviews[index] = URL.createObjectURL(image.file);
            needUpdate = true;
          }
        });
        
        if (needUpdate) {
          setCompressedImagePreviews(updatedPreviews);
        }
      }
    }, [activeTab]); // 当标签页切换时触发
  
  // 修复toast导入
  const { toast } = useToast();
  
  // 开发中提示状态（保持一致性）
  const { alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      if (newImages.length === 0) {
        toast({ title: '请上传有效的图片文件', variant: 'destructive' });
        return;
      }
      
      // 创建新图片的预览URL
      const newImagePreviews = newImages.map(file => URL.createObjectURL(file));
      
      // 更新状态
      setImages(prevImages => [...prevImages, ...newImages]);
      setImagePreviews(prevPreviews => [...prevPreviews, ...newImagePreviews]);
      
      // 清空input，允许重复上传相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 移除图片
  const removeImage = (index: number) => {
    // 清理要移除的图片的预览URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // 压缩图片
  const compressImages = async () => {
    if (images.length === 0) {
      toast({ title: '请先上传图片', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    const results: { file: File; originalSize: number; compressedSize: number }[] = [];

    for (const image of images) {
      try {
        const result = await processImage(image, quality[0], format);
        results.push(result);
      } catch (error) {
        toast({ title: `压缩图片失败: ${error}`, variant: 'destructive' });
      }
    }

    // 清理旧的压缩图片预览URL
    compressedImagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setCompressedImages(results);
    setIsProcessing(false);
    
    // 为压缩后的图片创建预览URL
    const compressedPreviews = results.map(item => URL.createObjectURL(item.file));
    setCompressedImagePreviews(compressedPreviews);
    
    toast({ title: `成功压缩 ${results.length} 张图片` });
    
    // 压缩完成后自动切换到结果标签页
    setActiveTab('results');
  };

  // 处理图片压缩的核心函数
  const processImage = (file: File, quality: number, format: string): Promise<{ file: File; originalSize: number; compressedSize: number }> => {
    return new Promise((resolve) => {
      // 直接读取文件为Blob，避免DataURL转换带来的额外开销
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (event) => {
        // 如果直接读取文件内容失败，再尝试通过canvas方法处理
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          // 清理临时URL
          URL.revokeObjectURL(img.src);
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 设置画布尺寸 - 保持原始尺寸
          canvas.width = img.width;
          canvas.height = img.height;
          
          // 确保图片质量
          if (ctx) {
            // 设置渲染质量
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 降低平滑质量以减小文件大小
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          
          // 确保质量值在有效范围内 (0-1)，并根据需要降低质量以确保压缩效果
          let qualityValue = Math.max(0.1, Math.min(1, quality / 100));
          
          // 处理格式转换 - 根据所选格式确定正确的MIME类型
          let mimeType: string;
          let extension: string;
          
          switch (format) {
            case 'jpeg':
            case 'jpg':
              mimeType = 'image/jpeg';
              extension = 'jpg';
              break;
            case 'webp':
              mimeType = 'image/webp';
              extension = 'webp';
              // WebP格式可以使用更低的质量值
              qualityValue *= 0.8;
              break;
            case 'png':
              mimeType = 'image/png';
              extension = 'png';
              break;
            default: // auto 或其他未指定格式
              // 自动选择更优格式
              if (file.type.includes('png') && quality < 80) {
                // PNG图片在较低质量要求下转为WebP可获得更好压缩率
                mimeType = 'image/webp';
                extension = 'webp';
                qualityValue *= 0.8;
              } else {
                mimeType = file.type;
                extension = file.type.split('/')[1] || 'jpg';
              }
              break;
          }
          
          // 转换为Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // 如果压缩后文件变大，尝试降低质量重试
                if (blob.size >= file.size) {
                  // 降低质量再次尝试
                  canvas.toBlob(
                    (retryBlob) => {
                      if (retryBlob) {
                        // 根据所选格式修改文件名后缀
                        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || 'image';
                        const newFilename = format !== 'auto' ? `${nameWithoutExt}.${extension}` : file.name;
                        
                        // 确保使用正确的MIME类型创建文件
                        const compressedFile = new File([retryBlob], newFilename, { type: mimeType });
                        resolve({
                          file: compressedFile,
                          originalSize: file.size,
                          compressedSize: retryBlob.size
                        });
                      } else {
                        // 如果重试也失败，返回原始文件
                        resolve({
                          file,
                          originalSize: file.size,
                          compressedSize: file.size
                        });
                      }
                    },
                    mimeType,
                    qualityValue * 0.7 // 降低30%质量
                  );
                } else {
                  // 压缩成功，返回结果
                  const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || 'image';
                  const newFilename = format !== 'auto' ? `${nameWithoutExt}.${extension}` : file.name;
                  
                  const compressedFile = new File([blob], newFilename, { type: mimeType });
                  resolve({
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: blob.size
                  });
                }
              } else {
                // 如果生成Blob失败，返回原始文件
                resolve({
                  file,
                  originalSize: file.size,
                  compressedSize: file.size
                });
              }
            },
            mimeType,
            qualityValue
          );
        };
        
        img.onerror = () => {
          // 图片加载失败时，返回原始文件
          URL.revokeObjectURL(img.src);
          resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size
          });
        };
      };
    });
  };

  // 下载单张图片
  const downloadImage = (image: { file: File; originalSize: number; compressedSize: number }) => {
    const url = URL.createObjectURL(image.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = image.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 批量下载
  const downloadAllImages = () => {
    compressedImages.forEach(downloadImage);
  };

  // 计算压缩率
  const calculateCompressionRate = (originalSize: number, compressedSize: number) => {
    // 确保分母不为零
    if (originalSize === 0) return 0;
    
    // 计算压缩率
    const rate = Math.round((1 - compressedSize / originalSize) * 100);
    return rate;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">图片智能压缩</h1>
        <p className="text-muted-foreground">上传图片，智能压缩算法将保持画质的同时减小文件体积</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">上传图片</TabsTrigger>
          <TabsTrigger value="results">压缩结果</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6 space-y-6">
          {/* 上传区域 */}
          <Card className="border-dashed p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">拖放图片到此处或点击上传</h3>
              <p className="text-sm text-muted-foreground mb-6">
                支持 JPG, PNG, WebP, GIF 格式，最大支持 20MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                选择图片文件
              </Button>
            </div>
          </Card>

          {/* 已上传图片列表 */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">已上传 ({images.length})</h3>
                <Button variant="secondary" size="sm" onClick={() => {
                // 清理预览URL
                imagePreviews.forEach(url => URL.revokeObjectURL(url));
                setImages([]);
                setImagePreviews([]);
              }}>
                清空
              </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => {
                  // 确保预览URL存在，如果不存在则重新创建
                  const previewUrl = imagePreviews[index] || URL.createObjectURL(image);
                  // 如果是新创建的URL，更新状态
                  if (!imagePreviews[index]) {
                    const updatedPreviews = [...imagePreviews];
                    updatedPreviews[index] = previewUrl;
                    setImagePreviews(updatedPreviews);
                  }
                  
                  return (
                    <Card key={index} className="relative overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="p-4">
                        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center mb-4">
                          <img 
                            src={previewUrl} 
                            alt={image.name} 
                            className="w-full h-full object-contain" 
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium truncate">{image.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(image.size)}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 压缩设置 */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">压缩设置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quality">压缩质量 ({quality[0]}%)</Label>
                  <Slider
                    id="quality"
                    value={quality}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={setQuality}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>更小文件</span>
                    <span>更高质量</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">输出格式</Label>
                  <select
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="auto">自动 (推荐)</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP (更小文件)</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 压缩按钮 */}
          {images.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={compressImages} disabled={isProcessing}>
                {isProcessing ? '压缩中...' : `压缩 ${images.length} 张图片`}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-6 space-y-6">
          {compressedImages.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">压缩结果 ({compressedImages.length})</h3>
                <Button variant="secondary" onClick={downloadAllImages}>
                  下载全部
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {compressedImages.map((image, index) => {
                  const compressionRate = calculateCompressionRate(image.originalSize, image.compressedSize);
                  // 确保压缩后的预览URL存在，如果不存在则重新创建
                  const previewUrl = compressedImagePreviews[index] || URL.createObjectURL(image.file);
                  // 如果是新创建的URL，更新状态
                  if (!compressedImagePreviews[index]) {
                    const updatedPreviews = [...compressedImagePreviews];
                    updatedPreviews[index] = previewUrl;
                    setCompressedImagePreviews(updatedPreviews);
                  }
                  
                  return (
                    <Card key={index} className="overflow-hidden">
                      <div className="p-4">
                        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center mb-4">
                          <img 
                            src={previewUrl} 
                            alt={image.file.name} 
                            className="w-full h-full object-contain" 
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium truncate">{image.file.name}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadImage(image)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">原始大小:</span>
                              <span>{formatFileSize(image.originalSize)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">压缩后:</span>
                              <span className="font-medium">{formatFileSize(image.compressedSize)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">压缩率:</span>
                              <span className={compressionRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {compressionRate >= 0 ? `-${compressionRate}%` : `+${Math.abs(compressionRate)}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => {
                // 只切换到上传标签页，保留压缩结果
                setActiveTab('upload');
              }}>
                  返回上传
                </Button>
                <Button onClick={downloadAllImages}>
                  下载全部
                </Button>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-lg font-medium mb-2">暂无压缩结果</h3>
              <p className="text-sm text-muted-foreground mb-4">
                请先上传图片并进行压缩
              </p>
              <Button onClick={() => setActiveTab('upload')}>
                上传图片
              </Button>
            </Card>
          )}
          
          {/* 添加清空结果按钮 */}
          {compressedImages.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button variant="destructive" size="sm" onClick={() => {
                // 清理压缩图片的预览URL
                compressedImagePreviews.forEach(url => URL.revokeObjectURL(url));
                setCompressedImages([]);
                setCompressedImagePreviews([]);
              }}>
                清空结果
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">使用说明</h2>
        <Card className="p-6">
          <ol className="space-y-4">
            <li className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">上传图片</p>
                <p className="text-sm text-muted-foreground">支持拖放或点击上传，可批量处理多张图片</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">调整设置</p>
                <p className="text-sm text-muted-foreground">设置压缩质量和输出格式，质量越高文件越大</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">开始压缩</p>
                <p className="text-sm text-muted-foreground">点击压缩按钮，等待处理完成</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <p className="font-medium">下载结果</p>
                <p className="text-sm text-muted-foreground">查看压缩结果，可单独或批量下载图片</p>
              </div>
            </li>
          </ol>
        </Card>
      </div>
      
      {/* 开发中提示（保持一致性，虽然当前页面功能已全部实现） */}
      <DevelopmentInProgress 
        visible={alertVisible}
        onClose={closeAlert}
        duration={alertDuration}
        message={alertMessage}
      />
    </div>
  );
}