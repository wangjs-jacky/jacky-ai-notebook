# 快速参考

## 新架构速查表

### 初始化
```typescript
import { LarkDoc, larkClient } from './src/core/index.js';
const larkDoc = new LarkDoc(larkClient);
```

## API 速查

### 📄 节点操作 (nodes)

| 功能 | 新方法 | 旧方法 (兼容) |
|------|--------|---------------|
| 获取节点 | `nodes.get(token, type)` | `getSpaceNode(token, type)` |
| 基于URL获取 | `nodes.getByUrl(url)` | `getSpaceNodeByUrl(url)` |
| 创建节点 | `nodes.create(spaceId, params)` | `createSpaceNode(...)` |
| 更新标题 | `nodes.updateTitle(spaceId, token, title)` | `updateSpaceNodeTitle(...)` |
| 复制节点 | `nodes.copy(spaceId, token, params)` | `copySpaceNode(...)` |
| 移动节点 | `nodes.move(spaceId, token, target, targetSpace)` | - |
| 获取子节点 | `nodes.listChildren(spaceId, token)` | `listSpaceNodes(...)` |
| 获取所有子节点 | `nodes.listAllChildren(spaceId, token)` | `listAllSpaceNodes(...)` |
| **获取节点树** | `nodes.getTree(token, depth)` | - |
| **批量创建** | `nodes.batchCreate(spaceId, configs)` | - |
| **批量更新** | `nodes.batchUpdate(updates)` | - |
| **查找节点** | `nodes.findByTitle(spaceId, title)` | - |
| **获取路径** | `nodes.getPath(token)` | - |

### 📝 文档操作 (docs)

| 功能 | 新方法 | 旧方法 (兼容) |
|------|--------|---------------|
| 获取纯文本 | `docs.getRawContent(token)` | `getDocxRawContent(token, uat)` |
| 获取块列表 | `docs.listBlocks(token)` | `getDocxBlocks(token, uat)` |
| 获取块详情 | `docs.getBlock(docToken, blockId)` | - |
| 创建块 | `docs.createBlock(docToken, blockId, children)` | - |
| **统一获取内容** | `docs.getContent(type, token)` | - |
| **获取纯文本** | `docs.getRawText(type, token)` | - |
| **导出Markdown** | `docs.exportToMarkdown(token)` | - |
| **导出JSON** | `docs.exportToJSON(type, token)` | - |
| **提取链接** | `docs.extractLinks(token)` | - |
| **文档统计** | `docs.getStatistics(token)` | - |

### 📊 表格操作 (sheets)

| 功能 | 新方法 | 旧方法 (兼容) |
|------|--------|---------------|
| 获取表格 | `sheets.get(token)` | `getSheetContent(token, uat)` |
| 获取工作表列表 | `sheets.listSheets(token)` | - |
| 获取范围内容 | `sheets.getRange(token, range)` | - |

### 🗂️ 多维表格 (bitable)

| 功能 | 新方法 | 旧方法 (兼容) |
|------|--------|---------------|
| 获取所有表 | `bitable.listTables(appToken)` | `listBitableTables(appToken, uat)` |
| 获取表信息 | `bitable.getTable(appToken, tableId)` | - |
| 获取记录 | `bitable.listRecords(appToken, tableId)` | `getBitableRecords(...)` |
| **创建记录** | `bitable.createRecord(appToken, tableId, fields)` | - |
| **更新记录** | `bitable.updateRecord(appToken, tableId, recordId, fields)` | - |
| **删除记录** | `bitable.deleteRecord(appToken, tableId, recordId)` | - |
| **获取字段** | `bitable.listFields(appToken, tableId)` | - |

### 🌐 空间操作 (space)

| 功能 | 新方法 | 旧方法 (兼容) |
|------|--------|---------------|
| **获取所有节点** | `space.getAllNodes(spaceId, rootToken)` | `getAllDocuments(token, uat, depth)` |
| **搜索** | `space.search(spaceId, query)` | - |
| **获取统计** | `space.getStatistics(spaceId, rootToken)` | - |
| **获取结构** | `space.getStructure(spaceId, rootToken)` | - |
| **导出空间** | `space.export(spaceId, rootToken, format)` | - |

## 常用场景

### 场景 1: 获取节点信息
```typescript
// 方式1: 使用 URL
const node = await larkDoc.nodes.getByUrl('https://...');

// 方式2: 使用 token
const node = await larkDoc.nodes.get('nodeToken', 'wiki');
```

### 场景 2: 遍历知识空间
```typescript
// 获取树结构（推荐，性能更好）
const tree = await larkDoc.nodes.getTree(nodeToken, 3);

// 或获取所有后代节点
const descendants = await larkDoc.nodes.getAllDescendants(nodeToken, 5);
```

