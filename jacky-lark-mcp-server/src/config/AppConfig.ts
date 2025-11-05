/**
 * 全局应用配置管理类（单例模式）
 * 用于统一管理命令行参数配置
 */

import { lark } from "jacky-lark-api";
export class AppConfig {
  private static instance: AppConfig;

  // 必需配置
  public appId?: string;
  public appSecret?: string;

  // 可选配置
  public domain: string;
  public scope?: string;
  public port: number;
  public debug: boolean;
  public redirectUri: string;
  public wikiUrl?: string;
  public client: lark.Client | undefined;
  private constructor() {
    // 设置默认值
    this.domain = 'https://open.feishu.cn';
    this.redirectUri = 'http://localhost:3000/callback';
    this.port = 3000;
    this.debug = false;
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  /**
   * 更新配置（通过命令行参数设置）
   */
  public update(options: Partial<AppConfig>): void {
    if (options.appId !== undefined) this.appId = options.appId;
    if (options.appSecret !== undefined) this.appSecret = options.appSecret;
    if (options.scope !== undefined) this.scope = options.scope;
    if (options.port !== undefined) this.port = options.port;
    if (options.debug !== undefined) this.debug = options.debug;
    if (options.redirectUri !== undefined) this.redirectUri = options.redirectUri;
    if (options.wikiUrl !== undefined) this.wikiUrl = options.wikiUrl;
    if (options.domain !== undefined) this.domain = options.domain;
    if (options.client !== undefined) this.client = options.client;
  }

  /**
   * 验证必需配置
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.appId) {
      errors.push('❌ LARK_APP_ID is required. Use --app-id option');
    }
    if (!this.appSecret) {
      errors.push('❌ LARK_APP_SECRET is required. Use --app-secret option');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 打印当前配置（调试用）
   */
  public print(): void {
    console.log('\n📋 Current Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ App ID: ${this.appId || '(not set)'}`);
    console.log(`🔒 App Secret: ${this.appSecret ? this.appSecret.substring(0, 8) + '...' : '(not set)'}`);
    console.log(`🌐 Domain: ${this.domain}`);
    console.log(`🎫 Scope: ${this.scope || '(not set)'}`);
    console.log(`🔗 Redirect URI: ${this.redirectUri}`);
    console.log(`🔌 Port: ${this.port}`);
    console.log(`🐛 Debug: ${this.debug ? 'Enabled' : 'Disabled'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

/**
 * 导出单例实例，供全局使用
 */
export const appConfig = AppConfig.getInstance();

