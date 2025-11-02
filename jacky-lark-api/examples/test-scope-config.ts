/**
 * LARK_SCOPE 配置测试脚本
 * 用于验证权限范围配置是否正确
 */

import { getLarkConfig } from '../src/config.js';
import { LarkOAuthHelper } from '../src/core/oauth.js';
import express from 'express';

async function testScopeConfiguration() {
    console.log('\n' + '='.repeat(60));
    console.log('=== LARK_SCOPE 配置测试 ===');
    console.log('='.repeat(60) + '\n');

    try {
        // 1. 读取配置
        console.log('1️⃣  读取环境变量配置');
        const config = getLarkConfig();
        console.log(`   ✅ LARK_APP_ID: ${config.appId}`);
        console.log(`   ✅ LARK_REDIRECT_URI: ${config.redirectUri}`);
        console.log(`   ✅ LARK_SCOPE: "${config.scope}"`);

        // 2. 检查 scope 配置
        console.log('\n2️⃣  分析 SCOPE 配置');
        if (!config.scope) {
            console.log('   ⚠️  未配置 LARK_SCOPE（将使用空权限）');
        } else {
            const scopes = config.scope.split(' ').filter(s => s);
            console.log(`   ✅ 配置了 ${scopes.length} 个权限范围:`);
            scopes.forEach((scope, index) => {
                console.log(`      ${index + 1}. ${scope}`);
            });
        }

        // 3. 生成授权 URL
        console.log('\n3️⃣  生成 OAuth 授权 URL');
        const app = express();
        const oauthHelper = new LarkOAuthHelper(app, config);
        const authUrl = oauthHelper.generateAuthUrl('test_state');
        
        console.log('   授权 URL:');
        console.log(`   ${authUrl}\n`);

        // 4. 解析 URL 中的 scope 参数
        console.log('4️⃣  验证 URL 中的 scope 参数');
        const url = new URL(authUrl);
        const urlScope = url.searchParams.get('scope');
        
        if (urlScope) {
            console.log(`   ✅ URL 中的 scope: "${urlScope}"`);
            const urlScopes = urlScope.split(' ').filter(s => s);
            console.log(`   ✅ 包含的权限（共 ${urlScopes.length} 个）:`);
            urlScopes.forEach((scope, index) => {
                const isAutoAdded = scope === 'offline_access';
                const marker = isAutoAdded ? '🔄 [自动添加]' : '✓';
                console.log(`      ${index + 1}. ${marker} ${scope}`);
            });
        } else {
            console.log('   ❌ URL 中未找到 scope 参数');
        }

        // 5. 验证空格处理
        console.log('\n5️⃣  验证空格处理');
        const originalScopes = config.scope.split(' ').filter(s => s);
        const urlScopes = (urlScope || '').split(' ').filter(s => s && s !== 'offline_access');
        
        if (originalScopes.length === urlScopes.length) {
            console.log(`   ✅ 空格处理正确（配置 ${originalScopes.length} 个 → URL ${urlScopes.length} 个）`);
        } else {
            console.log(`   ⚠️  权限数量不匹配（配置 ${originalScopes.length} 个 → URL ${urlScopes.length} 个）`);
        }

        // 6. 常见权限说明
        console.log('\n6️⃣  常用权限范围说明');
        const commonScopes = {
            'wiki:wiki': '知识库访问权限',
            'docx:document': '文档访问权限',
            'bitable:app': '多维表格权限',
            'sheets:spreadsheet': '电子表格权限',
            'drive:drive': '云文档权限',
            'contact:user.base': '通讯录基础信息',
            'offline_access': '离线访问（获取 refresh_token）',
        };

        const configuredScopes = (urlScope || '').split(' ').filter(s => s);
        configuredScopes.forEach(scope => {
            const description = commonScopes[scope] || '未知权限';
            console.log(`   • ${scope}: ${description}`);
        });

        // 7. 配置建议
        console.log('\n7️⃣  配置建议');
        console.log('   在 .env 文件中，建议使用以下格式：');
        console.log('   ```env');
        console.log('   # ✅ 推荐：使用双引号包裹');
        console.log('   LARK_SCOPE="wiki:wiki docx:document"');
        console.log('');
        console.log('   # ⚠️  可以但不推荐：不使用引号');
        console.log('   LARK_SCOPE=wiki:wiki docx:document');
        console.log('');
        console.log('   # ❌ 错误：不要使用逗号分隔');
        console.log('   LARK_SCOPE="wiki:wiki,docx:document"');
        console.log('   ```');

        console.log('\n' + '='.repeat(60));
        console.log('✅ 测试完成！');
        console.log('详细文档请参考：docs/SCOPE-CONFIG.md');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ 测试失败:', error);
        if (error instanceof Error) {
            console.error('   错误信息:', error.message);
        }
    }
}

// 运行测试
testScopeConfiguration();


