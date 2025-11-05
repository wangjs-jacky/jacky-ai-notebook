#!/usr/bin/env node

import { MCPServer } from "mcp-framework";
import { config } from 'dotenv';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { appConfig } from './config/AppConfig.js';
import { lark } from 'jacky-lark-api';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 文件
config();

// 登录处理器
class LoginHandler {
  static handleWhoAmI() {
    console.log('📋 User Sessions:');
    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;
    const userAccessToken = process.env.LARK_USER_ACCESS_TOKEN;

    if (appId && appSecret) {
      console.log(`\n✅ App ID: ${appId}`);
      console.log(`✅ App Secret: ${appSecret.substring(0, 8)}...`);
      if (userAccessToken) {
        console.log(`✅ User Access Token: ${userAccessToken.substring(0, 20)}...`);
      } else {
        console.log(`⚠️  User Access Token: Not set`);
      }
    } else {
      console.log('❌ No configuration found. Please run "login" command first.');
    }
  }

  static async handleLogin(options: any) {
    const {
      appId,
      appSecret,
      domain = 'https://open.feishu.cn',
      host = 'localhost',
      port = 3000,
      scope = [],
      debug = false
    } = options;

    if (!appId || !appSecret) {
      console.error('❌ Error: --app-id and --app-secret are required');
      process.exit(1);
    }

    console.log('🚀 Starting OAuth login process...\n');
    console.log(`📱 Domain: ${domain}`);
    console.log(`🔗 Redirect URI: http://${host}:${port}/callback`);
    console.log(`📝 Scope: ${scope.length > 0 ? scope.join(', ') : 'All granted permissions'}\n`);

    const redirectUri = `http://${host}:${port}/callback`;
    const scopeParam = scope.length > 0 ? scope.join(' ') : '';

    // 构建授权 URL
    const authUrl = `${domain}/open-apis/authen/v1/authorize?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopeParam)}`;

    console.log('👉 Please open this URL in your browser:\n');
    console.log(`   ${authUrl}\n`);

    // 启动本地服务器接收回调
    const server = http.createServer(async (req, res) => {
      if (req.url?.startsWith('/callback')) {
        const url = new URL(req.url, `http://${host}:${port}`);
        const code = url.searchParams.get('code');

        if (code) {
          try {
            // 用授权码换取 user_access_token
            const tokenResponse = await fetch(`${domain}/open-apis/authen/v1/oidc/access_token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
              }),
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.code === 0) {
              const userAccessToken = tokenData.data.access_token;

              // 保存到 .env 文件
              const envPath = path.join(process.cwd(), '.env');
              let envContent = '';
              if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf-8');
              }

              const envLines = envContent.split('\n');
              const updatedLines: string[] = [];
              let foundAppId = false;
              let foundAppSecret = false;
              let foundToken = false;

              for (const line of envLines) {
                if (line.startsWith('LARK_APP_ID=')) {
                  updatedLines.push(`LARK_APP_ID=${appId}`);
                  foundAppId = true;
                } else if (line.startsWith('LARK_APP_SECRET=')) {
                  updatedLines.push(`LARK_APP_SECRET=${appSecret}`);
                  foundAppSecret = true;
                } else if (line.startsWith('LARK_USER_ACCESS_TOKEN=')) {
                  updatedLines.push(`LARK_USER_ACCESS_TOKEN=${userAccessToken}`);
                  foundToken = true;
                } else {
                  updatedLines.push(line);
                }
              }

              if (!foundAppId) updatedLines.push(`LARK_APP_ID=${appId}`);
              if (!foundAppSecret) updatedLines.push(`LARK_APP_SECRET=${appSecret}`);
              if (!foundToken) updatedLines.push(`LARK_USER_ACCESS_TOKEN=${userAccessToken}`);

              fs.writeFileSync(envPath, updatedLines.join('\n'));

              console.log('\n✅ Login successful!');
              console.log(`✅ User Access Token saved to .env file`);
              console.log(`✅ Token: ${userAccessToken.substring(0, 20)}...\n`);

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end('<html><body><h1>✅ Login Successful!</h1><p>You can close this window now.</p></body></html>');

              setTimeout(() => {
                server.close();
                process.exit(0);
              }, 1000);
            } else {
              throw new Error(tokenData.msg || 'Failed to get access token');
            }
          } catch (error: any) {
            console.error('❌ Error:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<html><body><h1>❌ Error</h1><p>${error.message}</p></body></html>`);
            server.close();
            process.exit(1);
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>❌ No authorization code received</h1></body></html>');
          server.close();
          process.exit(1);
        }
      }
    });

    server.listen(port, host, () => {
      console.log(`🔄 Waiting for callback on http://${host}:${port}/callback...`);
    });
  }
}

// 解析字符串数组（支持空格或逗号分隔）
function parseStringArray(input?: string): string[] {
  if (!input) return [];
  return input.split(/[\s,]+/).filter(Boolean);
}

// 创建 CLI 程序
const program = new Command();

program
  .command('whoami')
  .description('Print all user sessions')
  .action(() => {
    LoginHandler.handleWhoAmI();
  });

program
  .command('login')
  .description('Login using OAuth and get user access token')
  .option('-a, --app-id <appId>', 'Feishu/Lark App ID')
  .option('-s, --app-secret <appSecret>', 'Feishu/Lark App Secret')
  .option('-d, --domain <domain>', '(Optional) Feishu/Lark Domain (default: "https://open.feishu.cn")')
  .option('--host <host>', '(Optional) Host to listen (default: "localhost")')
  .option('-p, --port <port>', '(Optional) Port to listen (default: "3000")', parseInt)
  .option(
    '--scope <scope>',
    '(Optional) Specify OAuth scope for user access token, default is all permissions granted to the app, separated by spaces or commas'
  )
  .option('--debug', '(Optional) Enable debug mode')
  .action(async (options) => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

    if (majorVersion < 18) {
      console.error(
        `❌ This CLI requires Node.js >= 18. You are using ${nodeVersion}.\n\n` +
        `👉 Please upgrade Node.js: https://nodejs.org/`
      );
      process.exit(1);
    }

    await LoginHandler.handleLogin({
      ...options,
      scope: parseStringArray(options.scope)
    });
  });

