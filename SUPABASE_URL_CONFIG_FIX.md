# Supabase URL 配置修复指南

## ⚠️ 发现的问题

从你的配置截图看到：

### 问题 1：网站网址格式错误

**当前配置**：
```
http://localhost:3000 https://creatikit.asia/
```

**问题**：这是两个 URL 用空格分隔，Supabase 需要的是**单个 URL**。

**正确配置**：
- **开发环境**：`http://localhost:3000`
- **生产环境**：`https://creatikit.asia`

⚠️ **重要**：Supabase 的"网站网址"字段只能填写**一个 URL**。如果需要同时支持开发和生产环境，应该：
1. 开发时使用：`http://localhost:3000`
2. 生产时使用：`https://creatikit.asia`
3. 或者在重定向 URL 中分别配置

### 问题 2：重定向 URL 可能未正确保存

**当前显示**：
- `http://localhost:3000/auth/callback` ✓
- `http://localhost:3000/auth/reset-password` ✓

但显示"URL总数: 1"，说明可能只有一个被保存了。

## 🔧 修复步骤

### 步骤 1：修复网站网址

1. 进入 **Authentication** > **URL Configuration**
2. 在"网站网址"字段中，**只填写一个 URL**：
   - 如果主要在本地开发：填写 `http://localhost:3000`
   - 如果主要在生产环境：填写 `https://creatikit.asia`
3. 点击"保存更改"

### 步骤 2：确保重定向 URL 都保存

1. 在"重定向 URL"部分，确保以下 URL 都已添加并保存：
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password
   https://creatikit.asia/auth/callback
   https://creatikit.asia/auth/reset-password
   ```

2. 如果某个 URL 没有显示为已保存：
   - 点击"添加网址"按钮
   - 输入 URL
   - 点击保存
   - 确保复选框被勾选

3. 检查"URL总数"是否显示正确的数量（应该是 4 个）

### 步骤 3：检查邮件模板

1. 进入 **Authentication** > **Email Templates**
2. 找到 **Reset Password** 模板
3. 检查模板中的链接变量：
   - 应该包含 `{{ .ConfirmationURL }}` 或 `{{ .SiteURL }}`
   - 确保链接格式正确

### 步骤 4：测试配置

1. 保存所有更改后，等待几秒钟让配置生效
2. 尝试发送重置密码邮件
3. 检查：
   - 是否收到成功提示
   - 浏览器控制台是否有错误
   - Supabase 日志中是否有邮件发送记录

## 📋 推荐的完整配置

### 网站网址（Site URL）
```
https://creatikit.asia
```
（生产环境优先，开发时可以在重定向 URL 中单独配置 localhost）

### 重定向 URL（Redirect URLs）
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
https://creatikit.asia/auth/callback
https://creatikit.asia/auth/reset-password
```

## 🔍 其他可能的问题

### 1. 邮件发送限制
- 检查是否达到 Supabase 免费版每日邮件发送限制
- 进入 **Settings** > **Billing** 查看使用情况

### 2. 邮件被拦截
- 检查垃圾邮件文件夹
- 尝试使用不同的邮箱测试
- 检查邮箱服务商的拦截设置

### 3. SMTP 配置
- 如果使用自定义 SMTP，检查配置是否正确
- 进入 **Settings** > **Auth** 查看 SMTP 设置

### 4. Supabase 服务状态
- 检查 Supabase 状态页面：https://status.supabase.com
- 查看是否有服务中断

## ✅ 验证清单

修复后，请确认：
- [ ] 网站网址只包含一个 URL（不是用空格分隔的多个）
- [ ] 所有必要的重定向 URL 都已添加并保存
- [ ] URL总数显示正确的数量
- [ ] 邮件模板配置正确
- [ ] 已保存所有更改
- [ ] 等待配置生效（几秒钟）

## 🚨 如果仍然收不到邮件

1. **检查 Supabase 日志**：
   - 进入 **Logs** > **Auth Logs**
   - 查找邮件发送相关的错误

2. **检查浏览器控制台**：
   - 打开开发者工具（F12）
   - 查看 Console 和 Network 标签
   - 查找错误信息

3. **尝试不同的邮箱**：
   - 使用 Gmail、Outlook 等不同服务商的邮箱测试
   - 排除邮箱服务商的问题

4. **联系 Supabase 支持**：
   - 如果配置正确但问题仍然存在
   - 可能是 Supabase 服务端的问题



