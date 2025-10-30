# LARK_SCOPE 配置说明（中文）

## 核心要点

**如何保证 `wiki:wiki` 和 `docx:document` 中间的空格不丢失？**

答案：**使用引号包裹整个字符串**

## 推荐配置方式

在 `.env` 文件中这样写：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

## 为什么要用引号？

1. **保证空格不丢失**：某些环境下，不加引号的空格可能被错误处理
2. **符合规范**：这是 `.env` 文件的标准写法
3. **避免歧义**：明确表示这是一个完整的字符串值

## 三种写法对比

### ✅ 推荐：使用双引号

```env
LARK_SCOPE="wiki:wiki docx:document"
```

- **优点**：最安全，空格一定不会丢失
- **适用**：所有环境

### ✅ 可选：使用单引号

```env
LARK_SCOPE='wiki:wiki docx:document'
```

- **优点**：与双引号效果相同
- **适用**：根据个人习惯选择

### ⚠️ 不推荐：不用引号

```env
LARK_SCOPE=wiki:wiki docx:document
```

- **风险**：某些环境可能会处理空格
- **建议**：仅用于测试环境

## 完整配置示例

```env
# 飞书应用基础配置
LARK_APP_ID=cli_a1b2c3d4e5f6g7h8
LARK_APP_SECRET=your_app_secret_here
LARK_REDIRECT_URI=http://localhost:3000/callback

# 权限范围配置（重点：用引号包裹，空格分隔）
LARK_SCOPE="wiki:wiki docx:document"
```

## 技术原理

### 1. dotenv 库的处理

```javascript
// dotenv 读取 .env 文件时
// LARK_SCOPE="wiki:wiki docx:document"
// 会被解析为：
{
  LARK_SCOPE: "wiki:wiki docx:document"  // 空格被保留
}
```

### 2. URL 编码

```typescript
// 在生成 OAuth 授权链接时
const params = new URLSearchParams({
  scope: "wiki:wiki docx:document offline_access"
});

// 空格会被自动编码为 %20 或 +
// 结果：scope=wiki%3Awiki+docx%3Adocument+offline_access
```

### 3. 飞书服务器解码

飞书服务器收到请求后，会自动将 URL 编码的字符串解码回原始格式：
- `wiki%3Awiki` → `wiki:wiki`
- `+` 或 `%20` → 空格
- `docx%3Adocument` → `docx:document`

## 验证配置是否正确

### 方法 1：运行测试脚本

```bash
npm run test:scope
```

你会看到详细的测试输出，包括：
- 读取的环境变量值
- 解析后的权限列表
- 生成的授权 URL
- URL 中的 scope 参数

### 方法 2：在代码中打印

```typescript
import { getLarkConfig } from './src/config.js';

const config = getLarkConfig();
console.log('配置的 scope:', config.scope);
// 输出：配置的 scope: wiki:wiki docx:document
```

### 方法 3：检查授权 URL

生成授权链接后，查看 URL 中的 `scope` 参数：

```
https://accounts.feishu.cn/open-apis/authen/v1/authorize?
  client_id=cli_xxx&
  scope=wiki%3Awiki+docx%3Adocument+offline_access&
  ...
```

如果看到 `wiki%3Awiki+docx%3Adocument`，说明空格处理正确（`+` 就是编码后的空格）。

## 常见错误

### ❌ 错误 1：使用逗号分隔

```env
LARK_SCOPE="wiki:wiki,docx:document"
```

**问题**：OAuth 2.0 标准要求使用空格，不是逗号。

### ❌ 错误 2：换行分隔

```env
LARK_SCOPE="wiki:wiki
docx:document"
```

**问题**：所有权限必须在同一行。

### ❌ 错误 3：分号分隔

```env
LARK_SCOPE="wiki:wiki;docx:document"
```

**问题**：不符合 OAuth 2.0 标准。

## 常用权限范围

| 权限 | 说明 | 使用场景 |
|------|------|---------|
| `wiki:wiki` | 知识库权限 | 读取、创建、修改知识库文档 |
| `docx:document` | 文档权限 | 操作飞书文档 |
| `bitable:app` | 多维表格权限 | 读写多维表格数据 |
| `sheets:spreadsheet` | 电子表格权限 | 操作电子表格 |
| `drive:drive` | 云文档权限 | 访问云文档资源 |
| `contact:user.base` | 用户基本信息 | 获取用户姓名、头像等 |

**注意**：`offline_access` 权限会被 SDK 自动添加，无需手动配置。

## 不同环境的配置

### 开发环境

在 `.env` 文件中配置：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

### 生产环境

#### Docker

```dockerfile
ENV LARK_SCOPE="wiki:wiki docx:document"
```

#### 系统环境变量（Linux/macOS）

```bash
export LARK_SCOPE="wiki:wiki docx:document"
```

#### 系统环境变量（Windows）

```cmd
set LARK_SCOPE="wiki:wiki docx:document"
```

#### 云平台（如 Vercel、Heroku）

在环境变量配置界面直接输入：

```
变量名：LARK_SCOPE
变量值：wiki:wiki docx:document
```

**注意**：在云平台配置时通常不需要引号。

## 代码中动态配置

如果不想使用环境变量，也可以在代码中直接配置：

```typescript
import { createLarkConfig } from 'jacky-lark-api';

const config = createLarkConfig({
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
  redirectUri: 'http://localhost:3000/callback',
  scope: 'wiki:wiki docx:document bitable:app'
});
```

## 总结

**保证空格不丢失的关键：使用引号包裹**

```env
# ✅ 正确
LARK_SCOPE="wiki:wiki docx:document"

# ⚠️  有风险
LARK_SCOPE=wiki:wiki docx:document

# ❌ 错误
LARK_SCOPE="wiki:wiki,docx:document"
```

## 相关文档

- [详细配置文档](./SCOPE-CONFIG.md)
- [快速参考](./SCOPE-QUICK-REFERENCE.md)
- [配置管理](./CONFIG.md)

## 遇到问题？

1. 检查 `.env` 文件中是否使用了引号
2. 确认多个权限之间是否用空格分隔
3. 运行 `npm run test:scope` 验证配置
4. 查看授权 URL 中的 scope 参数是否正确编码

**还有问题？** 查看完整的 [SCOPE-CONFIG.md](./SCOPE-CONFIG.md) 文档。

