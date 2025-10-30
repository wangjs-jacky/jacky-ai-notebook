/**
 * Token 提取器功能测试
 * 演示新的 getTokenOnly 返回值（token + objType）
 */

import { getTokenOnly, getTokenString, type TokenWithType } from '../src/index.js';

console.log('=== Token 提取器功能测试 ===\n');

// 测试各种类型的 URL
const testUrls = [
  {
    name: '旧版文档',
    url: 'https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q',
    expectedType: 'doc'
  },
  {
    name: '新版文档',
    url: 'https://sample.feishu.cn/docx/UXEAd6cRUoj5pexJZr0cdwaFnpd',
    expectedType: 'docx'
  },
  {
    name: '电子表格',
    url: 'https://sample.feishu.cn/sheets/SheetTokenExample',
    expectedType: 'sheet'
  },
  {
    name: '多维表格',
    url: 'https://sample.feishu.cn/base/BitableTokenExample',
    expectedType: 'bitable'
  },
  {
    name: 'Wiki 节点',
    url: 'https://sample.feishu.cn/wiki/WikiTokenExample',
    expectedType: 'wiki'
  },
  {
    name: '云空间文件',
    url: 'https://sample.feishu.cn/file/FileTokenExample',
    expectedType: 'file'
  }
];

console.log('测试 getTokenOnly() - 返回 { token, objType }:\n');

testUrls.forEach(({ name, url, expectedType }) => {
  const result: TokenWithType = getTokenOnly(url);
  const status = result.objType === expectedType ? '✅' : '❌';
  
  console.log(`${status} ${name}:`);
  console.log(`   URL: ${url}`);
  console.log(`   Token: ${result.token}`);
  console.log(`   ObjType: ${result.objType}`);
  console.log(`   期望类型: ${expectedType}\n`);
});

console.log('\n测试 getTokenString() - 仅返回 token 字符串（向后兼容）:\n');

const sampleUrl = 'https://sample.feishu.cn/docx/UXEAd6cRUoj5pexJZr0cdwaFnpd';
const tokenString = getTokenString(sampleUrl);
console.log(`URL: ${sampleUrl}`);
console.log(`Token (字符串): ${tokenString}\n`);

console.log('=== 实际使用场景示例 ===\n');

// 场景 1: 根据 URL 自动识别类型并调用相应 API
const wikiUrl = 'https://sample.feishu.cn/wiki/WikiNodeToken123';
const { token: nodeToken, objType } = getTokenOnly(wikiUrl);

console.log('场景 1: 智能识别文档类型');
console.log(`URL: ${wikiUrl}`);
console.log(`提取的 Token: ${nodeToken}`);
console.log(`识别的类型: ${objType}`);
console.log(`可以用于调用: wikiNodeAPI.getNode(nodeToken, objType || 'wiki')\n`);

// 场景 2: 解构赋值使用
const docUrl = 'https://sample.feishu.cn/docx/SampleDocToken';
const { token, objType: docType } = getTokenOnly(docUrl);

console.log('场景 2: 解构赋值');
console.log(`Token: ${token}`);
console.log(`类型: ${docType}\n`);

console.log('✅ 测试完成');

