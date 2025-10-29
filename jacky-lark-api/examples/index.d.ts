/**
 * 飞书 API 使用示例
 * 演示如何获取 user_access_token
 */
/**
 * 示例 1: 生成授权链接
 */
declare function generateAuthUrl(): string;
/**
 * 示例 2: 处理授权回调并获取 user_access_token
 */
declare function handleAuthCallback(callbackUrl: string): Promise<import("../src/index.js").AccessTokenResponse>;
/**
 * 示例 3: 获取用户信息
 */
declare function getUserInfo(accessToken: string): Promise<import("../src/index.js").UserInfoResponse>;
/**
 * 示例 4: 刷新访问令牌
 */
declare function refreshAccessToken(refreshToken: string): Promise<import("../src/index.js").AccessTokenResponse>;
/**
 * 示例 5: 验证访问令牌
 */
declare function validateToken(accessToken: string): Promise<boolean>;
/**
 * 完整的使用流程示例
 */
declare function completeFlow(): Promise<void>;
export { generateAuthUrl, handleAuthCallback, getUserInfo, refreshAccessToken, validateToken, completeFlow, };
//# sourceMappingURL=index.d.ts.map