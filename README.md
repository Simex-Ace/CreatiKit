# CreatiKit.io

一个现代化的在线工具箱平台，提供图片智能压缩、3D模型预览等创意工具。基于Next.js 14、TypeScript、Tailwind CSS和Shadcn/ui构建。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Shadcn/ui
- **状态管理**: React Context API
- **3D 预览**: Three.js
- **图片处理**: Sharp.js (服务端) / Canvas API (客户端)

## 项目设置

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 项目结构

```
├── public/                  # 静态资源文件
├── src/
│   ├── app/                 # Next.js App Router页面
│   │   ├── page.tsx         # 首页
│   │   ├── compress/        # 图片压缩工具页面
│   │   ├── model-viewer/    # 3D模型预览器页面
│   │   └── api/             # API路由
│   ├── components/          # 公共组件
│   │   ├── ui/              # Shadcn/ui组件
│   │   └── kit/             # 工具箱专用组件
│   ├── hooks/               # React hooks
│   ├── lib/                 # 工具函数库
│   ├── context/             # React Context
│   └── types/               # TypeScript类型定义
├── next.config.js           # Next.js配置
├── tailwind.config.js       # Tailwind CSS配置
└── tsconfig.json            # TypeScript配置
```

## 核心功能

### V1.0

1. **项目主页**: 展示平台介绍、功能入口和使用指南
2. **图片智能压缩工具**: 支持批量上传、智能压缩和格式转换
3. **3D模型预览器**: 支持多种3D文件格式的在线预览和基本操作

### V2.0 (规划中)

1. **用户系统**: 注册登录、个人中心和历史记录
2. **API接口**: 提供RESTful API供第三方集成
3. **高级功能**: 批量处理、云存储和跨设备同步
4. **商业化**: 会员订阅、高级功能解锁

## 开发规范

- 遵循Next.js App Router最佳实践
- 使用TypeScript进行类型安全开发
- 组件优先设计，保持UI一致性
- 采用Tailwind CSS实现响应式设计
- 代码风格遵循ESLint和Prettier规范

## 许可证

MIT