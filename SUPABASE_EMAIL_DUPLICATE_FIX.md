# 修复邮箱重复注册问题

## 问题描述

如果 Supabase 配置允许未验证邮箱重复注册，可能会导致：
- 同一邮箱可以注册多次
- 新密码不会更新到已存在的账户
- 用户只能使用第一次注册时的密码登录

## 解决方案

### 方法 1：在 Supabase 后台配置（推荐）

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单 **Authentication** > **Settings**
4. 找到 **Email Auth** 部分
5. 确保以下设置：
   - ✅ **Enable email confirmations** - 启用邮箱验证
   - ✅ **Secure email change** - 启用安全邮箱更改
   - ❌ **Allow duplicate email signups** - **禁用**重复邮箱注册（如果存在此选项）

6. 在 **Email Templates** 中：
   - 确保 **Confirm signup** 模板已配置
   - 确保 **Reset password** 模板已配置

### 方法 2：检查 Supabase 项目设置

1. 进入 **Authentication** > **Policies**
2. 检查是否有自定义策略允许重复注册
3. 确保使用 Supabase 的默认认证策略

### 方法 3：代码层面的改进（已实现）

代码已经添加了：
- ✅ 改进的错误处理，捕获各种重复邮箱错误
- ✅ 检查注册返回的数据
- ✅ 提示用户如果邮箱已存在

## 验证修复

1. 使用一个邮箱注册账户
2. 尝试使用同一邮箱再次注册
3. 应该看到错误提示："该邮箱已被注册，请直接登录"
4. 如果仍然可以注册，说明 Supabase 配置需要调整

## 如果问题仍然存在

如果按照上述步骤配置后问题仍然存在，可能需要：

1. **检查 Supabase 项目设置**：
   - 进入 **Settings** > **API**
   - 检查是否有特殊的认证配置

2. **清理测试数据**：
   - 进入 **Authentication** > **Users**
   - 删除重复的测试账户
   - 重新测试注册流程

3. **联系 Supabase 支持**：
   - 如果配置正确但问题仍然存在，可能是 Supabase 的 bug
   - 可以在 Supabase 社区论坛寻求帮助

## 注意事项

- 如果禁用了邮箱验证，Supabase 可能会允许重复注册
- 建议始终启用邮箱验证以确保安全性
- 定期检查 Supabase 的认证设置，确保配置正确



