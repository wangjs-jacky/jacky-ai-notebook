# Markdown 转文档功能使用指南

## 概述

本 SDK 提供了完整的 Markdown 到飞书文档的转换和导入功能，包括：

1. **convertMarkdown()** - 将 Markdown 转换为飞书文档块结构
2. **createBlockDescendant()** - 批量创建文档块，将内容添加到文档中

这两个方法结合使用，可以实现从 Markdown 文件创建飞书文档的完整流程。

## 前置条件

### 应用权限配置

需要在飞书开放平台配置以下权限：

- `docx:document:write` - 创建、更新和删除文档
- `docx:document:read` - 读取文档内容
- `wiki:wiki:write` - 创建和修改知识库节点（如果要在知识库中创建）

## 功能特性

### 支持的 Markdown 语法

- ✅ 标题（H1-H6）
- ✅ 文本格式化（**粗体**、*斜体*、~~删除线~~）
- ✅ `行内代码`
- ✅ 代码块
- ✅ 引用块
- ✅ 有序列表
- ✅ 无序列表
- ✅ 超链接
- ✅ 图片
- ✅ 表格

## 使用方法

### 方法 1: 仅转换 Markdown（不创建文档）

如果你只想看看 Markdown 会被转换成什么样的块结构：

```typescript
import { LarkDoc, larkClient, LoginHandler } from 'jacky-lark-api';
import { getLarkConfig } from './config';

const config = getLarkConfig();

// 登录
await LoginHandler.handleLogin(config);

// 创建实例
const larkDoc = new LarkDoc(larkClient);

// Markdown 内容
const markdown = `
# 标题

这是一段**粗体**和*斜体*文本。

- 列表项 1
- 列表项 2
`;

// 转换为飞书块结构
const blocks = await larkDoc.docxAPI.convertMarkdown(markdown);

console.log('转换结果:', JSON.stringify(blocks, null, 2));
```

### 方法 2: 创建文档并添加 Markdown 内容（完整流程）

```typescript
import { LarkDoc, larkClient, LoginHandler } from 'jacky-lark-api';
import { getLarkConfig } from './config';

const config = getLarkConfig();

async function createDocFromMarkdown() {
    // 登录
    await LoginHandler.handleLogin(config);
    const larkDoc = new LarkDoc(larkClient);

    // 步骤1: 在知识库中创建文档节点
    const newNode = await larkDoc.wikiNodeService.createNodeByUrl(
        "https://xxx.feishu.cn/wiki/YourParentNodeUrl",
        {
            title: '从 Markdown 创建的文档'
        }
    );

    // 步骤2: 准备 Markdown 内容
    const markdown = `
# 欢迎

这是通过 Markdown 创建的文档。

## 功能列表

- 支持多种格式
- 自动转换
- 简单易用
`;

    // 步骤3: 转换 Markdown 为块结构
    const blocks = await larkDoc.docxAPI.convertMarkdown(markdown);

    // 步骤4: 将块添加到文档中
    // 注意：convertMarkdown 返回的数据结构包含：
    // - blocks: 所有块（包括嵌套的子块）
    // - first_level_block_ids: 第一级块的 ID 列表
    if (blocks?.blocks && blocks.blocks.length > 0 && blocks?.first_level_block_ids) {
        // 使用 first_level_block_ids 作为顶层块 ID
        const childrenIds = blocks.first_level_block_ids;
        
        // 清理块数据：删除不应该传递的字段
        const descendants = blocks.blocks.map((block: any) => {
            const cleanBlock = { ...block };
            if (cleanBlock.table?.property?.merge_info) {
                delete cleanBlock.table.property.merge_info;
            }
            return cleanBlock;
        });

        const result = await larkDoc.docxAPI.createBlockDescendant({
            document_id: newNode.obj_token!,
            block_id: newNode.obj_token!,
            children_id: childrenIds,
            index: 0,
            descendants: descendants,
        });

        console.log('文档创建成功！');
        console.log('访问链接:', 'https://xxx.feishu.cn/wiki/' + newNode.node_token);
    }
}

createDocFromMarkdown();
```

### 方法 3: 使用便捷方法（最简单）

如果你不需要控制每一步细节，可以使用封装好的便捷方法：

```typescript
import { LarkDoc, larkClient, LoginHandler } from 'jacky-lark-api';
import { getLarkConfig } from './config';

async function quickAddMarkdown() {
    // 登录
    await LoginHandler.handleLogin(config);
    const larkDoc = new LarkDoc(larkClient);

    // 创建文档节点
    const newNode = await larkDoc.wikiNodeService.createNodeByUrl(
        "https://xxx.feishu.cn/wiki/YourParentNodeUrl",
        { title: '快速创建的文档' }
    );

    // 一步完成：转换 + 添加内容
    const markdown = `
