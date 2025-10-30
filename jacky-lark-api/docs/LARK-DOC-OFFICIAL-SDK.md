# 基于飞书官方 SDK 的知识库文档操作

本项目已集成飞书官方的 Node SDK (`@larksuiteoapi/node-sdk`)，提供了更可靠和完整的 API 支持。

## 特点

✅ **基于官方 SDK** - 使用飞书官方维护的 Node SDK  
✅ **自动分页处理** - 使用官方 SDK 的迭代器自动处理分页  
✅ **类型安全** - 完整的 TypeScript 类型支持  
✅ **灵活的 Token 管理** - 支持 `disableTokenCache` 选项  
✅ **类似官方示例** - 使用 `lark.withUserAccessToken()` 传递 token

## 快速开始

```typescript
import { larkClient, LarkDoc } from 'jacky-lark-api';

// 创建 LarkDoc 实例
const larkDoc = new LarkDoc(larkClient);

// 使用 user_access_token 调用 API
const userAccessToken = 'your_user_access_token';
const wikiUrl = 'https://xxx.feishu.cn/wiki/N3yNwV4oMicO0UkIpk7crQ2wndg';

// 从 URL 提取 node_token
const nodeToken = larkDoc.extractNodeToken(wikiUrl);

// 获取节点信息
const nodeInfo = await larkDoc.getSpaceNode(nodeToken, 'wiki', userAccessToken);

// 获取所有子节点（自动处理分页）
const childNodes = await larkDoc.listAllSpaceNodes(
  nodeInfo.data.node.space_id,
  nodeToken,
  userAccessToken
);

// 递归获取所有文档
const allDocs = await larkDoc.getAllDocuments(nodeToken, userAccessToken, 3);
```

## API 参考

### 初始化

```typescript
import { larkClient, LarkDoc } from 'jacky-lark-api';

// larkClient 已经配置好，可以直接使用
// 配置：disableTokenCache: true（需要手动传递 token）

const larkDoc = new LarkDoc(larkClient);
```

### 从 URL 提取 node_token

```typescript
const nodeToken = larkDoc.extractNodeToken(
  'https://xxx.feishu.cn/wiki/N3yNwV4oMicO0UkIpk7crQ2wndg'
);
// 返回: 'N3yNwV4oMicO0UkIpk7crQ2wndg'
```

### 获取知识空间节点信息

```typescript
const nodeInfo = await larkDoc.getSpaceNode(
  nodeToken: string,
  objType: "doc" | "docx" | "sheet" | "mindnote" | "bitable" | "file" | "slides" | "wiki" = 'wiki',
  userAccessToken: string
);

// 返回格式（官方 SDK 响应）：
// {
//   code: 0,
//   msg: 'success',
//   data: {
//     node: {
//       space_id: 'xxx',
//       node_token: 'xxx',
//       obj_token: 'xxx',
//       obj_type: 'wiki',
//       title: 'xxx',
//       has_child: true,
//       ...
//     }
//   }
// }
```

### 获取子节点列表（单页）

```typescript
const response = await larkDoc.listSpaceNodes(
  spaceId: string,
  parentNodeToken: string,
  userAccessToken: string,
  pageToken?: string  // 可选，用于分页
);
```

### 获取所有子节点（自动分页）

使用官方 SDK 的迭代器，自动处理分页：

```typescript
const allNodes = await larkDoc.listAllSpaceNodes(
  spaceId: string,
  parentNodeToken: string,
  userAccessToken: string
);

// 返回所有子节点的数组
// [
//   { node_token, obj_token, obj_type, title, has_child, ... },
//   { ... },
//   ...
// ]
```

### 获取文档内容

#### 获取文档纯文本内容（docx）

```typescript
const content = await larkDoc.getDocxRawContent(
  docToken: string,
  userAccessToken: string
);
```

#### 获取文档所有块（docx）

```typescript
const blocks = await larkDoc.getDocxBlocks(
  docToken: string,
  userAccessToken: string
);
```

#### 获取电子表格内容

```typescript
const sheet = await larkDoc.getSheetContent(
  spreadsheetToken: string,
  userAccessToken: string
);
```

#### 获取多维表格

```typescript
// 获取所有数据表
const tables = await larkDoc.listBitableTables(
  appToken: string,
  userAccessToken: string
);

// 获取表格记录
const records = await larkDoc.getBitableRecords(
  appToken: string,
  tableId: string,
  userAccessToken: string
);
```

### 递归获取所有文档

```typescript
const allDocs = await larkDoc.getAllDocuments(
  nodeToken: string,
  userAccessToken: string,
  maxDepth: number = 10  // 最大递归深度
);

// 返回文档树结构：
// [
//   {
//     node_token: 'xxx',
//     obj_token: 'xxx',
//     obj_type: 'docx',
//     title: 'xxx',
//     has_child: true,
//     children: [
//       { ... },
//       { ... }
//     ]
//   },
//   ...
// ]
```

