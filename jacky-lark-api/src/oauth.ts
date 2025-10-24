/**
 * 飞书 OAuth2.0 授权码获取工具
 */

/**
 * 飞书 OAuth2.0 授权码获取工具
 */

import type { LarkOAuthConfig, AuthorizationCodeResponse } from './types.js';

export class LarkOAuthHelper {
  private config: LarkOAuthConfig;
  private readonly baseUrl = 'https://open.larksuite.com/open-apis';

  constructor(config: LarkOAuthConfig) {
    this.config = config;
  }

  /**
   * 生成授权链接
   * @param state 可选的状态参数，用于防止 CSRF 攻击
   * @returns 授权链接
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      app_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'user:read',
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.baseUrl}/authen/v1/authorize?${params.toString()}`;
  }

  /**
   * 从回调 URL 中解析授权码
   * @param callbackUrl 回调 URL
   * @returns 授权码响应
   */
  parseAuthorizationCode(callbackUrl: string): AuthorizationCodeResponse {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      throw new Error('授权码未找到');
    }

    return {
      code,
      ...(state && { state }),
    };
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
