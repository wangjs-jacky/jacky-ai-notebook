# LarkDoc 架构设计文档

## 一、整体架构

### 1.1 分层设计

```
┌──────────────────────────────────────────────────────────┐
│                   Facade Layer (门面层)                    │
│                                                            │
│  LarkDoc: 统一对外接口，保持向后兼容                         │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                  Service Layer (服务层)                    │
│                                                            │
│  WikiNodeService:  基于 URL 操作、递归获取、批量操作        │
│  DocService:       文档内容提取、转换、组合操作             │
│  SpaceService:     知识空间级别的高级操作                   │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                   API Layer (底层 API 层)                  │
│                                                            │
│  WikiNodeAPI:      节点 CRUD（增删改查）                    │
│  DocxAPI:          新版文档操作                            │
│  SheetAPI:         电子表格操作                            │
│  BitableAPI:       多维表格操作                            │
│  WikiSearchAPI:    搜索相关操作                            │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                  Infrastructure (基础设施层)                │
│                                                            │
│  AuthStore:        认证信息管理                            │
│  ErrorHandler:     统一错误处理                            │
│  TokenExtractor:   URL 解析工具                           │
└──────────────────────────────────────────────────────────┘
```

## 二、各层详细设计

### 2.1 API Layer (底层 API 层)

#### 职责
- 直接封装飞书 SDK 调用
- 一对一映射飞书官方 API
- 处理认证令牌注入
- 统一错误处理和响应格式

#### 设计原则
- 每个 API 类对应飞书的一个功能模块
- 方法名与飞书 API 保持一致
- 只做最基础的参数验证
- 不包含业务逻辑

#### 类设计

##### WikiNodeAPI
```typescript
/**
 * 知识空间节点基础操作
 * 对应飞书 wiki.v2.space 和 wiki.v2.spaceNode
 */
class WikiNodeAPI {
  // 基础 CRUD
  - getNode()           // 获取单个节点信息
  - createNode()        // 创建节点
  - updateNodeTitle()   // 更新节点标题
  - moveNode()          // 移动节点
  - copyNode()          // 复制节点
  - deleteNode()        // 删除节点（如果API支持）
  
  // 列表查询
  - listChildNodes()    // 获取子节点列表（支持分页）
  - listAllChildNodes() // 获取所有子节点（自动分页）
}
```

##### DocxAPI
```typescript
/**
 * 新版文档操作
 * 对应飞书 docx.v1
 */
class DocxAPI {
  - getRawContent()     // 获取纯文本内容
  - listBlocks()        // 获取文档块列表
  - getBlock()          // 获取单个块
  - createBlock()       // 创建块
  - updateBlock()       // 更新块
  - deleteBlock()       // 删除块
}
```

##### SheetAPI
```typescript
/**
 * 电子表格操作
 * 对应飞书 sheets
 */
class SheetAPI {
  - getSpreadsheet()    // 获取表格信息
  - listSheets()        // 获取工作表列表
  - getSheetContent()   // 获取工作表内容
  - updateCells()       // 更新单元格
}
```

##### BitableAPI
```typescript
/**
 * 多维表格操作
 * 对应飞书 bitable.v1
 */
class BitableAPI {
  - listTables()        // 获取数据表列表
  - getTable()          // 获取单个表信息
  - listRecords()       // 获取记录列表
  - createRecord()      // 创建记录
  - updateRecord()      // 更新记录
  - deleteRecord()      // 删除记录
  - listFields()        // 获取字段列表
}
```

##### WikiSearchAPI
```typescript
/**
 * 搜索相关操作
 * 对应飞书 wiki.v1.node.search 等
 */
class WikiSearchAPI {
  - searchNodes()       // 搜索节点
}
```

---

### 2.2 Service Layer (服务层)

#### 职责
- 组合多个底层 API 调用
- 实现复杂业务逻辑
- 提供便捷的高级功能
- 处理跨模块的操作

#### 设计原则
- 面向业务场景设计
- 可以调用多个 API Layer 的类
- 包含业务逻辑和流程编排
- 提供更友好的参数形式（如支持 URL）

#### 类设计

