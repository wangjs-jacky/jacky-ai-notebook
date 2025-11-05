import * as fs from 'fs';
import * as path from 'path';
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

    // 3. 从环境变量或默认值获取文件 token
    const fileToken = process.env.FILE_TOKEN || 'SN4dbqf1Qo5GmexR1QscZBzEnGf';

    // 4. 设置输出目录（API 会自动在目录下生成文件名）
    const outputDir = process.env.OUTPUT_DIR 
      ? path.resolve(process.env.OUTPUT_DIR)
      : path.join(process.cwd(), 'downloads');

    console.log('📥 开始下载媒体文件...');
    console.log('文件 Token:', fileToken);
    console.log('输出目录:', outputDir);
    console.log('');

    // 5. 调用 API 下载文件
    // API 会自动从 contentDisposition 提取文件名，从 contentType 提取扩展名
    // 如果没有提取到文件名，则使用 fileToken 作为文件名
    // 返回生成的文件名（包含扩展名）
    const fileName = await larkDoc.driveAPI.downloadMedia(fileToken, outputDir);

    console.log('✅ 文件下载成功！');
    console.log('生成的文件名:', fileName);
    
    // 等待一小段时间确保文件写入完成
    await new Promise(resolve => setTimeout(resolve, 200));

    // 构建完整文件路径并检查文件信息
    const finalOutputPath = path.join(outputDir, fileName);
    
    if (fs.existsSync(finalOutputPath)) {
      const stats = fs.statSync(finalOutputPath);
      console.log('保存路径:', finalOutputPath);
      console.log('文件大小:', (stats.size / 1024).toFixed(2), 'KB');
    } else {
      console.warn('⚠️  警告：文件可能尚未完全写入，请检查文件路径');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 下载失败:', error);
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

