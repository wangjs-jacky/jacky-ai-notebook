import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { appConfig } from "../config/AppConfig.js";

interface DataProcessorInput {
    message: string;
}

class GetLocalConfigTool extends MCPTool<DataProcessorInput> {
    name = "get-local-config";
    description = "获取本地飞书应用配置信息";

    schema = {
        message: {
            type: z.string(),
            description: "Message to process",
        },
    };

    async execute(input: DataProcessorInput) {
        console.log('1️⃣  读取配置信息');
        
        // ✅ 从全局配置读取
        const { 
            appId, 
            appSecret, 
            scope,
            port,
            debug,
            domain
        } = appConfig;
        
        // 验证必需的配置项
        if (!appId) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: "❌ 错误：请配置 LARK_APP_ID\n\n" +
                              "可以通过以下方式配置：\n" +
                              "1. 在 .env 文件中设置 LARK_APP_ID\n" +
                              "2. 使用命令行参数：--app-id YOUR_APP_ID"
                    }
                ]
            };
        }

        if (!appSecret) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: "❌ 错误：请配置 LARK_APP_SECRET\n\n" +
                              "可以通过以下方式配置：\n" +
                              "1. 在 .env 文件中设置 LARK_APP_SECRET\n" +
                              "2. 使用命令行参数：--app-secret YOUR_APP_SECRET"
                    }
                ]
            };
        }

        // 返回配置信息（隐藏敏感信息）
        const configInfo = `
📋 飞书应用配置信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ App ID: ${appId}
🔒 App Secret: ${appSecret.substring(0, 8)}...（已隐藏）
🌐 Domain: ${domain}
🎫 Scope: ${scope || '（使用应用的所有权限）'}
🔌 Port: ${port}
🐛 Debug: ${debug ? '已启用' : '未启用'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 提示：配置已成功加载！

📖 使用说明：
   - 如需修改配置，可以编辑 .env 文件
   - 或使用命令行参数重新启动服务
   - 使用 --debug 参数查看详细配置信息
`;

        return {
            content: [
                {
                    type: "text" as const,
                    text: configInfo
                }
            ]
        };
    }
}

export default GetLocalConfigTool;