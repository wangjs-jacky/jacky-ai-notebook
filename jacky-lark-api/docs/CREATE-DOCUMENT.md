# 创建文档功能使用指南

## 概述

本 SDK 支持通过飞书 API 创建新文档。提供了两种使用方式：

1. **DocxAPI.create()** - 底层 API，提供更多控制
2. **DocService.createDocument()** - 高层服务，使用更简便

## 前置条件

### 1. 应用权限配置

在飞书开放平台配置应用权限，需要开通以下权限：

- `docx:document:write` - 创建、更新和删除文档

### 2. 获取文件夹 Token

创建文档需要指定目标文件夹的 `folder_token`。获取方式：

1. 在飞书云空间中找到目标文件夹
2. 右键点击文件夹，选择"复制链接"
3. 从链接中提取 `folder_token`

示例链接：
```
https://xxx.feishu.cn/drive/folder/fldcnqquW1svRIYVT2Np6Iabcef
                                   ↑ 这是 folder_token
```

## 使用方法

### 方法 1: 使用 DocxAPI (推荐用于复杂场景)

```typescript
import { LarkDoc, larkClient, LoginHandler } from 'jacky-lark-api';
import { getLarkConfig } from './config';

const config = getLarkConfig();

// 登录
await LoginHandler.handleLogin(config);

// 创建实例
const larkDoc = new LarkDoc(larkClient);

// 创建文档
const result = await larkDoc.docxAPI.create({
    folder_token: 'fldcnqquW1svRIYVT2Np6Iabcef',
    title: '我的新文档'
});

console.log('文档 ID:', result.document?.document_id);
console.log('文档 URL:', result.document?.url);
```

### 方法 2: 使用 DocService (推荐用于简单场景)

```typescript
import { LarkDoc, larkClient, LoginHandler } from 'jacky-lark-api';
import { getLarkConfig } from './config';

const config = getLarkConfig();

// 登录
await LoginHandler.handleLogin(config);

// 创建实例
const larkDoc = new LarkDoc(larkClient);

// 创建文档（更简洁）
const result = await larkDoc.docService.createDocument(
    'fldcnqquW1svRIYVT2Np6Iabcef',
    '我的新文档'
);

console.log('文档 ID:', result.document?.document_id);
console.log('文档 URL:', result.document?.url);
```

## API 参数说明

### CreateDocParams

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| folder_token | string | 是 | 文件夹 token，文档将创建在此文件夹中 |
| title | string | 是 | 文档标题 |

### 返回值

返回的 `result.document` 对象包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| document_id | string | 文档唯一标识符 |
| revision_id | number | 文档版本号 |
| title | string | 文档标题 |
| url | string | 文档访问链接 |

## 完整示例

查看 `examples/create-document-demo.ts` 获取完整的可运行示例：

```bash
# 编译示例
npm run build

# 运行示例
node dist/examples/create-document-demo.js
```

## 错误处理

```typescript
try {
    const result = await larkDoc.docxAPI.create({
        folder_token: 'fldcnqquW1svRIYVT2Np6Iabcef',
        title: '我的新文档'
    });
    console.log('创建成功:', result.document?.document_id);
} catch (error: any) {
    console.error('创建失败:', error.message);
    // 常见错误：
    // - 权限不足
    // - folder_token 无效
    // - 网络错误
}
```

## 官方文档参考

- [创建文档 API 文档](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/create)
- [飞书 Node SDK 文档](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development)

## 注意事项

1. **用户认证**：创建文档需要用户身份验证，请确保已完成 OAuth 登录
2. **权限检查**：确保应用已获得 `docx:document:write` 权限
3. **文件夹权限**：用户需要对目标文件夹有写入权限
4. **标题长度**：建议文档标题不超过 800 个字符
5. **频率限制**：注意飞书 API 的调用频率限制，避免过于频繁的请求

## 更多功能

创建文档后，您还可以：

- 使用 `docxAPI.getRawContent()` 获取文档内容
- 使用 `docxAPI.listBlocks()` 获取文档块信息
- 使用 `docxAPI.getBlock()` 获取特定块的详情

详见其他文档。

