# LARK_SCOPE 配置文档导航

## 🎯 核心问题

**如何保证 `LARK_SCOPE` 中 `wiki:wiki` 和 `docx:document` 之间的空格不会丢失？**

## ✅ 答案（TL;DR）

在 `.env` 文件中使用**引号包裹**：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

## 📚 文档导航

根据您的需求，选择合适的文档：

### 1️⃣ 我想快速了解配置方法

👉 **推荐阅读**：[SCOPE 快速参考](./docs/SCOPE-QUICK-REFERENCE.md)

**内容**：
- ✅ 正确/错误示例对比
- ✅ 常用权限速查表
- ✅ 快速问题解答
- ⏱️ 阅读时间：3-5 分钟

---

### 2️⃣ 我是中文用户，想详细了解

👉 **推荐阅读**：[SCOPE 配置说明（中文）](./docs/SCOPE配置说明-中文.md)

**内容**：
- ✅ 完整的中文说明
- ✅ 技术原理解释
- ✅ 验证方法
- ✅ 不同环境的配置方式
- ⏱️ 阅读时间：10-15 分钟

---

### 3️⃣ 我需要完整的英文技术文档

👉 **推荐阅读**：[SCOPE Configuration Guide](./docs/SCOPE-CONFIG.md)

**内容**：
- ✅ Complete configuration guide
- ✅ Technical implementation details
- ✅ Troubleshooting guide
- ⏱️ Reading time: 15-20 minutes

---

### 4️⃣ 我想了解本次更新的内容

👉 **推荐阅读**：[SCOPE 配置更新日志](./CHANGELOG_SCOPE.md)

**内容**：
- ✅ 新增文件列表
- ✅ 更新的文件
- ✅ 技术实现说明
- ✅ 测试方法
- ⏱️ 阅读时间：5-10 分钟

---

### 5️⃣ 我想测试我的配置是否正确

👉 **运行测试命令**：

```bash
npm run test:scope
```

**说明**：
- ✅ 自动读取 .env 配置
- ✅ 验证空格处理
- ✅ 检查 URL 编码
- ✅ 显示详细测试结果

---

### 6️⃣ 我想查看通用配置文档

👉 **推荐阅读**：[配置管理文档](./docs/CONFIG.md)

**内容**：
- ✅ 所有环境变量说明
- ✅ 配置方法
- ✅ 错误处理
- ⏱️ 阅读时间：5-8 分钟

---

## 🗂️ 完整文档列表

### 新增文档（关于 SCOPE 配置）

| 文档名 | 语言 | 类型 | 推荐度 |
|--------|------|------|--------|
| [SCOPE-QUICK-REFERENCE.md](./docs/SCOPE-QUICK-REFERENCE.md) | 英文 | 快速参考 | ⭐⭐⭐⭐⭐ |
| [SCOPE配置说明-中文.md](./docs/SCOPE配置说明-中文.md) | 中文 | 详细指南 | ⭐⭐⭐⭐⭐ |
| [SCOPE-CONFIG.md](./docs/SCOPE-CONFIG.md) | 英文 | 详细指南 | ⭐⭐⭐⭐ |
| [CHANGELOG_SCOPE.md](./CHANGELOG_SCOPE.md) | 中英 | 更新日志 | ⭐⭐⭐ |
| [SCOPE_CONFIG_UPDATE.md](./SCOPE_CONFIG_UPDATE.md) | 中英 | 更新说明 | ⭐⭐⭐ |

### 测试工具

| 文件名 | 使用方法 |
|--------|---------|
| `examples/test-scope-config.ts` | `npm run test:scope` |

### 更新的文档

| 文档名 | 更新内容 |
|--------|---------|
| [README.md](./README.md) | 添加了 LARK_SCOPE 配置示例 |
| [CONFIG.md](./docs/CONFIG.md) | 添加了 LARK_SCOPE 说明 |
| [package.json](./package.json) | 添加了测试脚本 |

---

## 🚀 快速上手

### 第一步：配置 .env

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_REDIRECT_URI=http://localhost:3000/callback

# 重点：使用引号包裹，空格分隔
LARK_SCOPE="wiki:wiki docx:document"
```

### 第二步：测试配置

```bash
npm run test:scope
```

### 第三步：开始使用

```typescript
import { LoginHandler, getLarkConfig } from 'jacky-lark-api';

const config = getLarkConfig();
const authInfo = await LoginHandler.handleLogin(config);
```

---

## 📋 常用配置示例

### 基础配置（知识库 + 文档）

```env
LARK_SCOPE="wiki:wiki docx:document"
```

### 扩展配置（+ 多维表格）

```env
LARK_SCOPE="wiki:wiki docx:document bitable:app"
```

### 完整配置（所有权限）

```env
LARK_SCOPE="wiki:wiki docx:document bitable:app sheets:spreadsheet drive:drive contact:user.base"
```

---

## ⚠️ 重要提示

### ✅ 正确

```env
# 使用引号
LARK_SCOPE="wiki:wiki docx:document"
```

### ❌ 错误

```env
# 不要使用逗号
LARK_SCOPE="wiki:wiki,docx:document"
```

---

## 🔗 外部链接

- [飞书开放平台](https://open.feishu.cn/)
- [OAuth 2.0 文档](https://open.feishu.cn/document/common-capabilities/sso/api/oauth)
- [权限范围说明](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)

---

## ❓ 需要帮助？

### 问题排查流程

1. **检查配置格式**
   - 是否使用了引号？
   - 是否使用空格分隔（不是逗号）？

2. **运行测试**
   ```bash
   npm run test:scope
   ```

3. **查看文档**
   - 中文用户：[SCOPE配置说明-中文.md](./docs/SCOPE配置说明-中文.md)
   - English: [SCOPE-CONFIG.md](./docs/SCOPE-CONFIG.md)

4. **验证 URL**
   - 检查授权 URL 中的 scope 参数
   - 确认空格被编码为 `%20` 或 `+`

---

## 📊 文档树状图

```
jacky-lark-api/
├── 📄 README.md                          # 项目主文档
├── 📄 CHANGELOG_SCOPE.md                  # SCOPE 更新日志 ⭐
├── 📄 SCOPE_CONFIG_UPDATE.md              # SCOPE 更新说明
├── 📄 SCOPE_CONFIG_导航.md                # 本文档
├── docs/
│   ├── 📄 CONFIG.md                       # 配置管理
│   ├── 📄 SCOPE-CONFIG.md                 # SCOPE 详细指南（英文）⭐
│   ├── 📄 SCOPE-QUICK-REFERENCE.md        # SCOPE 快速参考 ⭐
│   └── 📄 SCOPE配置说明-中文.md            # SCOPE 详细说明（中文）⭐
├── examples/
│   └── 📄 test-scope-config.ts            # SCOPE 测试脚本
└── package.json                          # 包含 test:scope 命令

⭐ = 推荐优先阅读
```

---

## 🎯 总结

### 核心答案

```env
LARK_SCOPE="wiki:wiki docx:document"
```

### 推荐阅读顺序

1. 本导航文档（您正在阅读）
2. [SCOPE 快速参考](./docs/SCOPE-QUICK-REFERENCE.md) 或 [中文详细说明](./docs/SCOPE配置说明-中文.md)
3. 运行 `npm run test:scope` 验证配置
4. 开始使用！

---

**祝您使用愉快！** 🎉

