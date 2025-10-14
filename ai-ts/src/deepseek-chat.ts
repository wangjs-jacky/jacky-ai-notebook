import OpenAI from 'openai';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建 OpenAI 客户端实例，但使用 DeepSeek API
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY, // 从环境变量中获取 API 密钥
  baseURL: 'https://api.deepseek.com', // DeepSeek API 的基础 URL
});

// 定义一个函数用于调用 DeepSeek API
async function chatWithDeepSeek(prompt: string, systemPrompt: string = "You are a helpful assistant.") {
  try {
    // 调用聊天完成 API
    const response = await client.chat.completions.create({
      model: "deepseek-chat", // 使用 deepseek-chat 模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7, // 可以根据需要调整
      stream: false // 设置为 true 可以使用流式输出
    });

    // 返回生成的内容
    return response.choices[0].message.content;
  } catch (error) {
    console.error('调用 DeepSeek API 时出错:', error);
    throw error;
  }
}

// 定义一个函数用于流式调用 DeepSeek API
async function streamChatWithDeepSeek(prompt: string, systemPrompt: string = "You are a helpful assistant.") {
  try {
    // 调用聊天完成 API，使用流式输出
    const stream = await client.chat.completions.create({
      model: "deepseek-chat", // 使用 deepseek-chat 模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: true // 启用流式输出
    });

    console.log("回复: ");
    let fullResponse = '';
    
    // 处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        process.stdout.write(content);
        fullResponse += content;
      }
    }
    
    console.log("\n");
    return fullResponse;
  } catch (error) {
    console.error('流式调用 DeepSeek API 时出错:', error);
    throw error;
  }
}

// 定义一个函数用于调用 DeepSeek Reasoner API (思考模式)
async function chatWithDeepSeekReasoner(prompt: string, systemPrompt: string = "You are a helpful assistant.") {
  try {
    // 调用聊天完成 API，使用 deepseek-reasoner 模型
    const response = await client.chat.completions.create({
      model: "deepseek-reasoner", // 使用 deepseek-reasoner 模型 (思考模式)
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: false
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('调用 DeepSeek Reasoner API 时出错:', error);
    throw error;
  }
}

// 定义一个函数用于流式调用 DeepSeek Reasoner API (思考模式 + 流式输出)
async function streamChatWithDeepSeekReasoner(prompt: string, systemPrompt: string = "You are a helpful assistant.") {
  try {
    // 调用聊天完成 API，使用 deepseek-reasoner 模型和流式输出
    const stream = await client.chat.completions.create({
      model: "deepseek-reasoner", // 使用 deepseek-reasoner 模型 (思考模式)
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: true // 启用流式输出
    });

    console.log("💭 思考过程:");
    console.log("─────────────────────────────────────");
    let reasoningContent = '';
    let fullResponse = '';
    let isInReasoning = true;
    
    // 处理流式响应
    for await (const chunk of stream) {
      // 思维链内容通常在 reasoning_content 字段中
      const reasoning = chunk.choices[0]?.delta?.reasoning_content || '';
      const content = chunk.choices[0]?.delta?.content || '';
      
      // 输出思考过程
      if (reasoning) {
        process.stdout.write(reasoning);
        reasoningContent += reasoning;
      }
      
      // 当开始输出最终答案时，添加分隔符
      if (content && isInReasoning && reasoningContent) {
        console.log("\n─────────────────────────────────────");
        console.log("✨ 最终回答:");
        console.log("─────────────────────────────────────");
        isInReasoning = false;
      }
      
      // 输出最终答案
      if (content) {
        process.stdout.write(content);
        fullResponse += content;
      }
    }
    
    console.log("\n");
    return {
      reasoning: reasoningContent,
      answer: fullResponse
    };
  } catch (error) {
    console.error('流式调用 DeepSeek Reasoner API 时出错:', error);
    throw error;
  }
}

// 示例用法
async function main() {
  // 确保设置了环境变量
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('错误: 请设置 DEEPSEEK_API_KEY 环境变量');
    process.exit(1);
  }

  const prompt = "请介绍一下你自己，你是什么模型？";
  
  // console.log("=".repeat(60));
  // console.log("1️⃣  非流式调用示例:");
  // console.log("=".repeat(60));
  // const response = await chatWithDeepSeek(prompt);
  // console.log(response);
  
  // console.log("\n" + "=".repeat(60));
  // console.log("2️⃣  流式调用示例:");
  // console.log("=".repeat(60));
  // await streamChatWithDeepSeek(prompt);
  
  // console.log("\n" + "=".repeat(60));
  // console.log("3️⃣  思考模式 (非流式):");
  // console.log("=".repeat(60));
  // const reasonerResponse = await chatWithDeepSeekReasoner("解释一下量子纠缠的基本原理");
  // console.log(reasonerResponse);
  
  console.log("\n" + "=".repeat(60));
  console.log("4️⃣  思考模式 (流式) - 可以实时看到思考过程:");
  console.log("=".repeat(60));
  const streamReasonerResult = await streamChatWithDeepSeekReasoner(
    "如果我有3个苹果,吃掉2个,又买了5个,然后送给朋友3个,我还剩几个苹果?请详细说明计算过程。"
  );
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 流式思考模式返回结果:");
  console.log("=".repeat(60));
  console.log("思考过程长度:", streamReasonerResult.reasoning.length, "字符");
  console.log("最终答案长度:", streamReasonerResult.answer.length, "字符");
}

// 运行主函数
main().catch(console.error);
