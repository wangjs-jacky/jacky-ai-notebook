/**
 * 刷新飞书 Access Token 脚本
 * 使用 refresh_token 刷新 access_token
 */

import { getLarkConfig } from '../src/config.js';
import { authStore } from '../src/core/auth-store.js';
import { LarkApiClient } from '../src/core/client.js';

async function main() {
  try {
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🔄 飞书 Token 刷新工具\n');
    console.log('='.repeat(60) + '\n');

    // 检查本地是否有认证信息
    const authInfo = authStore.getAuthInfo();
    
    if (!authInfo) {
      console.error('❌ 没有找到本地认证信息');
      console.error('💡 请先运行 pnpm run login 进行登录\n');
      process.exit(1);
    }

    console.log('📋 当前 Token 信息:');
    console.log(`  Access Token: ${authInfo.token.substring(0, 40)}...`);
    console.log(`  过期时间: ${authInfo.expiresAt ? new Date(authInfo.expiresAt).toLocaleString('zh-CN') : '未知'}`);
    console.log(`  是否过期: ${authStore.isTokenExpired() ? '是 ⚠️' : '否 ✅'}`);
    
    if (authInfo.extra?.refreshToken) {
      console.log(`  Refresh Token: ${authInfo.extra.refreshToken.substring(0, 40)}...`);
    } else {
      console.error('\n❌ 没有找到 refresh_token，无法刷新');
      console.error('💡 请重新登录以获取 refresh_token\n');
      process.exit(1);
    }

    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🔄 开始刷新 access_token...\n');

    // 获取配置并创建 API 客户端
    const config = getLarkConfig();
    const apiClient = new LarkApiClient(config);

    // 直接调用 API 刷新 token
    const tokenResponse = await apiClient.refreshUserAccessToken(authInfo.extra.refreshToken);

    console.log('✅ 成功获取新的 token\n');

    // 更新 authStore 中的认证信息
    const updatedAuthInfo: any = {
      token: tokenResponse.access_token,
      clientId: config.appId,
      scopes: authInfo.scopes || [],
      expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      expiresIn: tokenResponse.expires_in,
      extra: {
        appId: config.appId,
        appSecret: config.appSecret,
        refreshToken: tokenResponse.refresh_token || authInfo.extra.refreshToken,
      },
    };

    authStore.setAuthInfo(updatedAuthInfo);

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Token 刷新成功！\n');
    console.log('='.repeat(60) + '\n');

    console.log('📝 新的 Token 信息:');
    console.log(`  Access Token: ${updatedAuthInfo.token.substring(0, 40)}...`);
    console.log(`  过期时间: ${new Date(updatedAuthInfo.expiresAt).toLocaleString('zh-CN')}`);
    
    if (updatedAuthInfo.extra?.refreshToken) {
      console.log(`  Refresh Token: ${updatedAuthInfo.extra.refreshToken.substring(0, 40)}...`);
    }

    console.log('\n💾 Token 已更新到本地文件:');
    console.log(`  ${authStore.getStoragePath()}`);

    console.log('\n' + '='.repeat(60) + '\n');
    console.log('✨ Token 刷新完成！\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('\n❌ Token 刷新失败！\n');
    console.error('='.repeat(60) + '\n');
    console.error('错误信息:', error instanceof Error ? error.message : error);
    console.error('\n💡 提示:');
    console.error('  1. refresh_token 可能已过期，请重新登录');
    console.error('  2. 检查网络连接是否正常');
    console.error('  3. 确认应用配置正确');
    console.error('\n');
    process.exit(1);
  }
}

main();