program
  .command('start', { isDefault: true })
  .description('Start the MCP server')
  .option('-a, --app-id <appId>', 'Feishu/Lark App ID')
  .option('-s, --app-secret <appSecret>', 'Feishu/Lark App Secret')
  .option(
    '--scope <scope>',
    '(Optional) Specify OAuth scope for user access token, default is all permissions granted to the app, separated by spaces or commas',
  )
  .option('-p, --port <port>', '(Optional) Port to listen (default: "3000")', parseInt)
  .option('--wiki-url <wikiUrl>', '(Optional) Default wiki URL for Feishu/Lark knowledge base')
  .option('--debug', '(Optional) Enable debug mode')
  .action(async (options) => {
    const client = new lark.Client({
      appId: options.appId,
      appSecret: options.appSecret,
    });
    appConfig.update({
      appId: options.appId,
      appSecret: options.appSecret,
      scope: options.scope,
      port: options.port,
      wikiUrl: options.wikiUrl,
      debug: options.debug,
      client: client
    });

    // 同步到环境变量（向下兼容）
    appConfig.syncToEnv();

    // 验证配置
    const validation = appConfig.validate();
    if (!validation.valid) {
      console.error('\n❌ Configuration Error:\n');
      validation.errors.forEach(err => console.error(`   ${err}`));
      console.error('\n💡 Tip: You can set these in .env file or use command line options.');
      console.error('   Example: npm start -- --app-id YOUR_APP_ID --app-secret YOUR_APP_SECRET\n');
      process.exit(1);
    }

    // 如果开启了 debug 模式，打印配置
    if (appConfig.debug) {
      appConfig.print();
    }

    // 创建并启动 MCP Server
    const server = new MCPServer({
      transport: {
        type: "stdio",
      }
    });

    console.log('🚀 Starting MCP Server...\n');
    await server.start();
  });

// 解析命令行参数
program.parse();