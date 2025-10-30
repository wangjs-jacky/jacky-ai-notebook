#!/usr/bin/env node

/**
 * 清除本地存储的认证信息
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const DEFAULT_STORAGE_DIR = path.join(os.homedir(), '.lark');
const DEFAULT_STORAGE_FILE = path.join(DEFAULT_STORAGE_DIR, 'auth.json');

function clearStorage() {
  try {
    // 检查文件是否存在
    if (fs.existsSync(DEFAULT_STORAGE_FILE)) {
      fs.unlinkSync(DEFAULT_STORAGE_FILE);
      console.log('✅ 已删除认证文件:', DEFAULT_STORAGE_FILE);
      
      // 如果目录为空，也删除目录
      const files = fs.readdirSync(DEFAULT_STORAGE_DIR);
      if (files.length === 0) {
        fs.rmdirSync(DEFAULT_STORAGE_DIR);
        console.log('✅ 已删除存储目录:', DEFAULT_STORAGE_DIR);
      }
      
      console.log('🎉 存储清除完成！');
    } else {
      console.log('ℹ️  认证文件不存在，无需清除');
      console.log('路径:', DEFAULT_STORAGE_FILE);
    }
  } catch (error) {
    console.error('❌ 清除存储失败:', error.message);
    process.exit(1);
  }
}

// 执行清除
clearStorage();

