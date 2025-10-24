/**
 * 代码架构对比示例
 * 展示 Class 和模块化两种方式的优劣
 */

// ==================== Class 方式 ====================

interface LarkConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

class LarkApiClient {
  private config: LarkConfig;
  private baseUrl = 'https://open.larksuite.com/open-apis';

  constructor(config: LarkConfig) {
    this.config = config;
  }

  // 优点：状态封装，无需重复传递配置
  async getUserAccessToken(code: string) {
    const requestData = {
      grant_type: 'authorization_code',
      client_id: this.config.appId,  // 直接使用实例状态
      client_secret: this.config.appSecret,
      code,
      redirect_uri: this.config.redirectUri,
    };
    
    return this.makeRequest('/authen/v1/access_token', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // 优点：可以访问私有方法
  private async makeRequest(endpoint: string, options: any) {
    const url = `${this.baseUrl}${endpoint}`;
    // 实现细节...
    return { access_token: 'mock_token' };
  }

  // 优点：方法可以访问实例状态
  async getUserInfo(accessToken: string) {
    return this.makeRequest('/authen/v1/user_info', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
  }
}

// ==================== 模块化方式 ====================

// 优点：纯函数，无副作用
export async function getUserAccessToken(
  config: LarkConfig, 
  code: string
): Promise<{ access_token: string }> {
  const requestData = {
    grant_type: 'authorization_code',
    client_id: config.appId,
    client_secret: config.appSecret,
    code,
    redirect_uri: config.redirectUri,
  };
  
  return makeRequest(config, '/authen/v1/access_token', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

// 优点：函数可以独立测试
export async function getUserInfo(
  config: LarkConfig,
  accessToken: string
): Promise<any> {
  return makeRequest(config, '/authen/v1/user_info', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
}

// 优点：纯函数，易于测试
async function makeRequest(
  config: LarkConfig,
  endpoint: string, 
  options: any
): Promise<any> {
  const baseUrl = 'https://open.larksuite.com/open-apis';
  const url = `${baseUrl}${endpoint}`;
  // 实现细节...
  return { access_token: 'mock_token' };
}

// ==================== 使用对比 ====================

// Class 方式使用
async function useClassApproach() {
  const client = new LarkApiClient({
    appId: 'app_id',
    appSecret: 'app_secret',
    redirectUri: 'http://localhost:3000/callback'
  });
  
  // 优点：简洁的调用方式
  const token = await client.getUserAccessToken('auth_code');
  const userInfo = await client.getUserInfo(token.access_token);
  
  return { token, userInfo };
}

// 模块化方式使用
async function useModularApproach() {
  const config = {
    appId: 'app_id',
    appSecret: 'app_secret',
    redirectUri: 'http://localhost:3000/callback'
  };
  
  // 缺点：需要重复传递配置
  const token = await getUserAccessToken(config, 'auth_code');
  const userInfo = await getUserInfo(config, token.access_token);
  
  return { token, userInfo };
}

// ==================== 混合方式（推荐） ====================

// 结合两种方式的优点
export class LarkApiClientV2 {
  constructor(private config: LarkConfig) {}
  
  // 使用纯函数实现核心逻辑
  async getUserAccessToken(code: string) {
    return getUserAccessTokenImpl(this.config, code);
  }
  
  async getUserInfo(accessToken: string) {
    return getUserInfoImpl(this.config, accessToken);
  }
}

// 核心逻辑使用纯函数实现
async function getUserAccessTokenImpl(
  config: LarkConfig, 
  code: string
): Promise<{ access_token: string }> {
  // 纯函数实现...
  return { access_token: 'mock_token' };
}

async function getUserInfoImpl(
  config: LarkConfig,
  accessToken: string
): Promise<any> {
  // 纯函数实现...
  return { user: 'mock_user' };
}

export { getUserAccessTokenImpl, getUserInfoImpl };
