/**
 * 配置管理模块
 * 使用 dotenv 加载环境变量
 */

import { config } from 'dotenv';
import type { LarkOAuthConfig } from './types/index.js';

// 加载 .env 文件
config();

/**
 * 获取 Lark OAuth 配置
 * @returns LarkOAuthConfig 对象
 * @throws Error 如果缺少必要的环境变量
 */
export function getLarkConfig(): LarkOAuthConfig {
  const appId = process.env['LARK_APP_ID'];
  const appSecret = process.env['LARK_APP_SECRET'];
  const redirectUri = process.env['LARK_REDIRECT_URI'] || 'http://localhost:3000/callback';
  const scope = process.env['LARK_SCOPE'] || "";
  // 验证必需的配置项
  if (!appId || appId === 'your_app_id') {
    throw new Error('请在 .env 文件中配置 LARK_APP_ID');
  }

  if (!appSecret || appSecret === 'your_app_secret') {
    throw new Error('请在 .env 文件中配置 LARK_APP_SECRET');
  }

  return {
    appId,
    appSecret,
    redirectUri,
    scope
  };
}

/**
 * 从环境变量创建配置对象
 * 允许提供部分覆盖
 */
export function createLarkConfig(overrides?: Partial<LarkOAuthConfig>): LarkOAuthConfig {
  const envConfig = getLarkConfig();
  
  if (overrides) {
    return {
      ...envConfig,
      ...overrides,
    };
  }
  
  return envConfig;
}

