# 认证信息持久化存储

本文档说明如何使用 `authStore` 进行认证信息的持久化存储。

## 功能概述

`authStore` 提供了自动的本地文件系统持久化存储功能，可以：

- ✅ 自动保存认证信息到本地文件
- ✅ 自动从本地文件加载认证信息
- ✅ 自动检查 token 是否过期
- ✅ 支持自定义存储路径

## 默认存储位置

认证信息默认保存在：

```
~/.lark/auth.json
```

- macOS/Linux: `/Users/你的用户名/.lark/auth.json`
- Windows: `C:\Users\你的用户名\.lark\auth.json`

## 基本使用

### 1. 自动持久化（推荐）

使用 `LoginHandler.handleLogin()` 会自动处理持久化：

```typescript
import { LoginHandler } from 'jacky-lark-api';
import { getLarkConfig } from './config';

const config = getLarkConfig();

// 第一次运行：会打开浏览器进行 OAuth 授权，并保存 token 到本地
// 第二次运行：直接从本地加载 token，无需重新授权
const authInfo = await LoginHandler.handleLogin(config);

console.log('Access Token:', authInfo.token);
```

### 2. 手动操作

```typescript
import { authStore } from 'jacky-lark-api';

// 设置认证信息（会自动保存到文件）
authStore.setAuthInfo({
  token: 'your-access-token',
  clientId: 'your-client-id',
  scopes: [],
  expiresAt: Date.now() + 7200 * 1000, // 2小时后过期
  extra: {
    refreshToken: 'your-refresh-token',
    appId: 'your-app-id',
    appSecret: 'your-app-secret',
  },
});

// 获取认证信息（如果内存中没有，会自动从文件加载）
const authInfo = authStore.getAuthInfo();

// 检查 token 是否过期
if (authStore.isTokenExpired()) {
  console.log('Token 已过期，需要重新授权');
} else {
  console.log('Token 仍然有效');
}

// 清空认证信息（会删除本地文件）
authStore.clear();

// 或使用命令行清除
// npm run clear:storage
```

## 自定义存储路径

如果需要自定义存储路径：

```typescript
import { authStore } from 'jacky-lark-api';

// 设置自定义存储路径（必须在使用前设置）
authStore.setStoragePath('./my-custom-auth.json');

// 或者使用项目根目录
authStore.setStoragePath(path.join(process.cwd(), '.auth.json'));
```

## 存储文件格式

认证信息以 JSON 格式保存：

```json
{
  "token": "u-xxxxxxxxxxxxxx",
  "clientId": "cli_xxxxxxxxxxxxxx",
  "scopes": [],
  "expiresAt": 1761737630173,
  "extra": {
    "appId": "cli_xxxxxxxxxxxxxx",
    "appSecret": "your-secret",
    "refreshToken": "ur-xxxxxxxxxxxxxx"
  }
}
```

## API 参考

### authStore.setAuthInfo(info)

设置认证信息，并自动保存到文件。

**参数：**
- `info: AuthInfo` - 认证信息对象

**返回：**
- `void`

### authStore.getAuthInfo()

获取认证信息。如果内存中没有，会尝试从文件加载。

**返回：**
- `AuthInfo | null` - 认证信息对象，如果不存在或已过期则返回 null

### authStore.loadFromFile()

手动从文件加载认证信息。

**返回：**
- `AuthInfo | null` - 认证信息对象

### authStore.saveToFile()

手动保存认证信息到文件。

**返回：**
- `boolean` - 是否保存成功

### authStore.deleteFile()

删除存储文件。

**返回：**
- `boolean` - 是否删除成功

### authStore.isTokenExpired()

检查 token 是否过期。

**返回：**
- `boolean` - true 表示已过期，false 表示仍然有效

### authStore.setStoragePath(filePath)

设置自定义存储路径。

**参数：**
- `filePath: string` - 文件路径

**返回：**
- `void`

### authStore.clear()

清空所有认证信息，包括内存和文件。

**返回：**
- `void`

## 安全建议

1. **不要提交认证文件到 Git**
   - `.lark/` 和 `auth.json` 已自动添加到 `.gitignore`
   
2. **保护好存储文件**
   - 认证文件包含敏感信息（access token、refresh token、app secret）
   - 建议设置文件权限为仅当前用户可读（600）

3. **定期更新 token**
   - 使用 `isTokenExpired()` 检查 token 是否过期
   - 过期后使用 refresh token 获取新的 access token

## 工作流程

### 第一次运行

```
1. 检查本地文件 -> 不存在
2. 打开浏览器进行 OAuth 授权
3. 获取 access token
4. 保存到 ~/.lark/auth.json
5. 程序继续执行
```

### 第二次运行

```
1. 检查本地文件 -> 存在
2. 加载认证信息
3. 检查是否过期 -> 未过期
4. 直接使用 token
5. 程序继续执行（无需浏览器授权）
```

### Token 过期后

```
1. 检查本地文件 -> 存在
2. 加载认证信息
3. 检查是否过期 -> 已过期
4. 删除本地文件
5. 重新进行 OAuth 授权
6. 保存新的 token
```

## 示例代码

完整示例请参考 `examples/index.ts`：

```typescript
import { LoginHandler, authStore } from 'jacky-lark-api';
import { getLarkConfig } from './config';

const config = getLarkConfig();

const main = async () => {
  try {
    // 可选：自定义存储路径
    // authStore.setStoragePath('./custom-auth.json');
    
    // 执行登录（会自动检查本地是否有有效 token）
    const authInfo = await LoginHandler.handleLogin(config);
    
    console.log('Access Token:', authInfo.token);
    console.log('过期时间:', new Date(authInfo.expiresAt).toLocaleString());
    
    // 使用 token 调用其他 API...
    
  } catch (error) {
    console.error('登录失败:', error);
  }
};

main();
```

## 命令行工具

### 清除存储文件

使用 npm 命令快速清除本地存储的认证信息：

```bash
npm run clear:storage
```

**效果：**
- 删除认证文件（`~/.lark/auth.json`）
- 如果目录为空，同时删除目录（`~/.lark/`）

**输出示例：**
```
✅ 已删除认证文件: /Users/xxx/.lark/auth.json
✅ 已删除存储目录: /Users/xxx/.lark
🎉 存储清除完成！
```

如果文件不存在：
```
ℹ️  认证文件不存在，无需清除
路径: /Users/xxx/.lark/auth.json
```

**使用场景：**
- 🔄 强制重新授权（清除旧 token）
- 🔀 切换不同的飞书账号
- 🧪 测试授权流程
- 🐛 解决认证相关的问题
- 🗑️ 清理敏感信息

## 故障排查

### 问题：无法创建存储目录

**错误信息：**
```
❌ 创建存储目录失败: EACCES: permission denied
```

**解决方案：**
- 检查文件系统权限
- 使用自定义路径：`authStore.setStoragePath('./auth.json')`

### 问题：无法读取存储文件

**错误信息：**
```
❌ 从文件加载认证信息失败: SyntaxError: Unexpected token
```

**解决方案：**
- 文件可能已损坏，删除文件重新授权
- 运行：`rm ~/.lark/auth.json`

### 问题：Token 总是过期

**可能原因：**
- 系统时间不正确
- Token 有效期设置错误

**解决方案：**
- 检查系统时间
- 查看 `expiresAt` 字段是否正确

