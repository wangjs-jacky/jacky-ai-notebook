/**
 * 全局应用配置管理类（单例模式）
 * 用于统一管理命令行参数和环境变量配置
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
    // 从环境变量加载默认值
    this.appId = process.env.LARK_APP_ID;
    this.appSecret = process.env.LARK_APP_SECRET;
    this.domain = process.env.LARK_DOMAIN || 'https://open.feishu.cn';
    this.scope = process.env.LARK_SCOPE;
    this.redirectUri = process.env.LARK_REDIRECT_URI || 'http://localhost:3000/callback';
    this.wikiUrl = process.env.LARK_WIKI_URL;

    // 设置默认值
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
   * 更新配置（命令行参数会覆盖环境变量）
   */
  public update(options: Partial<AppConfig>): void {
    if (options.appId !== undefined) this.appId = options.appId;
    if (options.appSecret !== undefined) this.appSecret = options.appSecret;
    if (options.scope !== undefined) this.scope = options.scope;
    if (options.port !== undefined) this.port = options.port;
    if (options.debug !== undefined) this.debug = options.debug;
    if (options.redirectUri !== undefined) this.redirectUri = options.redirectUri;
    if (options.client !== undefined) this.client = options.client;
  }

  /**
   * 批量设置环境变量（用于向下兼容）
   */
  public syncToEnv(): void {
    if (this.appId) process.env.LARK_APP_ID = this.appId;
    if (this.appSecret) process.env.LARK_APP_SECRET = this.appSecret;
    if (this.domain) process.env.LARK_DOMAIN = this.domain;
    if (this.scope) process.env.LARK_SCOPE = this.scope;
    if (this.redirectUri) process.env.LARK_REDIRECT_URI = this.redirectUri;
  }

  /**
   * 验证必需配置
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.appId) {
      errors.push('❌ LARK_APP_ID is required. Use --app-id or set in .env file');
    }
    if (!this.appSecret) {
      errors.push('❌ LARK_APP_SECRET is required. Use --app-secret or set in .env file');
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

