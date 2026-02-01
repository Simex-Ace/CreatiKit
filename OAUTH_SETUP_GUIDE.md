# GitHub 和 Google 登录配置指南

## 📋 关于第三方登录账号

### 账号机制说明
- **独立账号**：每个第三方登录方式（Google、GitHub）都会创建一个独立的 Supabase 用户账号
- **邮箱自动获取**：Supabase 会自动从第三方平台获取邮箱地址（如果用户授权）
- **账号绑定**：如果同一个邮箱用不同方式登录，Supabase 会创建不同的账号（除非配置了账号链接）
- **邮箱显示**：登录后会在用户菜单和个人中心显示绑定的邮箱地址

### 当前实现
- ✅ 自动获取第三方平台的邮箱
- ✅ 显示登录方式（Google/GitHub/邮箱）
- ✅ 在用户菜单和个人中心显示邮箱
- ⚠️ 不同登录方式创建独立账号（如需绑定，需要额外配置）

## 📋 需要配置的内容

### 1. Supabase Dashboard 配置

#### 步骤 1：启用 OAuth 提供商
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **Google** 和 **GitHub**，点击启用

#### 步骤 2：配置 Google OAuth

**需要的信息：**
- Client ID（客户端 ID）
- Client Secret（客户端密钥）

**获取步骤：**
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 进入 **APIs & Services** → **Credentials**
4. 点击 **Create Credentials** → **OAuth client ID**
5. 选择 **Web application**
6. 配置：
   - **Name**: CreatiKit（或你的应用名称）
   - **Authorized JavaScript origins**:
     - `https://creatikit.asia`
     - `http://localhost:3000`（开发环境）
   - **Authorized redirect URIs**（⚠️ 重要：必须完全匹配）:
     - `https://kfsaonqqgobjorbdwopk.supabase.co/auth/v1/callback`（这是 Supabase 的回调地址，必须添加）
     - `https://creatikit.asia/auth/callback`（可选，用于直接回调）
     - `http://localhost:3000/auth/callback`（开发环境）
   - ⚠️ **注意**：Supabase 的回调地址格式为 `https://[你的项目ID].supabase.co/auth/v1/callback`
     - 你可以在 Supabase Dashboard → Settings → API 中找到你的项目 ID
     - 或者查看你的 `NEXT_PUBLIC_SUPABASE_URL`，提取其中的项目 ID
7. 点击 **Create**，复制 **Client ID** 和 **Client Secret**

**在 Supabase 中配置：**
1. 在 Supabase Dashboard → Authentication → Providers → Google
2. 填入：
   - **Client ID**: 从 Google Cloud Console 复制的 Client ID
   - **Client Secret**: 从 Google Cloud Console 复制的 Client Secret
3. 点击 **Save**

#### 步骤 3：配置 GitHub OAuth

**需要的信息：**
- Client ID（客户端 ID）
- Client Secret（客户端密钥）

**获取步骤：**
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **OAuth Apps** → **New OAuth App**
3. 填写：
   - **Application name**: CreatiKit（或你的应用名称）
   - **Homepage URL**: `https://creatikit.asia`
   - **Authorization callback URL**: 
     - `https://kfsaonqqgobjorbdwopk.supabase.co/auth/v1/callback`
4. 点击 **Register application**
5. 复制 **Client ID**
6. 点击 **Generate a new client secret**，复制 **Client Secret**

**在 Supabase 中配置：**
1. 在 Supabase Dashboard → Authentication → Providers → GitHub
2. 填入：
   - **Client ID**: 从 GitHub 复制的 Client ID
   - **Client Secret**: 从 GitHub 复制的 Client Secret
3. 点击 **Save**

#### 步骤 4：配置 Redirect URLs

1. 在 Supabase Dashboard → Authentication → URL Configuration
2. 确保 **Redirect URLs** 包含：
   - `https://creatikit.asia/auth/callback`
   - `http://localhost:3000/auth/callback`（开发环境）

### 2. 代码已就绪 ✅

代码已经实现完成，包括：
- ✅ OAuth 登录函数 (`signInWithProvider`)
- ✅ 回调路由处理 (`/auth/callback`)
- ✅ UI 按钮和错误处理

## 🧪 测试步骤

### 1. 测试 Google 登录
1. 点击登录弹窗中的 **"G Google"** 按钮
2. 应该跳转到 Google 登录页面
3. 登录后应该重定向回你的网站
4. 应该自动登录成功

### 2. 测试 GitHub 登录
1. 点击登录弹窗中的 **"GitHub"** 按钮
2. 应该跳转到 GitHub 登录页面
3. 授权后应该重定向回你的网站
4. 应该自动登录成功

## ⚠️ 常见问题

### 问题 1：重定向 URI 不匹配
**错误信息**: `redirect_uri_mismatch`

**解决方案**:
- 检查 Google/GitHub 中配置的 Redirect URI 是否与 Supabase 的回调 URL 完全一致
- Supabase 的回调 URL 格式：`https://[你的项目ID].supabase.co/auth/v1/callback`

### 问题 2：OAuth 提供商未启用
**错误信息**: `Provider not enabled`

**解决方案**:
- 在 Supabase Dashboard → Authentication → Providers 中启用对应的提供商

### 问题 3：Client Secret 错误
**错误信息**: `invalid_client`

**解决方案**:
- 检查 Supabase 中配置的 Client ID 和 Client Secret 是否正确
- 确保没有多余的空格或换行

### 问题 4：回调后没有登录
**可能原因**:
- Redirect URL 配置不正确
- `/auth/callback` 路由处理有问题

**解决方案**:
- 检查浏览器控制台的日志
- 确认 `/auth/callback` 路由正常工作

## 📝 配置检查清单

- [ ] Google OAuth App 已创建
- [ ] Google Client ID 和 Secret 已配置到 Supabase
- [ ] GitHub OAuth App 已创建
- [ ] GitHub Client ID 和 Secret 已配置到 Supabase
- [ ] Supabase Redirect URLs 已配置
- [ ] Google Authorized redirect URIs 已配置
- [ ] GitHub Authorization callback URL 已配置
- [ ] 已测试 Google 登录
- [ ] 已测试 GitHub 登录

## 🔗 重要链接

- [Supabase Dashboard](https://app.supabase.com)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub Developer Settings](https://github.com/settings/developers)
- [Supabase OAuth 文档](https://supabase.com/docs/guides/auth/social-login)

## 💡 提示

1. **开发环境**: 如果要在本地测试，确保在 Google/GitHub 中添加 `http://localhost:3000` 作为授权来源
2. **生产环境**: 确保使用 HTTPS 的 URL
3. **安全性**: 不要将 Client Secret 提交到代码仓库，只在 Supabase Dashboard 中配置

配置完成后，第三方登录功能就可以正常使用了！

