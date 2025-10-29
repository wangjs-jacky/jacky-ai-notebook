import type { LarkOAuthConfig } from "../types";
import express from 'express';
import open from 'open';
import { LarkOAuthHelper } from "./oauth.js";
import { authStore } from "./auth-store.js";

export class LoginHandler {

  static expressServer: any;
  // 统一处理登录
  static async handleLogin(config: LarkOAuthConfig) {
    const { appId, appSecret, redirectUri, port = 3000, timeout = 1000 * 6 } = config || {};

    if (!appId || !appSecret || !redirectUri) {
      console.error('appId, appSecret, redirectUri is required, please check your config');
      process.exit(1);
    }

    // 检查本地是否已有有效的 token
    console.log("🔍 检查本地认证信息...");
    const existingAuthInfo = authStore.getAuthInfo();
    
    if (existingAuthInfo && !authStore.isTokenExpired()) {
      console.log("✅ 本地认证信息有效，跳过登录");
      console.log("Token:", existingAuthInfo.token.substring(0, 20) + "...");
      console.log("过期时间:", existingAuthInfo.expiresAt ? new Date(existingAuthInfo.expiresAt).toLocaleString() : '未知');
      return existingAuthInfo;
    }

    if (existingAuthInfo && authStore.isTokenExpired()) {
      console.log("⚠️  本地 token 已过期，需要重新登录");
      authStore.clear();
    }

    console.log("开始 OAuth 登录....");

    // 基于 express 构建服务器，用于处理 OAuth 登录回调
    const app = express();
    app.use(express.json());

    // 创建 OAuth 助手
    const oauthHelper = new LarkOAuthHelper(app, config);

    // 注册路由（包含完整的生命周期）
    oauthHelper.setupRoutes();

    // 启动服务器，监听 prot 端口（必须先启动服务器再打开浏览器）
    await oauthHelper.reAuthorize();
    console.log(`✅ 服务器已启动在 http://localhost:${port}`);

    // 生成授权链接并打开浏览器
    const authUrl = oauthHelper.generateAuthUrl('random_state');
    console.log('正在打开浏览器进行授权...');
    console.log('授权链接:', authUrl);
    
    await open(authUrl);

    const success = await this.checkTokenWithTimeout(timeout);
    if (success) {
      console.log('✅ Successfully logged in');
      const authInfo = authStore.getAuthInfo();
      return authInfo;
    } else {
      console.log('❌ Login failed');
      throw new Error('登录失败：未在规定时间内完成认证');
    }
  }

  // 每隔 200ms 去查下 authInfo 是否存在值（即 token 是否获取成功）
  static async checkTokenWithTimeout(timeout: number) {
    let time = 0;
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const authInfo = authStore.getAuthInfo();
        if (authInfo && authInfo.token) {
          console.log("🎉 检测到 token 已获取成功！");
          clearInterval(interval);
          resolve(true);
        }
        time += 200;
        if (time >= timeout) {
          console.log("⏰ 超时：未在规定时间内获取到 token");
          clearInterval(interval);
          resolve(false);
        }
      }, 200);
    });
  }

}