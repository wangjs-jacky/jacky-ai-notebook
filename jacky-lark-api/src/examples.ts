/**
 * 飞书 API 使用示例
 * 演示如何获取 user_access_token
 */

import { LarkApiClient, LarkOAuthHelper } from './index.js';

// 配置信息 - 请替换为您的实际应用信息
const config = {
  appId: 'your_app_id',           // 您的应用 ID
  appSecret: 'your_app_secret',   // 您的应用密钥
  redirectUri: 'http://localhost:3000/callback', // 回调地址
};

// 创建 OAuth 助手和 API 客户端
const oauthHelper = new LarkOAuthHelper(config);
const apiClient = new LarkApiClient(config);

/**
 * 示例 1: 生成授权链接
 */
function generateAuthUrl() {
  const authUrl = oauthHelper.generateAuthUrl('random_state');
  console.log('请访问以下链接进行授权:');
  console.log(authUrl);
  return authUrl;
}

/**
 * 示例 2: 处理授权回调并获取 user_access_token
 */
async function handleAuthCallback(callbackUrl: string) {
  try {
    // 验证回调 URL
    oauthHelper.validateCallback(callbackUrl);
    
    // 解析授权码
    const { code } = oauthHelper.parseAuthorizationCode(callbackUrl);
    console.log('获取到授权码:', code);
    
    // 使用授权码获取 user_access_token
    const tokenResponse = await apiClient.getUserAccessToken(code);
    console.log('获取到 user_access_token:', tokenResponse);
    
    return tokenResponse;
  } catch (error) {
    console.error('处理授权回调失败:', error);
    throw error;
  }
}

/**
 * 示例 3: 获取用户信息
 */
async function getUserInfo(accessToken: string) {
  try {
    const userInfo = await apiClient.getUserInfo(accessToken);
    console.log('用户信息:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 示例 4: 刷新访问令牌
 */
async function refreshAccessToken(refreshToken: string) {
  try {
    const tokenResponse = await apiClient.refreshUserAccessToken(refreshToken);
    console.log('刷新后的 user_access_token:', tokenResponse);
    return tokenResponse;
  } catch (error) {
    console.error('刷新访问令牌失败:', error);
    throw error;
  }
}

/**
 * 示例 5: 验证访问令牌
 */
async function validateToken(accessToken: string) {
  try {
    const isValid = await apiClient.validateAccessToken(accessToken);
    console.log('访问令牌是否有效:', isValid);
    return isValid;
  } catch (error) {
    console.error('验证访问令牌失败:', error);
    throw error;
  }
}

/**
 * 完整的使用流程示例
 */
async function completeFlow() {
  try {
    // 1. 生成授权链接
    generateAuthUrl();
    
    // 2. 模拟用户点击授权链接后的回调
    // 在实际应用中，这会是用户浏览器重定向到您的回调地址
    const mockCallbackUrl = 'http://localhost:3000/callback?code=mock_auth_code&state=random_state';
    
    // 3. 处理回调并获取 token
    const tokenResponse = await handleAuthCallback(mockCallbackUrl);
    
    // 4. 获取用户信息
    await getUserInfo(tokenResponse.access_token);
    
    // 5. 验证令牌
    await validateToken(tokenResponse.access_token);
    
    console.log('完整流程执行成功！');
  } catch (error) {
    console.error('完整流程执行失败:', error);
  }
}

// 导出示例函数
export {
  generateAuthUrl,
  handleAuthCallback,
  getUserInfo,
  refreshAccessToken,
  validateToken,
  completeFlow,
};