##### WikiNodeService
```typescript
/**
 * 知识空间节点高级服务
 * 基于 WikiNodeAPI 提供组合能力
 */
class WikiNodeService {
  constructor(
    private wikiNodeAPI: WikiNodeAPI,
    private docxAPI: DocxAPI,
    private sheetAPI: SheetAPI,
    private bitableAPI: BitableAPI
  ) {}
  
  // 基于 URL 的便捷操作
  - getNodeByUrl(url: string)
  - updateNodeByUrl(url: string, title: string)
  
  // 递归操作
  - getAllDescendants(nodeToken: string, maxDepth?: number)
  - getNodeTree(nodeToken: string)
  
  // 批量操作
  - batchCreateNodes(nodes: NodeConfig[])
  - batchUpdateNodes(updates: NodeUpdate[])
  
  // 复杂查询
  - findNodesByTitle(spaceId: string, title: string)
  - getNodePath(nodeToken: string)  // 获取从根到当前节点的路径
}
```

##### DocService
```typescript
/**
 * 文档内容服务
 * 提供跨文档类型的统一操作
 */
class DocService {
  constructor(
    private docxAPI: DocxAPI,
    private sheetAPI: SheetAPI,
    private bitableAPI: BitableAPI
  ) {}
  
  // 统一内容获取
  - getContent(objType: string, token: string)  // 根据类型自动选择API
  - getRawText(objType: string, token: string)  // 获取纯文本
  
  // 内容转换
  - exportToMarkdown(docToken: string)
  - exportToJSON(objType: string, token: string)
  
  // 内容分析
  - extractLinks(docToken: string)
  - getDocStatistics(docToken: string)  // 字数、段落数等
}
```

##### SpaceService
```typescript
/**
 * 知识空间级别服务
 * 处理整个空间的操作
 */
class SpaceService {
  constructor(
    private wikiNodeAPI: WikiNodeAPI,
    private wikiNodeService: WikiNodeService
  ) {}
  
  // 空间级别操作
  - getAllNodes(spaceId: string)
  - searchInSpace(spaceId: string, query: string)
  
  // 空间分析
  - getSpaceStatistics(spaceId: string)
  - getSpaceStructure(spaceId: string)
  
  // 批量导出
  - exportSpace(spaceId: string, format: 'json' | 'markdown')
}
```

---

### 2.3 Facade Layer (门面层)

#### 职责
- 提供统一的对外接口
- 保持向后兼容
- 简化使用方式
- 可选的快捷访问

#### 设计

```typescript
/**
 * LarkDoc 门面类
 * 统一对外接口，向下委托给各个 Service
 */
class LarkDoc {
  // 各层实例
  private wikiNodeAPI: WikiNodeAPI;
  private docxAPI: DocxAPI;
  private sheetAPI: SheetAPI;
  private bitableAPI: BitableAPI;
  
  private wikiNodeService: WikiNodeService;
  private docService: DocService;
  private spaceService: SpaceService;
  
  constructor(client: lark.Client) {
    // 初始化 API 层
    this.wikiNodeAPI = new WikiNodeAPI(client);
    this.docxAPI = new DocxAPI(client);
    this.sheetAPI = new SheetAPI(client);
    this.bitableAPI = new BitableAPI(client);
    
    // 初始化 Service 层
    this.wikiNodeService = new WikiNodeService(
      this.wikiNodeAPI,
      this.docxAPI,
      this.sheetAPI,
      this.bitableAPI
    );
    this.docService = new DocService(
      this.docxAPI,
      this.sheetAPI,
      this.bitableAPI
    );
    this.spaceService = new SpaceService(
      this.wikiNodeAPI,
      this.wikiNodeService
    );
  }
  
  // 提供快捷访问（直接委托）
  getSpaceNode = this.wikiNodeAPI.getNode.bind(this.wikiNodeAPI);
  getSpaceNodeByUrl = this.wikiNodeService.getNodeByUrl.bind(this.wikiNodeService);
  
  // 或者提供分组访问
  get nodes() {
    return {
      get: this.wikiNodeAPI.getNode.bind(this.wikiNodeAPI),
      create: this.wikiNodeAPI.createNode.bind(this.wikiNodeAPI),
      update: this.wikiNodeAPI.updateNodeTitle.bind(this.wikiNodeAPI),
      // ... 其他方法
      
      // Service 层方法
      getByUrl: this.wikiNodeService.getNodeByUrl.bind(this.wikiNodeService),
      getTree: this.wikiNodeService.getNodeTree.bind(this.wikiNodeService),
    };
  }
  
  get docs() {
    return {
      getContent: this.docService.getContent.bind(this.docService),
      exportToMarkdown: this.docService.exportToMarkdown.bind(this.docService),
      // ...
    };
  }
  
  get space() {
    return {
      getAll: this.spaceService.getAllNodes.bind(this.spaceService),
      search: this.spaceService.searchInSpace.bind(this.spaceService),
      // ...
    };
  }
}
```

