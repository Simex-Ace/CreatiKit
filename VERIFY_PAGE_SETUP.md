# 邮箱验证页面配置说明

## ✅ 已完成

我已经创建了 `/verify` 页面来处理邮箱验证链接。

## 📝 需要在 Supabase 中配置

### 1. 添加重定向 URL

在 Supabase 控制台中：

1. 进入你的项目
2. 点击左侧 **Authentication**（认证）
3. 点击 **URL Configuration**（URL 配置）
4. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/verify`（开发环境）
   - `https://creatikit.asia/verify`（生产环境）
5. 点击 **Save**（保存）

### 2. 确认 Site URL 配置

确保 **Site URL**（网站网址）配置正确：
- 开发环境：`http://localhost:3000`
- 生产环境：`https://creatikit.asia`

⚠️ **重要**：Site URL 只能包含一个 URL，不要用逗号分隔多个 URL。

## 🔄 工作流程

1. **用户注册** → 系统发送验证邮件
2. **用户点击邮件中的链接** → 跳转到 `/verify?code=xxx&type=signup`
3. **`/verify` 页面处理验证** → 使用 code 交换会话
4. **验证成功** → 显示成功消息，3 秒后跳转到首页

## 🎯 功能特点

- ✅ 自动处理验证链接
- ✅ 显示验证状态（加载中/成功/失败/过期）
- ✅ 友好的错误提示
- ✅ 自动跳转到首页

## 🐛 如果还是提示无效

1. **检查 Supabase 配置**：
   - 确认 `/verify` 已添加到 Redirect URLs
   - 确认 Site URL 配置正确

2. **检查邮箱链接**：
   - 验证链接应该包含 `code` 参数
   - 格式：`https://creatikit.asia/verify?code=xxx&type=signup`

3. **检查环境变量**：
   - 确认 `.env.local` 中的 `NEXT_PUBLIC_SITE_URL` 设置正确

4. **清除浏览器缓存**：
   - 有时需要清除缓存才能看到更新

