# Supabase 邮箱配置完整指南

## 问题 1：重复注册问题

即使启用了 "Confirm email"，Supabase 在某些情况下仍可能允许未验证邮箱重复注册。

### 解决方案

1. **检查 Policies（策略）**
   - 进入 **Authentication** > **Policies**
   - 确保没有自定义策略允许重复注册
   - 如果看到 `auth.users` 表有自定义策略，检查是否允许重复邮箱

2. **检查数据库约束**
   - 进入 **Database** > **Tables** > **auth.users**
   - 检查是否有唯一约束在 `email` 字段上
   - 如果没有，可能需要添加（但 Supabase 应该默认有）

3. **使用 Supabase 的 Rate Limits**
   - 进入 **Authentication** > **Rate Limits**
   - 设置注册频率限制，防止恶意重复注册

## 问题 2：收不到验证邮件

### 可能的原因和解决方案

#### 1. 检查 Email 模板配置

1. 进入 **Authentication** > **Email Templates**
2. 检查以下模板：
   - **Confirm signup** - 注册确认邮件
   - **Magic Link** - 魔法链接邮件
   - **Change Email Address** - 更改邮箱邮件
   - **Reset Password** - 重置密码邮件

3. 确保每个模板都有正确的内容和链接

#### 2. 检查 SMTP 配置

Supabase 默认使用自己的 SMTP 服务，但可能需要配置：

1. 进入 **Settings** > **Auth**
2. 找到 **SMTP Settings** 部分
3. 检查是否配置了自定义 SMTP（如果使用）
4. 如果使用默认 SMTP，确保没有限制

#### 3. 检查 URL Configuration

1. 进入 **Authentication** > **URL Configuration**
2. 确保 **Site URL** 设置正确：
   - 开发环境：`http://localhost:3000`
   - 生产环境：`https://creatikit.asia`

3. 确保 **Redirect URLs** 包含：
   - `http://localhost:3000/auth/callback`
   - `https://creatikit.asia/auth/callback`
   - `http://localhost:3000/auth/reset-password`
   - `https://creatikit.asia/auth/reset-password`

#### 4. 检查邮箱验证设置

1. 进入 **Authentication** > **Settings**（Sign In / Providers 页面）
2. 确保：
   - ✅ **Confirm email** 已启用
   - ✅ **Allow new users to sign up** 已启用

#### 5. 检查垃圾邮件文件夹

- 验证邮件可能被标记为垃圾邮件
- 检查邮箱的垃圾邮件/垃圾箱文件夹
- 如果找到，标记为"不是垃圾邮件"

#### 6. 检查 Supabase 项目限制

1. 进入 **Settings** > **Billing**
2. 检查是否达到免费额度限制
3. 免费版每天有邮件发送限制

#### 7. 测试邮件发送

1. 进入 **Authentication** > **Email Templates**
2. 点击 **Send test email**（如果有此选项）
3. 或尝试注册一个新账户，检查邮件是否发送

#### 8. 检查域名验证（如果使用自定义域名）

如果使用自定义 SMTP 或域名：
- 确保域名 DNS 记录配置正确
- 确保 SPF、DKIM、DMARC 记录正确

## 临时解决方案

如果邮件仍然收不到，可以：

1. **暂时禁用邮箱验证**（仅用于测试）：
   - 进入 **Authentication** > **Settings**
   - 关闭 **Confirm email**
   - ⚠️ **注意**：这会降低安全性，仅用于测试

2. **使用 Supabase 的测试邮箱**：
   - Supabase 提供测试邮箱功能
   - 可以在开发环境中使用

3. **检查 Supabase 日志**：
   - 进入 **Logs** > **Auth Logs**
   - 查看是否有邮件发送错误

## 推荐配置

### 生产环境推荐设置：

1. ✅ **Confirm email** - 启用
2. ✅ **Allow new users to sign up** - 启用
3. ✅ **Site URL** - 设置为生产域名
4. ✅ **Redirect URLs** - 包含所有必要的回调 URL
5. ✅ **Email Templates** - 配置所有模板
6. ✅ **Rate Limits** - 设置合理的限制

### 开发环境推荐设置：

1. ✅ **Confirm email** - 可以暂时禁用用于快速测试
2. ✅ **Site URL** - `http://localhost:3000`
3. ✅ **Redirect URLs** - 包含 localhost 回调

## 联系支持

如果以上方法都无法解决问题：
1. 检查 Supabase 状态页面：https://status.supabase.com
2. 查看 Supabase 社区论坛
3. 联系 Supabase 支持



