# Git SSH 配置指南

## ✅ 已完成的步骤

已将 Git remote 从 HTTPS 改为 SSH：
- **之前**：`https://github.com/Simex-Ace/CreatiKit.git`
- **现在**：`git@github.com:Simex-Ace/CreatiKit.git`

## 🔑 配置 SSH 密钥（如果还没有）

### 1. 检查是否已有 SSH 密钥

在 PowerShell 中运行：
```powershell
Test-Path ~/.ssh/id_rsa
Test-Path ~/.ssh/id_ed25519
```

如果返回 `True`，说明已有密钥，跳到第 3 步。

### 2. 生成新的 SSH 密钥

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- 按 Enter 使用默认路径
- 可以设置密码（可选，建议设置）
- 生成后会在 `~/.ssh/` 目录下创建 `id_ed25519` 和 `id_ed25519.pub`

### 3. 复制公钥到剪贴板

```powershell
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

或者：
```powershell
cat ~/.ssh/id_ed25519.pub
```
然后手动复制输出内容。

### 4. 添加到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. **Title**：填写一个描述（如 "我的电脑"）
4. **Key**：粘贴刚才复制的公钥内容
5. 点击 "Add SSH key"

### 5. 测试 SSH 连接

```powershell
ssh -T git@github.com
```

如果看到类似以下消息，说明配置成功：
```
Hi Simex-Ace! You've successfully authenticated, but GitHub does not provide shell access.
```

## 🚀 现在可以 Push 了

配置完成后，就可以正常使用 Git push 了：

```powershell
git push origin main
```

## 🔄 如果 SSH 也不行（备用方案）

如果 SSH 也无法连接，可以尝试配置代理：

### 方案 1：使用系统代理

```powershell
# 查看系统代理设置
netsh winhttp show proxy

# 如果系统有代理，配置 Git 使用系统代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

### 方案 2：使用 GitHub CLI

安装 GitHub CLI (`gh`)，它可能能绕过网络限制：
```powershell
winget install GitHub.cli
```

## ❓ 常见问题

**Q: SSH 连接超时怎么办？**
A: 检查防火墙设置，确保 22 端口没有被阻止。

**Q: 提示 "Permission denied"？**
A: 检查 SSH 密钥是否正确添加到 GitHub，或者尝试重新生成密钥。

**Q: 想改回 HTTPS？**
A: 运行：
```powershell
git remote set-url origin https://github.com/Simex-Ace/CreatiKit.git
```

