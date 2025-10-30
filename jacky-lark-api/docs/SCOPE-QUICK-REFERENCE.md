# LARK_SCOPE 快速参考

## TL;DR（太长不看版）

在 `.env` 文件中使用**双引号**包裹，多个权限用**空格**分隔：

```env
LARK_SCOPE="wiki:wiki docx:document"
```

## 正确示例 ✅

### 推荐写法（使用引号）

```env
# ✅ 推荐：双引号
LARK_SCOPE="wiki:wiki docx:document"

# ✅ 也可以：单引号
LARK_SCOPE='wiki:wiki docx:document'

# ✅ 单个权限可以不用引号
LARK_SCOPE=wiki:wiki
```

### 完整示例

```env
# 基础配置
LARK_APP_ID=cli_a1b2c3d4e5f6g7h8
LARK_APP_SECRET=your_app_secret_here
LARK_REDIRECT_URI=http://localhost:3000/callback

# 权限配置
LARK_SCOPE="wiki:wiki docx:document bitable:app"
```

## 错误示例 ❌

```env
# ❌ 错误：使用逗号分隔（OAuth 2.0 标准要求空格）
LARK_SCOPE="wiki:wiki,docx:document"

# ❌ 错误：使用分号分隔
LARK_SCOPE="wiki:wiki;docx:document"

# ❌ 错误：每行一个
LARK_SCOPE="wiki:wiki
docx:document"

# ⚠️  不推荐：没有引号（某些环境可能有问题）
LARK_SCOPE=wiki:wiki docx:document
```

## 常用权限速查表

| 权限范围 | 说明 | 典型用途 |
|---------|------|---------|
| `wiki:wiki` | 知识库 | 读取/创建知识库文档 |
| `docx:document` | 文档 | 操作飞书文档 |
| `bitable:app` | 多维表格 | 读取/写入表格数据 |
| `sheets:spreadsheet` | 电子表格 | 操作电子表格 |
| `drive:drive` | 云文档 | 访问云文档资源 |
| `contact:user.base` | 用户信息 | 获取用户基本信息 |

**注意：** `offline_access` 会被自动添加，用于获取 refresh_token。

## 测试你的配置

运行测试命令验证配置：

```bash
npm run test:scope
```

预期输出：
```
=== LARK_SCOPE 配置测试 ===
1️⃣  读取环境变量配置
   ✅ LARK_SCOPE: "wiki:wiki docx:document"

2️⃣  分析 SCOPE 配置
   ✅ 配置了 2 个权限范围:
      1. wiki:wiki
      2. docx:document
...
```

## 常见问题速答

### Q: 空格会丢失吗？
**A:** 不会。使用引号包裹后，空格会被正确保留。

### Q: 必须用引号吗？
**A:** 不是必须的，但**强烈推荐**，可以避免很多问题。

### Q: 可以换行吗？
**A:** 不可以。所有权限必须在同一行，用空格分隔。

### Q: 需要手动添加 offline_access 吗？
**A:** 不需要。SDK 会自动添加。

### Q: 如何验证配置正确？
**A:** 运行 `npm run test:scope` 查看详细测试结果。

## 更多信息

- 详细文档：[SCOPE-CONFIG.md](./SCOPE-CONFIG.md)
- 配置说明：[CONFIG.md](./CONFIG.md)
- 飞书官方文档：[OAuth 2.0 权限范围](https://open.feishu.cn/document/common-capabilities/sso/api/oauth)

## 代码中动态设置

如果需要在代码中动态设置权限：

```typescript
import { createLarkConfig } from 'jacky-lark-api';

const config = createLarkConfig({
  scope: 'wiki:wiki docx:document bitable:app'
});
```

## 环境变量优先级

```
代码中指定的 scope > 环境变量 LARK_SCOPE > 空字符串 ""
```

---

**提示：** 如果遇到权限问题，首先检查 `.env` 文件中的 `LARK_SCOPE` 配置是否正确。

