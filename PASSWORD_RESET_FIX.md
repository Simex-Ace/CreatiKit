# 密码重置功能修复说明

## 问题描述
用户点击密码重置邮件链接后，一直显示"链接已过期"，即使秒点击也显示过期。

## 根本原因
**Supabase 的密码重置链接不会自动设置会话**。我们需要使用 `verifyOtp` 来验证 token 并获取会话。

## 修复内容

### 1. 修复重置密码页面 (`src/app/auth/reset-password/page.tsx`)
- **之前**：直接检查会话（错误，因为 Supabase 不会自动设置会话）
- **现在**：使用 `verifyOtp` 验证 token，成功后获取会话

### 2. 验证流程
1. 用户点击邮件中的链接
2. Supabase 重定向到 `/auth/reset-password?token=xxx&type=recovery`
3. 重置页面使用 `verifyOtp` 验证 token：
   - 如果有 `email` 参数：使用 `{ email, token, type: 'recovery' }`
   - 如果没有 `email` 参数：使用 `{ token_hash: token, type: 'recovery' }`
4. 验证成功后，Supabase 会设置会话
5. 用户输入新密码并提交

## 关键代码

```typescript
// 使用 verifyOtp 验证 token
const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp(verifyParams);

if (verifyData?.session) {
  // 验证成功，允许重置密码
  setIsValidSession(true);
} else {
  // 验证失败，显示错误
  setIsValidSession(false);
}
```

## 测试步骤

1. **申请密码重置**
   - 在登录页面点击"忘记密码"
   - 输入邮箱并提交

2. **检查邮件**
   - 查看邮箱中的重置链接
   - 链接格式应该是：`https://creatikit.asia/auth/reset-password?token=xxx&type=recovery`

3. **点击链接**
   - 立即点击链接（不要等待）
   - 打开浏览器控制台（F12）查看日志

4. **查看日志**
   - 应该看到：`[Reset Password] Found token, verifying with verifyOtp...`
   - 如果成功：`[Reset Password] OTP verified successfully, session created`
   - 如果失败：查看具体错误信息

## 如果还是显示"已过期"

### 检查清单

1. **Supabase 配置**
   - 进入 Supabase Dashboard → Authentication → URL Configuration
   - 检查 `Site URL`：应该是 `https://creatikit.asia`（没有末尾斜杠）
   - 检查 `Redirect URLs`：应该包含 `https://creatikit.asia/auth/reset-password`

2. **环境变量**
   - 检查 `.env.local` 文件
   - `NEXT_PUBLIC_SITE_URL` 应该是 `https://creatikit.asia`（没有末尾斜杠）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 应该是正确的 JWT token（以 `eyJ` 开头）

3. **OTP 有效期**
   - 进入 Supabase Dashboard → Authentication → Email Templates
   - 检查 OTP 有效期设置（建议设置为 3600 秒或更长）

4. **浏览器控制台**
   - 打开浏览器控制台（F12）
   - 查看是否有错误信息
   - 查看 `[Reset Password]` 开头的日志

5. **网络请求**
   - 打开浏览器开发者工具 → Network 标签
   - 点击重置链接后，查看是否有失败的请求
   - 查看请求的 URL 和响应内容

## 调试信息

代码中添加了详细的调试日志，包括：
- Token 的前 20 个字符
- Email 参数（如果有）
- 验证结果（成功或失败）
- 错误信息（如果有）

如果问题仍然存在，请提供：
1. 浏览器控制台的完整日志
2. Network 标签中的请求和响应
3. Supabase Dashboard 中的配置截图

## 常见错误

### 1. "链接已过期"
- **原因**：OTP 已过期或 token 无效
- **解决**：检查 Supabase 中的 OTP 有效期设置，确保足够长

### 2. "链接无效"
- **原因**：token 格式错误或已被使用
- **解决**：重新申请密码重置

### 3. "验证失败"
- **原因**：网络错误或 Supabase 配置问题
- **解决**：检查网络连接和 Supabase 配置

## 注意事项

1. **不要多次点击链接**：每个 token 只能使用一次
2. **及时点击**：虽然 OTP 有效期通常很长，但建议收到邮件后尽快点击
3. **检查邮箱**：确保邮件没有被标记为垃圾邮件
4. **清除缓存**：如果问题持续，尝试清除浏览器缓存和 cookies

