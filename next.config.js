/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 压缩优化
  compress: true,
  
  // 图片优化
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // 图片优化配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 禁用图片优化（如果使用外部图片服务）
    unoptimized: false,
  },
  
  // 实验性功能优化
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-icons',
    ],
  },
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 3D模型文件加载器
    config.module.rules.push({
      test: /\.(glb|gltf|obj|fbx)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/files',
            outputPath: 'static/files',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });
    
    // Bundle 分析（仅在需要时启用）
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    // 优化：代码分割大型库
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 大型库单独打包
            three: {
              name: 'three',
              test: /[\\/]node_modules[\\/]three[\\/]/,
              priority: 20,
            },
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 20,
            },
            matter: {
              name: 'matter-js',
              test: /[\\/]node_modules[\\/]matter-js[\\/]/,
              priority: 20,
            },
            emoji: {
              name: 'emoji-mart',
              test: /[\\/]node_modules[\\/]@emoji-mart[\\/]/,
              priority: 20,
            },
            // Radix UI 组件库
            radix: {
              name: 'radix-ui',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 15,
            },
            // 其他 vendor
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // 输出模式
  output: 'standalone',
  
  // 生产环境优化
  productionBrowserSourceMaps: false,
  
  // 头部优化
  poweredByHeader: false,
};

module.exports = nextConfig;