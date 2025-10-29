# 配置管理

本项目使用 `dotenv` 来管理环境变量配置。

## 环境变量

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| `LARK_APP_ID` | 飞书应用 ID | 是 | `cli_xxxxxx` |
| `LARK_APP_SECRET` | 飞书应用密钥 | 是 | `your_app_secret` |
| `LARK_REDIRECT_URI` | OAuth 回调地址 | 是 | `http://localhost:3000/callback` |

## 快速开始

### 1. 创建环境变量文件

```bash
# 复制示例配置文件
cp .env.example .env
```

### 2. 编辑 `.env` 文件

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_REDIRECT_URI=http://localhost:3000/callback
```

### 3. 在代码中使用

```typescript
import { getLarkConfig } from './src/config.js';

// 从 .env 加载配置
const config = getLarkConfig();

// 使用配置
const apiClient = new LarkApiClient(config);
```

## 配置方法

### 方法 1: 使用 `getLarkConfig()`

从 `.env` 文件自动加载配置：

```typescript
import { getLarkConfig } from './src/index.js';

const config = getLarkConfig();
```

### 方法 2: 使用 `createLarkConfig()` 覆盖

从环境变量加载，但可以覆盖部分配置：

```typescript
import { createLarkConfig } from './src/index.js';

const config = createLarkConfig({
  redirectUri: 'https://your-domain.com/callback',
});
```

### 方法 3: 手动指定配置

直接传递配置对象：

```typescript
const config = {
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
  redirectUri: 'http://localhost:3000/callback',
};
```

## 错误处理

如果缺少必要的环境变量，`getLarkConfig()` 会抛出错误：

```typescript
try {
  const config = getLarkConfig();
} catch (error) {
  console.error('配置错误:', error.message);
  // 输出: 请在 .env 文件中配置 LARK_APP_ID
}
```

## 注意事项

1. **开发环境**: 使用 `.env` 文件，已添加到 `.gitignore`
2. **生产环境**: 请使用环境变量设置，不要提交 `.env` 文件
3. **安全性**: 妥善保管 `LARK_APP_SECRET`，不要提交到版本控制





