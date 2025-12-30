# 密码重置"链接已过期"问题完整排查指南

## 🔍 问题现象

即使秒点开链接，仍然提示"链接已过期"。

## ✅ 已添加的改进

1. **详细的调试日志**：代码已添加完整的日志输出
2. **修复 Site URL 处理**：自动移除末尾斜杠
3. **改进错误处理**：更准确的错误判断

## 📋 完整排查步骤

### 步骤 1：检查 Supabase Site URL 配置

**问题**：从你的截图看到 Site URL 是 `https://creatikit.asia/`（末尾有斜杠）

**修复**：
1. 进入 Supabase Dashboard → **Authentication** → **URL Configuration**
2. 将 **Site URL** 改为：`https://creatikit.asia`（**移除末尾斜杠**）
3. 点击 **Save changes**

### 步骤 2：检查 Redirect URLs

确保以下 URL 都已添加（**不要有末尾斜杠**）：
- ✅ `https://creatikit.asia/auth/callback`
- ✅ `https://creatikit.asia/auth/reset-password`

### 步骤 3：检查 OTP 过期时间设置

从截图看到有警告："OTP expiry exceeds recommended threshold"

**检查步骤**：
1. 进入 **Authentication** → **Email** → **Email Templates**
2. 找到 **Reset Password** 模板
3. 检查 OTP 过期时间设置
4. 建议设置为 **3600 秒（1小时）** 或更短

### 步骤 4：测试并查看日志

1. **打开浏览器开发者工具**（F12）
2. **切换到 Console 标签**
3. **申请密码重置**
4. **点击邮件中的链接**
5. **查看控制台输出**，应该看到：

```
[Reset Password] Sending reset email with redirectTo: https://creatikit.asia/auth/callback
[Auth Callback] Full URL: https://creatikit.asia/auth/callback?code=xxx&type=recovery
[Auth Callback] Params: { code: 'xxx...', type: 'recovery', ... }
[Reset Password] Page loaded, checking session...
```

### 步骤 5：检查邮件中的链接格式

**正确的链接格式应该是**：
```
https://creatikit.asia/auth/callback?code=xxx&type=recovery
```

**错误的格式**：
- `https://creatikit.asia/auth/reset-password?token=xxx`（旧格式，可能不工作）
- `https://creatikit.asia/auth/callback`（缺少参数）

### 步骤 6：检查环境变量

确认 `.env.local` 文件中的配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfsaonqqgobjorbdwopk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

**注意**：
- `NEXT_PUBLIC_SITE_URL` 不要有末尾斜杠
- 确保使用的是 **anon public key**（不是 publishable key）

### 步骤 7：检查 Supabase Auth Logs

1. 进入 Supabase Dashboard → **Authentication** → **Auth Logs**
2. 查看最近的密码重置请求
3. 检查是否有错误信息

### 步骤 8：清除缓存并重新测试

1. **清除浏览器缓存**
2. **使用无痕模式**测试
3. **重新申请密码重置**
4. **立即点击链接**（不要等待）

## 🐛 常见问题及解决方案

### 问题 1：Site URL 末尾有斜杠

**症状**：链接生成不正确

**解决**：移除末尾斜杠，改为 `https://creatikit.asia`

### 问题 2：OTP 过期时间设置过长

**症状**：即使刚发送的链接也提示过期

**解决**：将 OTP 过期时间设置为 3600 秒（1小时）

### 问题 3：Redirect URL 配置错误

**症状**：链接跳转到错误页面

**解决**：确保 Redirect URLs 包含：
- `https://creatikit.asia/auth/callback`
- `https://creatikit.asia/auth/reset-password`

### 问题 4：使用了错误的 API Key

**症状**：各种认证错误

**解决**：确保使用 **anon public key**（格式：`eyJ...`），不是 publishable key

### 问题 5：代码交换失败

**症状**：控制台显示 `exchangeCodeForSession` 错误

**可能原因**：
- Code 已被使用（只能使用一次）
- Code 已过期
- Supabase 配置不匹配

**解决**：
- 检查 Supabase 的 Site URL 和 Redirect URLs
- 确保代码只使用一次
- 检查 OTP 过期时间

## 📊 调试信息解读

### 正常流程的日志应该是：

```
[Reset Password] Sending reset email with redirectTo: https://creatikit.asia/auth/callback
[Auth Callback] Full URL: https://creatikit.asia/auth/callback?code=xxx&type=recovery
[Auth Callback] Attempting to exchange code for session...
[Auth Callback] Session created successfully
[Reset Password] Found code in URL, attempting to exchange...
[Reset Password] Session created from code successfully
```

### 如果看到错误：

1. **`Error exchanging code: expired`**
   - 说明 code 已过期
   - 检查 OTP 过期时间设置
   - 确保立即点击链接

2. **`Error exchanging code: invalid`**
   - 说明 code 无效
   - 检查 Supabase 配置
   - 检查环境变量

3. **`No session after code exchange`**
   - 说明交换成功但没有会话
   - 可能是 Supabase 配置问题
   - 检查 Auth Logs

## 🎯 快速验证清单

- [ ] Site URL 设置为 `https://creatikit.asia`（无末尾斜杠）
- [ ] Redirect URLs 包含 `/auth/callback` 和 `/auth/reset-password`
- [ ] OTP 过期时间设置为 3600 秒或更短
- [ ] 环境变量 `NEXT_PUBLIC_SITE_URL` 无末尾斜杠
- [ ] 使用的是 anon public key（不是 publishable key）
- [ ] 浏览器控制台有详细的日志输出
- [ ] 邮件链接格式正确（包含 `code` 和 `type` 参数）

## 🆘 如果还是不行

请提供以下信息：

1. **浏览器控制台的完整日志**（从申请重置到点击链接）
2. **邮件中链接的完整 URL**（可以隐藏敏感部分）
3. **Supabase Auth Logs** 中的相关记录
4. **Network 标签**中对 `/auth/callback` 的请求和响应

这样我可以进一步帮你排查问题。