# 标题
内容...
`;

    await larkDoc.docService.addMarkdownContent(
        newNode.obj_token!,
        markdown
    );

    console.log('完成！', 'https://xxx.feishu.cn/wiki/' + newNode.node_token);
}

quickAddMarkdown();
```

**优点：**
- 自动处理数据映射
- 自动验证数据结构
- 错误处理更友好
- 代码更简洁

### 方法 4: 从 Markdown 文件导入

```typescript
import * as fs from 'fs';
import { LarkDoc, larkClient, LoginHandler } from 'jacky-lark-api';

async function importMarkdownFile(filePath: string, parentWikiUrl: string) {
    // 登录
    await LoginHandler.handleLogin(config);
    const larkDoc = new LarkDoc(larkClient);

    // 读取 Markdown 文件
    const markdown = fs.readFileSync(filePath, 'utf-8');
    
    // 从文件名提取标题
    const title = filePath.split('/').pop()?.replace('.md', '') || '未命名文档';

    // 创建文档节点
    const newNode = await larkDoc.wikiNodeService.createNodeByUrl(
        parentWikiUrl,
        { title }
    );

    // 转换并添加内容
    const blocks = await larkDoc.docxAPI.convertMarkdown(markdown);
    
    if (blocks?.document?.blocks && blocks.document.blocks.length > 0) {
        const childrenIds = blocks.document.blocks.map((b: any) => b.block_id);
        await larkDoc.docxAPI.createBlockDescendant({
            document_id: newNode.obj_token!,
            block_id: newNode.obj_token!,
            children_id: childrenIds,
            descendants: blocks.document.blocks,
        });
    }

    return newNode;
}

// 使用示例
importMarkdownFile('./README.md', 'https://xxx.feishu.cn/wiki/YourWikiUrl');
```

## 数据结构映射说明

### convertMarkdown 返回的数据结构

```typescript
{
    blocks: Array<BlockData>,           // 所有块（包括嵌套的子块，如表格单元格）
    first_level_block_ids: string[],   // 第一级块的 ID 列表（顶层块）
    block_id_to_image_urls: Array<{    // 图片块的 URL 映射
        block_id: string,
        image_url: string
    }>
}
```

### 如何映射到 createBlockDescendant

```typescript
// ✅ 正确的映射方式
const blocks = await larkDoc.docxAPI.convertMarkdown(markdown);

// 清理块数据：删除不应该传递的字段
const cleanedBlocks = blocks.blocks.map((block: any) => {
    const cleanBlock = { ...block };
    
    // 删除表格块中的 merge_info 字段
    if (cleanBlock.table?.property?.merge_info) {
        delete cleanBlock.table.property.merge_info;
    }
    
    return cleanBlock;
});

await larkDoc.docxAPI.createBlockDescendant({
    document_id: docToken,
    block_id: docToken,
    children_id: blocks.first_level_block_ids,  // 使用第一级块 ID
    descendants: cleanedBlocks,                  // 使用清理后的块数据
});
```

**重要说明：**

1. **children_id** 应该使用 `first_level_block_ids`，这是文档的顶层块
2. **descendants** 应该使用清理后的 `blocks`，包含所有块数据（包括嵌套块）
3. **必须删除 merge_info**：转换返回的表格块中包含 `merge_info` 字段，但创建时不应该传递这个字段
4. 嵌套块（如表格单元格）会自动关联到父块

### 块类型说明

常见的 `block_type` 值：

| block_type | 说明 |
|------------|------|
| 2 | 文本块 |
| 3 | 一级标题 |
| 4 | 二级标题 |
| 5 | 三级标题 |
| 12 | 无序列表 |
| 13 | 有序列表 |
| 14 | 代码块 |
| 15 | 引用块 |
| 27 | 图片 |
| 31 | 表格 |
| 32 | 表格单元格 |

## API 参考

### convertMarkdown()

将 Markdown 内容转换为飞书文档块结构。

**参数：**
- `markdown: string` - Markdown 文本内容

**返回：**
```typescript
{
    blocks: Array<{
        block_id: string;
        block_type: number;
        parent_id: string;
        children?: string[];
        // ... 其他块属性（text, heading1, table 等）
    }>,
    first_level_block_ids: string[],
    block_id_to_image_urls?: Array<{
        block_id: string,
        image_url: string
    }>
}
```

