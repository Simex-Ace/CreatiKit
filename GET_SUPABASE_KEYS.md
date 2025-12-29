# 如何获取 Supabase 配置信息（详细图文指南）

## ⚠️ 重要说明

你提供的 `sbp_xxxxx` 格式的 token **不是**我们需要的。我们需要的是：

1. **Project URL** - 项目地址（格式：`https://xxxxx.supabase.co`）
2. **anon/public key** - 匿名公钥（格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）

## 📍 获取步骤（详细版）

### 第 1 步：登录 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击右上角 "Sign In" 登录
3. 如果还没有项目，点击 "New Project" 创建一个

### 第 2 步：进入项目设置

1. 登录后，你会看到项目列表
2. 点击你的项目（如果没有项目，先创建一个）
3. 进入项目后，点击左侧边栏的 **⚙️ Settings**（设置图标）

### 第 3 步：找到 API 设置

1. 在 Settings 页面，点击左侧的 **API** 选项
2. 你会看到以下信息：

```
┌─────────────────────────────────────┐
│  Project URL                        │
│  https://xxxxx.supabase.co          │ ← 复制这个
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  anon public                        │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6...    │ ← 复制这个
└─────────────────────────────────────┘
```

### 第 4 步：复制这两个值

**Project URL** 示例：
```
https://abcdefghijklmnop.supabase.co
```

**anon public key** 示例：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **注意**：不要复制 `service_role` key（那个是服务器端用的，不安全）

## 🔧 配置到项目中

### 方法 1：创建 .env.local 文件

1. 在项目根目录（`s:\工作区\自己网站\CreatiKit`）创建 `.env.local` 文件
2. 添加以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon public key
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

### 方法 2：如果已经有 .env.local

直接打开 `.env.local` 文件，添加或修改这三行。

## ✅ 验证配置

配置完成后，重启开发服务器：

```bash
npm run dev
```

然后访问网站，点击"登录"按钮，如果能看到登录弹窗，说明配置成功！

## 🆘 如果找不到这些信息

### 情况 1：还没有创建项目

1. 在 Supabase 首页点击 "New Project"
2. 填写项目名称（如：CreatiKit）
3. 设置数据库密码（记住这个密码）
4. 选择区域（建议选择离你最近的）
5. 点击 "Create new project"
6. 等待 2-3 分钟项目创建完成
7. 然后按照上面的步骤获取配置

### 情况 2：找不到 Settings/API

1. 确保你已经登录
2. 确保你已经选择了正确的项目
3. 左侧边栏应该有一个齿轮图标 ⚙️，点击它
4. 在设置页面左侧菜单找到 "API"

### 情况 3：不知道项目在哪里

1. 访问 [https://app.supabase.com](https://app.supabase.com)
2. 你会看到所有项目的列表
3. 点击你的项目进入

## 📸 参考位置

在 Supabase 控制台中，配置信息的位置：

```
左侧边栏
├── Table Editor
├── SQL Editor
├── Authentication
├── Storage
├── Edge Functions
└── ⚙️ Settings  ← 点击这里
    ├── General
    ├── API  ← 点击这里，就能看到 URL 和 Keys
    ├── Database
    └── ...
```

## 💡 提示

- **Project URL** 通常以 `https://` 开头，以 `.supabase.co` 结尾
- **anon public key** 通常以 `eyJ` 开头，是一串很长的字符串
- 这两个值都是**公开的**，可以安全地放在前端代码中
- 不要使用 `service_role` key（那个是私有的，只能在后端使用）

## 🎯 快速检查清单

- [ ] 已登录 Supabase
- [ ] 已创建项目
- [ ] 已进入 Settings > API
- [ ] 已复制 Project URL
- [ ] 已复制 anon public key
- [ ] 已创建 .env.local 文件
- [ ] 已添加配置到 .env.local
- [ ] 已重启开发服务器

完成这些步骤后，登录功能就可以使用了！

