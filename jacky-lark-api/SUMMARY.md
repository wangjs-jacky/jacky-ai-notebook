# 功能完成总结

## 已完成的新功能

### 1. Markdown 转换功能

#### API: `DocxAPI.convertMarkdown()`

将 Markdown 文本转换为飞书文档块结构。

**位置：** `src/core/api/docx-api.ts`

**功能特点：**
- 支持标准 Markdown 语法（标题、列表、代码块、表格、图片等）
- 返回完整的块结构，包括嵌套块
- 自动生成块 ID 和块层级关系

**返回数据结构：**
```typescript
{
    blocks: Array<BlockData>,           // 所有块（包括嵌套块）
    first_level_block_ids: string[],   // 第一级块 ID 列表
    block_id_to_image_urls: Array<...>  // 图片 URL 映射
}
```

---

### 2. 批量创建文档块功能

#### API: `DocxAPI.createBlockDescendant()`

将块结构批量添加到飞书文档中。

**位置：** `src/core/api/docx-api.ts`

**功能特点：**
- 支持批量创建多个块
- 自动处理块的层级关系
- 支持嵌套块（如表格单元格）
- 可指定插入位置

**参数说明：**
```typescript
{
    document_id: string;        // 文档 ID
    block_id: string;           // 父块 ID
    children_id: string[];      // 子块 ID 列表（第一级）
    descendants: any[];         // 所有块数据
    index?: number;             // 插入位置
    document_revision_id?: number;  // 文档版本
}
```

---

### 3. 便捷方法

#### API: `DocService.addMarkdownContent()`

一步完成 Markdown 转换和添加内容。

**位置：** `src/core/services/doc-service.ts`

**功能特点：**
- 自动映射数据结构
- 自动验证数据
- 友好的错误处理
- 简化的 API 调用

**使用示例：**
```typescript
await larkDoc.docService.addMarkdownContent(docToken, markdown);
```

---

## 数据结构映射关键点

### 正确的映射方式

```typescript
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

// ✅ 正确
await larkDoc.docxAPI.createBlockDescendant({
    document_id: docToken,
    block_id: docToken,
    children_id: blocks.first_level_block_ids,  // 使用第一级块 ID
    descendants: cleanedBlocks,                  // 使用清理后的块数据
});

// ❌ 错误示例1：使用所有块的 ID
await larkDoc.docxAPI.createBlockDescendant({
    document_id: docToken,
    block_id: docToken,
    children_id: blocks.blocks.map(b => b.block_id), // 错误！
    descendants: cleanedBlocks,
});

// ❌ 错误示例2：未清理 merge_info
await larkDoc.docxAPI.createBlockDescendant({
    document_id: docToken,
    block_id: docToken,
    children_id: blocks.first_level_block_ids,
    descendants: blocks.blocks,  // 错误！未清理
});
```

**重要说明：**
1. `children_id` 必须使用 `first_level_block_ids`（顶层块）
2. `descendants` 使用清理后的块数据（所有块，包括嵌套块）
3. **必须删除 `merge_info` 字段**：表格块中的 `merge_info` 在创建时不应传递
4. 嵌套块通过 `parent_id` 和 `children` 字段自动关联

---

## 类型定义

### 新增类型

**位置：** `src/core/types/api-types.ts`

```typescript
// Markdown 转换参数
export interface ConvertMarkdownParams {
    content: string;
    content_type: 'markdown';
}

// 批量创建块参数
export interface CreateBlockDescendantParams {
    document_id: string;
    block_id: string;
    children_id: string[];
    index?: number;
    descendants: any[];
    document_revision_id?: number;
}
```

---

## 文档

### 新增文档

1. **MARKDOWN-TO-DOC.md** - Markdown 转文档完整指南
   - 使用方法（4种方式）
   - 数据结构映射说明
   - 块类型说明
   - API 参考
   - 常见问题

2. **README.md 更新** - 添加了 Markdown 功能说明

---

## 示例代码

### 更新的示例

**位置：** `examples/create-document-demo.ts`

**展示内容：**
1. 创建文档节点
2. 准备 Markdown 内容
3. 转换 Markdown 为块结构
4. 添加内容到文档
5. 完整的错误处理

**运行方式：**
```bash
npm run build
node dist/examples/create-document-demo.js
```

---

## 支持的 Markdown 语法

- ✅ 标题 (H1-H6)
- ✅ 文本格式化（**粗体**、*斜体*、~~删除线~~）
- ✅ `行内代码`
- ✅ 代码块
- ✅ 引用块
- ✅ 有序列表
- ✅ 无序列表
- ✅ 超链接
- ✅ 图片
- ✅ 表格

---

## 常见块类型

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

---

## 使用建议

### 推荐使用方式

1. **简单场景** - 使用 `DocService.addMarkdownContent()`
   ```typescript
   await larkDoc.docService.addMarkdownContent(docToken, markdown);
   ```

2. **需要自定义** - 使用 `DocxAPI` 方法
   ```typescript
   const blocks = await larkDoc.docxAPI.convertMarkdown(markdown);
   // 自定义处理...
   await larkDoc.docxAPI.createBlockDescendant({...});
   ```

3. **批量处理** - 循环调用便捷方法

---

## 注意事项

1. **图片处理**：图片 URL 需要公开可访问
2. **权限要求**：需要 `docx:document:write` 权限
3. **文档版本**：使用 `-1` 表示最新版本
4. **块 ID**：由飞书 API 自动生成，无需手动指定
5. **嵌套块**：会自动处理父子关系

---

## 官方文档参考

- [Markdown 转换 API](https://open.larkenterprise.com/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert)
- [批量创建块 API](https://open.larkenterprise.com/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create)
- [飞书文档开发指南](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/overview)

