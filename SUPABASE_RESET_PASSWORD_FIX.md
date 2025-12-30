# 密码重置链接"秒点过期"问题完整解决方案

## 🔍 问题根源

"秒点过期"的核心原因是**链接参数未被正确传递/识别**，而非真的过期。Supabase 的密码重置链接可能使用两种格式：

1. **新格式（推荐）**：`https://creatikit.asia/auth/callback?code=xxx&type=recovery`
2. **旧格式**：`https://creatikit.asia/auth/reset-password?token=xxx&type=recovery`

## ✅ 已修复的代码

代码已更新，现在同时支持 `code` 和 `token` 两种参数格式。

## 📝 Supabase 配置检查清单

### 1. 检查 Site URL 配置

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 进入项目 → **Authentication** → **URL Configuration**
3. 检查 **Site URL**：
   - ✅ 应该设置为：`https://creatikit.asia`
   - ❌ 不要使用：`http://localhost:3000`（除非只在本地测试）
   - ⚠️ **重要**：只能有一个 URL，不要用逗号分隔多个

### 2. 检查 Redirect URLs 配置

在同一个页面，检查 **Redirect URLs**，确保包含：

```
https://creatikit.asia/auth/callback
https://creatikit.asia/auth/reset-password
http://localhost:3000/auth/callback (如果需要本地测试)
http://localhost:3000/auth/reset-password (如果需要本地测试)
```

### 3. 检查邮件模板配置

1. 进入 **Authentication** → **Email Templates**
2. 找到 **Reset Password** 模板
3. 检查链接变量：
   - ✅ 应该使用：`{{ .ConfirmationURL }}`
   - ❌ 不要使用自定义链接

### 4. 检查密码重置有效期设置

1. 进入 **Authentication** → **Settings**
2. 找到 **Password Reset** 相关设置
3. 确认有效期设置（通常为 1 小时，但可以调整）

## 🔧 测试步骤

### 步骤 1：检查链接格式

1. 申请密码重置
2. 复制邮件中的完整链接
3. 检查链接格式：

**正确格式（新格式）**：
```
https://creatikit.asia/auth/callback?code=abc123&type=recovery
```

**正确格式（旧格式）**：
```
https://creatikit.asia/auth/reset-password?token=abc123&type=recovery
```

**错误格式（参数缺失）**：
```
https://creatikit.asia/auth/reset-password
```

如果参数缺失，说明 Supabase 配置有问题。

### 步骤 2：在 Supabase 控制台测试

1. 进入 **Authentication** → **Users**
2. 找到对应用户
3. 点击 **Send password reset email**
4. 使用此邮件测试

如果仍提示过期：
- 检查项目的 **Project URL** 和 **Anon Key** 是否正确
- 检查环境变量 `.env.local` 是否正确配置

如果能正常跳转：
- 说明之前的邮件是旧配置生成的
- 清空浏览器缓存后重新测试

### 步骤 3：检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 点击邮件中的重置链接
4. 查看日志：

应该看到：
```
[Auth Callback] { code: 'present', type: 'recovery', ... }
或
[Reset Password] Found token in URL, attempting to verify...
```

如果看到错误信息，记录下来以便排查。

### 步骤 4：检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 点击邮件中的重置链接
4. 查看对 `/auth/callback` 或 `/auth/reset-password` 的请求

检查：
- 请求 URL 是否包含 `code` 或 `token` 参数
- 响应状态码是否为 200
- 响应内容是否有错误信息

## 🐛 常见问题

### 问题 1：链接直接跳转到错误页面

**原因**：Supabase 的 `redirectTo` 配置错误

**解决**：
1. 检查 `resetPassword` 函数中的 `redirectTo` 参数
2. 确保指向 `/auth/callback` 而不是 `/auth/reset-password`

### 问题 2：参数在 URL 中丢失

**原因**：
- 前端路由使用 Hash 模式（`#`）
- 服务端路由配置问题

**解决**：
- Next.js 使用 History 模式，不需要额外配置
- 如果使用其他框架，确保路由配置正确

### 问题 3：移动端和桌面端表现不同

**原因**：
- 移动端浏览器可能对 URL 参数处理不同
- Cookie 同步延迟

**解决**：
- 代码已添加 100ms 延迟确保 Cookie 同步
- 如果仍有问题，检查移动端浏览器的 Cookie 设置

## 📊 调试信息

代码已添加详细的日志，在浏览器控制台可以看到：

- `[Auth Callback]` - 回调路由的处理日志
- `[Reset Password]` - 重置密码页面的处理日志

如果问题持续存在，请提供：
1. 浏览器控制台的完整日志
2. 网络请求的详细信息
3. Supabase 配置的截图（隐藏敏感信息）

## 🎯 终极验证

如果以上步骤都无效，使用本地测试：

1. **本地启动项目**：
   ```bash
   npm run dev
   ```

2. **修改 Supabase 配置**：
   - Site URL: `http://localhost:3000`
   - Redirect URLs: 添加 `http://localhost:3000/auth/callback`

3. **重新申请密码重置**

4. **在本地测试**：
   - 如果能正常工作，说明是线上环境配置问题
   - 如果仍不行，说明是代码逻辑问题

## ✅ 验证成功标志

当一切正常时，你应该看到：

1. ✅ 点击邮件链接后，URL 包含 `code` 或 `token` 参数
2. ✅ 页面跳转到 `/auth/reset-password` 并显示密码输入表单
3. ✅ 浏览器控制台显示成功日志
4. ✅ 没有错误提示

如果所有步骤都正确，但仍然有问题，请提供详细的错误信息和日志。

