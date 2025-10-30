# LARK_SCOPE 权限配置指南

## 概述

`LARK_SCOPE` 环境变量用于指定飞书 OAuth 授权时请求的权限范围。正确配置该变量可确保您的应用获得访问相应资源的权限。

## 配置格式

### 基本格式

多个权限范围使用**空格**分隔（符合 OAuth 2.0 标准）：

```env
LARK_SCOPE="scope1 scope2 scope3"
```

### 在 .env 文件中配置（推荐方式）

#### 方式 1：使用双引号（推荐）✅

```env
LARK_SCOPE="wiki:wiki docx:document"
```

**优点：**
- 明确表示这是一个完整的字符串
- 避免某些环境下空格被错误处理
- 符合标准的 .env 文件规范

#### 方式 2：不使用引号

```env
LARK_SCOPE=wiki:wiki docx:document
```

**说明：**
- dotenv 库会正确读取空格
- 但在某些特殊环境下可能会有问题
- 不推荐用于生产环境

#### 方式 3：单引号

```env
LARK_SCOPE='wiki:wiki docx:document'
```

**说明：**
- 与双引号效果相同
- 根据个人偏好选择

## 常用权限范围

| 权限范围 | 说明 | 使用场景 |
|---------|------|---------|
| `wiki:wiki` | 知识库访问权限 | 读取/创建/修改知识库文档 |
| `docx:document` | 文档访问权限 | 读取/编辑飞书文档 |
| `bitable:app` | 多维表格权限 | 操作多维表格数据 |
| `sheets:spreadsheet` | 电子表格权限 | 读取/编辑电子表格 |
| `drive:drive` | 云文档权限 | 访问云文档资源 |
| `contact:user.base` | 通讯录基础信息 | 获取用户基本信息 |
| `offline_access` | 离线访问 | 获取 refresh_token（自动添加）|

## 配置示例

### 示例 1：知识库 + 文档权限

```env
LARK_SCOPE="wiki:wiki docx:document"
```

### 示例 2：知识库 + 文档 + 多维表格

```env
LARK_SCOPE="wiki:wiki docx:document bitable:app"
```

### 示例 3：完整权限

```env
LARK_SCOPE="wiki:wiki docx:document bitable:app sheets:spreadsheet drive:drive contact:user.base"
```

### 示例 4：仅知识库权限

```env
LARK_SCOPE="wiki:wiki"
```

## 代码中的处理

### 自动处理

SDK 会自动处理以下事项：

1. **自动添加 offline_access**：用于获取 refresh_token
   ```typescript
   // oauth.ts 中的实现
   scope: this.config.scope + (needRefreshToken ? ' offline_access' : ''),
   ```

2. **URL 编码**：URLSearchParams 会自动将空格编码为 `%20` 或 `+`
   ```typescript
   const params = new URLSearchParams({
     scope: this.config.scope + ' offline_access',
     // 空格会被自动编码
   });
   ```

3. **从环境变量读取**：
   ```typescript
   // config.ts 中的实现
   const scope = process.env['LARK_SCOPE'] || "";
   ```

### 验证配置

您可以在代码中验证 scope 配置是否正确：

```typescript
import { getLarkConfig } from './src/config.js';

const config = getLarkConfig();
console.log('配置的权限范围:', config.scope);

// 输出示例：配置的权限范围: wiki:wiki docx:document
```

## 常见问题

### Q1: 空格在环境变量中会丢失吗？

**答：** 不会。使用引号包裹后，dotenv 会正确解析空格：

```env
# ✅ 正确 - 空格会被保留
LARK_SCOPE="wiki:wiki docx:document"

# ⚠️  某些环境可能有问题
LARK_SCOPE=wiki:wiki docx:document

# ❌ 错误 - 不要使用逗号分隔
LARK_SCOPE="wiki:wiki,docx:document"
```

### Q2: 如何确认 scope 被正确传递？

**答：** 可以通过以下方式验证：

1. 在授权 URL 中查看：
   ```typescript
   const authUrl = oauthHelper.generateAuthUrl();
   console.log(authUrl);
   // 查看 URL 中的 scope 参数是否包含所有权限
   // 例如: ...&scope=wiki%3Awiki%20docx%3Adocument%20offline_access
   ```

2. 查看生成的授权链接中的 `scope` 参数，空格会被编码为 `%20`

### Q3: offline_access 需要手动添加吗？

**答：** 不需要。SDK 会自动添加 `offline_access`，用于获取 refresh_token。

### Q4: 可以使用其他分隔符吗？

**答：** 不可以。OAuth 2.0 标准规定必须使用空格分隔多个 scope。

### Q5: 如何在代码中动态设置 scope？

**答：** 使用 `createLarkConfig` 覆盖环境变量：

```typescript
import { createLarkConfig } from './src/config.js';

const config = createLarkConfig({
  scope: 'wiki:wiki docx:document bitable:app'
});
```

## 测试配置

创建测试脚本验证配置：

```typescript
// test-scope.ts
import { getLarkConfig } from './src/config.js';
import { LarkOAuthHelper } from './src/core/oauth.js';
import express from 'express';

const config = getLarkConfig();
const app = express();
const oauthHelper = new LarkOAuthHelper(app, config);

console.log('=== 权限配置测试 ===');
console.log('配置的 scope:', config.scope);
console.log('\n生成的授权 URL:');
const authUrl = oauthHelper.generateAuthUrl();
console.log(authUrl);
console.log('\n提取的 scope 参数:');
const url = new URL(authUrl);
console.log(url.searchParams.get('scope'));
```

运行测试：

```bash
npx tsx test-scope.ts
```

预期输出：
```
=== 权限配置测试 ===
配置的 scope: wiki:wiki docx:document

生成的授权 URL:
https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=...&scope=wiki%3Awiki+docx%3Adocument+offline_access...

提取的 scope 参数:
wiki:wiki docx:document offline_access
```

## 最佳实践

1. **使用引号包裹**：始终在 .env 文件中使用引号
2. **最小权限原则**：只请求必要的权限
3. **版本控制**：不要将 `.env` 文件提交到代码仓库
4. **文档说明**：在 `.env.example` 中提供配置示例
5. **测试验证**：部署前验证权限配置是否正确

## 调试技巧

如果遇到权限问题，可以：

1. 检查授权 URL 中的 scope 参数
2. 在飞书开放平台查看应用的权限配置
3. 确认用户在授权时看到的权限列表
4. 使用浏览器开发者工具查看网络请求

## 参考资料

- [飞书开放平台 - OAuth 2.0](https://open.feishu.cn/document/common-capabilities/sso/api/oauth)
- [飞书开放平台 - 权限范围说明](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749#section-3.3)

