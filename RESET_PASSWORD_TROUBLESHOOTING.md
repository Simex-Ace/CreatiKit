# 重置密码邮件发送问题排查指南

## 已改进的功能

代码已经添加了：
- ✅ 邮箱存在性检查（发送前验证邮箱是否已注册）
- ✅ 详细的错误处理和提示
- ✅ 更友好的用户反馈

## 问题排查步骤

### 1. 检查 Supabase URL 配置

**最重要！** 这是最常见的问题原因。

1. 进入 Supabase Dashboard
2. 点击 **Authentication** > **URL Configuration**
3. 检查以下设置：

   **Site URL** 应该设置为：
   - 开发环境：`http://localhost:3000`
   - 生产环境：`https://creatikit.asia`

   **Redirect URLs** 必须包含：
   ```
   http://localhost:3000/auth/reset-password
   https://creatikit.asia/auth/reset-password
   http://localhost:3000/auth/callback
   https://creatikit.asia/auth/callback
   ```

   ⚠️ **注意**：如果 Redirect URLs 中没有包含重置密码页面的 URL，邮件中的链接将无法工作！

### 2. 检查邮件模板配置

1. 进入 **Authentication** > **Email Templates**
2. 找到 **Reset Password** 模板
3. 检查模板内容，确保包含：
   - `{{ .ConfirmationURL }}` 或类似的链接变量
   - 正确的邮件主题和内容

### 3. 检查邮件发送限制

1. 进入 **Settings** > **Billing**
2. 检查是否达到免费版邮件发送限制
3. Supabase 免费版每天有邮件发送数量限制

### 4. 检查垃圾邮件文件夹

- 验证邮件可能被标记为垃圾邮件
- 检查邮箱的垃圾邮件/垃圾箱文件夹
- 如果找到，标记为"不是垃圾邮件"

### 5. 检查 Supabase 日志

1. 进入 **Logs** > **Auth Logs**
2. 查看是否有邮件发送相关的错误
3. 查找 "reset password" 或 "email" 相关的日志

### 6. 测试邮件发送

1. 尝试使用不同的邮箱测试
2. 检查控制台是否有错误信息
3. 查看网络请求，确认 API 调用是否成功

### 7. 检查环境变量

确保 `.env.local` 文件中的配置正确：
```env
NEXT_PUBLIC_SUPABASE_URL=https://kfsaonqqgobjorbdwopk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的密钥
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

## 常见错误和解决方案

### 错误 1：邮件发送成功但收不到

**可能原因**：
- 邮件被标记为垃圾邮件
- 邮箱服务商拦截
- Supabase 邮件发送延迟

**解决方案**：
- 检查垃圾邮件文件夹
- 等待几分钟后重试
- 尝试使用不同的邮箱

### 错误 2：显示"发送失败"但没有具体错误

**可能原因**：
- Supabase 配置问题
- 网络问题
- API 限制

**解决方案**：
- 检查 Supabase 状态页面：https://status.supabase.com
- 检查网络连接
- 查看浏览器控制台的错误信息

### 错误 3：点击邮件中的链接没有反应

**可能原因**：
- Redirect URL 配置不正确
- 链接已过期
- 回调路由有问题

**解决方案**：
- 检查 Supabase URL Configuration 中的 Redirect URLs
- 确保链接在有效期内（通常 1 小时）
- 检查 `/auth/reset-password` 页面是否存在

## 临时解决方案

如果急需重置密码但邮件收不到：

1. **暂时禁用邮箱验证**（仅用于测试）：
   - 进入 **Authentication** > **Settings**
   - 暂时关闭 **Confirm email**
   - ⚠️ **注意**：这会降低安全性

2. **使用 Supabase Dashboard 手动重置**：
   - 进入 **Authentication** > **Users**
   - 找到用户
   - 手动发送重置密码邮件

3. **检查 Supabase 项目设置**：
   - 进入 **Settings** > **Auth**
   - 检查 SMTP 配置（如果使用自定义 SMTP）

## 验证修复

修复后，测试流程：

1. 点击"忘记密码"
2. 输入已注册的邮箱
3. 应该看到成功提示："邮件已发送"
4. 检查邮箱（包括垃圾邮件文件夹）
5. 点击邮件中的链接
6. 应该跳转到重置密码页面

## 如果问题仍然存在

1. **检查 Supabase 状态**：https://status.supabase.com
2. **查看 Supabase 社区论坛**：寻求帮助
3. **联系 Supabase 支持**：如果是服务问题

## 重要提示

- **URL Configuration 是最关键的配置**，必须正确设置
- 邮件发送可能有延迟，请耐心等待
- 免费版有邮件发送限制，注意不要超过
- 建议在生产环境使用自定义 SMTP 以提高可靠性


