# Token Extractor 更新日志

## 2025-10-30 - getTokenOnly 功能增强

### 🎉 主要变更

`getTokenOnly()` 函数现在返回一个对象，包含 `token` 和 `objType`，而不仅仅是字符串。这使得从 URL 中提取 token 时可以自动识别文档类型，无需手动指定。

### ✨ 新增功能

#### 1. 新的返回类型 `TokenWithType`

```typescript
interface TokenWithType {
  token: string;           // Token 值
  objType: ObjType | null; // 对象类型: 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides' | 'wiki' | null
}
```

#### 2. 更新的 `getTokenOnly()` 函数

```typescript
// 之前 (返回 string)
const token = getTokenOnly(url);

// 现在 (返回 TokenWithType)
const { token, objType } = getTokenOnly(url);
```

#### 3. 新增 `getTokenString()` 函数（向后兼容）

如果你只需要 token 字符串，可以使用新的 `getTokenString()` 函数：

```typescript
const token = getTokenString(url); // 返回 string
```

### 📝 使用示例

#### 基本使用

```typescript
import { getTokenOnly } from 'jacky-lark-api';

// 自动识别文档类型
const { token, objType } = getTokenOnly('https://sample.feishu.cn/docx/abc123');
console.log(token);    // 'abc123'
console.log(objType);  // 'docx'
```

#### 在 API 调用中使用

```typescript
import { getTokenOnly } from 'jacky-lark-api';

const url = 'https://xxx.feishu.cn/wiki/N3yNwV4oMicO0UkIpk7crQ2wndg';
const { token: nodeToken, objType } = getTokenOnly(url);

// 自动使用正确的类型调用 API
const node = await wikiNodeAPI.getNode(nodeToken, objType || 'wiki');
```

#### 支持的文档类型映射

| URL 路径 | LarkResourceType | ObjType | 说明 |
|---------|------------------|---------|------|
| `/docs/xxx` | `DOC` | `'doc'` | 旧版文档 |
| `/docx/xxx` | `DOCUMENT` | `'docx'` | 新版文档 |
| `/sheets/xxx` | `SPREADSHEET` | `'sheet'` | 电子表格 |
| `/base/xxx` | `BASE` | `'bitable'` | 多维表格 |
| `/wiki/xxx` | `WIKI_NODE` | `'wiki'` | Wiki 节点 |
| `/file/xxx` | `FILE` | `'file'` | 云空间文件 |

### 🔧 API 变更

#### 新增

- `TokenWithType` 接口
- `getTokenString(url: string): string` 函数（向后兼容）

#### 修改

- `getTokenOnly(url: string)`: `string` → `TokenWithType`

#### 标记为废弃

- 无（`getTokenString` 提供向后兼容）

### 📦 内部实现变更

1. **类型统一**：`ObjType` 类型统一使用 `src/core/types/api-types.ts` 中的定义
2. **类型转换**：新增 `mapResourceTypeToObjType()` 函数，将 `LarkResourceType` 映射到 `ObjType`
3. **导出优化**：避免类型重复导出，解决了 TypeScript 编译冲突

### 🚀 迁移指南

#### 如果你使用 `getTokenOnly()` 并期望得到字符串

**选项 1：更新为解构赋值（推荐）**
```typescript
// 之前
const nodeToken = getTokenOnly(url);

// 现在 - 推荐方式
const { token: nodeToken, objType } = getTokenOnly(url);
```

**选项 2：使用 `getTokenString()`**
```typescript
// 之前
const nodeToken = getTokenOnly(url);

// 现在 - 向后兼容方式
const nodeToken = getTokenString(url);
```

### ✅ 测试验证

运行测试：
```bash
node examples/test-token-extractor.js
```

所有测试用例已通过 ✅

### 📚 相关文档

- [README.md](./README.md) - 已更新 API 说明
- [docs/TOKEN-EXTRACTION.md](./docs/TOKEN-EXTRACTION.md) - 已更新详细文档
- [docs/USAGE-STYLES.md](./docs/USAGE-STYLES.md) - 已更新使用示例
- [examples/test-token-extractor.ts](./examples/test-token-extractor.ts) - 新增测试示例

### 🎯 优势

1. **自动类型识别**：无需手动指定文档类型
2. **类型安全**：TypeScript 完整类型支持
3. **向后兼容**：提供 `getTokenString()` 保持兼容性
4. **更智能的 API**：根据 URL 自动选择正确的 API 类型参数

### 💡 实际应用场景

```typescript
// 场景：用户提供一个飞书 URL，自动处理不同类型的文档
async function processLarkDocument(url: string) {
  const { token, objType } = getTokenOnly(url);
  
  if (!objType) {
    throw new Error('无法识别的文档类型');
  }
  
  // 根据类型自动调用对应的 API
  switch (objType) {
    case 'doc':
    case 'docx':
      return await docxAPI.getDocument(token);
    case 'sheet':
      return await sheetAPI.getSpreadsheet(token);
    case 'bitable':
      return await bitableAPI.getBase(token);
    case 'wiki':
      return await wikiNodeAPI.getNode(token, 'wiki');
    default:
      throw new Error(`不支持的文档类型: ${objType}`);
  }
}
```

---

**版本**: v1.1.0
**日期**: 2025-10-30
**作者**: Jacky Wang

