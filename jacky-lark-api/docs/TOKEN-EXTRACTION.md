# 飞书 URL Token 提取工具

## 概述

这个工具可以从飞书的各种资源 URL 中自动提取对应的 token，支持文件夹、文件、文档、电子表格、多维表格、知识空间等多种资源类型。

## 支持的域名

工具会自动验证 URL 是否来自飞书官方域名，仅识别以下域名：

- ✅ `feishu.cn` - 飞书中国版
- ✅ `larksuite.com` - 飞书国际版
- ✅ `feishu.com` - 飞书备用域名
- ✅ `lark.cn` - 飞书备用域名

**安全提示**：非飞书域名的 URL（即使路径格式相似）将被自动拒绝，确保安全性。

## 支持的资源类型

| 资源类型 | Token 名称 | URL 示例 |
|---------|-----------|----------|
| 文件夹 | `folder_token` | `https://sample.feishu.cn/drive/folder/cSJe2JgtFFBwRuTKAJK6baNGUn0` |
| 文件 | `file_token` | `https://sample.feishu.cn/file/ndqUw1kpjnGNNaegyqDyoQDCLx1` |
| 旧版文档 | `doc_token` | `https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q` |
| 新版文档 | `document_id` | `https://sample.feishu.cn/docx/UXEAd6cRUoj5pexJZr0cdwaFnpd` |
| 电子表格 | `spreadsheet_token` | `https://sample.feishu.cn/sheets/MRLOWBf6J47ZUjmwYRsN8utLEoY` |
| 多维表格 | `app_token` | `https://sample.feishu.cn/base/Pc9OpwAV4nLdU7lTy71t6Kmmkoz` |
| 知识空间 | `space_id` | `https://sample.feishu.cn/wiki/settings/7075377271827264924` |
| 知识库节点 | `node_token` | `https://sample.feishu.cn/wiki/sZdeQp3m4nFGzwqR5vx4vZksMoe` |

## 功能特性

- ✅ 自动识别资源类型
- ✅ **域名安全验证**（仅识别飞书官方域名）
- ✅ 自动清除 URL 末尾的 `#` 符号
- ✅ 自动清除查询参数
- ✅ 支持批量提取
- ✅ 类型安全（TypeScript）
- ✅ URL 有效性验证

## 使用方法

### 1. 提取完整信息（包含 token 和类型）

```typescript
import { extractTokenFromUrl } from 'jacky-lark-api';

const url = 'https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q#';
const result = extractTokenFromUrl(url);

console.log(result);
// {
//   token: '2olt0Ts4Mds7j7iqzdwrqEUnO7q',
//   type: 'doc_token',
//   originalUrl: 'https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q#'
// }
```

### 2. 仅提取 token 字符串

```typescript
import { getTokenOnly } from 'jacky-lark-api';

const url = 'https://sample.feishu.cn/sheets/MRLOWBf6J47ZUjmwYRsN8utLEoY';
const { token, objType } = getTokenOnly(url);

console.log(token);    // 'MRLOWBf6J47ZUjmwYRsN8utLEoY'
console.log(objType);  // 'sheet'

// 或者直接解构使用
const { token: sheetToken, objType: sheetType } = getTokenOnly(url);
```

### 3. 批量提取多个 URL

```typescript
import { extractTokensFromUrls } from 'jacky-lark-api';

const urls = [
  'https://sample.feishu.cn/drive/folder/cSJe2JgtFFBwRuTKAJK6baNGUn0',
  'https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q',
  'https://sample.feishu.cn/sheets/MRLOWBf6J47ZUjmwYRsN8utLEoY'
];

const results = extractTokensFromUrls(urls);
console.log(results);
// [
//   { token: 'cSJe2JgtFFBwRuTKAJK6baNGUn0', type: 'folder_token', originalUrl: '...' },
//   { token: '2olt0Ts4Mds7j7iqzdwrqEUnO7q', type: 'doc_token', originalUrl: '...' },
//   { token: 'MRLOWBf6J47ZUjmwYRsN8utLEoY', type: 'spreadsheet_token', originalUrl: '...' }
// ]
```

### 4. 验证 URL 有效性

```typescript
import { isValidLarkUrl } from 'jacky-lark-api';

console.log(isValidLarkUrl('https://sample.feishu.cn/docs/xxx'));  // true
console.log(isValidLarkUrl('https://google.com'));  // false
```

### 5. 使用资源类型枚举

```typescript
import { extractTokenFromUrl, LarkResourceType } from 'jacky-lark-api';

const url = 'https://sample.feishu.cn/docx/UXEAd6cRUoj5pexJZr0cdwaFnpd';
const result = extractTokenFromUrl(url);

if (result.type === LarkResourceType.DOCUMENT) {
  console.log('这是一个新版文档');
  // 调用新版文档相关的 API
} else if (result.type === LarkResourceType.DOC) {
  console.log('这是一个旧版文档');
  // 调用旧版文档相关的 API
}
```

## API 参考

### extractTokenFromUrl(url: string): TokenResult

从飞书 URL 中提取 token 和资源类型。

**参数：**
- `url` (string): 飞书资源的完整 URL

**返回：**
```typescript
{
  token: string;           // 提取到的 token
  type: LarkResourceType;  // 资源类型
  originalUrl: string;     // 原始 URL
}
```

### getTokenOnly(url: string): TokenWithType

提取 token 和对应的对象类型（用于 API 调用）。

