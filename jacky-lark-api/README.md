# 飞书开放平台 TypeScript SDK

这是一个用于获取飞书 `user_access_token` 的 TypeScript SDK，基于飞书开放平台的 OAuth2.0 授权流程实现。

## 功能特性

- ✅ OAuth2.0 授权码流程
- ✅ 获取 user_access_token
- ✅ 刷新访问令牌
- ✅ 获取用户信息
- ✅ 验证访问令牌有效性
- ✅ 完整的 TypeScript 类型支持

## 安装

```bash
npm install
```

## 快速开始

### 1. 配置应用信息

```typescript
import { LarkApiClient, LarkOAuthHelper } from './src/index.js';

const config = {
  appId: 'your_app_id',           // 您的应用 ID
  appSecret: 'your_app_secret',   // 您的应用密钥
  redirectUri: 'http://localhost:3000/callback', // 回调地址
};
```

### 2. 生成授权链接

```typescript
const oauthHelper = new LarkOAuthHelper(config);
const authUrl = oauthHelper.generateAuthUrl('random_state');
console.log('请访问以下链接进行授权:', authUrl);
```

### 3. 处理授权回调

```typescript
// 用户授权后，飞书会重定向到您的回调地址
// 例如: http://localhost:3000/callback?code=xxx&state=random_state

const callbackUrl = 'http://localhost:3000/callback?code=xxx&state=random_state';

// 验证回调
oauthHelper.validateCallback(callbackUrl);

// 解析授权码
const { code } = oauthHelper.parseAuthorizationCode(callbackUrl);
```

### 4. 获取 user_access_token

```typescript
const apiClient = new LarkApiClient(config);

// 使用授权码获取 user_access_token
const tokenResponse = await apiClient.getUserAccessToken(code);
console.log('user_access_token:', tokenResponse.access_token);
```

### 5. 获取用户信息

```typescript
// 使用 user_access_token 获取用户信息
const userInfo = await apiClient.getUserInfo(tokenResponse.access_token);
console.log('用户信息:', userInfo);
```

## API 参考

### LarkOAuthHelper

#### `generateAuthUrl(state?: string): string`
生成授权链接

#### `parseAuthorizationCode(callbackUrl: string): AuthorizationCodeResponse`
从回调 URL 中解析授权码

#### `validateCallback(callbackUrl: string): void`
验证回调 URL 中的错误

### LarkApiClient

#### `getUserAccessToken(authorizationCode: string): Promise<AccessTokenResponse>`
使用授权码获取 user_access_token

#### `refreshUserAccessToken(refreshToken: string): Promise<AccessTokenResponse>`
使用刷新令牌获取新的 user_access_token

#### `getUserInfo(accessToken: string): Promise<UserInfoResponse>`
获取用户信息

#### `validateAccessToken(accessToken: string): Promise<boolean>`
验证访问令牌是否有效

## 类型定义

```typescript
interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface UserInfoResponse {
  sub: string;
  name: string;
  picture: string;
  open_id: string;
  union_id: string;
  email?: string;
  user_id?: string;
}
```

## 开发

```bash
# 编译 TypeScript
npm run build

# 运行示例
npm run dev
```

## 注意事项

1. **应用配置**: 确保在飞书开放平台正确配置了应用的回调地址
2. **HTTPS**: 生产环境建议使用 HTTPS 协议
3. **令牌安全**: 妥善保管 `app_secret` 和 `user_access_token`
4. **令牌过期**: `user_access_token` 有时效性，需要定期刷新

## 相关文档

- [飞书开放平台文档](https://open.larksuite.com/document/authentication-management/access-token/get-user-access-token)
- [OAuth2.0 授权流程](https://open.larksuite.com/document/authentication-management/oauth-2-0/authorization-code)

## 许可证

ISC
