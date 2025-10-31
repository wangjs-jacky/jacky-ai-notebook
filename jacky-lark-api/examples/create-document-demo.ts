/**
 * 创建文档示例
 * 演示如何使用 API 创建新文档
 */

import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { larkClient, LarkDoc } from '../src/core/index.js';

const config = getLarkConfig();

/**
 * 示例: 创建文档并添加 Markdown 内容
 */
async function demoCreateDocument(larkDoc: LarkDoc) {
    console.log('\n=== 创建文档示例 ===\n');

    try {
        // 步骤1: 在知识库中创建一个新文档节点
        console.log('1️⃣  在知识库中创建文档节点:');
        const newNode = await larkDoc.wikiNodeService.createNodeByUrl(
            "https://trip.larkenterprise.com/wiki/Z4KjwE6hnixLc0kt6c7cZOgbnzd",
            {
                title: '通过 API 创建的文档（含 Markdown 内容）'
            }
        );
        console.log('   创建成功！');
        console.log('   文档节点 Token:', newNode.node_token);
        console.log('   文档 Token:', newNode.obj_token);
        console.log();

        // 步骤2: 准备 Markdown 内容
        const mdStr = `# 欢迎使用飞书 API

这是一个通过 API 创建的文档示例。

## 功能特性

- **文本格式化**：支持 *斜体* 和 ~~删除线~~
- \`代码片段\`
- [超链接](https://open.feishu.cn)

### 代码块示例

\`\`\`javascript
function hello() {
    console.log("Hello, Feishu!");
}
\`\`\`

### 引用

> 这是一段引用文本

### 列表

1. 有序列表项 1
2. 有序列表项 2

- 无序列表项 1
- 无序列表项 2

### 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| 创建文档 | ✅ | 已实现 |
| Markdown 转换 | ✅ | 已实现 |
| 内容编辑 | 🚧 | 开发中 |

### 图片

![Feishu Logo](https://sf3-scmcdn-cn.feishucdn.com/obj/feishu-static/lark/open/website/share-logo.png)
`;

        // 步骤3: 将 Markdown 转换为飞书文档块结构
        console.log('2️⃣  将 Markdown 转换为飞书文档块结构:');
        const blocks = await larkDoc.docxAPI.convertMarkdown(mdStr);
        console.log('   转换成功！',JSON.stringify(blocks, null, 2));
        console.log('   生成了', blocks?.document?.blocks?.length || 0, '个文档块');
        console.log('   块结构预览:', JSON.stringify(blocks?.document?.blocks?.[0], null, 2));
        console.log();

        // 步骤4: 可以使用这些块结构来更新文档内容（需要其他 API）
        console.log('3️⃣  提示:');
        console.log('   - 转换后的块结构可以用于文档内容编辑');
        console.log('   - 需要使用 documentBlock.batchCreate 等 API 来添加内容');
        console.log('   - 文档链接: https://trip.larkenterprise.com/wiki/' + newNode.node_token);
        console.log();

        return { node: newNode, blocks };
    } catch (error: any) {
        console.error('❌ 创建文档失败:', error.message);
        throw error;
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        console.log('🚀 飞书文档创建示例\n');

        // 1. 登录
        console.log('🔐 正在登录...');
        const authInfo = await LoginHandler.handleLogin(config);

        if (!authInfo) {
            console.error('❌ 登录失败');
            process.exit(1);
        }

        console.log('✅ 登录成功');

        // 2. 创建 LarkDoc 实例
        const larkDoc = new LarkDoc(larkClient);

        // 3. 执行创建文档示例
        await demoCreateDocument(larkDoc);

        console.log('\n✅ 示例执行完成！');
        process.exit(0);
    } catch (error) {
        console.error('❌ 示例执行失败:', error);
        process.exit(1);
    }
}

// 运行示例
main();

