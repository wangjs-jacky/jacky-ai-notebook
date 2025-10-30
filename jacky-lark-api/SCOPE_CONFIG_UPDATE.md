# LARK_SCOPE 配置更新说明

## 更新日期
2025-10-30

## 问题描述

用户询问如何保证 `LARK_SCOPE` 环境变量中 `wiki:wiki` 和 `docx:document` 之间的空格不会丢失。

## 解决方案

### 核心答案

**使用引号包裹整个值**：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

## 本次更新内容

### 1. 新增文档

#### ✨ `docs/SCOPE-CONFIG.md`（详细配置指南）
- 完整的 LARK_SCOPE 配置说明
- 配置格式和最佳实践
- 常用权限范围说明
- 代码中的自动处理机制
- 常见问题解答（Q&A）
- 测试和验证方法
- 调试技巧

#### ✨ `docs/SCOPE-QUICK-REFERENCE.md`（快速参考）
- TL;DR 版本
- 正确/错误示例对比
- 常用权限速查表
- 快速问题解答

#### ✨ `docs/SCOPE配置说明-中文.md`（中文详细说明）
- 中文用户友好版本
- 技术原理解释
- 完整配置示例
- 不同环境的配置方式
- 验证方法

### 2. 更新现有文档

#### 📝 `docs/CONFIG.md`
- 添加了 `LARK_SCOPE` 环境变量说明
- 更新了 .env 配置示例
- 添加了 SCOPE 配置注意事项

#### 📝 `README.md`
- 在快速开始部分添加了 LARK_SCOPE 配置示例
- 添加了 SCOPE 配置指南的链接
- 在相关文档列表中添加了 SCOPE 配置文档

### 3. 新增测试工具

#### 🧪 `examples/test-scope-config.ts`
完整的 SCOPE 配置测试脚本，包含：
- 读取和显示当前配置
- 分析 scope 权限列表
- 生成和验证授权 URL
- 检查 URL 编码
- 验证空格处理
- 显示常用权限说明
- 提供配置建议

#### ⚙️ `package.json`
添加了新的 npm 脚本：
```bash
npm run test:scope
```

## 技术原理

### 1. 环境变量读取

```typescript
// src/config.ts
const scope = process.env['LARK_SCOPE'] || "";
```

使用 dotenv 库读取 .env 文件，引号包裹的字符串中的空格会被正确保留。

### 2. URL 编码

```typescript
// src/core/oauth.ts
const params = new URLSearchParams({
  scope: this.config.scope + ' offline_access',
});
```

URLSearchParams 会自动将空格编码为 `%20` 或 `+`，符合 OAuth 2.0 标准。

### 3. 自动添加 offline_access

```typescript
scope: this.config.scope + (needRefreshToken ? ' offline_access' : ''),
```

SDK 会自动添加 `offline_access` 权限以获取 refresh_token。

## 使用方法

### 方法 1：在 .env 文件中配置（推荐）

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_REDIRECT_URI=http://localhost:3000/callback

# 使用引号包裹，空格分隔多个权限
LARK_SCOPE="wiki:wiki docx:document"
```

### 方法 2：在代码中动态配置

```typescript
import { createLarkConfig } from 'jacky-lark-api';

const config = createLarkConfig({
  scope: 'wiki:wiki docx:document bitable:app'
});
```

### 验证配置

运行测试脚本：

```bash
npm run test:scope
```

预期输出示例：

```
============================================================
=== LARK_SCOPE 配置测试 ===
============================================================

1️⃣  读取环境变量配置
   ✅ LARK_APP_ID: cli_xxxxxx
   ✅ LARK_REDIRECT_URI: http://localhost:3000/callback
   ✅ LARK_SCOPE: "wiki:wiki docx:document"

2️⃣  分析 SCOPE 配置
   ✅ 配置了 2 个权限范围:
      1. wiki:wiki
      2. docx:document

3️⃣  生成 OAuth 授权 URL
   授权 URL:
   https://accounts.feishu.cn/open-apis/authen/v1/authorize?...

4️⃣  验证 URL 中的 scope 参数
   ✅ URL 中的 scope: "wiki:wiki docx:document offline_access"
   ✅ 包含的权限（共 3 个）:
      1. ✓ wiki:wiki
      2. ✓ docx:document
      3. 🔄 [自动添加] offline_access

5️⃣  验证空格处理
   ✅ 空格处理正确（配置 2 个 → URL 2 个）

6️⃣  常用权限范围说明
   • wiki:wiki: 知识库访问权限
   • docx:document: 文档访问权限
   • offline_access: 离线访问（获取 refresh_token）

7️⃣  配置建议
   ...

============================================================
✅ 测试完成！
详细文档请参考：docs/SCOPE-CONFIG.md
============================================================
```

## 配置最佳实践

### ✅ 推荐

```env
# 使用双引号
LARK_SCOPE="wiki:wiki docx:document"

# 或使用单引号
LARK_SCOPE='wiki:wiki docx:document'
```

### ⚠️ 不推荐

```env
# 不使用引号（某些环境可能有问题）
LARK_SCOPE=wiki:wiki docx:document
```

### ❌ 错误

```env
# 使用逗号分隔（不符合 OAuth 2.0 标准）
LARK_SCOPE="wiki:wiki,docx:document"

# 使用分号分隔
LARK_SCOPE="wiki:wiki;docx:document"

# 换行分隔
LARK_SCOPE="wiki:wiki
docx:document"
```

## 常用权限范围

| 权限 | 说明 |
|------|------|
| `wiki:wiki` | 知识库访问权限 |
| `docx:document` | 文档访问权限 |
| `bitable:app` | 多维表格权限 |
| `sheets:spreadsheet` | 电子表格权限 |
| `drive:drive` | 云文档权限 |
| `contact:user.base` | 通讯录基础信息 |
| `offline_access` | 离线访问（自动添加）|

## 相关文档

- [SCOPE-CONFIG.md](./docs/SCOPE-CONFIG.md) - 详细配置指南
- [SCOPE-QUICK-REFERENCE.md](./docs/SCOPE-QUICK-REFERENCE.md) - 快速参考
- [SCOPE配置说明-中文.md](./docs/SCOPE配置说明-中文.md) - 中文详细说明
- [CONFIG.md](./docs/CONFIG.md) - 配置管理文档

## 总结

**问题**：如何保证 `wiki:wiki` 和 `docx:document` 之间的空格不丢失？

**答案**：在 `.env` 文件中使用引号包裹整个值：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

**验证**：运行 `npm run test:scope` 测试配置是否正确。

## 技术支持

如果遇到任何问题：
1. 查看详细文档 `docs/SCOPE-CONFIG.md`
2. 运行测试脚本 `npm run test:scope`
3. 检查授权 URL 中的 scope 参数
4. 确认飞书开放平台的应用权限配置