---

## 三、目录结构

```
src/
├── core/
│   ├── lark-doc.ts              # 门面层：统一入口
│   │
│   ├── api/                     # API 层：底层封装
│   │   ├── base-api.ts         # 基础 API 类（处理认证、错误）
│   │   ├── wiki-node-api.ts    # 知识空间节点 API
│   │   ├── docx-api.ts         # 新版文档 API
│   │   ├── sheet-api.ts        # 电子表格 API
│   │   ├── bitable-api.ts      # 多维表格 API
│   │   └── wiki-search-api.ts  # 搜索 API
│   │
│   ├── services/                # Service 层：组合能力
│   │   ├── wiki-node-service.ts
│   │   ├── doc-service.ts
│   │   └── space-service.ts
│   │
│   └── types/                   # 类型定义
│       ├── api-types.ts        # API 层类型
│       ├── service-types.ts    # Service 层类型
│       └── index.ts
│
└── utils/                       # 工具函数
    ├── auth-store.ts           # 认证管理
    ├── error-handler.ts        # 错误处理
    └── token-extractor.ts      # URL 解析
```

## 四、使用示例

### 4.1 底层 API 使用
```typescript
// 直接使用底层 API（完全控制）
const larkDoc = new LarkDoc(client);
const node = await larkDoc.wikiNodeAPI.getNode('nodeToken', 'wiki');
```

### 4.2 Service 层使用
```typescript
// 使用 Service 层（推荐）
const larkDoc = new LarkDoc(client);
const node = await larkDoc.wikiNodeService.getNodeByUrl('https://...');
const tree = await larkDoc.wikiNodeService.getNodeTree('nodeToken');
```

### 4.3 门面层使用
```typescript
// 使用门面层（最简单）
const larkDoc = new LarkDoc(client);

// 方式1: 直接调用
const node = await larkDoc.getSpaceNodeByUrl('https://...');

// 方式2: 分组调用
const node = await larkDoc.nodes.getByUrl('https://...');
const content = await larkDoc.docs.getContent('docx', 'docToken');
```

## 五、迁移策略

### 5.1 向后兼容
保持现有方法签名不变，逐步迁移到新架构：

```typescript
class LarkDoc {
  // 保留旧方法（标记为 deprecated）
  /** @deprecated 使用 nodes.get 代替 */
  async getSpaceNode(nodeToken: string, objType: string) {
    return this.wikiNodeAPI.getNode(nodeToken, objType);
  }
  
  // 新方法
  get nodes() {
    return {
      get: this.wikiNodeAPI.getNode.bind(this.wikiNodeAPI),
      // ...
    };
  }
}
```

### 5.2 分步实施
1. **第一阶段**: 创建 API 层，迁移底层调用
2. **第二阶段**: 创建 Service 层，迁移组合逻辑
3. **第三阶段**: 重构门面层，提供新旧两套接口
4. **第四阶段**: 废弃旧接口，完成迁移

## 六、设计优势

### 6.1 清晰的职责分离
- API 层只负责调用飞书 SDK
- Service 层负责业务逻辑
- Facade 层提供友好接口

### 6.2 易于测试
- 每层可以独立测试
- 可以 mock 下层依赖

### 6.3 易于扩展
- 新增飞书 API：在 API 层添加
- 新增业务功能：在 Service 层添加
- 不影响现有代码

### 6.4 代码复用
- API 层可以被多个 Service 复用
- Service 层可以被多个门面复用

### 6.5 向后兼容
- 保留旧接口，平滑迁移
- 不破坏现有使用方

