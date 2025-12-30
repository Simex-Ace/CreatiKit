# 密码重置链接无效问题排查指南

## 🔍 问题现象

点击邮箱中的密码重置链接后，显示"链接无效"或"链接已过期"。

## ✅ 已修复的问题

1. ✅ 防止重复显示错误提示
2. ✅ 改进错误处理逻辑
3. ✅ 支持直接从 URL 参数中处理 code

## 🔧 排查步骤

### 1. 检查 Supabase 配置

#### 检查重定向 URL 配置

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **URL Configuration**
4. 确认 **Redirect URLs** 中包含：
   - `https://creatikit.asia/auth/callback`（生产环境）
   - `http://localhost:3000/auth/callback`（开发环境，如果需要）

#### 检查 Site URL 配置

1. 在同一个页面，检查 **Site URL**
2. 应该设置为：`https://creatikit.asia`（生产环境）
   - ⚠️ **重要**：只能有一个 URL，不要用逗号分隔多个

### 2. 检查邮箱链接格式

正常的密码重置链接格式应该是：
```
https://你的项目ID.supabase.co/auth/v1/verify?token=xxx&type=recovery&redirect_to=https://creatikit.asia/auth/callback
```

或者：
```
https://creatikit.asia/auth/callback?code=xxx&type=recovery
```

### 3. 检查链接是否过期

- 密码重置链接通常有效期为 **1 小时**
- 如果链接已过期，需要重新申请

### 4. 检查环境变量

确认 `.env.local` 文件中的配置正确：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

### 5. 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 点击邮箱中的重置链接
4. 查看是否有错误信息

应该能看到类似这样的日志：
- `[Auth Callback]` - 回调路由的日志
- `[Reset Password]` - 重置密码页面的日志

### 6. 测试流程

#### 正确的流程应该是：

1. **用户点击"忘记密码"**
   - 输入邮箱
   - 系统发送重置邮件

2. **用户点击邮件中的链接**
   - 链接应该跳转到：`https://creatikit.asia/auth/callback?code=xxx&type=recovery`
   - 或者：`https://你的项目ID.supabase.co/auth/v1/verify?...&redirect_to=https://creatikit.asia/auth/callback`

3. **回调路由处理**
   - `/auth/callback` 接收 code
   - 使用 `exchangeCodeForSession` 交换会话
   - 重定向到 `/auth/reset-password`

4. **重置密码页面**
   - 检查会话是否有效
   - 如果有效，显示密码输入表单
   - 如果无效，显示错误提示

## 🐛 常见问题

### 问题 1：链接直接跳转到错误页面

**原因**：链接可能没有经过 `/auth/callback` 处理

**解决**：
- 检查 Supabase 的 `redirectTo` 配置
- 确认 `resetPassword` 函数中的 `redirectTo` 参数正确

### 问题 2：显示 403 错误

**原因**：
- 链接已过期
- Supabase URL 配置不匹配（本地开发 vs 生产环境）

**解决**：
- 重新申请密码重置
- 检查 Supabase 的 Site URL 和 Redirect URLs 配置

### 问题 3：链接在手机上无效，但在电脑上有效

**原因**：
- 手机和电脑访问的 URL 不同
- Supabase 配置的 URL 不包含移动端访问的域名

**解决**：
- 确保 Supabase 的 Site URL 和 Redirect URLs 包含所有可能的访问域名
- 如果使用本地开发，确保手机和电脑在同一网络

## 📝 调试代码

如果问题持续存在，可以在浏览器控制台运行以下代码来检查会话：

```javascript
// 检查当前会话
const { createClient } = await import('/src/lib/supabase/client.ts');
const supabase = createClient();
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('Error:', error);
```

## 🆘 如果还是不行

1. **检查 Supabase 日志**：
   - 进入 Supabase Dashboard > **Logs** > **Auth Logs**
   - 查看是否有相关错误信息

2. **检查网络请求**：
   - 打开浏览器开发者工具 > **Network** 标签
   - 点击重置链接
   - 查看对 `/auth/callback` 的请求和响应

3. **提供以下信息以便进一步排查**：
   - 邮箱链接的完整 URL（可以隐藏敏感部分）
   - 浏览器控制台的错误信息
   - Supabase Auth Logs 中的相关日志