### 场景 3: 批量创建文档
```typescript
const nodes = await larkDoc.nodes.batchCreate(spaceId, [
    { title: '文档1', obj_type: 'docx', parent_node_token: parentToken },
    { title: '表格1', obj_type: 'sheet', parent_node_token: parentToken },
    { title: '多维表格1', obj_type: 'bitable', parent_node_token: parentToken },
]);
```

### 场景 4: 获取文档内容并分析
```typescript
// 获取内容
const content = await larkDoc.docs.getRawContent(docToken);

// 获取统计信息
const stats = await larkDoc.docs.getStatistics(docToken);
console.log(`字数: ${stats.wordCount}, 图片: ${stats.imageCount}`);

// 导出为 Markdown
const markdown = await larkDoc.docs.exportToMarkdown(docToken);
```

### 场景 5: 空间统计和导出
```typescript
// 获取统计信息
const stats = await larkDoc.space.getStatistics(spaceId, rootToken);
console.log(`总节点: ${stats.totalNodes}, 深度: ${stats.maxDepth}`);

// 导出为 Markdown
const markdown = await larkDoc.space.export(spaceId, rootToken, 'markdown');

// 导出为 JSON
const json = await larkDoc.space.export(spaceId, rootToken, 'json');
```

### 场景 6: 多维表格数据操作
```typescript
// 获取所有表
const tables = await larkDoc.bitable.listTables(appToken);

// 获取第一个表的记录
const records = await larkDoc.bitable.listRecords(appToken, tables[0].table_id);

// 创建新记录
await larkDoc.bitable.createRecord(appToken, tableId, {
    '名称': '张三',
    '年龄': 25,
    '部门': '技术部',
});

// 更新记录
await larkDoc.bitable.updateRecord(appToken, tableId, recordId, {
    '年龄': 26,
});
```

## 类型导入

```typescript
import type {
    // 基础类型
    ObjType,
    NodeType,
    WikiNode,
    
    // 树形结构
    WikiNodeTree,
    
    // 配置类型
    NodeConfig,
    NodeUpdate,
    
    // 文档类型
    DocumentContent,
    DocumentStatistics,
    
    // 空间类型
    SpaceStatistics,
    
    // 多维表格
    BitableTable,
    BitableRecord,
    BitableField,
} from './src/core/types/index.js';
```

## 直接使用底层

### 仅使用 API 层
```typescript
import { WikiNodeAPI, DocxAPI } from './src/core/api/index.js';

const api = new WikiNodeAPI(larkClient);
const node = await api.getNode('token', 'wiki');
```

### 仅使用 Service 层
```typescript
import { WikiNodeService } from './src/core/services/index.js';
import { WikiNodeAPI, DocxAPI, SheetAPI, BitableAPI } from './src/core/api/index.js';

const wikiAPI = new WikiNodeAPI(larkClient);
const docxAPI = new DocxAPI(larkClient);
const sheetAPI = new SheetAPI(larkClient);
const bitableAPI = new BitableAPI(larkClient);

const service = new WikiNodeService(wikiAPI, docxAPI, sheetAPI, bitableAPI);
const tree = await service.getNodeTree('token', 5);
```

## 错误处理

```typescript
try {
    const node = await larkDoc.nodes.getByUrl(url);
} catch (error) {
    if (error.message.includes('用户访问令牌不存在')) {
        // 需要重新登录
    } else if (error.message.includes('获取知识空间节点信息失败')) {
        // API 调用失败
    } else {
        // 其他错误
    }
}
```

## 迁移对照

| 旧方法 | 新方法 | 说明 |
|--------|--------|------|
| `getSpaceNode` | `nodes.get` | 基础获取 |
| `getSpaceNodeByUrl` | `nodes.getByUrl` | URL 获取 |
| `updateSpaceNodeTitle` | `nodes.updateTitle` | 更新标题 |
| `copySpaceNode` | `nodes.copy` | 复制节点 |
| `createSpaceNode` | `nodes.create` | 创建节点 |
| `listSpaceNodes` | `nodes.listChildren` | 获取子节点 |
| `listAllSpaceNodes` | `nodes.listAllChildren` | 获取所有子节点 |
| `getDocxRawContent` | `docs.getRawContent` | 获取文档内容 |
| `getDocxBlocks` | `docs.listBlocks` | 获取文档块 |
| `getSheetContent` | `sheets.get` | 获取表格 |
| `listBitableTables` | `bitable.listTables` | 获取多维表格表列表 |
| `getBitableRecords` | `bitable.listRecords` | 获取记录 |
| `getAllDocuments` | `space.getAllNodes` 或 `nodes.getTree` | 递归获取 |

## 运行示例

```bash
# 运行新架构示例
tsx examples/new-architecture-demo.ts
```

## 更多文档

- 📖 [完整架构设计](./ARCHITECTURE.md)
- 📘 [使用指南](./NEW_ARCHITECTURE_GUIDE.md)
- 📋 [改造总结](./REFACTORING_SUMMARY.md)

---

**提示：** 粗体标记的是新增功能，不带粗体的是已有功能的新接口。

