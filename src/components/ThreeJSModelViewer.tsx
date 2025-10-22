import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';

const ThreeJSModelViewer = () => {
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState('默认立方体');
  const [fileInput, setFileInput] = useState<string>('');
  const [isUnmounted, setIsUnmounted] = useState(false); // 跟踪组件卸载状态
  
  // 开发中提示状态
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();
  
  // 引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const currentModelRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const fileUrlsRef = useRef<string[]>([]); // 用于存储需要清理的文件URL
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 初始化ThreeJS场景
  const initScene = async () => {
    // 检查组件是否已卸载或DOM引用是否存在
    if (isUnmounted || !canvasRef.current || !containerRef.current) {
      console.warn('初始化场景失败: 组件已卸载或DOM元素不存在');
      return;
    }
    
    try {
      // 再次检查DOM元素是否存在（在异步导入后）
      if (!containerRef.current) {
        console.warn('初始化场景失败: container元素已不存在');
        return;
      }
      
      // 动态导入Three.js及相关模块
      const { 
        Scene, 
        PerspectiveCamera, 
        WebGLRenderer, 
        Color, 
        AmbientLight, 
        DirectionalLight, 
        Box3, 
        Vector3, 
        Group,
        BoxGeometry,
        MeshStandardMaterial,
        Mesh,
        GridHelper
      } = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      
      // 再次检查组件是否已卸载或DOM引用是否存在（在异步导入后）
      if (isUnmounted || !containerRef.current) {
        console.warn('初始化场景失败: 组件已卸载或DOM元素不存在');
        return;
      }
      
      // 场景设置
      const scene = new Scene();
      scene.background = new Color(0xf5f5f5);
      
      // 相机设置 - 添加额外的安全检查
      let width, height;
      try {
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
      } catch (e) {
        console.error('获取容器尺寸失败:', e);
        // 使用默认尺寸作为后备方案
        width = 800;
        height = 600;
      }
      
      const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      
      // 渲染器设置
      const renderer = new WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      // 光源设置
      const ambientLight = new AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // 网格辅助线
      const gridHelper = new GridHelper(10, 10);
      scene.add(gridHelper);
      
      // 控制器设置
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      
      // 实现双击重置视角功能
      const handleDoubleClick = () => {
        controls.reset();
      };
      renderer.domElement.addEventListener('dblclick', handleDoubleClick);
      
      // 创建立方体网格作为默认模型
      const geometry = new BoxGeometry(2, 2, 2);
      const material = new MeshStandardMaterial({ 
        color: 0x00ff00,
        wireframe: false
      });
      const cube = new Mesh(geometry, material);
      scene.add(cube);
      
      // 只有在组件未卸载时才保存引用
      if (!isUnmounted) {
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        controlsRef.current = controls;
      } else {
        // 如果组件已卸载，清理资源
        renderer.dispose();
        console.warn('组件已卸载，清理Three.js资源');
        return;
      }
      
      // 动画循环 - 添加安全检查
      const animate = () => {
        // 只有在组件未卸载且所有引用都存在时才继续动画
        if (isUnmounted || !controlsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
          return;
        }
        
        try {
          animationFrameRef.current = requestAnimationFrame(animate);
          controlsRef.current.update();
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        } catch (e) {
          console.error('动画循环错误:', e);
        }
      };
      
      // 只有在组件未卸载时才启动动画循环
      if (!isUnmounted) {
        animate();
      }
      
      // 响应窗口大小变化 - 增强安全性
      const handleResize = () => {
        // 检查组件是否已卸载
        if (isUnmounted) return;
        
        // 检查所有必需的引用是否存在
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) {
          return;
        }
        
        try {
          // 双重检查DOM元素存在性
          if (!document.body.contains(containerRef.current)) {
            console.warn('容器元素已不在DOM中，跳过尺寸调整');
            return;
          }
          
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        } catch (e) {
          console.error('调整大小失败:', e);
        }
      };
      
      // 添加窗口大小变化监听
      // 使用防抖函数减少频繁触发
      let resizeTimeout: NodeJS.Timeout;
      const debouncedHandleResize = () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(handleResize, 50);
      };
      
      window.addEventListener('resize', debouncedHandleResize);
      
      // 加载URL中的模型（如果有）
      const modelUrl = searchParams.get('model');
      if (modelUrl) {
        loadModel(modelUrl, GLTFLoader);
      }
      
      return () => {
        // 移除事件监听器
        window.removeEventListener('resize', debouncedHandleResize);
        
        // 清理超时定时器
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        // 移除双击事件监听
        renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
        
        // 取消动画帧
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // 释放渲染器资源
        try {
          renderer.dispose();
        } catch (e) {
          console.error('清理渲染器失败:', e);
        }
      };
      
    } catch (err) {
      console.error('初始化Three.js时出错:', err);
      setError('无法初始化3D查看器');
    }
  };
  
  // 加载模型函数 - 增强安全性
  const loadModel = (url: string, GLTFLoader: any) => {
    // 检查组件是否已卸载或必要的引用是否存在
    if (isUnmounted || !sceneRef.current || !cameraRef.current || !controlsRef.current) {
      console.warn('加载模型失败: 组件已卸载或必要引用不存在');
      return;
    }
    
    // 在函数作用域顶部声明loader
    let loader: any;
    
    try {
      loader = new GLTFLoader();
      
      // 清理现有模型
      if (currentModelRef.current) {
        sceneRef.current.remove(currentModelRef.current);
        currentModelRef.current = null;
      }
      
      // 创建新的模型组
      const { Group } = require('three');
      currentModelRef.current = new Group();
      sceneRef.current.add(currentModelRef.current);
    } catch (e) {
      console.error('初始化模型加载失败:', e);
      if (!isUnmounted) {
        setError('模型加载器初始化失败');
        setIsLoading(false);
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // 现在可以安全地使用loader变量
    loader.load(
      url,
      (gltf: any) => {
        // 将模型添加到组中
        currentModelRef.current!.add(gltf.scene);
        
        // 计算模型大小并居中
        const { Box3, Vector3 } = require('three');
        const box = new Box3().setFromObject(gltf.scene);
        const size = new Vector3();
        box.getSize(size);
        
        // 调整相机位置以适应模型
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // 添加一些缓冲
        
        cameraRef.current.position.z = cameraZ;
        
        // 重置控制器
        controlsRef.current.reset();
        
        setIsLoading(false);
        setModelName(url.split('/').pop() || 'Model');
      },
      undefined,
      (error: Error) => {
        console.error('加载模型时出错:', error);
        setError('无法加载模型，请尝试其他文件');
        setIsLoading(false);
      }
    );
  };
  
  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // 创建文件URL
      const fileUrl = URL.createObjectURL(file);
      
      // 动态导入GLTFLoader
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      
      // 加载模型
        loadModel(fileUrl, GLTFLoader);
        
        // 更新文件输入状态
        setFileInput(file.name);
        
        // 存储文件URL以便后续清理
        fileUrlsRef.current.push(fileUrl);
    } catch (err) {
      console.error('处理文件上传时出错:', err);
      setError('文件上传失败');
    }
  };
  
  // 处理拖拽上传
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    try {
      // 创建文件URL
      const fileUrl = URL.createObjectURL(file);
      
      // 动态导入GLTFLoader
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      
      // 加载模型
        loadModel(fileUrl, GLTFLoader);
        
        // 更新文件输入状态
        setFileInput(file.name);
        
        // 存储文件URL以便后续清理
        fileUrlsRef.current.push(fileUrl);
    } catch (err) {
      console.error('处理文件上传时出错:', err);
      setError('文件上传失败');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // 初始化场景 - 增强的useEffect与清理逻辑
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    const initialize = async () => {
      try {
        cleanupFn = await initScene();
      } catch (err) {
        console.error('初始化失败:', err);
        if (!isUnmounted) {
          setError('3D查看器初始化失败');
        }
      }
    };
    
    initialize();
    
    // 组件卸载时的清理函数
    return () => {
      // 标记组件为已卸载，防止异步操作继续执行
      setIsUnmounted(true);
      
      // 取消动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 执行initScene返回的清理函数
      if (cleanupFn) {
        try {
          cleanupFn();
        } catch (e) {
          console.error('执行清理函数失败:', e);
        }
      }
      
      // 清理Three.js资源
      if (rendererRef.current) {
        try {
          rendererRef.current.dispose();
        } catch (e) {
          console.error('清理渲染器失败:', e);
        }
      }
      
      // 清理文件URLs
      fileUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error('释放文件URL失败:', e);
        }
      });
      fileUrlsRef.current = [];
      
      // 重置所有引用
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      currentModelRef.current = null;
    };
  }, []);
  
  // 添加清除错误的函数
  const clearError = () => {
    setError(null);
  };
  
  // 下载模型处理函数
  const handleDownloadModel = () => {
    if (currentModelRef.current) {
      showAlert('模型下载功能将在后续版本中实现');
    } else {
      showAlert('请先上传或加载一个模型');
    }
  };
  
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">3D 模型查看器</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">支持格式: glTF, GLB, OBJ (推荐使用glTF/GLB)</p>
          
          <div 
            ref={containerRef} 
            className="w-full h-[600px] relative bg-gray-100 overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="bg-white p-4 rounded-lg">
                  <p>正在加载模型...</p>
                </div>
              </div>
            )}
            
            {/* 错误消息 */}
            {error && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10" onClick={clearError}>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-600">{error}</p>
                  <p className="text-xs text-gray-500 mt-1">点击任意位置关闭</p>
                </div>
              </div>
            )}
          </div>
          
          {/* 文件上传区域 */}
          <div className="mt-4 flex items-center gap-3">
            <input 
              type="file" 
              accept=".gltf,.glb,.obj" 
              onChange={handleFileUpload}
              className="flex-1 p-2 border rounded"
              id="model-upload"
            />
            <label htmlFor="model-upload">
              <Button variant="default" className="cursor-pointer">
                选择文件
              </Button>
            </label>
          </div>
          
          {/* 上传提示 */}
          <p className="text-xs text-gray-400 mt-2">
            或直接将文件拖放到3D视图区域
          </p>
          
          {/* 模型信息 */}
          {modelName && (
            <div className="mt-4 p-2 bg-gray-50 rounded">
              <p className="text-sm font-medium">当前模型: {modelName}</p>
            </div>
          )}
        </div>
        
        {/* 控制器说明 */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-bold mb-2">控制器说明:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 鼠标左键: 旋转视角</li>
            <li>• 鼠标右键: 平移视图</li>
            <li>• 鼠标滚轮: 缩放视图</li>
            <li>• 双击: 重置视角</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="default" onClick={() => router.back()}>
          返回
        </Button>
        <Button variant="default" onClick={handleDownloadModel}>
          下载模型
        </Button>
      </CardFooter>
      
      {/* 开发中提示 */}
      <DevelopmentInProgress 
        visible={alertVisible}
        onClose={closeAlert}
        duration={alertDuration}
        message={alertMessage}
      />
    </Card>
  );
};

export default ThreeJSModelViewer;