/**
 * 新架构示例
 * 演示如何使用三层架构的飞书 API
 */

import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { larkClient, LarkDoc } from '../src/core/index.js';

const config = getLarkConfig();

/**
 * 示例 2: 使用新 API - 节点操作
 */
async function demoNodeOperations(larkDoc: LarkDoc, wikiUrl: string) {
    console.log('\n=== 示例 2: 使用新 API - 节点操作 ===');
    console.log('推荐使用新的分组访问方式\n');

    // 使用新方法获取节点信息
    console.log('1️⃣  使用 nodes.getByUrl() 获取节点:');

    const node = await larkDoc.wikiNodeService.getNodeByUrl(wikiUrl);
    console.log("wjs: node", node);

    await larkDoc.wikiNodeService.updateNodeByUrl(wikiUrl, "新标题");
    await larkDoc.wikiNodeService.createNodeByUrl(wikiUrl, {
        title: "aaa",
    });

    // const rawContent = await larkDoc.docs.getRawContent(docToken);
    return node;
}

/**
 * 示例 3: 使用新 API - 文档操作
 */
// async function demoDocOperations(larkDoc: LarkDoc, docToken: string) {
//     console.log('\n=== 示例 3: 使用新 API - 文档操作 ===\n');

//     try {
//         // 获取文档纯文本内容
//         console.log('1️⃣  使用 docs.getRawContent() 获取文档内容:');
//         const rawContent = await larkDoc.docs.getRawContent(docToken);
//         const content = rawContent.data?.content || '';
//         console.log(`   内容长度: ${content.length} 字符`);
//         console.log(`   内容预览: ${content.substring(0, 100)}...\n`);

//         // 获取文档统计信息
//         console.log('2️⃣  使用 docs.getStatistics() 获取文档统计:');
//         const stats = await larkDoc.docs.getStatistics(docToken);
//         console.log(`   字符数: ${stats.wordCount}`);
//         console.log(`   段落数: ${stats.paragraphCount}`);
//         console.log(`   图片数: ${stats.imageCount}`);
//         console.log(`   链接数: ${stats.linkCount}\n`);

//         // 导出为 Markdown
//         console.log('3️⃣  使用 docs.exportToMarkdown() 导出为 Markdown:');
//         const markdown = await larkDoc.docs.exportToMarkdown(docToken);
//         console.log(`   Markdown 长度: ${markdown.length} 字符\n`);

//     } catch (error) {
//         console.log(`   ⚠️  文档操作示例需要有效的 docToken\n`);
//     }
// }

/**
 * 示例 4: 使用新 API - 空间操作
 */
// async function demoSpaceOperations(larkDoc: LarkDoc, spaceId: string, rootNodeToken: string) {
//     console.log('\n=== 示例 4: 使用新 API - 空间操作 ===\n');

//     try {
//         // 获取空间统计信息
//         console.log('1️⃣  使用 space.getStatistics() 获取空间统计:');
//         const stats = await larkDoc.space.getStatistics(spaceId, rootNodeToken);
//         console.log(`   节点总数: ${stats.totalNodes}`);
//         console.log(`   最大深度: ${stats.maxDepth}`);
//         console.log('   节点类型分布:');
//         Object.entries(stats.nodesByType).forEach(([type, count]) => {
//             console.log(`     - ${type}: ${count}`);
//         });
//         console.log();

//         // 在空间中搜索
//         console.log('2️⃣  使用 space.search() 在空间中搜索:');
//         const searchResults = await larkDoc.space.search(spaceId, '测试');
//         console.log(`   搜索结果数: ${searchResults.data?.items?.length || 0}\n`);

//         // 导出空间结构为 Markdown
//         console.log('3️⃣  使用 space.export() 导出空间结构:');
//         const exportedMarkdown = await larkDoc.space.export(spaceId, rootNodeToken, 'markdown');
//         console.log(`   导出的 Markdown 长度: ${exportedMarkdown.length} 字符`);
//         console.log('   结构预览:');
//         console.log(exportedMarkdown.split('\n').slice(0, 10).join('\n'));
//         console.log('   ...\n');

//     } catch (error) {
//         console.log(`   ⚠️  空间操作示例遇到错误: ${error}\n`);
//     }
// }

/**
 * 示例 5: 批量操作
 */
// async function demoBatchOperations(larkDoc: LarkDoc, spaceId: string, parentNodeToken: string) {
//     console.log('\n=== 示例 5: 批量操作 ===\n');

//     try {
//         // 批量创建节点
//         console.log('1️⃣  使用 nodes.batchCreate() 批量创建节点:');
//         const nodesToCreate = [
//             {
//                 title: '测试文档 1',
//                 obj_type: 'docx' as const,
//                 parent_node_token: parentNodeToken,
//             },
//             {
//                 title: '测试表格 1',
//                 obj_type: 'sheet' as const,
//                 parent_node_token: parentNodeToken,
//             },
//             {
//                 title: '测试多维表格 1',
//                 obj_type: 'bitable' as const,
//                 parent_node_token: parentNodeToken,
//             },
//         ];

