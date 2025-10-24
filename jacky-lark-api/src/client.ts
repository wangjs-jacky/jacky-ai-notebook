/**
 * 飞书 API 客户端 - 用于获取 user_access_token
 */

/**
 * 飞书 API 客户端 - 用于获取 user_access_token
 */

import type { 
  LarkApiClientConfig, 
  AccessTokenRequest, 
  AccessTokenResponse, 
  UserInfoResponse, 
  LarkApiError,
  RequestOptions 
} from './types.js';

export class LarkApiClient {
  private config: LarkApiClientConfig;
  private readonly baseUrl: string;

  constructor(config: LarkApiClientConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://open.larksuite.com/open-apis';
  }

  /**
   * 使用授权码获取 user_access_token
   * @param authorizationCode 授权码
   * @returns Promise<AccessTokenResponse>
   */
  async getUserAccessToken(authorizationCode: string): Promise<AccessTokenResponse> {
    const requestData: AccessTokenRequest = {
      grant_type: 'authorization_code',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      code: authorizationCode,
      redirect_uri: this.config.redirectUri,
    };

    try {
      const response = await this.makeRequest('/authen/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      return response as AccessTokenResponse;
    } catch (error) {
      throw new Error(`获取 user_access_token 失败: ${error}`);
    }
  }

  /**
   * 使用刷新令牌获取新的 user_access_token
   * @param refreshToken 刷新令牌
   * @returns Promise<AccessTokenResponse>
   */
  async refreshUserAccessToken(refreshToken: string): Promise<AccessTokenResponse> {
    const requestData = {
      grant_type: 'refresh_token',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      refresh_token: refreshToken,
    };

    try {
      const response = await this.makeRequest('/authen/v1/refresh_access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      return response as AccessTokenResponse;
    } catch (error) {
      throw new Error(`刷新 user_access_token 失败: ${error}`);
    }
  }

  /**
   * 获取用户信息
   * @param accessToken 用户访问令牌
   * @returns Promise<UserInfoResponse>
   */
  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    try {
      const response = await this.makeRequest('/authen/v1/user_info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response as UserInfoResponse;
    } catch (error) {
      throw new Error(`获取用户信息失败: ${error}`);
    }
  }

  /**
   * 验证访问令牌是否有效
   * @param accessToken 访问令牌
   * @returns Promise<boolean>
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 发起 HTTP 请求
   * @param endpoint API 端点
   * @param options 请求选项
   * @returns Promise<any>
   */
  private async makeRequest(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'jacky-lark-api/1.0.0',
        ...options.headers,
      },
    };

    if (options.body) {
      requestOptions.body = options.body;
    }

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData: LarkApiError = await response.json();
        throw new Error(`API 请求失败 (${response.status}): ${errorData.msg || response.statusText}`);
      }

      const data = await response.json();
      
      // 检查飞书 API 的响应格式
      if (data.code && data.code !== 0) {
        throw new Error(`飞书 API 错误: ${data.msg || '未知错误'}`);
      }

      return data.data || data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`网络请求失败: ${error}`);
    }
  }
}
