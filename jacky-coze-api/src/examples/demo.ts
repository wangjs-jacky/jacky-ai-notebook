import { createCozeAgent } from '../index';

// ==================== 使用示例 ====================

// 1. 基础使用示例（带返回值）
async function basicExample() {
  console.log('\n=== 基础使用示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: "pat_HzR7Vt18ltFZKashdi8VaCPXhM7LhkMr4lsaTrLp0IJvSkO3hQxwn91ASzWn7kB8",
    COZE_BOT_ID: "7560248215090675752",
    debug: false,
  });

  const result = await agent.chat('上海影視樂園+朱家角古鎮一日遊【影視基地&江南古鎮&純玩】 上海影視樂園+朱家角古鎮【含更換民國服飾或漢服、乘搖櫓船】');
  
  // 使用返回值
  if (result.success) {
    console.log('\n✅ 对话成功！');
    console.log('📝 回复内容:', result.message);
    console.log('💰 Token使用:', result.usage);
  } else {
    console.log('\n❌ 对话失败:', result.error);
  }
}

// 2. 带生命周期事件的使用示例
async function lifecycleExample() {
  console.log('\n=== 生命周期事件示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: "pat_HzR7Vt18ltFZKashdi8VaCPXhM7LhkMr4lsaTrLp0IJvSkO3hQxwn91ASzWn7kB8",
    COZE_BOT_ID: "7560248215090675752",
    debug: false,
  });

  const result = await agent.chat('请写一首关于春天的诗', {
    onStart: (data) => {
      console.log('🚀 对话开始，会话ID:', data.id);
    },
    onMessage: (content) => {
      process.stdout.write(content);
    },
    onComplete: (data) => {
      console.log('\n✅ 对话完成');
    },
    onUsage: (usage) => {
      console.log('💰 使用情况:', usage);
    },
    onError: (error) => {
      console.error('❌ 发生错误:', error);
    }
  });

  // 打印返回结果
  console.log('\n📊 返回结果:');
  console.log('- 成功:', result.success);
  console.log('- 消息:', result.message);
  console.log('- 会话ID:', result.conversationId);
  console.log('- Token使用:', result.usage);
  if (result.error) {
    console.log('- 错误:', result.error);
  }

}

// 3. 多轮对话示例
async function multiTurnExample() {
  console.log('\n=== 多轮对话示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: "pat_HzR7Vt18ltFZKashdi8VaCPXhM7LhkMr4lsaTrLp0IJvSkO3hQxwn91ASzWn7kB8",
    COZE_BOT_ID: "7560248215090675752",
    debug: false,
    autoSaveHistory: true, // 启用历史记录保存
  });

  // 第一轮对话
  console.log('第一轮对话:');
  await agent.chat('我的名字是张三');

  // 第二轮对话
  console.log('\n第二轮对话:');
  await agent.chat('你还记得我的名字吗？');

  // 查看对话历史
  console.log('\n对话历史:');
  const history = agent.getHistory();
  history.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role}]: ${msg.content}`);
  });
}

// 4. 对话重置示例
async function resetExample() {
  console.log('\n=== 对话重置示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: "pat_HzR7Vt18ltFZKashdi8VaCPXhM7LhkMr4lsaTrLp0IJvSkO3hQxwn91ASzWn7kB8",
    COZE_BOT_ID: "7560248215090675752",
    debug: false,
  });

  // 第一轮对话
  await agent.chat('我的名字是李四');

  // 重置对话
  agent.reset();
  console.log('对话已重置');

  // 第二轮对话（AI不会记得之前的信息）
  await agent.chat('你还记得我的名字吗？');
}

// 5. 错误处理示例
async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: "invalid_key", // 故意使用无效的API密钥
    COZE_BOT_ID: "7560248215090675752",
    debug: false,
  });

  try {
    await agent.chat('测试错误处理', {
      onError: (error) => {
        console.log('捕获到错误:', error.message);
      }
    });
  } catch (error: any) {
    console.log('外层错误处理:', error.message);
  }
}

// 6. 自定义配置示例
async function customConfigExample() {
  console.log('\n=== 自定义配置示例 ===');

  const agent = createCozeAgent({
    COZE_API_KEY: "pat_HzR7Vt18ltFZKashdi8VaCPXhM7LhkMr4lsaTrLp0IJvSkO3hQxwn91ASzWn7kB8",
    COZE_BOT_ID: "7560248215090675752",
    debug: true, // 启用调试模式
    autoSaveHistory: true, // 自动保存历史
    baseURL: "https://api.coze.cn" // 自定义API地址
  });

  await agent.chat('请用一句话介绍人工智能');
}

// 执行所有示例
async function runAllExamples() {
  try {
    await basicExample();
    // await lifecycleExample();
    // await multiTurnExample();
    // await resetExample();
    // await errorHandlingExample();
    // await customConfigExample();
  } catch (error) {
    console.error('示例执行出错:', error);
  }
}


const main = async () => {
  await runAllExamples();
}

main();