//         const createdNodes = await larkDoc.nodes.batchCreate(spaceId, nodesToCreate);
//         console.log(`   成功创建 ${createdNodes.filter(n => n).length} 个节点`);
//         createdNodes.forEach((node, index) => {
//             if (node) {
//                 console.log(`   [${index + 1}] ${node.title} - ${node.node_token}`);
//             }
//         });
//         console.log();

//         // 批量更新节点标题
//         console.log('2️⃣  使用 nodes.batchUpdate() 批量更新节点:');
//         const updates = createdNodes
//             .filter(n => n && n.node_token)
//             .map((node, index) => ({
//                 space_id: spaceId,
//                 node_token: node!.node_token!,
//                 title: `${node!.title} (已更新)`,
//             }));

//         const updateResults = await larkDoc.nodes.batchUpdate(updates);
//         console.log(`   更新了 ${updateResults.filter(r => !r.error).length} 个节点\n`);

//     } catch (error) {
//         console.log(`   ⚠️  批量操作需要有效的空间和节点信息\n`);
//     }
// }

/**
 * 示例 6: 多维表格操作
 */
// async function demoBitableOperations(larkDoc: LarkDoc, appToken: string) {
//     console.log('\n=== 示例 6: 多维表格操作 ===\n');

//     try {
//         // 获取所有数据表
//         console.log('1️⃣  使用 bitable.listTables() 获取数据表:');
//         const tables = await larkDoc.bitable.listTables(appToken);
//         console.log(`   找到 ${tables.length} 个数据表\n`);

//         if (tables.length > 0) {
//             const firstTable = tables[0];
//             console.log(`   第一个表格: ${firstTable?.name} (${firstTable?.table_id})\n`);

//             // 获取字段列表
//             console.log('2️⃣  使用 bitable.listFields() 获取字段:');
//             const fields = await larkDoc.bitable.listFields(appToken, firstTable?.table_id!);
//             console.log(`   找到 ${fields.length} 个字段`);
//             fields.slice(0, 5).forEach((field: any) => {
//                 console.log(`     - ${field.field_name} (类型: ${field.type})`);
//             });
//             if (fields.length > 5) {
//                 console.log(`     ... 还有 ${fields.length - 5} 个字段`);
//             }
//             console.log();

//             // 获取记录列表
//             console.log('3️⃣  使用 bitable.listRecords() 获取记录:');
//             const records = await larkDoc.bitable.listRecords(appToken, firstTable?.table_id!, 10);
//             console.log(`   找到 ${records.data?.items?.length || 0} 条记录（前 10 条）\n`);
//         }

//     } catch (error) {
//         console.log(`   ⚠️  多维表格操作需要有效的 appToken\n`);
//     }
// }

/**
 * 主函数
 */
async function main() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('=== 飞书 API 新架构示例 ===');
        console.log('='.repeat(60));

        // 登录
        console.log('\n🔐 正在登录...');
        const authInfo = await LoginHandler.handleLogin(config);

        if (!authInfo) {
            console.error('❌ 登录失败');
            process.exit(1);
        }

        console.log('✅ 登录成功');

        // 创建 LarkDoc 实例
        const larkDoc = new LarkDoc(larkClient);

        // 测试用的知识库 URL
        const wikiUrl = 'https://trip.larkenterprise.com/wiki/RtO9wg4x8ijGYdkCSpicrxUenWd';

        // 运行各个示例
        console.log('\n' + '='.repeat(60));

        // // 示例 1: 向后兼容
        // const node1 = await demoBackwardCompatibility(larkDoc, wikiUrl);

        // 示例 2: 节点操作
        const node2 = await demoNodeOperations(larkDoc, wikiUrl);

        // // 示例 3: 文档操作（需要 docx token）
        // if (node2?.obj_type === 'docx' && node2?.obj_token) {
        //     await demoDocOperations(larkDoc, node2.obj_token);
        // } else {
        //     console.log('\n⏭️  跳过示例 3（需要 docx 类型的节点）\n');
        // }

        // // 示例 4: 空间操作
        // if (node2?.space_id && node2?.node_token) {
        //     await demoSpaceOperations(larkDoc, node2.space_id, node2.node_token);
        // }

        // 示例 5: 批量操作（注意：这会创建真实的节点）
        // if (node2?.space_id && node2?.parent_node_token) {
        //     await demoBatchOperations(larkDoc, node2.space_id, node2.parent_node_token);
        // }

        // 示例 6: 多维表格操作（需要 bitable token）
        // if (node2?.obj_type === 'bitable' && node2?.obj_token) {
        //     await demoBitableOperations(larkDoc, node2.obj_token);
        // }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 执行失败:', error);
        process.exit(1);
    }
}

// 运行主函数
main();

