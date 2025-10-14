import { createCozeAgent } from 'jacky-coze-api';
import type { LifecycleEvents, ChatResult } from 'jacky-coze-api';
import 'dotenv/config';

// ==================== Coze API 使用示例 ====================

// 1. 基础使用示例
async function basicExample() {
  console.log('\n=== 基础使用示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: process.env.COZE_API_KEY || '',
    COZE_BOT_ID: "7560379484466266153",
    debug: false,
  });

  const result = await agent.chat('你好，请介绍一下你自己');
  
  if (result.success) {
    console.log('\n✅ 对话成功！');
    console.log('📝 回复内容:', result.message);
    console.log('💰 Token使用:', result.usage);
    console.log('🔑 会话ID:', result.conversationId);
  } else {
    console.log('\n❌ 对话失败:', result.error);
  }
}

// 2. 使用生命周期事件的流式输出示例
async function streamingExample() {
  console.log('\n=== 流式输出示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: process.env.COZE_API_KEY || '',
    COZE_BOT_ID: process.env.COZE_BOT_ID || '',
    debug: false,
  });

  console.log('问题: 请写一首关于人工智能的短诗\n');
  console.log('回复:');
  
  const result = await agent.chat('请写一首关于人工智能的短诗', {
    onStart: (data) => {
      console.log('🚀 对话开始，会话ID:', data.id);
    },
    onMessage: (content) => {
      // 实时输出流式内容
      process.stdout.write(content);
    },
    onComplete: (data) => {
      console.log('\n✅ 对话完成');
    },
    onUsage: (usage) => {
      console.log('💰 Token使用情况:', usage);
    },
    onError: (error) => {
      console.error('❌ 发生错误:', error);
    }
  });

  console.log('\n📊 完整结果:', {
    success: result.success,
    messageLength: result.message.length,
    conversationId: result.conversationId,
  });
}

// 3. 多轮对话示例
async function multiTurnExample() {
  console.log('\n=== 多轮对话示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: process.env.COZE_API_KEY || '',
    COZE_BOT_ID: process.env.COZE_BOT_ID || '',
    debug: false,
    autoSaveHistory: true, // 启用历史记录保存
  });

  // 第一轮对话
  console.log('\n📝 第一轮对话: 我的名字是小明');
  const result1 = await agent.chat('我的名字是小明');
  console.log('回复:', result1.message);

  // 第二轮对话
  console.log('\n📝 第二轮对话: 你还记得我的名字吗？');
  const result2 = await agent.chat('你还记得我的名字吗？');
  console.log('回复:', result2.message);

  // 查看对话历史
  console.log('\n📚 对话历史:');
  const history = agent.getHistory();
  history.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role}]: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
  });
}

// 4. 对话重置示例
async function resetExample() {
  console.log('\n=== 对话重置示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: process.env.COZE_API_KEY || '',
    COZE_BOT_ID: process.env.COZE_BOT_ID || '',
    debug: false,
    autoSaveHistory: true,
  });

  // 第一轮对话
  console.log('\n📝 第一轮: 我最喜欢的颜色是蓝色');
  await agent.chat('我最喜欢的颜色是蓝色');

  // 重置对话
  agent.reset();
  console.log('\n🔄 对话已重置');

  // 第二轮对话（AI不会记得之前的信息）
  console.log('\n📝 第二轮: 你知道我最喜欢什么颜色吗？');
  const result = await agent.chat('你知道我最喜欢什么颜色吗？');
  console.log('回复:', result.message);
}

// 5. 错误处理示例
async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: 'invalid_key', // 使用无效的API密钥测试错误处理
    COZE_BOT_ID: process.env.COZE_BOT_ID || '',
    debug: false,
  });

  try {
    const result = await agent.chat('测试错误处理', {
      onError: (error) => {
        console.log('⚠️  回调中捕获到错误:', error.message);
      }
    });
    
    if (!result.success) {
      console.log('❌ 请求失败:', result.error);
    }
  } catch (error: any) {
    console.log('❌ 外层捕获到错误:', error.message);
  }
}

// 主函数
async function main() {
  // 检查环境变量
  if (!process.env.COZE_API_KEY) {
    console.error('❌ 请设置环境变量 COZE_API_KEY 和 COZE_BOT_ID');
    console.log('\n提示: 在 .env 文件中添加:');
    console.log('COZE_API_KEY=your_api_key');
    return;
  }

  try {
    // 运行示例（可以注释/取消注释来运行不同的示例）
    await basicExample();
    // await streamingExample();
    // await multiTurnExample();
    // await resetExample();
    // await errorHandlingExample();
    
  } catch (error) {
    console.error('❌ 运行出错:', error);
  }
}

// 执行主函数
main();

export {};
