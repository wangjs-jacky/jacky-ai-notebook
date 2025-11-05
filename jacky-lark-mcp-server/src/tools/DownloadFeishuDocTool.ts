import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { appConfig } from "../config/AppConfig.js";
import { LarkDoc, LoginHandler, lark, getTokenOnly } from "jacky-lark-api";

interface DownloadFeishuDocInput {
  url: string;
  outputPath?: string;
  imagesDir?: string;
  downloadImages?: boolean;
}

/**
 * Lark OAuth 配置接口
 */
interface LarkOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  port?: number;
  scope?: string;
}

class DownloadFeishuDocTool extends MCPTool<DownloadFeishuDocInput> {
  name = "download-feishu-doc";
  description = "将飞书文档转换为 Markdown 格式并下载";

  schema = {
    url: {
      type: z.string(),
      description: "飞书文档 URL（支持 docx 文档和 wiki 节点）",
    },
    outputPath: {
      type: z.string().optional(),
      description: "Markdown 文件输出路径（可选，默认在当前目录生成）",
    },
    imagesDir: {
      type: z.string().optional(),
      description: "图片保存目录（可选，默认在输出文件同目录下的 images 文件夹）",
    },
    downloadImages: {
      type: z.boolean().optional(),
      description: "是否下载图片（默认: true）",
    },
  };

  /**
   * 从 appConfig 获取 LarkOAuthConfig 格式的配置
   */
  private getLarkConfig(): LarkOAuthConfig {
    const { appId, appSecret, redirectUri, port, scope } = appConfig;

    if (!appId || !appSecret) {
      throw new Error('请在配置中设置 appId 和 appSecret');
    }

    return {
      appId,
      appSecret,
      redirectUri: redirectUri || 'http://localhost:3000/callback',
      port,
      scope,
    };
  }

  async execute(input: DownloadFeishuDocInput) {
    try {
      // 1. 从 appConfig 获取配置
      const config = this.getLarkConfig();

      // 2. 处理登录认证
      const authInfo = await LoginHandler.handleLogin(config);
      if (!authInfo) {
        throw new Error('登录失败');
      }

      // 3. 创建 Lark 客户端
      const larkClient = appConfig.client || new lark.Client({
        appId: config.appId,
        appSecret: config.appSecret,
      });

      // 4. 创建 LarkDoc 实例
      const larkDoc = new LarkDoc(larkClient);

      // 5. 获取文档 token
      const { token, objType } = getTokenOnly(input.url);
      let docToken: string;

      // 如果是 wiki 节点，需要先获取节点信息，然后获取 obj_token
      if (objType === 'wiki' || input.url.includes('/wiki/')) {
        const node = await larkDoc.wikiNodeService.getNodeByUrl(input.url);
        if (!node || !node.obj_token) {
          throw new Error(`无法获取 Wiki 节点的文档信息: ${node ? 'obj_token 为空' : '节点不存在'}`);
        }
        
        if (node.obj_type !== 'docx') {
          throw new Error(`不支持的文档类型: ${node.obj_type}，仅支持 docx 类型`);
        }
        
        docToken = node.obj_token;
      } else {
        docToken = token;
      }

      // 6. 确定输出路径和图片目录
      const outputPath = input.outputPath || path.join(process.cwd(), 'document.md');
      const imagesDir = input.imagesDir || path.join(path.dirname(outputPath), 'images');
      const downloadImages = input.downloadImages !== false; // 默认为 true

      // 7. 确保图片目录存在
      if (downloadImages && !fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // 8. 使用 DocService 的 exportToMarkdown 方法转换为 Markdown
      const markdown = await larkDoc.docService.exportToMarkdown(docToken, {
        downloadImages,
        imagesDir: downloadImages ? imagesDir : undefined,
        markdownDir: path.dirname(outputPath),
      });

      // 9. 写入文件
      fs.writeFileSync(outputPath, markdown, 'utf-8');

      // 10. 统计信息
      const lineCount = markdown.split('\n').length;
      let imageCount = 0;
      if (downloadImages && fs.existsSync(imagesDir)) {
        const imageFiles = fs.readdirSync(imagesDir).filter(f => !f.startsWith('.'));
        imageCount = imageFiles.length;
      }

      // 11. 返回结果
      return {
        content: [{
          type: "text" as const,
          text: `✅ 转换完成！\n\n` +
                `📄 文档 URL: ${input.url}\n` +
                `📝 Markdown 文件: ${outputPath}\n` +
                `📊 共 ${lineCount} 行\n` +
                (downloadImages ? `🖼️  下载了 ${imageCount} 张图片到: ${imagesDir}\n` : '')
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ 下载飞书文档失败: ${error.message || String(error)}`
        }]
      };
    }
  }
}

export default DownloadFeishuDocTool;