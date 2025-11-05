/**
 * 飞书 OAuth2.0 授权码获取工具
 * 
 * 区别：OAuth2.0 与 OIDC 验证逻辑
 * 1. OAuth2.0 直接使用 client_id 和 client_secret 获取 access_token
 * 2. OIDC 需要使用 client_id 和 client_secret 获取 app_access_token, 然后再换取 user_access_token
 */

import type { LarkOAuthConfig, AuthorizationCodeResponse } from '../types/index.js';
import { type Express, type Request, type Response } from 'express';
import http from 'http';
import { authStore } from './auth-store.js';
import { LarkApiClient } from './client.js';

export class LarkOAuthHelper {
  private config: LarkOAuthConfig;
  private readonly baseUrl = 'https://accounts.feishu.cn/open-apis';
  private timeoutId: NodeJS.Timeout | null = null;
  // 服务器实例
  private expressServer: http.Server | null = null;
  apiClient: LarkApiClient;

  constructor(protected readonly app: Express, config: LarkOAuthConfig) {
    this.config = config;
    // 需要传入 express 实例，用于注册 callback 路由
    this.app = app;
    this.apiClient = new LarkApiClient(config);
  }

  async reAuthorize() {
    const { port, timeout } = this.config;
    // 从缓存读取是否存在 useAccessToken 且未过期

    await this.startServer(port, timeout)
  }


  // 启动服务器
  async startServer(port: number = 3000, timeout: number = 30 * 1000) {
    return new Promise<void>((resolve) => {
      this.expressServer = this.app.listen(port, () => {
        console.log(`🚀 Express 服务器已启动在 http://localhost:${port}`);
        resolve();
      });
      // 30 秒后停止服务器
      this.timeoutId = setTimeout(() => {
        this.stopServer();
      }, timeout);
    });
  }

  // 停止服务器
  async stopServer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    return new Promise<boolean>((resolve, reject) => {
      if (!this.expressServer) {
        resolve(true);
        return;
      }
      this.expressServer.close((error) => {
        if (error) {
          console.error('服务器关闭失败:', error);
          reject(error);
        } else {
          resolve(true);
        }
        this.expressServer = null;
      });
    });
  }

  /**
   * 生成授权链接
   * @param state 可选的状态参数，用于防止 CSRF 攻击
   * @returns 授权链接
   */
  generateAuthUrl(state?: string, needRefreshToken: boolean = true): string {
    // TODO: 后续可以添加上 code_challenge 和 code_challenge_method 参数
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: (this.config.scope || "") + (needRefreshToken ? ' offline_access' : ''),
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.baseUrl}/authen/v1/authorize?${params.toString()}`;
  }

  // 注册 express 路由，兼容 redirect_uri 的回调
  setupRoutes = () => {
    console.log("📝 注册 /callback 路由...");

    this.app.get("/callback", async (req: Request, res: Response) => {
      console.log("🔔 收到回调请求！");
      console.log("请求 URL:", req.url);
      console.log("请求 Query:", req.query);

      try {
        // 获取重定向后的路由参数
        const { code, state } = req.query;

        if (!code) {
          throw new Error("未收到授权码 (code)");
        }

        authStore.code = code as string;
        authStore.state = state as string;

        console.log("✅ 获取到授权码:", code);
        console.log("✅ 获取到 state:", state);

        console.log("🔄 正在获取 user_access_token...");
        const userAccessToken = await this.apiClient.getUserAccessToken(code as string);
        console.log("✅ 成功获取 userAccessToken:", userAccessToken);

        // 将 token 存储到 authStore
        const authInfo: any = {
          token: userAccessToken.access_token,
          clientId: this.config.appId,
          scopes: [],
          expiresAt: Date.now() + (userAccessToken.expires_in * 1000),
          expiresIn: userAccessToken.expires_in,
          extra: {
            appId: this.config.appId,
            appSecret: this.config.appSecret,
          },
        };

        // 只在 refreshToken 存在时添加
        if (userAccessToken.refresh_token) {
          authInfo.extra.refreshToken = userAccessToken.refresh_token;
        }

        authStore.setAuthInfo(authInfo);

        console.log("💾 Token 已保存到 authStore");

        // 响应客户端
        res.send('授权成功！您可以关闭此页面。');
      } catch (error) {
        console.error("❌ 获取 user_access_token 失败:", error);
        res.status(500).send(`授权失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    });

    console.log("✅ 路由注册完成");
  }

  /**
   * 验证回调 URL 中的错误
   * @param callbackUrl 回调 URL
   * @throws 如果存在错误则抛出异常
   */
  validateCallback(callbackUrl: string): void {
    const url = new URL(callbackUrl);
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      throw new Error(`授权失败: ${error} - ${errorDescription || '未知错误'}`);
    }
  }
}
