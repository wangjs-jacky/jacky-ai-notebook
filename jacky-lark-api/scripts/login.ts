/**
 * 飞书 OAuth 登录脚本
 * 用于快速完成登录认证并保存 token
 */

import { LoginHandler } from '../src/core/login-handler.js';
import { getLarkConfig } from '../src/config.js';
import { authStore } from '../src/core/auth-store.js';

async function main() {
  try {
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🚀 飞书 OAuth 登录工具\n');
    console.log('='.repeat(60) + '\n');

    // 获取配置信息
    const config = getLarkConfig();
    
    console.log('📋 应用配置信息:');
    console.log(`  App ID: ${config.appId}`);
    console.log(`  Redirect URI: ${config.redirectUri}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Scope: ${config.scope || '(使用应用的所有权限)'}\n`);
    
    console.log('='.repeat(60) + '\n');

    // 执行登录（会自动检查本地是否有有效 token）
    const authInfo = await LoginHandler.handleLogin(config);

    if (authInfo) {
      console.log('\n' + '='.repeat(60));
      console.log('\n✅ 登录成功！\n');
      console.log('='.repeat(60) + '\n');
      
      console.log('📝 认证信息:');
      console.log(`  Access Token: ${authInfo.token.substring(0, 40)}...`);
      console.log(`  Client ID: ${authInfo.clientId}`);
      console.log(`  过期时间: ${authInfo.expiresAt ? new Date(authInfo.expiresAt).toLocaleString('zh-CN') : '未知'}`);
      
      if (authInfo.extra?.refreshToken) {
        console.log(`  Refresh Token: ${authInfo.extra.refreshToken.substring(0, 40)}...`);
      }
      
      console.log('\n💾 Token 已保存到本地文件:');
      console.log(`  ${authStore.getStoragePath()}`);
      
      console.log('\n' + '='.repeat(60) + '\n');
      console.log('✨ 现在您可以开始使用飞书 API 了！\n');
      
      // 成功后退出
      process.exit(0);
    }
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('\n❌ 登录失败！\n');
    console.error('='.repeat(60) + '\n');
    console.error('错误信息:', error instanceof Error ? error.message : error);
    console.error('\n💡 提示:');
    console.error('  1. 请确保 .env 文件配置正确');
    console.error('  2. 检查网络连接是否正常');
    console.error('  3. 确认应用的 redirect_uri 配置与飞书开放平台一致');
    console.error('\n');
    process.exit(1);
  }
}

main();

