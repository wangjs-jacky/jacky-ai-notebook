/**
 * 将飞书文档转换为 Markdown 格式
 * 使用 DocService 的 exportToMarkdown 方法
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as lark from '@larksuiteoapi/node-sdk';
import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { LarkDoc } from '../src/core/index.js';
import { getTokenOnly } from '../src/utils/token-extractor.js';

// 主函数
async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  
  // 可以通过命令行参数传入文档 URL，或使用默认的 block.json 中的 token
  const docUrl = "https://trip.larkenterprise.com/wiki/EwALwz4TtiX0fjkRfXUc8zxInIg";
  const outputPath = path.join(scriptDir, 'block-generated.md');
  const imagesDir = path.join(scriptDir, 'images');

  console.log('📖 开始转换飞书文档到 Markdown...');
  console.log('输出文件:', outputPath);
  console.log('图片目录:', imagesDir);

  try {
    // 1. 初始化 LarkDoc 客户端
    console.log('🔐 正在登录...');
    const config = getLarkConfig();
    const authInfo = await LoginHandler.handleLogin(config);
    if (!authInfo) {
      throw new Error('登录失败');
    }

    const larkClient = new lark.Client({
      appId: config.appId,
      appSecret: config.appSecret,
    });
    const larkDoc = new LarkDoc(larkClient);

    // 2. 获取文档 token
    let docToken: string;
    if (docUrl) {
      // 从 URL 提取 token
      const { token, objType } = getTokenOnly(docUrl);
      
      // 如果是 wiki 节点，需要先获取节点信息，然后获取 obj_token
      if (objType === 'wiki' || docUrl.includes('/wiki/')) {
        console.log('🔍 检测到 Wiki 节点，正在获取文档信息...');
        const node = await larkDoc.wikiNodeService.getNodeByUrl(docUrl);
        if (!node || !node.obj_token) {
          throw new Error(`无法获取 Wiki 节点的文档信息: ${node ? 'obj_token 为空' : '节点不存在'}`);
        }
        
        if (node.obj_type !== 'docx') {
          throw new Error(`不支持的文档类型: ${node.obj_type}，仅支持 docx 类型`);
        }
        
        docToken = node.obj_token;
        console.log('📄 节点信息:', {
          title: node.title,
          nodeToken: node.node_token,
          objToken: docToken.substring(0, 20) + '...',
          objType: node.obj_type
        });
      } else {
        docToken = token;
      }
      
      console.log('文档 URL:', docUrl);
      console.log('文档 Token:', docToken.substring(0, 20) + '...');
    } else {
      // 如果没有提供 URL，尝试从 block.json 文件中读取（向后兼容）
      const inputPath = path.join(scriptDir, 'block.json');
      if (fs.existsSync(inputPath)) {
        console.log('⚠️  未提供文档 URL，尝试从 block.json 读取...');
        // 从 block.json 中提取文档 token（如果有的话）
        // 这里假设 block.json 可能包含文档信息
        // 如果 block.json 不存在或无法提取 token，则报错
        throw new Error('请提供文档 URL 作为命令行参数');
      } else {
        throw new Error('请提供文档 URL 作为命令行参数，例如: npm run block-to-markdown "https://xxx.feishu.cn/docx/xxx"');
      }
    }

    // 3. 确保图片目录存在
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // 4. 使用 DocService 的 exportToMarkdown 方法转换为 Markdown
    console.log('\n📝 开始转换文档...');
    const markdown = await larkDoc.docService.exportToMarkdown(docToken, {
      downloadImages: true,
      imagesDir: imagesDir,
      markdownDir: path.dirname(outputPath),
    });

    // 5. 写入文件
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log('✅ 转换完成！');
    console.log(`生成了 ${markdown.split('\n').length} 行 Markdown`);
    console.log(`文件已保存到: ${outputPath}`);
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir).filter(f => !f.startsWith('.'));
      if (imageFiles.length > 0) {
        console.log(`下载了 ${imageFiles.length} 张图片到 images/ 目录`);
      }
    }
  } catch (error) {
    console.error('❌ 转换失败:', error);
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