**示例：**
```typescript
const result = await larkDoc.docxAPI.convertMarkdown('# Hello World');
console.log('总块数:', result.blocks.length);
console.log('顶层块数:', result.first_level_block_ids.length);
```

### createBlockDescendant()

批量创建文档块，将内容添加到文档中。

**参数：**
```typescript
{
    document_id: string;        // 文档 ID
    block_id: string;           // 父级块 ID（根节点使用 document_id）
    children_id: string[];      // 子块 ID 列表
    index?: number;             // 插入位置，默认 0（开头）
    descendants: any[];         // 块数据数组
    document_revision_id?: number;  // 文档版本，默认 -1（最新）
}
```

**返回：**
```typescript
{
    children: string[];  // 创建的块 ID 列表
    document_revision_id: number;  // 新的文档版本号
}
```

**示例：**
```typescript
const result = await larkDoc.docxAPI.createBlockDescendant({
    document_id: 'docToken123',
    block_id: 'docToken123',
    children_id: ['block1', 'block2'],
    descendants: [/* 块数据 */],
});
```

## Markdown 示例

### 基础格式

```markdown
# 一级标题
## 二级标题
### 三级标题

这是普通文本，支持 **粗体**、*斜体*、~~删除线~~ 和 `行内代码`。

[这是一个链接](https://open.feishu.cn)
```

### 列表

```markdown
有序列表：
1. 第一项
2. 第二项
3. 第三项

无序列表：
- 项目 A
- 项目 B
- 项目 C
```

### 代码块

````markdown
```javascript
function hello() {
    console.log("Hello, World!");
}
```
````

### 引用

```markdown
> 这是一段引用文本
> 可以有多行
```

### 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| 1   | 2   | 3   |
```

### 图片

```markdown
![图片描述](https://example.com/image.png)
```

## 注意事项

1. **块 ID 唯一性**：转换后的块都有唯一的 block_id，由飞书 API 自动生成
2. **文档权限**：需要确保有文档的写入权限
3. **版本控制**：使用 `document_revision_id: -1` 表示操作最新版本
4. **插入位置**：`index: 0` 表示插入到文档开头，可以调整
5. **错误处理**：建议添加 try-catch 处理可能的错误
6. **大文件处理**：对于很大的 Markdown 文件，建议分块处理

## 完整示例

查看 `examples/create-document-demo.ts` 获取完整的可运行示例：

```bash
# 编译
npm run build

# 运行示例
node dist/examples/create-document-demo.js
```

## 常见问题

### Q: 为什么要删除 merge_info 字段？

A: `convertMarkdown` 返回的表格块中包含 `merge_info` 字段，这个字段描述了表格单元格的合并信息。但是在调用 `createBlockDescendant` 创建块时，飞书 API 不接受这个字段，必须删除，否则会导致创建失败。

```typescript
// ✅ 正确：清理 merge_info
const cleanedBlocks = blocks.blocks.map((block: any) => {
    const cleanBlock = { ...block };
    if (cleanBlock.table?.property?.merge_info) {
        delete cleanBlock.table.property.merge_info;
    }
    return cleanBlock;
});

// ❌ 错误：未清理会导致 API 错误
await createBlockDescendant({ descendants: blocks.blocks });
```

### Q: 转换后的内容如何修改？

A: 可以使用 `documentBlock.update` 或其他块操作 API 来修改已创建的块。

### Q: 支持哪些 Markdown 语法？

A: 支持标准 Markdown 语法，包括标题、列表、代码块、表格、图片等。具体请参考飞书官方文档。

### Q: 如何处理图片？

A: 图片 URL 需要是公开可访问的。如果是本地图片，需要先上传到飞书再使用。

### Q: 转换失败怎么办？

A: 检查：
1. Markdown 语法是否正确
2. 是否有足够的 API 权限
3. 网络连接是否正常
4. 查看错误信息中的具体代码

### Q: 为什么要使用 first_level_block_ids 而不是所有块的 ID？

A: `first_level_block_ids` 是文档的顶层块，而 `blocks` 数组包含所有块（包括嵌套的表格单元格等）。如果把所有块的 ID 都放在 `children_id` 中，会导致文档结构错乱。正确的做法是只把顶层块放在 `children_id`，嵌套块会通过它们的 `parent_id` 自动关联。

## 官方文档

- [Markdown 转换 API](https://open.larkenterprise.com/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert)
- [批量创建块 API](https://open.larkenterprise.com/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create)
- [飞书文档开发指南](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/overview)

