import * as lark from '@larksuiteoapi/node-sdk';
import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { LarkDoc } from '../src/core/index.js';

const config = getLarkConfig();

async function main() {
  try {
    // 1. 登录认证
    const authInfo = await LoginHandler.handleLogin(config);
    if (!authInfo) {
      console.error('❌ 登录失败');
      process.exit(1);
    }

    // 2. 初始化客户端
    const larkClient = new lark.Client({
      appId: config.appId,
      appSecret: config.appSecret,
    });

    const larkDoc = new LarkDoc(larkClient);

    // 3. 从环境变量或命令行参数获取文档 URL
    const targetUrl = "https://trip.larkenterprise.com/wiki/EwALwz4TtiX0fjkRfXUc8zxInIg";
    const readType = process.env.READ_TYPE || 'blocks'; // 'content' | 'blocks' | 'node'

    console.log('📖 开始读取文档...');
    console.log('文档 URL:', targetUrl);
    console.log('读取类型:', readType);
    console.log('');

    if (readType === 'node') {
      // 读取节点信息
      const node = await larkDoc.wikiNodeService.getNodeByUrl(targetUrl);
      if (!node) {
        console.error('❌ 无法获取节点信息');
        process.exit(1);
      }

      console.log('✅ 节点信息获取成功！');
      console.log('');
      console.log('节点标题:', node.title);
      console.log('节点 Token:', node.node_token);
      console.log('对象 Token:', node.obj_token);
      console.log('对象类型:', node.obj_type);
      console.log('空间 ID:', node.space_id);
      console.log('是否有子节点:', node.has_child);
      console.log('');
      console.log('完整节点信息:');
      console.log(JSON.stringify(node, null, 2));

    } else if (readType === 'blocks') {
      // 读取文档块结构
      const blocksResponse = await larkDoc.docService.listBlocksByUrl(targetUrl);

      console.log('✅ 文档块获取成功！');
      console.log('');
      console.log('文档块结构:');
      console.log(JSON.stringify(blocksResponse, null, 2));

    } else {
      // 读取文档纯文本内容（默认）
      const contentResponse = await larkDoc.docService.getRawContentByUrl(targetUrl);

      // 处理返回的响应对象
      const content = typeof contentResponse === 'string'
        ? contentResponse
        : (contentResponse as any)?.data?.content || JSON.stringify(contentResponse, null, 2);

      console.log('✅ 文档内容获取成功！');
      console.log('');
      console.log('文档内容:');
      console.log('---');
      console.log(content);
      console.log('---');
      console.log('');
      console.log('内容长度:', content.length, '字符');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 示例执行失败:', error);
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      if (error.stack) {
        console.error('错误堆栈:', error.stack);
      }
    }
    process.exit(1);
  }
}

main();

