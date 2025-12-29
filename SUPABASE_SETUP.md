# Supabase 登录功能设置指南

## 为什么选择 Supabase？

✅ **完全免费** - 免费额度非常慷慨（50,000 MAU）
✅ **无需后端** - 所有认证逻辑由 Supabase 处理
✅ **多种登录方式** - 支持邮箱、Google、GitHub 等
✅ **自动数据库** - 自动创建用户表，无需手动管理
✅ **安全可靠** - 企业级安全标准
✅ **中文支持** - 有中文文档和社区

## 快速开始（5分钟）

### 1. 注册 Supabase 账户

访问 [https://supabase.com](https://supabase.com) 并注册账户（支持 GitHub 登录）

### 2. 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: CreatiKit（或任意名称）
   - **Database Password**: 设置一个强密码（保存好，以后会用到）
   - **Region**: 选择离你最近的区域（如 `Southeast Asia (Singapore)`）
3. 点击 "Create new project"
4. 等待项目创建完成（约 2 分钟）

### 3. 获取 API 密钥

1. 项目创建完成后，点击左侧菜单的 **Settings**（设置）
2. 点击 **API**
3. 找到以下信息：
   - **Project URL** - 复制这个 URL
   - **anon public** key - 复制这个 key

### 4. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件（如果还没有）
2. 添加以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon public key
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

**示例：**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

### 5. 配置认证提供者（可选，但推荐）

#### 配置 Google 登录

1. 在 Supabase 项目中，点击 **Authentication** > **Providers**
2. 找到 **Google**，点击启用
3. 按照提示配置 Google OAuth：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建 OAuth 2.0 客户端 ID
   - 添加授权回调 URL：`https://你的项目ID.supabase.co/auth/v1/callback`
   - 复制 Client ID 和 Client Secret 到 Supabase

#### 配置 GitHub 登录

1. 在 Supabase 项目中，点击 **Authentication** > **Providers**
2. 找到 **GitHub**，点击启用
3. 按照提示配置 GitHub OAuth：
   - 访问 GitHub Settings > Developer settings > OAuth Apps
   - 创建新的 OAuth App
   - 添加授权回调 URL：`https://你的项目ID.supabase.co/auth/v1/callback`
   - 复制 Client ID 和 Client Secret 到 Supabase

### 6. 配置重定向 URL

1. 在 Supabase 项目中，点击 **Authentication** > **URL Configuration**
2. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/auth/callback`（开发环境）
   - `https://creatikit.asia/auth/callback`（生产环境）

### 7. 重启开发服务器

```bash
npm run dev
```

## 功能说明

### 已实现的功能

✅ **邮箱注册/登录** - 用户可以使用邮箱和密码注册/登录
✅ **第三方登录** - 支持 Google 和 GitHub 登录
✅ **用户状态管理** - 自动检测登录状态
✅ **用户菜单** - 显示用户信息和退出登录
✅ **安全会话** - 使用安全的 cookie 管理会话

### 使用方式

1. **用户注册**：
   - 点击"注册"按钮
   - 输入邮箱和密码
   - 系统会发送验证邮件（如果启用了邮箱验证）

2. **用户登录**：
   - 点击"登录"按钮
   - 输入邮箱和密码
   - 或使用 Google/GitHub 快速登录

3. **退出登录**：
   - 点击右上角用户头像
   - 选择"退出登录"

## 免费额度说明

Supabase 免费版包含：
- **50,000 月活跃用户（MAU）**
- **500 MB 数据库存储**
- **1 GB 文件存储**
- **2 GB 带宽**

对于个人项目和小型网站，这个免费额度完全够用！

## 常见问题

### Q: 需要信用卡吗？
A: 不需要！免费版完全免费，无需绑定信用卡。

### Q: 数据安全吗？
A: 非常安全。Supabase 使用企业级安全标准，数据加密存储。

### Q: 可以自定义用户表吗？
A: 可以！Supabase 会自动创建 `auth.users` 表，你还可以创建自己的表来存储额外信息。

### Q: 如何查看用户数据？
A: 在 Supabase 控制台的 **Authentication** > **Users** 中查看。

## 下一步

现在你可以：
1. 使用用户信息保存用户偏好设置
2. 保存用户的使用历史
3. 实现用户收藏功能
4. 添加用户个人中心页面

## 需要帮助？

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase 中文社区](https://github.com/supabase/supabase/discussions)

