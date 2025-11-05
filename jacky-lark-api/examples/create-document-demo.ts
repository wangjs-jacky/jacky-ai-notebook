import * as fs from 'fs';
import * as path from 'path';
import * as lark from '@larksuiteoapi/node-sdk';
import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { LarkDoc } from '../src/core/index.js';

const config = getLarkConfig();

async function main() {
    try {

        const authInfo = await LoginHandler.handleLogin(config);
        if (!authInfo) {
            console.error('❌ 登录失败');
            process.exit(1);
        }

        const larkClient = new lark.Client({
            appId: config.appId,
            appSecret: config.appSecret,
        });

        const larkDoc = new LarkDoc(larkClient);
        const demoType = process.env.DEMO_TYPE || 'create';
        const targetUrl = "https://trip.larkenterprise.com/wiki/Z4KjwE6hnixLc0kt6c7cZOgbnzd";

        if (demoType === 'add') {
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
`;

            const result = await larkDoc.wikiNodeService.insertMarkdownToFeishuDoc(targetUrl, additionalContent, {
                mode: 'append'
            });

            console.log('✅ 内容添加成功！');
            console.log('文档链接:', result.url);
        } else {
            const docPath = path.join(process.cwd(), 'docs', 'CONFIG.md');
            const mdStr = fs.readFileSync(docPath, 'utf-8');
            
            const result = await larkDoc.wikiNodeService.insertMarkdownToFeishuDoc(targetUrl, mdStr, {
                mode: 'create',
                title: 'Markdown 转文档功能使用指南'
            });

            console.log('✅ 创建成功！');
            console.log('文档链接:', result.url);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ 示例执行失败:', error);
        process.exit(1);
    }
}

main();
