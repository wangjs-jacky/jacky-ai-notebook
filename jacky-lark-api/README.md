# 飞书开放平台 TypeScript SDK

这是一个用于获取飞书 `user_access_token` 的 TypeScript SDK，基于飞书开放平台的 OAuth2.0 授权流程实现。

## 功能特性

- ✅ OAuth2.0 授权码流程
- ✅ 获取 user_access_token
- ✅ 刷新访问令牌
- ✅ 获取用户信息
- ✅ 验证访问令牌有效性
- ✅ **本地持久化存储**（自动保存和加载认证信息）
- ✅ **智能缓存**（token 有效期内无需重新授权）
- ✅ 完整的 TypeScript 类型支持

## 安装

```bash
npm install
```

## 快速开始

### 1. 配置应用信息

项目使用 `dotenv` 管理配置，请先创建 `.env` 文件：

```bash
# 复制示例配置文件
cp .env.example .env
```

编辑 `.env` 文件，填入您的应用信息：

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_REDIRECT_URI=http://localhost:3000/callback
```

### 2. 一键登录（推荐）

最简单的方式，使用 `LoginHandler` 自动处理 OAuth 流程和持久化存储：

```typescript
import { LoginHandler, getLarkConfig } from 'jacky-lark-api';

const config = getLarkConfig();

// 第一次运行：打开浏览器进行授权，保存 token 到本地
// 第二次运行：直接从本地加载 token，无需重新授权
const authInfo = await LoginHandler.handleLogin(config);

console.log('Access Token:', authInfo.token);
console.log('过期时间:', new Date(authInfo.expiresAt).toLocaleString());

// 现在可以使用 token 调用其他 API...
```

**特性：**
- ✅ 自动检查本地是否有有效的 token
- ✅ Token 有效则直接使用，无需重新授权
- ✅ Token 过期自动重新授权
- ✅ 认证信息自动保存到 `~/.lark/auth.json`

### 3. 手动配置

如果需要更多控制，可以手动使用各个模块：

```typescript
import { LarkApiClient, LarkOAuthHelper, getLarkConfig } from './src/index.js';

// 从 .env 文件加载配置
const config = getLarkConfig();

// 也可以手动指定配置
const customConfig = {
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
  redirectUri: 'http://localhost:3000/callback',
};
```

### 4. 生成授权链接

```typescript
const oauthHelper = new LarkOAuthHelper(config);
const authUrl = oauthHelper.generateAuthUrl('random_state');
console.log('请访问以下链接进行授权:', authUrl);
```

### 5. 处理授权回调

```typescript
// 用户授权后，飞书会重定向到您的回调地址
// 例如: http://localhost:3000/callback?code=xxx&state=random_state

const callbackUrl = 'http://localhost:3000/callback?code=xxx&state=random_state';

// 验证回调
oauthHelper.validateCallback(callbackUrl);

// 解析授权码
const { code } = oauthHelper.parseAuthorizationCode(callbackUrl);
```

### 6. 获取 user_access_token

```typescript
const apiClient = new LarkApiClient(config);

// 使用授权码获取 user_access_token
const tokenResponse = await apiClient.getUserAccessToken(code);
console.log('user_access_token:', tokenResponse.access_token);
```

### 7. 获取用户信息

```typescript
// 使用 user_access_token 获取用户信息
const userInfo = await apiClient.getUserInfo(tokenResponse.access_token);
console.log('用户信息:', userInfo);
```

## API 参考

### 配置管理

#### `getLarkConfig(): LarkOAuthConfig`
从 `.env` 文件加载配置并返回配置对象

#### `createLarkConfig(overrides?: Partial<LarkOAuthConfig>): LarkOAuthConfig`
从环境变量创建配置，支持部分覆盖

### LoginHandler

#### `LoginHandler.handleLogin(config: LarkOAuthConfig): Promise<AuthInfo>`
一键登录，自动处理 OAuth 流程和持久化存储

**特性：**
- 自动检查本地是否有有效的 token
- Token 有效则直接返回，无需重新授权
- Token 过期自动重新授权
- 认证信息自动保存到本地文件

### authStore（持久化存储）

#### `authStore.getAuthInfo(): AuthInfo | null`
获取认证信息（自动从文件加载）

#### `authStore.setAuthInfo(info: AuthInfo): void`
设置认证信息（自动保存到文件）

#### `authStore.isTokenExpired(): boolean`
检查 token 是否过期

#### `authStore.clear(): void`
清空所有认证信息（包括文件）

#### `authStore.setStoragePath(filePath: string): void`
设置自定义存储路径

**更多详情请参考：** [STORAGE.md](./docs/STORAGE.md)

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

1. **环境变量配置**: 
   - 确保已创建 `.env` 文件并配置了正确的环境变量
   - `.env` 文件已添加到 `.gitignore`，不会被提交到版本控制
   - 开发环境使用 `.env`，生产环境请设置相应的环境变量

2. **应用配置**: 
   - 确保在飞书开放平台正确配置了应用的回调地址

3. **HTTPS**: 
   - 生产环境建议使用 HTTPS 协议

4. **令牌安全**: 
   - 妥善保管 `app_secret` 和 `user_access_token`
   - 认证文件（`~/.lark/auth.json`）包含敏感信息，已自动添加到 `.gitignore`
   - 建议设置文件权限为仅当前用户可读（600）

5. **令牌过期**: 
   - `user_access_token` 有时效性（默认约2小时）
   - 使用 `authStore.isTokenExpired()` 检查是否过期
   - SDK 会自动处理过期 token 的重新授权

6. **持久化存储**:
   - 默认存储在 `~/.lark/auth.json`
   - 可使用 `authStore.setStoragePath()` 自定义路径
   - 详细文档见 [STORAGE.md](./docs/STORAGE.md)

## 相关文档

### 项目文档
- [持久化存储详细文档](./docs/STORAGE.md)
- [配置说明文档](./docs/CONFIG.md)
- [项目结构说明](./docs/STRUCTURE.md)

### 飞书官方文档
- [飞书开放平台文档](https://open.larksuite.com/document/authentication-management/access-token/get-user-access-token)
- [OAuth2.0 授权流程](https://open.larksuite.com/document/authentication-management/oauth-2-0/authorization-code)

## 许可证

ISC
