/**
 * 创建文档示例
 * 演示如何使用 API 创建新文档
 */

import * as fs from 'fs';
import * as path from 'path';
import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { larkClient, LarkDoc } from '../src/core/index.js';

const config = getLarkConfig();

/**
 * 示例1: 创建新文档并添加 Markdown 内容
 */
async function demoCreateDocument(larkDoc: LarkDoc) {
    console.log('\n=== 示例1: 创建新文档并添加内容 ===\n');

    try {
        // 步骤1: 在知识库中创建一个新文档节点
        console.log('1️⃣  在知识库中创建文档节点:');
        const newNode = await larkDoc.wikiNodeService.createNodeByUrl(
            "https://trip.larkenterprise.com/wiki/Z4KjwE6hnixLc0kt6c7cZOgbnzd",
            {
                title: 'Markdown 转文档功能使用指南'
            }
        );
        console.log('   创建成功！');
        console.log('   文档节点 Token:', newNode.node_token);
        console.log('   文档 Token:', newNode.obj_token);
        console.log();

        // 步骤2: 准备 Markdown 内容
        // 从 docs/MARKDOWN-TO-DOC.md 文件中读取内容
        console.log('2️⃣  读取 Markdown 文件:');
        const docPath = path.join(process.cwd(), 'docs', 'MARKDOWN-TO-DOC.md');
        const mdStr = fs.readFileSync(docPath, 'utf-8');
        
        console.log('   文件路径:', docPath);
        console.log('   内容长度:', mdStr.length, '字符');
        console.log();

        // 步骤3: 使用便捷方法一步完成：转换 + 清理 + 添加内容
        console.log('3️⃣  将 Markdown 内容添加到文档:');
        console.log('   使用 DocService.addMarkdownContent() 方法');
        console.log('   自动处理：转换 → 清理 → 创建块');
        
        try {
            const result = await larkDoc.docService.addMarkdownContent(
                newNode.obj_token!,
                mdStr
            );
            
            console.log('   ✅ 内容添加成功！');
            console.log('   添加的块数量:', result?.children?.length || 0);
        } catch (error: any) {
            console.error('   ❌ 添加内容失败:', error.message);
            throw error;
        }
        console.log();

        // 步骤4: 提供访问链接
        console.log('4️⃣  文档信息:');
        console.log('   - 节点 Token:', newNode.node_token);
        console.log('   - 文档 Token:', newNode.obj_token);
        console.log('   - 访问链接: https://trip.larkenterprise.com/wiki/' + newNode.node_token);
        console.log();

        return { node: newNode };
    } catch (error: any) {
        console.error('❌ 创建文档失败:', error.message);
        throw error;
    }
}

/**
 * 示例2: 向已有文档添加 Markdown 内容
 */
async function demoAddToExistingDocument(larkDoc: LarkDoc) {
    console.log('\n=== 示例2: 向已有文档添加内容 ===\n');

    try {
        // 步骤1: 从已有文档链接获取节点信息
        console.log('1️⃣  获取已有文档信息:');
        const existingDocUrl = "https://trip.larkenterprise.com/wiki/Z4KjwE6hnixLc0kt6c7cZOgbnzd";
        
        const nodeInfo = await larkDoc.wikiNodeService.getNodeByUrl(existingDocUrl);
        console.log('   文档标题:', nodeInfo.title);
        console.log('   文档节点 Token:', nodeInfo.node_token);
        console.log('   文档 Token:', nodeInfo.obj_token);
        console.log();

        // 步骤2: 准备要添加的 Markdown 内容
        console.log('2️⃣  准备 Markdown 内容:');
        const additionalContent = `
---

## 更新记录

### ${new Date().toLocaleDateString('zh-CN')} 更新

本次更新内容：

1. **新增功能**
   - 支持向已有文档添加内容
   - 自动获取文档信息
   - 保留原有内容

2. **改进点**
   - 更好的错误处理
   - 清晰的日志输出
   - 完整的示例代码

### 使用示例

\`\`\`typescript
// 向已有文档添加内容
const nodeInfo = await larkDoc.wikiNodeService.getNodeByUrl(docUrl);
await larkDoc.docService.addMarkdownContent(nodeInfo.obj_token!, markdown);
\`\`\`

**注意事项：**
- 内容会添加到文档末尾
- 不会覆盖原有内容
- 需要有文档的写入权限
`;

        console.log('   内容长度:', additionalContent.length, '字符');
        console.log();

        // 步骤3: 添加内容到已有文档
        console.log('3️⃣  添加内容到文档:');
        console.log('   使用 DocService.addMarkdownContent() 方法');
        
        try {
            const result = await larkDoc.docService.addMarkdownContent(
                nodeInfo.obj_token!,
                additionalContent
            );
            
            console.log('   ✅ 内容添加成功！');
            console.log('   添加的块数量:', result?.children?.length || 0);
        } catch (error: any) {
            console.error('   ❌ 添加内容失败:', error.message);
            throw error;
        }
        console.log();

        // 步骤4: 提供访问链接
        console.log('4️⃣  文档信息:');
        console.log('   - 节点 Token:', nodeInfo.node_token);
        console.log('   - 文档 Token:', nodeInfo.obj_token);
        console.log('   - 访问链接: https://trip.larkenterprise.com/wiki/' + nodeInfo.node_token);
        console.log();

        return { node: nodeInfo };
    } catch (error: any) {
        console.error('❌ 向已有文档添加内容失败:', error.message);
        throw error;
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        console.log('🚀 飞书文档 Markdown 导入示例\n');

        // 1. 登录
        console.log('🔐 正在登录...');
        const authInfo = await LoginHandler.handleLogin(config);

        if (!authInfo) {
            console.error('❌ 登录失败');
            process.exit(1);
        }

        console.log('✅ 登录成功\n');

        // 2. 创建 LarkDoc 实例
        const larkDoc = new LarkDoc(larkClient);

        // 3. 选择要运行的示例
        // 通过环境变量或命令行参数选择
        const demoType = process.env.DEMO_TYPE || 'create'; // 'create' 或 'add'

        console.log('📋 可用示例:');
        console.log('   1. create - 创建新文档并添加内容（默认）');
        console.log('   2. add    - 向已有文档添加内容');
        console.log(`\n当前运行: ${demoType === 'add' ? '示例2' : '示例1'}`);
        console.log('提示: 使用 DEMO_TYPE=add npm run ... 切换示例\n');

        if (demoType === 'add') {
            // 示例2: 向已有文档添加内容
            await demoAddToExistingDocument(larkDoc);
        } else {
            // 示例1: 创建新文档并添加内容（默认）
            await demoCreateDocument(larkDoc);
        }

        console.log('\n✅ 示例执行完成！');
        console.log('\n💡 提示:');
        console.log('   - 查看完整文档: docs/MARKDOWN-TO-DOC.md');
        console.log('   - 切换示例: DEMO_TYPE=add node dist/examples/create-document-demo.js');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ 示例执行失败:', error);
        process.exit(1);
    }
}

// 运行示例
main();

