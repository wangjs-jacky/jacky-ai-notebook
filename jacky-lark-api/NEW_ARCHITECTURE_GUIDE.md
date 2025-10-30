# 新架构使用指南

## 概述

LarkDoc 已重构为清晰的三层架构，提供更好的代码组织、可维护性和扩展性。

```
┌─────────────────────────────────────┐
│    Facade Layer (门面层)              │
│    LarkDoc - 统一对外接口              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Service Layer (服务层)              │
│   组合能力、业务逻辑                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    API Layer (API 层)                │
│    一对一映射飞书 SDK                  │
└─────────────────────────────────────┘
```

## 快速开始

### 1. 基本使用

```typescript
import { LarkDoc, larkClient } from './src/core/index.js';

const larkDoc = new LarkDoc(larkClient);

// 新方式：使用分组访问（推荐）
const node = await larkDoc.nodes.getByUrl('https://...');

// 旧方式：直接调用（向后兼容）
const node2 = await larkDoc.getSpaceNodeByUrl('https://...');
```

### 2. 三种使用方式

#### 方式 1: 门面层 - 分组访问（推荐）

```typescript
// 节点操作
const node = await larkDoc.nodes.getByUrl(url);
const tree = await larkDoc.nodes.getTree(nodeToken);
const children = await larkDoc.nodes.listChildren(spaceId, nodeToken);

// 文档操作
const content = await larkDoc.docs.getContent('docx', docToken);
const stats = await larkDoc.docs.getStatistics(docToken);
const markdown = await larkDoc.docs.exportToMarkdown(docToken);

// 空间操作
const spaceStats = await larkDoc.space.getStatistics(spaceId, rootToken);
const searchResults = await larkDoc.space.search(spaceId, 'keyword');

// 多维表格操作
const tables = await larkDoc.bitable.listTables(appToken);
const records = await larkDoc.bitable.listRecords(appToken, tableId);
```

#### 方式 2: 直接使用 API 层

```typescript
import { WikiNodeAPI, DocxAPI } from './src/core/api/index.js';

const wikiNodeAPI = new WikiNodeAPI(larkClient);
const node = await wikiNodeAPI.getNode('nodeToken', 'wiki');
```

#### 方式 3: 直接使用 Service 层

```typescript
import { WikiNodeService } from './src/core/services/index.js';
import { WikiNodeAPI, DocxAPI } from './src/core/api/index.js';

const wikiNodeAPI = new WikiNodeAPI(larkClient);
const docxAPI = new DocxAPI(larkClient);
const sheetAPI = new SheetAPI(larkClient);
const bitableAPI = new BitableAPI(larkClient);

const wikiNodeService = new WikiNodeService(
    wikiNodeAPI, 
    docxAPI, 
    sheetAPI, 
    bitableAPI
);

const node = await wikiNodeService.getNodeByUrl(url);
const tree = await wikiNodeService.getNodeTree(nodeToken);
```

## 各层详细说明

### API 层 (API Layer)

**职责：** 直接封装飞书 SDK，一对一映射官方 API

**特点：**
- 最小化业务逻辑
- 统一错误处理
- 自动注入认证令牌

**可用的 API 类：**
- `WikiNodeAPI` - 知识空间节点操作
- `DocxAPI` - 新版文档操作
- `SheetAPI` - 电子表格操作
- `BitableAPI` - 多维表格操作
- `WikiSearchAPI` - 搜索操作

**示例：**
```typescript
import { WikiNodeAPI } from './src/core/api/index.js';

const api = new WikiNodeAPI(larkClient);

// 基础 CRUD
const node = await api.getNode('nodeToken', 'wiki');
const created = await api.createNode(spaceId, {
    obj_type: 'docx',
    parent_node_token: parentToken,
    node_type: 'origin',
    title: '新文档',
});
await api.updateNodeTitle(spaceId, nodeToken, '新标题');
const copied = await api.copyNode(spaceId, nodeToken, {
    target_parent_token: targetParent,
    target_space_id: targetSpace,
});
```

### Service 层 (Service Layer)

**职责：** 组合多个 API 调用，实现业务逻辑

**特点：**
- 跨 API 调用
- 复杂业务逻辑
- 便捷的高级功能

**可用的 Service 类：**
- `WikiNodeService` - 节点高级服务
- `DocService` - 文档内容服务
- `SpaceService` - 空间级别服务

**示例：**
```typescript
import { WikiNodeService } from './src/core/services/index.js';

const service = new WikiNodeService(wikiNodeAPI, docxAPI, sheetAPI, bitableAPI);

// 基于 URL 的便捷操作
const node = await service.getNodeByUrl('https://...');
await service.updateNodeByUrl(url, '新标题');

// 递归操作
const tree = await service.getNodeTree(nodeToken, 5);
const descendants = await service.getAllDescendants(nodeToken);

// 批量操作
const nodes = await service.batchCreateNodes(spaceId, [
    { title: '文档1', obj_type: 'docx', parent_node_token: parent },
    { title: '表格1', obj_type: 'sheet', parent_node_token: parent },
]);

// 查询操作
const found = await service.findNodesByTitle(spaceId, '搜索标题');
const path = await service.getNodePath(nodeToken);
```

### Facade 层 (Facade Layer)

**职责：** 统一对外接口，提供便捷访问

**使用方式：**

