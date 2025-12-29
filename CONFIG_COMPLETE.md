# ✅ 配置完成指南

## 你的 Supabase 配置信息

根据你提供的截图，配置信息如下：

- **Project URL**: `https://kfsaonqqgobjorbdwopk.supabase.co`
- **Publishable API Key**: `sb_publishable_r34-blb1nxyrvcV5Y7M0uA_jPDpTno7`

这些都是正确的！✅

## 📝 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件，内容如下：

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfsaonqqgobjorbdwopk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r34-blb1nxyrvcV5Y7M0uA_jPDpTno7
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

## ⚠️ 重要：配置认证回调 URL

在 Supabase 控制台还需要配置重定向 URL：

1. 在 Supabase 控制台，点击左侧 **Authentication**（认证）
2. 点击 **URL Configuration**（URL 配置）
3. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/auth/callback`（开发环境）
   - `https://creatikit.asia/auth/callback`（生产环境）
4. 点击 **Save**（保存）

## ✅ 完成后的步骤

1. 创建 `.env.local` 文件（如上所示）
2. 配置重定向 URL（如上所示）
3. 重启开发服务器：`npm run dev`
4. 测试登录功能

## 🎉 现在可以测试了！

访问你的网站，点击"登录"按钮，应该能看到登录弹窗了！

