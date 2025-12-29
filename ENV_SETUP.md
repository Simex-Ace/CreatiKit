# 环境变量配置指南

## 📝 创建 .env.local 文件

在项目根目录（`s:\工作区\自己网站\CreatiKit`）创建 `.env.local` 文件，内容如下：

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfsaonqqgobjorbdwopk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r34-blb1nxyrvcV5Y7M0uA_jPDpTno7
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

## ⚠️ 重要提示

你提供的 key 格式是 `sb_publishable_` 开头，这可能是 Supabase 的新格式。但如果登录功能不工作，可能需要使用 **anon public** key（格式通常是 `eyJ` 开头的 JWT token）。

## 🔍 如何找到正确的 anon public key

1. 访问 [https://app.supabase.com](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧 **Settings** > **API**
4. 找到 **anon public** 部分
5. 复制那个 key（通常很长，以 `eyJ` 开头）

## ✅ 配置完成后

1. 保存 `.env.local` 文件
2. 重启开发服务器：`npm run dev`
3. 测试登录功能

## 🆘 如果遇到问题

如果登录功能不工作，请检查：
1. `.env.local` 文件是否在项目根目录
2. 环境变量名称是否正确（注意大小写）
3. 是否重启了开发服务器
4. 浏览器控制台是否有错误信息

