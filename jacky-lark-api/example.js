/**
 * 飞书 API 完整使用示例
 * 演示完整的 OAuth2.0 授权流程
 */

import { LarkApiClient, LarkOAuthHelper } from './dist/index.js';

// 配置信息 - 请替换为您的实际应用信息
const config = {
  appId: 'your_app_id',           // 您的应用 ID
  appSecret: 'your_app_secret',   // 您的应用密钥
  redirectUri: 'http://localhost:3000/callback', // 回调地址
};

async function main() {
  console.log('🚀 飞书 API 完整使用示例');
  console.log('='.repeat(50));

  // 创建 OAuth 助手和 API 客户端
  const oauthHelper = new LarkOAuthHelper(config);
  const apiClient = new LarkApiClient(config);

  try {
    // 步骤 1: 生成授权链接
    console.log('\n📝 步骤 1: 生成授权链接');
    const state = 'random_state_' + Date.now();
    const authUrl = oauthHelper.generateAuthUrl(state);
    console.log('授权链接:', authUrl);
    console.log('请复制此链接到浏览器中进行授权');

    // 步骤 2: 模拟用户授权后的回调
    console.log('\n📝 步骤 2: 处理授权回调');
    console.log('等待用户授权...');
    
    // 在实际应用中，这里会是用户浏览器重定向到您的回调地址
    // 您需要从回调 URL 中获取授权码
    const mockCallbackUrl = 'http://localhost:3000/callback?code=mock_auth_code&state=' + state;
    
    // 验证回调 URL
    oauthHelper.validateCallback(mockCallbackUrl);
    
    // 解析授权码
    const { code, state: returnedState } = oauthHelper.parseAuthorizationCode(mockCallbackUrl);
    console.log('✅ 授权码解析成功:', code);
    console.log('✅ 状态验证成功:', returnedState === state);

    // 步骤 3: 获取 user_access_token
    console.log('\n📝 步骤 3: 获取 user_access_token');
    console.log('正在获取 user_access_token...');
    
    // 注意：这里会失败，因为使用的是模拟的授权码
    // 在实际使用中，请使用真实的授权码
    try {
      const tokenResponse = await apiClient.getUserAccessToken(code);
      console.log('✅ user_access_token 获取成功:', tokenResponse);
      
      // 步骤 4: 获取用户信息
      console.log('\n📝 步骤 4: 获取用户信息');
      const userInfo = await apiClient.getUserInfo(tokenResponse.access_token);
      console.log('✅ 用户信息获取成功:', userInfo);
      
      // 步骤 5: 验证访问令牌
      console.log('\n📝 步骤 5: 验证访问令牌');
      const isValid = await apiClient.validateAccessToken(tokenResponse.access_token);
      console.log('✅ 访问令牌验证结果:', isValid);
      
    } catch (error) {
      console.log('⚠️  使用模拟授权码获取 token 失败（这是预期的）:', error.message);
      console.log('在实际使用中，请使用真实的授权码');
    }

    console.log('\n🎉 示例执行完成！');
    console.log('\n📋 使用步骤总结:');
    console.log('1. 配置您的应用信息（appId, appSecret, redirectUri）');
    console.log('2. 生成授权链接并引导用户访问');
    console.log('3. 处理用户授权后的回调，解析授权码');
    console.log('4. 使用授权码获取 user_access_token');
    console.log('5. 使用 user_access_token 调用飞书 API');

  } catch (error) {
    console.error('❌ 示例执行失败:', error);
  }
}

// 运行示例
main().catch(console.error);
