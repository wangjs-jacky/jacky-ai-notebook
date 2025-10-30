# 飞书知识库 API 使用方式说明

`LarkDocClient` 支持两种使用方式来传递 `user_access_token`，你可以根据自己的需求选择。

## 方式一：预先设置 Token（推荐用于单用户场景）

这种方式适合在应用启动时设置一次 token，后续所有调用都使用这个 token。

```typescript
import { LarkDocClient, getTokenOnly } from 'jacky-lark-api';

// 创建客户端
const docClient = new LarkDocClient({
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
});

// 预先设置访问令牌
docClient.setAccessToken('your_user_access_token');

// 后续所有调用都会自动使用这个 token
const { token: nodeToken, objType } = getTokenOnly('https://xxx.feishu.cn/wiki/xxx');
const nodeInfo = await docClient.getSpaceNode(nodeToken, objType || 'wiki');
const childNodes = await docClient.listAllSpaceNodes(nodeInfo.space_id, nodeToken);
const allDocs = await docClient.getAllDocuments(nodeToken, objType || 'wiki');
```

**优点**：
- ✅ 代码简洁，不需要每次都传递 token
- ✅ 适合单用户或固定用户场景
- ✅ 减少代码重复

**缺点**：
- ❌ 不适合多用户场景（需要频繁切换用户）
- ❌ Token 保存在实例内，可能有安全风险

## 方式二：在调用时传递 Token（推荐用于多用户场景）

这种方式类似飞书官方 SDK 的 `lark.withUserAccessToken()` 方式，每次调用时都传递 token。

```typescript
import { LarkDocClient, getTokenOnly } from 'jacky-lark-api';

// 创建客户端（不预先设置 token）
const docClient = new LarkDocClient({
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
});

const userToken = 'user_access_token_from_somewhere';
const { token: nodeToken, objType } = getTokenOnly('https://xxx.feishu.cn/wiki/xxx');

// 每次调用时传递 token（作为最后一个参数）
const nodeInfo = await docClient.getSpaceNode(nodeToken, objType || 'wiki', userToken);
const childNodes = await docClient.listAllSpaceNodes(
  nodeInfo.space_id, 
  nodeToken, 
  userToken
);
const allDocs = await docClient.getAllDocuments(
  nodeToken, 
  objType || 'wiki', 
  false, 
  10, 
  userToken
);
```

**优点**：
- ✅ 更灵活，可以为每个请求使用不同的用户身份
- ✅ 适合多租户/多用户场景
- ✅ 更安全，token 不保存在实例中
- ✅ 类似飞书官方 SDK 的使用方式

**缺点**：
- ❌ 需要每次都传递 token，代码稍显冗长

## 混合使用

你也可以同时使用两种方式。如果调用时传递了 token，会优先使用传递的 token；否则使用预设的 token。

```typescript
const docClient = new LarkDocClient({
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
});

// 设置默认 token
docClient.setAccessToken('default_token');

// 使用默认 token
const nodeInfo1 = await docClient.getSpaceNode(nodeToken, 'wiki');

// 使用特定 token（会覆盖默认 token）
const nodeInfo2 = await docClient.getSpaceNode(nodeToken, 'wiki', 'another_token');
```

## API 参数说明

所有方法的最后一个参数都是可选的 `accessToken`：

```typescript
// 获取节点信息
getSpaceNode(
  nodeToken: string,
  objType?: WikiObjType,
  accessToken?: string  // 👈 可选
)

// 获取子节点列表
listSpaceNodes(
  spaceId: string,
  parentNodeToken?: string,
  pageToken?: string,
  pageSize?: number,
  accessToken?: string  // 👈 可选
)

// 获取所有子节点
listAllSpaceNodes(
  spaceId: string,
  parentNodeToken?: string,
  accessToken?: string  // 👈 可选
)

// 获取文档内容
getDocumentContent(
  objToken: string,
  objType: WikiObjType,
  accessToken?: string  // 👈 可选
)

// 递归获取所有文档
getAllDocuments(
  nodeToken: string,
  objType?: WikiObjType,
  includeContent?: boolean,
  maxDepth?: number,
  accessToken?: string  // 👈 可选
)

// 其他方法也类似...
```

## 与飞书官方 SDK 的对比

### 飞书官方 SDK

```javascript
const lark = require('@larksuiteoapi/node-sdk');

const client = new lark.Client({
  appId: 'app_id',
  appSecret: 'app_secret',
});

// 使用 withUserAccessToken 传递 token
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

### 我们的实现（方式二）

```typescript
import { LarkDocClient } from 'jacky-lark-api';

const docClient = new LarkDocClient({
  appId: 'app_id',
  appSecret: 'app_secret',
});

// 在调用时传递 token（类似 withUserAccessToken）
const response = await docClient.listSpaceNodes(
  '7520655084628394003',
  'N3yNwV4oMicO0UkIpk7crQ2wndg',
  undefined,
  50,
  'u-xxx'  // 👈 user_access_token
);

console.log(response);
```

## 最佳实践建议

### 单用户应用（如个人工具、脚本）

使用**方式一**（预先设置 token）：

```typescript
const docClient = new LarkDocClient(config);
docClient.setAccessToken(token);

// 简洁的调用
const docs = await docClient.getAllDocuments(nodeToken, 'wiki');
```

### 多用户应用（如 Web 服务、SaaS）

使用**方式二**（调用时传递 token）：

```typescript
const docClient = new LarkDocClient(config);

// 每个用户请求都传递对应的 token
app.get('/api/docs/:nodeToken', async (req, res) => {
  const userToken = req.session.userToken;  // 从 session 获取用户的 token
  const docs = await docClient.getAllDocuments(
    req.params.nodeToken,
    'wiki',
    false,
    10,
    userToken  // 传递当前用户的 token
  );
  res.json(docs);
});
```

### 混合场景

对于大部分请求使用同一个用户身份，偶尔需要切换用户：

```typescript
const docClient = new LarkDocClient(config);
docClient.setAccessToken(defaultToken);  // 设置默认 token

// 大部分请求使用默认 token
const docs1 = await docClient.getAllDocuments(nodeToken1, 'wiki');

// 某些请求需要使用特定用户的 token
const docs2 = await docClient.getAllDocuments(
  nodeToken2, 
  'wiki', 
  false, 
  10, 
  adminToken  // 使用管理员 token
);
```

## 总结

| 特性 | 方式一：预先设置 | 方式二：调用时传递 |
|------|----------------|-------------------|
| 代码简洁度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 灵活性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 多用户支持 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 安全性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 适用场景 | 个人工具、脚本 | Web 服务、SaaS |

选择最适合你项目的方式即可！

