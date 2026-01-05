# Git 提交失败问题修复指南

## 问题描述

错误信息：
```
fatal: unable to access 'https://github.com/Simex-Ace/CreatiKit.git/': 
Failed to connect to github.com port 443 after 21068 ms: Could not connect to server
```

## 问题原因

网络可以 ping 通 GitHub，但 HTTPS（443 端口）连接失败，可能原因：
1. 防火墙阻止了 HTTPS 连接
2. 需要配置代理
3. SSL 证书验证问题
4. 网络环境限制（某些地区访问 GitHub 需要代理）

## 解决方案

### 方案 1：配置 Git 使用代理（如果有代理）

如果你有代理（VPN、Clash、V2Ray 等），配置 Git 使用代理：

```bash
# HTTP 代理（根据你的代理端口修改）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 或者 SOCKS5 代理
git config --global http.proxy socks5://127.0.0.1:1080
git config --global https.proxy socks5://127.0.0.1:1080
```

**常见代理端口**：
- Clash: 7890
- V2Ray: 1080
- Shadowsocks: 1080

### 方案 2：禁用 SSL 验证（临时方案，不推荐）

```bash
git config --global http.sslVerify false
```

⚠️ **注意**：这会降低安全性，仅用于临时解决连接问题。

### 方案 3：改用 SSH 方式（推荐）

1. **生成 SSH 密钥**（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加 SSH 密钥到 GitHub**：
   - 复制公钥内容：`cat ~/.ssh/id_ed25519.pub`
   - 登录 GitHub > Settings > SSH and GPG keys > New SSH key
   - 粘贴公钥并保存

3. **更改 remote URL 为 SSH**：
   ```bash
   git remote set-url origin git@github.com:Simex-Ace/CreatiKit.git
   ```

4. **测试连接**：
   ```bash
   ssh -T git@github.com
   ```

### 方案 4：使用 GitHub CLI（gh）

如果上述方法都不行，可以尝试使用 GitHub CLI：

```bash
# 安装 GitHub CLI（如果还没有）
# 然后使用 gh 命令提交
```

## 快速修复步骤

### 如果你有代理：

1. 找到代理的本地端口（通常是 7890 或 1080）
2. 运行：
   ```bash
   git config --global http.proxy http://127.0.0.1:7890
   git config --global https.proxy http://127.0.0.1:7890
   ```
3. 再次尝试提交

### 如果没有代理，改用 SSH：

1. 检查是否有 SSH 密钥：
   ```bash
   ls ~/.ssh/id_*.pub
   ```

2. 如果没有，生成一个：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. 复制公钥并添加到 GitHub

4. 更改 remote：
   ```bash
   git remote set-url origin git@github.com:Simex-Ace/CreatiKit.git
   ```

## 验证修复

修复后，测试连接：

```bash
# 测试 HTTPS 连接
git ls-remote origin

# 或测试 SSH 连接
ssh -T git@github.com
```

## 取消代理配置（如果需要）

如果配置了代理但想取消：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 其他可能的问题

1. **防火墙设置**：检查 Windows 防火墙是否阻止了 Git
2. **公司网络**：如果在公司网络，可能需要联系 IT 部门
3. **DNS 问题**：尝试使用其他 DNS（如 8.8.8.8）




