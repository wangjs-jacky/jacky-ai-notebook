/**
 * 飞书授权信息存储
 * 支持本地文件持久化
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

export interface AuthInfo {
  token: string;              // access_token
  clientId: string;
  scopes: string[];
  expiresAt?: number;          // 过期时间（Unix 时间戳）
  extra?: {
    refreshToken?: string;     // 用于刷新的 Token
    appId?: string;
    appSecret?: string;
  };
}

// 默认存储路径：用户家目录下的 .lark 文件夹
const DEFAULT_STORAGE_DIR = path.join(os.homedir(), '.lark');
const DEFAULT_STORAGE_FILE = path.join(DEFAULT_STORAGE_DIR, 'auth.json');

/**
 * 授权信息存储
 * 存储授权码、状态和认证信息
 * 支持文件系统持久化
 */
export const authStore = {
  code: '',
  state: '',
  authInfo: null as AuthInfo | null,
  storageFilePath: DEFAULT_STORAGE_FILE,

  /**
   * 初始化存储（创建目录）
   */
  initStorage: (): void => {
    try {
      const dir = path.dirname(authStore.storageFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 创建存储目录: ${dir}`);
      }
    } catch (error) {
      console.error('❌ 创建存储目录失败:', error);
    }
  },

  /**
   * 获取当前存储路径
   */
  getStoragePath: (): string => {
    return authStore.storageFilePath;
  },

  /**
   * 设置自定义存储路径
   */
  setStoragePath: (filePath: string): void => {
    authStore.storageFilePath = filePath;
    authStore.initStorage();
  },

  /**
   * 从文件加载认证信息
   */
  loadFromFile: (): AuthInfo | null => {
    try {
      if (!fs.existsSync(authStore.storageFilePath)) {
        console.log('📂 认证文件不存在，跳过加载');
        return null;
      }

      const data = fs.readFileSync(authStore.storageFilePath, 'utf-8');
      const authInfo = JSON.parse(data) as AuthInfo;
      
      // 检查是否过期
      if (authInfo.expiresAt && Date.now() >= authInfo.expiresAt) {
        console.log('⚠️  本地 token 已过期');
        authStore.deleteFile();
        return null;
      }

      authStore.authInfo = authInfo;
      console.log('✅ 从本地文件加载认证信息成功');
      return authInfo;
    } catch (error) {
      console.error('❌ 从文件加载认证信息失败:', error);
      return null;
    }
  },

  /**
   * 保存认证信息到文件
   */
  saveToFile: (): boolean => {
    try {
      if (!authStore.authInfo) {
        console.log('⚠️  没有认证信息需要保存');
        return false;
      }

      authStore.initStorage();
      
      const data = JSON.stringify(authStore.authInfo, null, 2);
      fs.writeFileSync(authStore.storageFilePath, data, 'utf-8');
      
      console.log(`💾 认证信息已保存到: ${authStore.storageFilePath}`);
      return true;
    } catch (error) {
      console.error('❌ 保存认证信息到文件失败:', error);
      return false;
    }
  },

  /**
   * 删除存储文件
   */
  deleteFile: (): boolean => {
    try {
      if (fs.existsSync(authStore.storageFilePath)) {
        fs.unlinkSync(authStore.storageFilePath);
        console.log('🗑️  已删除认证文件');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 删除认证文件失败:', error);
      return false;
    }
  },

  /**
   * 获取授权码
   */
  getCode: async (): Promise<string> => {
    return authStore.code;
  },

  /**
   * 设置授权码
   */
  setCode: (code: string) => {
    authStore.code = code;
  },

  /**
   * 设置状态
   */
  setState: (state: string) => {
    authStore.state = state;
  },

  /**
   * 获取认证信息
   * 如果内存中没有，尝试从文件加载
   */
  getAuthInfo: (): AuthInfo | null => {
    if (!authStore.authInfo) {
      return authStore.loadFromFile();
    }
    return authStore.authInfo;
  },

  /**
   * 设置认证信息
   * 自动保存到文件
   */
  setAuthInfo: (info: AuthInfo) => {
    authStore.authInfo = info;
    authStore.saveToFile();
  },

  /**
   * 清空所有存储的认证信息
   * 包括内存和文件
   */
  clear: () => {
    authStore.code = '';
    authStore.state = '';
    authStore.authInfo = null;
    authStore.deleteFile();
  },

  /**
   * 检查 token 是否过期
   */
  isTokenExpired: (): boolean => {
    const info = authStore.getAuthInfo();
    if (!info || !info.expiresAt) {
      return true;
    }
    return Date.now() >= info.expiresAt;
  },
};

