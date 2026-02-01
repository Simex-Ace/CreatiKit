# 登录注册功能诊断报告

## 🔍 发现的问题

### 1. **关键问题：ANON_KEY 格式错误** ⚠️

**当前配置**：
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r34-blb1nxyrvcV5Y7M0uA_jPDpTno7
```

**问题**：
- `sb_publishable_` 开头的是 **Publishable Key**，不是 **Anon Key**
- Supabase 认证需要使用 **Anon Public Key**（格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）
- 这会导致所有认证请求失败

**修复方法**：
1. 登录 Supabase Dashboard
2. 进入 **Settings** → **API**
3. 找到 **anon public** 部分（不是 publishable key）
4. 复制完整的 JWT token（通常很长，以 `eyJ` 开头）
5. 更新 `.env.local` 文件

### 2. **代码逻辑问题**

#### 问题 A：注册时的邮箱检查逻辑有缺陷

**位置**：`src/contexts/AuthContext.tsx` 第 64-102 行

**问题**：
- 通过尝试登录来检查邮箱是否存在，这个逻辑不可靠
- 如果邮箱不存在，`signInWithPassword` 可能返回不同的错误
- 可能导致误判

**建议**：直接调用 `signUp`，让 Supabase 返回明确的错误信息

#### 问题 B：缺少错误日志

**问题**：
- 登录/注册失败时，没有详细的错误日志
- 难以排查具体问题

**建议**：添加详细的 console.error 日志

### 3. **环境变量检查**

**当前配置**：
```env
NEXT_PUBLIC_SUPABASE_URL=https://kfsaonqqgobjorbdwopk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r34-blb1nxyrvcV5Y7M0uA_jPDpTno7  ❌ 错误
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

**需要修复**：
- ✅ URL 格式正确
- ❌ ANON_KEY 格式错误（需要 JWT token）
- ✅ SITE_URL 格式正确

## 🔧 修复步骤

### 步骤 1：获取正确的 Anon Key

1. 访问 [https://app.supabase.com](https://app.supabase.com)
2. 选择项目：`kfsaonqqgobjorbdwopk`
3. 点击左侧 **Settings**（⚙️ 图标）
4. 点击 **API**
5. 找到 **anon public** 部分（在 **Project API keys** 区域）
6. 复制完整的 key（格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2FvbnFxZ29iam9yYmR3b3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIzNDU2NzgsImV4cCI6MjAyNzkwMTY3OH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 步骤 2：更新 .env.local 文件

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfsaonqqgobjorbdwopk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（你的完整 anon key）
NEXT_PUBLIC_SITE_URL=https://creatikit.asia
```

### 步骤 3：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### 步骤 4：测试登录注册

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 尝试登录/注册
4. 查看是否有错误信息

## 🐛 常见错误及解决方案

### 错误 1：`Missing Supabase environment variables`

**原因**：环境变量未正确加载

**解决**：
- 确保 `.env.local` 在项目根目录
- 重启开发服务器
- 检查变量名是否正确（注意大小写）

### 错误 2：`Invalid API key`

**原因**：使用了错误的 key 格式

**解决**：
- 使用 **anon public key**（JWT 格式），不是 publishable key
- 确保 key 完整（没有截断）

### 错误 3：`Email rate limit exceeded`

**原因**：发送邮件过于频繁

**解决**：
- 等待一段时间后重试
- 检查 Supabase 的 Rate Limits 设置

### 错误 4：`Email not confirmed`

**原因**：邮箱未验证

**解决**：
- 检查邮箱（包括垃圾邮件文件夹）
- 点击验证链接
- 或者在 Supabase 设置中禁用邮箱验证（仅用于开发）

## 📋 检查清单

- [ ] `.env.local` 文件存在
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 正确
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是 JWT 格式（`eyJ` 开头）
- [ ] `NEXT_PUBLIC_SITE_URL` 正确
- [ ] 已重启开发服务器
- [ ] 浏览器控制台无错误
- [ ] Supabase Dashboard 中已配置 Redirect URLs
- [ ] Supabase 中已启用 Email 认证提供者

## 🔍 调试技巧

### 1. 查看浏览器控制台

打开开发者工具（F12），查看：
- **Console**：错误信息
- **Network**：API 请求和响应

### 2. 检查 Supabase Dashboard

1. **Authentication** → **Users**：查看用户是否创建成功
2. **Authentication** → **Auth Logs**：查看认证日志
3. **Settings** → **API**：确认 key 是否正确

### 3. 添加调试日志

在 `src/contexts/AuthContext.tsx` 中添加：

```typescript
const signIn = async (email: string, password: string) => {
  console.log('[Sign In] Attempting to sign in:', { email });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error('[Sign In] Error:', error);
  } else {
    console.log('[Sign In] Success:', data.user?.email);
  }
  return { error };
};
```

## 🆘 如果还是不行

请提供以下信息：

1. **浏览器控制台的完整错误信息**
2. **Network 标签中对 Supabase API 的请求和响应**
3. **Supabase Dashboard → Authentication → Auth Logs 中的相关记录**
4. **.env.local 文件内容**（隐藏敏感部分）

这样我可以进一步帮你排查问题。

