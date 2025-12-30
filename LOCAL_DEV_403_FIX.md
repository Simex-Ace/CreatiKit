# 修复本地开发环境 403 错误

## 问题原因

403 错误通常是因为：

1. **URL 不匹配**：邮件中的链接指向的 URL 与 Supabase 配置的 Redirect URLs 不匹配
2. **环境不一致**：在本地开发（localhost:3000）但邮件链接指向生产环境，或反之
3. **Supabase 配置缺失**：Redirect URLs 中没有包含当前使用的 URL

## 解决方案

### 方案 1：确保 Supabase 配置包含所有环境（推荐）

在 Supabase Dashboard 中：

1. 进入 **Authentication** > **URL Configuration**
2. 在 **Redirect URLs** 中确保包含：
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password
   https://creatikit.asia/auth/callback
   https://creatikit.asia/auth/reset-password
   ```
3. **网站网址**设置为：`https://creatikit.asia`（生产环境优先）

### 方案 2：使用环境变量控制重定向 URL

代码已经更新，现在会根据 `NEXT_PUBLIC_SITE_URL` 环境变量来确定重定向 URL。

**本地开发时**：
- 如果想在本地测试，确保 `.env.local` 中：
  ```env
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```
- 并在 Supabase 中添加 `http://localhost:3000/auth/reset-password`

**生产环境时**：
- `.env.local` 或生产环境变量中：
  ```env
  NEXT_PUBLIC_SITE_URL=https://creatikit.asia
  ```

### 方案 3：在手机上测试时使用生产环境

如果是在手机上测试：

1. **确保 Supabase 配置了生产环境的 URL**：
   - `https://creatikit.asia/auth/callback`
   - `https://creatikit.asia/auth/reset-password`

2. **确保 `.env.local` 中的 `NEXT_PUBLIC_SITE_URL` 是生产环境**：
   ```env
   NEXT_PUBLIC_SITE_URL=https://creatikit.asia
   ```

3. **在手机上打开邮件链接时，确保网站已部署到生产环境**

## 重要提示

### 本地开发 vs 生产环境

- **本地开发**：使用 `http://localhost:3000`
  - 邮件链接只能在本地浏览器中打开
  - 手机无法访问 localhost

- **生产环境**：使用 `https://creatikit.asia`
  - 邮件链接可以在任何设备上打开
  - 需要网站已部署到生产环境

### 测试建议

1. **本地测试**：
   - 在本地浏览器中打开邮件链接
   - 确保 Supabase 配置了 `http://localhost:3000/auth/reset-password`

2. **手机测试**：
   - 必须使用生产环境的 URL
   - 确保网站已部署到 `https://creatikit.asia`
   - 确保 Supabase 配置了 `https://creatikit.asia/auth/reset-password`

## 验证步骤

1. **检查 Supabase 配置**：
   - 进入 **Authentication** > **URL Configuration**
   - 确认所有必要的 URL 都已添加

2. **检查环境变量**：
   - 确认 `.env.local` 中的 `NEXT_PUBLIC_SITE_URL` 正确
   - 本地开发：`http://localhost:3000`
   - 生产环境：`https://creatikit.asia`

3. **测试流程**：
   - 发送重置密码邮件
   - 检查邮件中的链接指向哪个 URL
   - 确保该 URL 在 Supabase 的 Redirect URLs 中
   - 点击链接测试

## 如果仍然出现 403

1. **检查邮件中的实际链接**：
   - 查看邮件中的完整链接
   - 确认链接指向的域名
   - 确保该域名在 Supabase 配置中

2. **检查 Supabase 日志**：
   - 进入 **Logs** > **Auth Logs**
   - 查看详细的错误信息

3. **尝试不同的设备**：
   - 在桌面浏览器中测试
   - 排除手机浏览器的问题

4. **检查网络**：
   - 某些网络环境可能阻止重定向
   - 尝试使用不同的网络