```typescript
const larkDoc = new LarkDoc(larkClient);

// 分组访问
larkDoc.nodes.*      // 节点操作
larkDoc.docs.*       // 文档操作
larkDoc.sheets.*     // 表格操作
larkDoc.bitable.*    // 多维表格操作
larkDoc.space.*      // 空间操作
```

## 完整示例

### 示例 1: 获取并遍历知识空间

```typescript
import { LarkDoc, larkClient } from './src/core/index.js';

const larkDoc = new LarkDoc(larkClient);
const wikiUrl = 'https://xxx.larkenterprise.com/wiki/xxx';

// 1. 获取节点信息
const node = await larkDoc.nodes.getByUrl(wikiUrl);
console.log(`节点标题: ${node?.title}`);

// 2. 获取子节点
const children = await larkDoc.nodes.listAllChildren(
    node!.space_id!,
    node!.node_token!
);
console.log(`子节点数: ${children.length}`);

// 3. 获取完整树结构
const tree = await larkDoc.nodes.getTree(node!.node_token!, 3);
console.log('树结构:', JSON.stringify(tree, null, 2));
```

### 示例 2: 文档内容处理

```typescript
// 获取文档内容
const content = await larkDoc.docs.getRawContent(docToken);
console.log('文档内容:', content.data?.content);

// 获取统计信息
const stats = await larkDoc.docs.getStatistics(docToken);
console.log(`字数: ${stats.wordCount}, 图片: ${stats.imageCount}`);

// 导出为 Markdown
const markdown = await larkDoc.docs.exportToMarkdown(docToken);
console.log(markdown);

// 提取链接
const links = await larkDoc.docs.extractLinks(docToken);
console.log('文档中的链接:', links);
```

### 示例 3: 批量操作

```typescript
// 批量创建节点
const newNodes = await larkDoc.nodes.batchCreate(spaceId, [
    { title: '会议记录', obj_type: 'docx', parent_node_token: parent },
    { title: '数据统计', obj_type: 'sheet', parent_node_token: parent },
    { title: '项目管理', obj_type: 'bitable', parent_node_token: parent },
]);

// 批量更新标题
await larkDoc.nodes.batchUpdate([
    { space_id: spaceId, node_token: token1, title: '新标题1' },
    { space_id: spaceId, node_token: token2, title: '新标题2' },
]);
```

### 示例 4: 空间级操作

```typescript
// 获取空间统计
const stats = await larkDoc.space.getStatistics(spaceId, rootToken);
console.log(`总节点数: ${stats.totalNodes}`);
console.log(`最大深度: ${stats.maxDepth}`);
console.log('类型分布:', stats.nodesByType);

// 搜索空间
const results = await larkDoc.space.search(spaceId, '项目');
console.log('搜索结果:', results.data?.items);

// 导出空间为 Markdown
const markdown = await larkDoc.space.export(spaceId, rootToken, 'markdown');
console.log(markdown);

// 导出空间为 JSON
const json = await larkDoc.space.export(spaceId, rootToken, 'json');
console.log(json);
```

### 示例 5: 多维表格操作

```typescript
// 获取所有数据表
const tables = await larkDoc.bitable.listTables(appToken);
console.log('数据表:', tables);

// 获取字段列表
const fields = await larkDoc.bitable.listFields(appToken, tableId);
console.log('字段:', fields);

// 获取记录
const records = await larkDoc.bitable.listRecords(appToken, tableId);
console.log('记录:', records.data?.items);

// 创建记录
await larkDoc.bitable.createRecord(appToken, tableId, {
    '字段1': '值1',
    '字段2': 123,
});

// 更新记录
await larkDoc.bitable.updateRecord(appToken, tableId, recordId, {
    '字段1': '新值',
});
```

## 类型定义

所有类型定义都可以从 `types` 目录导入：

```typescript
import type {
    ObjType,
    WikiNode,
    WikiNodeTree,
    NodeConfig,
    NodeUpdate,
    DocumentContent,
    DocumentStatistics,
    SpaceStatistics,
    // ... 更多类型
} from './src/core/types/index.js';
```

## 迁移指南

### 从旧版本迁移

旧代码**无需修改**，新架构完全向后兼容：

```typescript
// ✅ 旧代码仍然可用
const node = await larkDoc.getSpaceNodeByUrl(url);
const children = await larkDoc.listSpaceNodes(spaceId, nodeToken);
```

### 推荐的迁移方式

逐步迁移到新的分组访问方式：

```typescript
// ❌ 旧方式
const node = await larkDoc.getSpaceNodeByUrl(url);

// ✅ 新方式（推荐）
const node = await larkDoc.nodes.getByUrl(url);
```

## 架构优势

1. **清晰的职责分离**
   - API 层：纯 SDK 封装
   - Service 层：业务逻辑
   - Facade 层：统一入口

2. **易于测试**
   - 每层可独立测试
   - 可以 mock 下层依赖

3. **易于扩展**
   - 新增功能不影响现有代码
   - 支持插件式扩展

4. **代码复用**
   - API 层可被多个 Service 复用
   - Service 层可被多个门面复用

5. **向后兼容**
   - 保留旧接口
   - 平滑迁移

## 运行示例

```bash
# 运行新架构示例
npm run dev:new-architecture

# 或直接运行
tsx examples/new-architecture-demo.ts
```

## 参考文档

- [完整架构设计文档](./ARCHITECTURE.md)
- [飞书开放平台文档](https://open.larkenterprise.com/)