## 使用示例

### 示例 1：获取知识库结构

```typescript
import { larkClient, LarkDoc } from 'jacky-lark-api';

async function getWikiStructure() {
  const larkDoc = new LarkDoc(larkClient);
  const userAccessToken = 'your_user_access_token';
  
  const wikiUrl = 'https://xxx.feishu.cn/wiki/xxx';
  const nodeToken = larkDoc.extractNodeToken(wikiUrl);
  
  // 获取节点信息
  const nodeInfo = await larkDoc.getSpaceNode(nodeToken, 'wiki', userAccessToken);
  console.log('节点信息:', nodeInfo.data?.node);
  
  // 获取所有子节点
  const childNodes = await larkDoc.listAllSpaceNodes(
    nodeInfo.data!.node!.space_id!,
    nodeToken,
    userAccessToken
  );
  
  console.log(`找到 ${childNodes.length} 个子节点`);
  childNodes.forEach(node => {
    console.log(`- ${node.title} (${node.obj_type})`);
  });
}
```

### 示例 2：递归获取所有文档

```typescript
async function getAllDocumentsTree() {
  const larkDoc = new LarkDoc(larkClient);
  const userAccessToken = 'your_user_access_token';
  const nodeToken = 'N3yNwV4oMicO0UkIpk7crQ2wndg';
  
  const allDocs = await larkDoc.getAllDocuments(
    nodeToken,
    userAccessToken,
    5  // 最大递归深度
  );
  
  // 打印文档树
  function printTree(docs: any[], level = 0) {
    docs.forEach(doc => {
      const indent = '  '.repeat(level);
      console.log(`${indent}📄 ${doc.title} [${doc.obj_type}]`);
      
      if (doc.children) {
        printTree(doc.children, level + 1);
      }
    });
  }
  
  printTree(allDocs);
}
```

### 示例 3：获取文档内容

```typescript
async function getDocumentContent(docToken: string) {
  const larkDoc = new LarkDoc(larkClient);
  const userAccessToken = 'your_user_access_token';
  
  // 获取文档纯文本内容
  const content = await larkDoc.getDocxRawContent(docToken, userAccessToken);
  
  if (content.code === 0) {
    console.log('文档内容:', content.data?.content);
  }
}
```

## 与官方 SDK 示例对比

### 飞书官方示例

```javascript
const lark = require('@larksuiteoapi/node-sdk');

const client = new lark.Client({
  appId: 'app_id',
  appSecret: 'app_secret',
  disableTokenCache: true
});

client.wiki.v2.spaceNode.list(
  {
    path: { space_id: '7520655084628394003' },
    params: { parent_node_token: 'N3yNwV4oMicO0UkIpk7crQ2wndg' },
  },
  lark.withUserAccessToken("u-xxx")
).then(res => {
  console.log(res);
});
```

### 我们的封装

```typescript
import { larkClient, LarkDoc } from 'jacky-lark-api';

const larkDoc = new LarkDoc(larkClient);

// 同样的调用，但更简洁
const response = await larkDoc.listSpaceNodes(
  '7520655084628394003',
  'N3yNwV4oMicO0UkIpk7crQ2wndg',
  'u-xxx'  // user_access_token
);

console.log(response);
```

## 配置说明

客户端配置在 `src/core/lark-client.ts` 中：

```typescript
import * as lark from '@larksuiteoapi/node-sdk';
import { getLarkConfig } from '../config';

const config = getLarkConfig();

const client = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    // disableTokenCache 为 true 时，需要手动传递 token
    disableTokenCache: true
});

export default client;
```

## Token 管理

本实现使用 `disableTokenCache: true`，这意味着：

- ✅ SDK 不会主动拉取和缓存 token
- ✅ 需要在每次调用时手动传递 `user_access_token`
- ✅ 适合多用户场景，每个用户使用自己的 token
- ✅ 类似官方示例的使用方式

如果要使用自动 token 管理，可以修改 `lark-client.ts`：

```typescript
const client = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    disableTokenCache: false  // SDK 自动管理 token
});
```

## 权限要求

确保你的飞书应用已获得以下权限：

1. **应用权限**：
   - `wiki:wiki` (知识库读写) 或
   - `wiki:wiki.readonly` (知识库只读)

2. **文档访问权限**：
   - 将应用添加为知识库成员
   - 或添加为文档协作者

详见：[如何给应用授权访问知识库文档资源](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-overview)

## 相关文档

- [飞书官方 Node SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development)
- [飞书 Wiki API 文档](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-overview)
- [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)
- [获取知识空间子节点列表](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/list)

## 完整示例

查看 `examples/index.ts` 中的 `demoLarkDocWithOfficialSDK()` 函数，可以看到完整的使用示例。

运行示例：

```bash
npm run example
```

