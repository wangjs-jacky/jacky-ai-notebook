# LARK_SCOPE 配置更新日志

## 📅 2025-10-30

### 🎯 问题
用户询问：**如何保证 LARK_SCOPE 环境变量中 `wiki:wiki` 和 `docx:document` 之间的空格不会丢失？**

### ✅ 解决方案
**使用引号包裹整个值**：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

---

## 📦 新增文件

### 1. 文档文件（4个）

| 文件名 | 说明 | 适用场景 |
|--------|------|---------|
| `docs/SCOPE-CONFIG.md` | 详细配置指南（英文）| 需要深入了解配置原理 |
| `docs/SCOPE-QUICK-REFERENCE.md` | 快速参考卡片（英文）| 快速查阅配置方法 |
| `docs/SCOPE配置说明-中文.md` | 中文详细说明 | 中文用户首选 |
| `SCOPE_CONFIG_UPDATE.md` | 更新说明文档 | 了解本次更新内容 |

### 2. 测试工具（1个）

| 文件名 | 说明 | 使用方法 |
|--------|------|---------|
| `examples/test-scope-config.ts` | SCOPE 配置测试脚本 | `npm run test:scope` |

---

## 📝 更新的文件

### 1. `docs/CONFIG.md`
- ✅ 添加了 `LARK_SCOPE` 环境变量说明
- ✅ 更新了 .env 配置示例
- ✅ 添加了配置注意事项

### 2. `README.md`
- ✅ 在快速开始部分添加了 LARK_SCOPE 示例
- ✅ 添加了 SCOPE 配置文档链接
- ✅ 更新了相关文档列表

### 3. `package.json`
- ✅ 添加了新的 npm 脚本：`npm run test:scope`

---

## 🚀 快速开始

### 1. 配置 .env 文件

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_REDIRECT_URI=http://localhost:3000/callback

# 使用引号包裹，空格分隔多个权限
LARK_SCOPE="wiki:wiki docx:document"
```

### 2. 测试配置

```bash
npm run test:scope
```

### 3. 查看文档

- 中文用户：阅读 `docs/SCOPE配置说明-中文.md`
- 快速参考：查看 `docs/SCOPE-QUICK-REFERENCE.md`
- 详细了解：阅读 `docs/SCOPE-CONFIG.md`

---

## 📚 配置方式对比

### ✅ 推荐（使用引号）

```env
# 双引号（推荐）
LARK_SCOPE="wiki:wiki docx:document"

# 单引号（也可以）
LARK_SCOPE='wiki:wiki docx:document'
```

**优点**：
- ✔️ 保证空格不会丢失
- ✔️ 符合 .env 文件规范
- ✔️ 适用于所有环境

### ⚠️ 不推荐（不用引号）

```env
LARK_SCOPE=wiki:wiki docx:document
```

**问题**：
- ⚠️ 某些环境可能会错误处理空格
- ⚠️ 不够明确

### ❌ 错误（错误的分隔符）

```env
# 使用逗号
LARK_SCOPE="wiki:wiki,docx:document"

# 使用分号
LARK_SCOPE="wiki:wiki;docx:document"

# 换行
LARK_SCOPE="wiki:wiki
docx:document"
```

**问题**：
- ❌ 不符合 OAuth 2.0 标准（必须用空格）

---

## 🔧 技术实现

### 1. 环境变量读取

```typescript
// src/config.ts (第 21 行)
const scope = process.env['LARK_SCOPE'] || "";
```

### 2. 自动添加 offline_access

```typescript
// src/core/oauth.ts (第 86 行)
scope: this.config.scope + (needRefreshToken ? ' offline_access' : ''),
```

### 3. URL 编码

```typescript
// src/core/oauth.ts (第 82-87 行)
const params = new URLSearchParams({
  client_id: this.config.appId,
  redirect_uri: this.config.redirectUri,
  response_type: 'code',
  scope: this.config.scope + (needRefreshToken ? ' offline_access' : ''),
});
```

URLSearchParams 会自动将空格编码为 `%20` 或 `+`

---

## 🧪 测试验证

运行测试命令：

```bash
npm run test:scope
```

**预期输出**：

```
============================================================
=== LARK_SCOPE 配置测试 ===
============================================================

1️⃣  读取环境变量配置
   ✅ LARK_SCOPE: "wiki:wiki docx:document"

2️⃣  分析 SCOPE 配置
   ✅ 配置了 2 个权限范围:
      1. wiki:wiki
      2. docx:document

3️⃣  生成 OAuth 授权 URL
   ...

4️⃣  验证 URL 中的 scope 参数
   ✅ URL 中的 scope: "wiki:wiki docx:document offline_access"
   ✅ 包含的权限（共 3 个）:
      1. ✓ wiki:wiki
      2. ✓ docx:document
      3. 🔄 [自动添加] offline_access

5️⃣  验证空格处理
   ✅ 空格处理正确（配置 2 个 → URL 2 个）

============================================================
✅ 测试完成！
============================================================
```

---

## 📖 常用权限范围

| 权限 | 说明 | 使用场景 |
|------|------|---------|
| `wiki:wiki` | 知识库权限 | 读取/创建知识库文档 |
| `docx:document` | 文档权限 | 操作飞书文档 |
| `bitable:app` | 多维表格 | 读写表格数据 |
| `sheets:spreadsheet` | 电子表格 | 操作电子表格 |
| `drive:drive` | 云文档 | 访问云文档资源 |
| `contact:user.base` | 用户信息 | 获取用户基本信息 |
| `offline_access` | 离线访问 | 自动添加，无需配置 |

---

## 📋 配置示例

### 示例 1：知识库 + 文档

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

---

## 🔗 相关文档

### 项目文档
- [SCOPE 配置指南（中文）](./docs/SCOPE配置说明-中文.md) ⭐ **推荐**
- [SCOPE 详细配置](./docs/SCOPE-CONFIG.md)
- [SCOPE 快速参考](./docs/SCOPE-QUICK-REFERENCE.md)
- [配置管理](./docs/CONFIG.md)
- [README](./README.md)

### 官方文档
- [飞书开放平台 - OAuth 2.0](https://open.feishu.cn/document/common-capabilities/sso/api/oauth)
- [飞书开放平台 - 权限范围](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)

---

## ❓ 常见问题

### Q1: 空格会丢失吗？
**A**: 不会。使用引号包裹后，dotenv 会正确保留空格。

### Q2: 必须使用引号吗？
**A**: 不是必须的，但**强烈推荐**使用引号。

### Q3: 可以使用逗号分隔吗？
**A**: 不可以。OAuth 2.0 标准要求使用空格分隔。

### Q4: offline_access 需要手动配置吗？
**A**: 不需要。SDK 会自动添加。

### Q5: 如何验证配置是否正确？
**A**: 运行 `npm run test:scope` 进行验证。

---

## 🎉 总结

### 问题
如何保证 `wiki:wiki` 和 `docx:document` 之间的空格不丢失？

### 答案
在 `.env` 文件中使用引号包裹：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

### 验证
```bash
npm run test:scope
```

### 了解更多
查看 `docs/SCOPE配置说明-中文.md`

---

**更新完成！** 🎊



