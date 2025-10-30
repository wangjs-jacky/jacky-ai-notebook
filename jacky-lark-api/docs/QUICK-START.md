# 快速开始指南

本指南将帮助你快速上手使用飞书 OAuth SDK。

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的飞书应用信息：

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_REDIRECT_URI=http://localhost:3000/callback
```

## 3. 运行示例

```bash
npm run example
```

**第一次运行：**
- 会打开浏览器进行飞书授权
- 授权成功后，token 会自动保存到 `~/.lark/auth.json`
- 控制台会显示认证信息

**第二次及以后运行：**
- 直接从本地加载 token，无需重新授权
- 如果 token 已过期，会自动重新授权

## 4. 常用命令

### 编译项目

```bash
npm run build
```

### 运行示例

```bash
npm run example
```

### 清除认证信息

当你需要重新授权或切换账号时：

```bash
npm run clear:storage
```

## 5. 在你的项目中使用

### 方式 1：一键登录（推荐）

```typescript
import { LoginHandler, getLarkConfig } from 'jacky-lark-api';

const config = getLarkConfig();

// 自动处理授权和持久化
const authInfo = await LoginHandler.handleLogin(config);

console.log('Access Token:', authInfo.token);
console.log('User Info:', authInfo);
```

### 方式 2：手动管理认证

```typescript
import { authStore, LarkApiClient, getLarkConfig } from 'jacky-lark-api';

const config = getLarkConfig();

// 检查是否有有效的 token
let authInfo = authStore.getAuthInfo();

if (!authInfo || authStore.isTokenExpired()) {
  // 需要重新授权
  authInfo = await LoginHandler.handleLogin(config);
}

// 使用 token
const client = new LarkApiClient(config);
const userInfo = await client.getUserInfo(authInfo.token);
console.log('用户信息:', userInfo);
```

### 方式 3：自定义存储路径

```typescript
import { authStore, LoginHandler, getLarkConfig } from 'jacky-lark-api';

const config = getLarkConfig();

// 设置自定义存储路径
authStore.setStoragePath('./my-auth.json');

// 执行登录
const authInfo = await LoginHandler.handleLogin(config);
```

## 6. 工作流程说明

### 首次使用流程

```
1. 运行 npm run example
   ↓
2. 检查本地 token (不存在)
   ↓
3. 启动 Express 服务器 (http://localhost:3000)
   ↓
4. 打开浏览器授权
   ↓
5. 用户在飞书页面授权
   ↓
6. 飞书重定向回 http://localhost:3000/callback?code=xxx
   ↓
7. 使用 code 获取 access_token
   ↓
8. 保存 token 到 ~/.lark/auth.json
   ↓
9. 程序继续执行
```

### 再次使用流程

```
1. 运行 npm run example
   ↓
2. 检查本地 token (存在)
   ↓
3. 检查是否过期 (未过期)
   ↓
4. 直接使用 token
   ↓
5. 程序继续执行
```

### Token 过期流程

```
1. 运行 npm run example
   ↓
2. 检查本地 token (存在)
   ↓
3. 检查是否过期 (已过期)
   ↓
4. 清除本地 token
   ↓
5. 重新进行授权流程 (同首次使用)
```

## 7. 故障排查

### 问题：端口 3000 被占用

**错误：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决：**
1. 更改配置中的端口：
```typescript
const config = {
  ...getLarkConfig(),
  port: 3001, // 使用其他端口
};
```

2. 或者停止占用 3000 端口的进程：
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 问题：浏览器没有自动打开

**手动操作：**
1. 查看控制台输出的授权链接
2. 复制链接到浏览器手动打开
3. 完成授权

### 问题：回调超时

**可能原因：**
- 网络问题
- 授权页面未操作

**解决：**
```bash
# 清除并重试
npm run clear:storage
npm run example
```

### 问题：Token 无效

**解决：**
```bash
# 清除旧 token 并重新授权
npm run clear:storage
npm run example
```

## 8. 调试模式

代码中已包含详细的日志输出，你会看到：

- 🔍 检查本地认证信息
- 📝 注册路由
- 🚀 服务器启动
- 🔔 收到回调请求
- ✅ 获取授权码
- 🔄 正在获取 token
- 💾 保存认证信息
- 🎉 登录成功

## 9. 下一步

- 📖 阅读 [完整 API 文档](../README.md)
- 💾 了解 [持久化存储](./STORAGE.md)
- ⚙️ 查看 [配置说明](./CONFIG.md)
- 🏗️ 理解 [项目结构](./STRUCTURE.md)

## 10. 常见使用场景

### 场景 1：CLI 工具

在命令行工具中使用，自动处理授权：

```typescript
#!/usr/bin/env node
import { LoginHandler, getLarkConfig } from 'jacky-lark-api';

async function main() {
  const config = getLarkConfig();
  const authInfo = await LoginHandler.handleLogin(config);
  
  // 使用 token 执行你的业务逻辑
  console.log('已登录，Token:', authInfo.token);
}

main();
```

### 场景 2：长期运行的服务

在服务中使用，定期检查 token 有效性：

```typescript
import { authStore, LoginHandler, getLarkConfig } from 'jacky-lark-api';

const config = getLarkConfig();

// 初始化时登录
let authInfo = await LoginHandler.handleLogin(config);

// 定期检查 token
setInterval(async () => {
  if (authStore.isTokenExpired()) {
    console.log('Token 已过期，重新授权...');
    authInfo = await LoginHandler.handleLogin(config);
  }
}, 60000); // 每分钟检查一次
```

### 场景 3：多账号管理

使用不同的存储路径管理多个账号：

```typescript
import { authStore, LoginHandler, getLarkConfig } from 'jacky-lark-api';

// 账号 1
authStore.setStoragePath('./auth-account1.json');
const account1 = await LoginHandler.handleLogin(getLarkConfig());

// 账号 2
authStore.setStoragePath('./auth-account2.json');
const account2 = await LoginHandler.handleLogin(getLarkConfig());
```

## 需要帮助？

如果遇到问题，请：

1. 查看 [故障排查](#7-故障排查) 部分
2. 查看 [完整文档](../README.md)
3. 检查 [Issues](https://github.com/your-repo/issues)

