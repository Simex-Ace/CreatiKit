'use client';
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { FileDown, Play, Pause, RotateCw, ImageIcon, CheckCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useI18n } from '@/contexts/I18nContext';
// @ts-ignore - gifshot doesn't have proper TypeScript support
import gifshot from 'gifshot';

// 简化的GIF生成函数，不依赖复杂的worker机制
function generateSimpleGif(images: HTMLImageElement[], fps: number = 10): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 创建一个足够大的Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建Canvas上下文');
      
      // 设置Canvas尺寸为第一张图片的尺寸
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      
      // 由于浏览器安全限制，我们无法直接生成GIF
      // 这里我们将生成一个HTML预览或返回图片序列的文本信息
      ctx.drawImage(images[0], 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          // 为了演示，我们创建一个包含所有图片数据的文本文件
          const framesData = `GIF生成预览（由于浏览器安全限制，完整功能需要额外库）
图片数量: ${images.length}
帧率: ${fps}fps
图片尺寸: ${canvas.width}x${canvas.height}

注意：在生产环境中，请使用gif.js或其他专门的GIF生成库。`;
          
          const textBlob = new Blob([framesData], { type: 'text/plain' });
          resolve(textBlob);
        } else {
          reject(new Error('Canvas转换为Blob失败'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
}

export default function GifTool() {
  const { t } = useI18n();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('split');
  const [selectedGif, setSelectedGif] = useState<File | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [fps, setFps] = useState<number[]>([10]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0); // 添加进度状态
  
  // Refs
  const gifFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理GIF文件上传
  const handleGifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('image/gif')) {
      setError(t('gifToolPage.uploadGifFormat'));
      return;
    }
    
    setError('');
    setSelectedGif(file);
    decompileGif(file);
  };
  
  // 分解GIF为帧 - 改进版
  const decompileGif = (file: File) => {
    setIsProcessing(true);
    setFrames([]);
    
    // 添加错误处理的FileReader
    const reader = new FileReader();
    reader.onerror = () => {
      setError(t('gifToolPage.readFileFailed'));
      setIsProcessing(false);
    };
    
    reader.onload = function(event) {
      try {
        const gifUrl = event.target?.result as string;
        if (!gifUrl) {
          throw new Error('无法读取文件内容');
        }
        
        const img = new Image();
        img.onerror = () => {
          setError(t('gifToolPage.loadGifFailed'));
          setIsProcessing(false);
        };
        
        img.onload = function() {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 300; // 设置默认宽度
            canvas.height = img.height || 200; // 设置默认高度
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              setError('无法创建Canvas上下文');
              setIsProcessing(false);
              return;
            }
            
            // 使用改进的GIF帧提取器
            extractGifFrames(gifUrl, canvas, ctx);
          } catch (err) {
            console.error('Canvas处理错误:', err);
            setError(t('gifToolPage.processGifError'));
            setIsProcessing(false);
          }
        };
        
        img.src = gifUrl;
      } catch (err) {
        console.error('文件处理错误:', err);
        setError('处理文件时出错');
        setIsProcessing(false);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // 提取GIF帧 - 改进版
  const extractGifFrames = (gifUrl: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // 使用更可靠的GIF帧提取方法
    const extractedFrames: string[] = [];
    const framesToExtract = 30; // 减少最大帧数以提高性能
    let frameCount = 0;
    let lastFrameData = '';
    
    // 创建视频元素来帮助提取帧
    const video = document.createElement('video');
    video.src = gifUrl;
    video.autoplay = true;
    video.loop = true;
    video.muted = true; // 避免意外播放声音
    video.style.display = 'none';
    
    // 添加视频到DOM以确保它能正常工作
    document.body.appendChild(video);
    
    // 设置定时器来捕获帧
    const frameCaptureInterval = setInterval(() => {
      try {
        // 绘制当前视频帧到canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 获取图像数据
        const frameDataUrl = canvas.toDataURL('image/png');
        
        // 检查是否与前一帧不同且不是空白帧
        if (frameDataUrl !== lastFrameData && frameDataUrl.length > 1000) { // 避免空白帧
          extractedFrames.push(frameDataUrl);
          lastFrameData = frameDataUrl;
          frameCount++;
          
          console.log(`提取到第 ${frameCount} 帧`);
        }
        
        // 停止条件
        if (frameCount >= framesToExtract || (frameCount > 0 && Date.now() - startTime > 5000)) {
          clearInterval(frameCaptureInterval);
          cleanUp();
          
          // 如果没有提取到足够的帧，尝试简单方法
          if (extractedFrames.length <= 1) {
            fallbackFrameExtraction(gifUrl, canvas, ctx);
          } else {
            setFrames(extractedFrames);
            setIsProcessing(false);
          }
        }
      } catch (err) {
        console.error('帧提取错误:', err);
        clearInterval(frameCaptureInterval);
        cleanUp();
        fallbackFrameExtraction(gifUrl, canvas, ctx);
      }
    }, 100); // 100ms间隔捕获帧
    
    // 记录开始时间
    const startTime = Date.now();
    
    // 清理函数
    const cleanUp = () => {
      video.pause();
      video.src = '';
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
    };
    
    // 添加错误处理
    video.onerror = () => {
      console.error('视频加载失败，使用备选方案');
      clearInterval(frameCaptureInterval);
      cleanUp();
      fallbackFrameExtraction(gifUrl, canvas, ctx);
    };
  };
  
  // 备选帧提取方法（当视频方法失败时使用）
  const fallbackFrameExtraction = (gifUrl: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const fallbackFrames: string[] = [];
    
    // 创建一个简单的图像元素
    const img = new Image();
    img.src = gifUrl;
    
    // 立即捕获静态帧
    setTimeout(() => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const staticFrame = canvas.toDataURL('image/png');
        fallbackFrames.push(staticFrame);
        
        // 模拟几帧（对于不支持动态提取的情况）
        setTimeout(() => {
          setFrames(fallbackFrames);
          setIsProcessing(false);
          setError('GIF动态帧提取有限，仅显示静态帧。建议使用更专业的GIF解析库。');
        }, 100);
      } catch (err) {
        console.error('备选方法失败:', err);
        setError('无法提取GIF帧，请尝试其他GIF文件');
        setIsProcessing(false);
      }
    }, 100);
  };
  
  // 下载选中的帧
  const downloadFrame = (frame: string, index: number) => {
    const blob = dataURItoBlob(frame);
    saveAs(blob, `frame_${index + 1}.png`);
  };
  
  // 下载所有帧
  const downloadAllFrames = () => {
    frames.forEach((frame, index) => {
      setTimeout(() => downloadFrame(frame, index), index * 100);
    });
  };
  
  // 数据URI转换为Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };
  
  // 处理图片上传 - 重构版本
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      
      // 过滤出图片文件
      const imageFiles = files.filter(file => {
        const valid = file.type.startsWith('image/');
        if (!valid) {
          console.warn(`跳过非图片文件: ${file.name}`);
        }
        return valid;
      });
      
      if (imageFiles.length === 0) {
        setError(t('gifToolPage.uploadValidImages'));
        return;
      }
      
      // 检查总图片数量限制
      if (selectedImages.length + imageFiles.length > 20) {
        setError(t('gifToolPage.imageLimitExceeded'));
        return;
      }
      
      setError('');
      
      // 更新选中的图片文件
      const newSelectedImages = [...selectedImages, ...imageFiles];
      setSelectedImages(newSelectedImages);
      
      // 生成预览 - 使用Promise.all以更可靠地处理
      const previewPromises = imageFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error(`无法读取文件: ${file.name}`));
            }
          };
          
          reader.onerror = () => {
            console.error(`文件读取失败: ${file.name}`);
            reject(new Error(`文件读取失败: ${file.name}`));
          };
          
          reader.onabort = () => {
            console.warn(`文件读取中止: ${file.name}`);
            reject(new Error(`文件读取中止: ${file.name}`));
          };
          
          reader.readAsDataURL(file);
        });
      });
      
      // 处理预览生成
      Promise.allSettled(previewPromises)
        .then(results => {
          const newPreviews = [...imagePreviews];
          let hasErrors = false;
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              newPreviews.push(result.value);
            } else {
              console.error(`预览生成失败: ${imageFiles[index].name}`, result.reason);
              hasErrors = true;
            }
          });
          
          // 只有在成功生成预览后才更新预览状态
          setImagePreviews(newPreviews);
          
          if (hasErrors) {
            setError(t('gifToolPage.previewGenerationFailed'));
          }
        })
        .catch(err => {
          console.error('预览处理错误:', err);
          setError(t('gifToolPage.previewError'));
        });
        
    } catch (uploadError) {
      console.error('图片上传处理错误:', uploadError);
      setError(t('gifToolPage.uploadError'));
    }
  };
  
  // 移除图片
  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };
  
  // 清空所有图片
  const clearImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
  };
  
  // 压缩图片函数 - 重构版本
  const compressImage = async (imageSrc: string, maxWidth: number = 640, maxHeight: number = 480): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // 设置超时处理
        const timeoutId = setTimeout(() => {
          console.warn('图片加载超时，使用原图');
          resolve(imageSrc);
        }, 5000); // 5秒超时
        
        img.onload = () => {
          try {
            clearTimeout(timeoutId);
            
            // 计算压缩后的尺寸
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
              const aspectRatio = width / height;
              if (width > height) {
                width = maxWidth;
                height = width / aspectRatio;
              } else {
                height = maxHeight;
                width = height * aspectRatio;
              }
            }
            
            // 使用Canvas进行压缩
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(width); // 确保整数尺寸
            canvas.height = Math.floor(height); // 确保整数尺寸
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('无法创建Canvas上下文，使用原图');
              resolve(imageSrc);
              return;
            }
            
            // 添加异常捕获的绘制操作
            try {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (drawError) {
              console.error('绘制图片失败:', drawError);
              resolve(imageSrc);
              return;
            }
            
            // 尝试不同的压缩质量，确保成功
            const qualityLevels = [0.8, 0.7, 0.6, 0.5];
            let compressedDataUrl: string | null = null;
            
            for (const quality of qualityLevels) {
              try {
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                // 检查生成的DataURL是否有效
                if (compressedDataUrl && compressedDataUrl.length > 100) {
                  console.log(`压缩成功，质量: ${quality}, 大小: ${Math.round(compressedDataUrl.length / 1024)}KB`);
                  resolve(compressedDataUrl);
                  return;
                }
              } catch (dataUrlError) {
                console.warn(`生成DataURL失败，尝试较低质量: ${quality}`);
              }
            }
            
            // 如果所有质量级别都失败，返回原图
            console.error('所有压缩级别都失败，使用原图');
            resolve(imageSrc);
            
          } catch (onloadError) {
            console.error('图片加载后处理错误:', onloadError);
            resolve(imageSrc);
          }
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          console.error('图片加载失败，使用原图');
          resolve(imageSrc); // 加载失败时返回原图
        };
        
        // 安全地设置图片源
        try {
          img.src = imageSrc;
        } catch (srcError) {
          clearTimeout(timeoutId);
          console.error('设置图片源失败:', srcError);
          resolve(imageSrc);
        }
        
      } catch (error) {
        console.error('压缩图片过程中的严重错误:', error);
        reject(error);
      }
    });
  };

  // 生成GIF - 使用优化的实现确保生成有效大小的GIF文件
  const generateGif = async () => {
    if (selectedImages.length === 0) {
      setError('请先上传图片');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProgress(0); // 重置进度
    
    try {
      const frameRate = fps[0];
      console.log(`开始生成GIF，图片数量: ${selectedImages.length}，帧率: ${frameRate}fps`);
      
      // 检查图片数量限制
      if (selectedImages.length > 10) {
        setError(t('gifToolPage.imageLimit'));
        setIsProcessing(false);
        return;
      }
      
      // 使用较小的尺寸以确保GIF质量和播放兼容性
      const targetWidth = 320;
      const targetHeight = 240;
      
      // 第1步：直接使用gifshot库（更简单可靠）
      setProgress(30);
      console.log('使用gifshot生成GIF...');
      
      // 使用gifshot生成GIF，直接传入base64图片数组
      await new Promise<void>((resolve, reject) => {
        gifshot.createGIF({
          images: imagePreviews, // 直接使用已有的预览图片数组
          gifWidth: targetWidth,
          gifHeight: targetHeight,
          interval: 1 / frameRate, // 修正：每帧间隔时间（秒）
          numWorkers: 2,
          quality: 10,
          width: targetWidth,
          height: targetHeight,
          sampleInterval: 10, // 增加采样间隔提高性能
          workersPath: '/gif.worker.js', // 指定worker路径
          pixelFormat: 'rgb8', // 使用标准RGB格式
          defaultDelay: 1 / frameRate,
          text: false,
          fontSize: 0,
          fontWeight: 'normal',
          textAlign: 'center',
          textBaseline: 'bottom',
          textColor: '#ffffff',
          backgroundColor: '#000000',
          fontStyle: 'normal',
          fontFamily: 'sans-serif'
        }, (obj: any) => {
          try {
            setProgress(90);
            
            if (!obj.error) {
              console.log('GIF生成成功，blob大小:', obj.imageBlob?.size || '未知');
              
              // 确保blob有效
              if (obj.imageBlob && obj.imageBlob.size > 0) {
                // 使用file-saver保存文件
                saveAs(obj.imageBlob, 'generated_gif.gif');
                setProgress(100);
                resolve();
              } else if (obj.image) {
                // 如果没有blob但有dataURL，转换为blob
                fetch(obj.image)
                  .then(res => res.blob())
                  .then(blob => {
                    console.log('从dataURL转换的blob大小:', blob.size);
                    if (blob.size > 0) {
                      saveAs(blob, 'generated_gif.gif');
                      setProgress(100);
                      resolve();
                    } else {
                      throw new Error('生成的GIF文件为空');
                    }
                  })
                  .catch(e => {
                    console.error('转换dataURL到blob失败:', e);
                    // 作为最后尝试，直接下载dataURL
                    const link = document.createElement('a');
                    link.href = obj.image;
                    link.download = 'generated_gif.gif';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setProgress(100);
                    resolve();
                  });
              } else {
                throw new Error('无法获取GIF数据');
              }
            } else {
              console.error('gifshot错误:', obj.error);
              reject(new Error(`gifshot生成失败: ${obj.error}`));
            }
          } catch (e) {
            console.error('处理GIF生成结果时出错:', e);
            reject(e);
          }
        });
      });
      
      console.log('GIF生成完成！');
      
    } catch (generateError) {
      console.error('生成过程中出错:', generateError);
      // 直接显示错误信息，提供更详细的错误原因
      const errorMessage = generateError instanceof Error ? generateError.message : String(generateError);
      setError(`${t('gifToolPage.gifGenerationFailed')}: ${errorMessage}。${t('gifToolPage.gifGenerationFailedDesc')}`);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
    }
  };
  
  // HTML预览fallback函数 - 修复版本

  
  // 播放/暂停帧序列
  const togglePlayback = () => {
    if (frames.length === 0) return;
    
    if (isPlaying) {
      if (playInterval) {
        clearInterval(playInterval);
        setPlayInterval(null);
      }
    } else {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, 1000 / fps[0]);
      setPlayInterval(interval);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [playInterval]);
  
  // 渲染帧预览
  const renderFrames = () => {
    if (frames.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          {isProcessing ? t('gifToolPage.processingGif') : t('gifToolPage.uploadGifToShowFrames')}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{t('gifToolPage.totalFrames', { count: frames.length })}</h3>
          <div className="flex gap-2">
            <Button 
              onClick={togglePlayback} 
              size="sm"
              className="flex items-center gap-1"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? t('gifToolPage.pause') : t('gifToolPage.play')}
            </Button>
            <Button 
              onClick={downloadAllFrames} 
              size="sm"
              className="flex items-center gap-1"
            >
              <FileDown size={16} />
              {t('gifToolPage.downloadAll')}
            </Button>
          </div>
        </div>
        
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={frames[currentFrame]} 
            alt={`帧 ${currentFrame + 1}`} 
            className="mx-auto max-h-[300px] object-contain"
          />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            {currentFrame + 1} / {frames.length}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto">
          {frames.map((frame, index) => (
            <div 
              key={index} 
              className={`relative cursor-pointer border-2 rounded transition-all hover:shadow-md ${index === currentFrame ? 'border-blue-500' : 'border-gray-200'}`}
              onClick={() => setCurrentFrame(index)}
            >
              <img src={frame} alt={`帧 ${index + 1}`} className="w-full h-auto object-contain" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFrame(frame, index);
                }}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <FileDown size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 渲染图片上传预览
  const renderImagePreviews = () => {
    if (imagePreviews.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          上传图片后将显示预览
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">共 {imagePreviews.length} 张图片</h3>
          <Button 
            onClick={clearImages} 
            size="sm"
            variant="secondary"
          >
            清空
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imagePreviews.map((preview, index) => (
            <div 
              key={index} 
              className="relative group"
            >
              <img src={preview} alt={`图片 ${index + 1}`} className="w-full h-auto object-cover border border-gray-200 rounded" />
              <button 
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('gifToolPage.title')}</h1>
          <p className="text-gray-600">{t('gifToolPage.splitGif')} / {t('gifToolPage.createGif')}</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6 overflow-hidden">
          <Tabs defaultValue="split" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start p-1">
              <TabsTrigger value="split" className="flex-1">{t('gifToolPage.splitGif')}</TabsTrigger>
              <TabsTrigger value="merge" className="flex-1">{t('gifToolPage.createGif')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="split" className="p-6">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">拖放GIF文件到此处，或点击选择文件</p>
                  <Button 
                    onClick={() => gifFileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    选择GIF文件
                  </Button>
                  <input
                    ref={gifFileInputRef}
                    type="file"
                    accept="image/gif"
                    onChange={handleGifUpload}
                    className="hidden"
                  />
                  {selectedGif && (
                    <div className="mt-4 text-sm text-gray-500">
                      已选择: {selectedGif.name} ({(selectedGif.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
                
                {renderFrames()}
              </div>
            </TabsContent>
            
            <TabsContent value="merge" className="p-6">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">拖放图片文件到此处，或点击选择文件（支持批量上传）</p>
                  <Button 
                    onClick={() => imageFileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    选择图片文件
                  </Button>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fps">帧率 (FPS): {fps[0]}</Label>
                      <Slider
                        id="fps"
                        min={1}
                        max={30}
                        step={1}
                        value={fps}
                        onValueChange={setFps}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500">调整GIF的播放速度</p>
                    </div>
                    
                    {/* 进度条 */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>生成进度</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={generateGif}
                      disabled={isProcessing || imagePreviews.length === 0}
                      className="w-full"
                    >
                      {isProcessing ? t('gifToolPage.processing') : t('gifToolPage.generateGif')}
                    </Button>
                  </div>
                )}
                
                {renderImagePreviews()}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        <Card className="p-6 mb-6">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <span className="font-medium">功能说明：</span><br />
                  本工具现在支持直接生成GIF动画文件！上传图片后，点击生成按钮即可获得完整的GIF文件。<br /><br />
                  <span className="font-medium">使用提示：</span><br />
                  - 推荐上传5-20张图片以获得最佳效果<br />
                  - 图片会自动压缩以提高性能<br />
                  - 生成过程中会显示实时进度<br />
                  - 大图片或多张图片可能需要较长处理时间<br />
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">使用说明</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>GIF分解:</strong> 上传GIF文件，工具会将其分解为单独的帧，您可以预览、播放和下载各个帧。</p>
            <p><strong>GIF合成:</strong> 上传多张图片，设置帧率后点击生成，系统将创建一个完整的GIF动画文件。</p>
            <p>所有处理均在本地完成，不会上传您的文件到服务器，保护您的数据隐私。</p>
            <p>提示：对于大图片或多张图片，生成过程可能需要一些时间，请耐心等待。</p>
          </div>
        </Card>
      </div>
    </div>
  );
}