**参数：**
- `url` (string): 飞书资源的完整 URL

**返回：**
```typescript
{
  token: string;         // 提取到的 token
  objType: ObjType | null;  // 对象类型: 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides' | 'wiki' | null
}
```

**示例：**
```typescript
const { token, objType } = getTokenOnly('https://sample.feishu.cn/docx/abc123');
// { token: 'abc123', objType: 'docx' }
```

### getTokenString(url: string): string

仅提取 token 字符串（向后兼容，不推荐使用）。

**参数：**
- `url` (string): 飞书资源的完整 URL

**返回：**
- `string`: token 字符串，如果无法识别则返回空字符串

### extractTokensFromUrls(urls: string[]): TokenResult[]

批量提取多个 URL 的 token。

**参数：**
- `urls` (string[]): URL 数组

**返回：**
- `TokenResult[]`: TokenResult 对象数组

### isValidLarkUrl(url: string): boolean

验证 URL 是否为有效的飞书资源 URL。

**参数：**
- `url` (string): 待验证的 URL

**返回：**
- `boolean`: 是否为有效的飞书资源 URL

## LarkResourceType 枚举

```typescript
enum LarkResourceType {
  FOLDER = 'folder_token',          // 文件夹
  FILE = 'file_token',              // 文件
  DOC = 'doc_token',                // 旧版文档
  DOCUMENT = 'document_id',         // 新版文档
  SPREADSHEET = 'spreadsheet_token', // 电子表格
  BASE = 'app_token',               // 多维表格
  WIKI_SPACE = 'space_id',          // 知识空间
  WIKI_NODE = 'node_token',         // 知识库节点
  UNKNOWN = 'unknown'               // 未知类型
}
```

## 注意事项

1. **域名验证**：工具会严格验证 URL 域名，仅接受飞书官方域名（`feishu.cn`、`larksuite.com`、`feishu.com`、`lark.cn`）。非飞书域名的 URL 将被拒绝，即使路径格式正确。

   ```typescript
   // ✅ 有效 - 飞书域名
   extractTokenFromUrl('https://feishu.cn/docs/xxx');
   
   // ❌ 无效 - 非飞书域名
   extractTokenFromUrl('https://google.com/docs/xxx'); 
   // 返回 { token: '', type: 'unknown', ... }
   ```

2. **URL 末尾的 # 符号**：在复制飞书 URL 时，末尾可能会有多余的 `#` 符号，工具会自动清除。

3. **查询参数**：URL 中的查询参数（如 `?xxx=yyy`）也会被自动清除。

4. **支持多个飞书域名**：工具支持飞书中国版（`feishu.cn`）、国际版（`larksuite.com`）及备用域名。

5. **未知类型**：如果 URL 格式不匹配任何已知模式或域名不是飞书官方域名，会返回 `LarkResourceType.UNKNOWN` 和空字符串。

## 实际应用示例

### 示例 1: 根据 URL 调用不同的 API

```typescript
import { extractTokenFromUrl, LarkResourceType } from 'jacky-lark-api';
import { LarkApiClient } from 'jacky-lark-api';

async function processLarkResource(url: string, accessToken: string) {
  const { token, type } = extractTokenFromUrl(url);
  
  if (!token) {
    throw new Error('无效的飞书 URL');
  }
  
  const client = new LarkApiClient({ /* config */ });
  
  switch (type) {
    case LarkResourceType.DOCUMENT:
      // 获取新版文档内容
      return await client.getDocumentContent(token, accessToken);
      
    case LarkResourceType.SPREADSHEET:
      // 获取电子表格数据
      return await client.getSpreadsheetData(token, accessToken);
      
    case LarkResourceType.BASE:
      // 获取多维表格数据
      return await client.getBaseData(token, accessToken);
      
    default:
      throw new Error(`不支持的资源类型: ${type}`);
  }
}
```

### 示例 2: 批量处理用户分享的链接

```typescript
import { extractTokensFromUrls, LarkResourceType } from 'jacky-lark-api';

// 用户分享的多个飞书链接
const sharedLinks = [
  'https://feishu.cn/docs/xxx#',
  'https://feishu.cn/sheets/yyy',
  'https://feishu.cn/base/zzz?from=share'
];

// 批量提取并分类
const results = extractTokensFromUrls(sharedLinks);

const docs = results.filter(r => r.type === LarkResourceType.DOC || r.type === LarkResourceType.DOCUMENT);
const sheets = results.filter(r => r.type === LarkResourceType.SPREADSHEET);
const bases = results.filter(r => r.type === LarkResourceType.BASE);

console.log(`文档数量: ${docs.length}`);
console.log(`电子表格数量: ${sheets.length}`);
console.log(`多维表格数量: ${bases.length}`);
```

### 示例 3: URL 有效性验证

```typescript
import { isValidLarkUrl } from 'jacky-lark-api';

function handleUserInput(url: string) {
  if (!isValidLarkUrl(url)) {
    throw new Error('请输入有效的飞书资源链接');
  }
  
  // 继续处理...
}
```

## 运行示例代码

查看完整的使用示例：

```bash
npm run example
```

或

```bash
pnpm run example
```

示例代码位置：`examples/index.ts`

## 相关文档

- [快速开始指南](./QUICK-START.md)
- [配置说明](./CONFIG.md)
- [飞书文档 API](./FeishuDoc.md)

## 问题反馈

如果遇到不支持的 URL 格式或其他问题，请提交 Issue。

