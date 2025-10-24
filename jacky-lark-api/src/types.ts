/**
 * 飞书开放平台 API 类型定义
 */

// OAuth2.0 授权相关类型
export interface LarkOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

// 授权码响应
export interface AuthorizationCodeResponse {
  code: string;
  state?: string;
}

// 访问令牌请求参数
export interface AccessTokenRequest {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
}

// 访问令牌响应
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// 用户信息响应
export interface UserInfoResponse {
  sub: string;
  name: string;
  picture: string;
  open_id: string;
  union_id: string;
  email?: string;
  user_id?: string;
}

// API 错误响应
export interface LarkApiError {
  code: number;
  msg: string;
  data?: any;
}

// 飞书 API 客户端配置
export interface LarkApiClientConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  baseUrl?: string;
}

// HTTP 请求选项
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}
