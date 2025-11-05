import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { appConfig } from "../config/AppConfig.js";
import { LarkDoc, LoginHandler, lark } from "jacky-lark-api";
// import type { LarkOAuthConfig } from "jacky-lark-api";

interface DataProcessorInput {
  content: string;
  url: string;
  mode?: 'create' | 'append';
  title?: string;
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

class AddMarkdownToFeiShuTool extends MCPTool<DataProcessorInput> {
  name = "add-markdown-to-feishu";
  description = "将 markdown 添加到飞书知识库中，支持创建新文档或追加内容到已有文档";

  schema = {
    content: {
      type: z.string(),
      description: "Markdown 文本内容",
    },
    url: {
      type: z.string(),
      description: "飞书知识库节点 URL 地址（用于创建新文档的位置，或已有文档的链接）",
    },
    mode: {
      type: z.enum(['create', 'append']).optional(),
      description: "操作模式：'create' 创建新文档，'append' 追加内容到已有文档（默认：append）",
    },
    title: {
      type: z.string().optional(),
      description: "新文档标题（仅在 mode='create' 时有效）",
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

  async execute(input: DataProcessorInput) {
    try {
      // 从 appConfig 获取配置
      const config = this.getLarkConfig();

      // 处理登录认证
      const authInfo = await LoginHandler.handleLogin(config);
      if (!authInfo) {
        throw new Error('登录失败');
      }

      // 创建 Lark 客户端（优先使用 appConfig 中的 client，否则创建新实例）
      const larkClient = appConfig.client || new lark.Client({
        appId: config.appId,
        appSecret: config.appSecret,
      });

      // 创建 LarkDoc 实例
      const larkDoc = new LarkDoc(larkClient);

      // 确定操作模式（默认使用 append）
      const mode = input.mode || 'append';

      // 执行操作：创建新文档或追加内容
      const result = await larkDoc.wikiNodeService.insertMarkdownToFeishuDoc(
        input.url,
        input.content,
        {
          mode,
          title: input.title,
        }
      );

      return {
        content: [{
          type: "text" as const,
          text: `✅ ${mode === 'create' ? '创建' : '追加'}成功！\n\n文档链接: ${result.url}\n节点 Token: ${result.nodeToken || 'N/A'}\n文档 Token: ${result.docToken || 'N/A'}`
        }]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ 将 markdown 添加到飞书知识库失败: ${error.message || String(error)}`
          }
        ]
      };
    }
  }
}

export default AddMarkdownToFeiShuTool;