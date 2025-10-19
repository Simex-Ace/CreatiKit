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
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 初始化ThreeJS场景
  const initScene = async () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    try {
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
      
      // 场景设置
      const scene = new Scene();
      scene.background = new Color(0xf5f5f5);
      
      // 相机设置
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
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
      
      // 保存引用
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      controlsRef.current = controls;
      
      // 动画循环
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      
      // 响应窗口大小变化
      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;
        
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // 加载URL中的模型（如果有）
      const modelUrl = searchParams.get('model');
      if (modelUrl) {
        loadModel(modelUrl, GLTFLoader);
      }
      
      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        renderer.dispose();
      };
      
    } catch (err) {
      console.error('初始化Three.js时出错:', err);
      setError('无法初始化3D查看器');
    }
  };
  
  // 加载模型函数
  const loadModel = (url: string, GLTFLoader: any) => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    
    const loader = new GLTFLoader();
    
    // 清理现有模型
    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
    }
    
    // 创建新的模型组
    const { Group } = require('three');
    currentModelRef.current = new Group();
    sceneRef.current.add(currentModelRef.current);
    
    setIsLoading(true);
    setError(null);
    
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
      
      // 组件卸载时释放URL
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
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
      
      // 组件卸载时释放URL
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    } catch (err) {
      console.error('处理文件上传时出错:', err);
      setError('文件上传失败');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // 初始化场景
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    const initialize = async () => {
      try {
        cleanupFn = await initScene();
      } catch (err) {
        console.error('初始化失败:', err);
        setError('3D查看器初始化失败');
      }
    };
    
    initialize();
    
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
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