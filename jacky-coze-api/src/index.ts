import { ChatEventType, CozeAPI, RoleType } from "@coze/api";
import type {
  LifecycleEvents,
  ChatResult,
  CozeAgentConfig,
  ConversationManager,
  CozeAgent
} from "./interface";

/**
 * 创建一个 Coze Agent 高阶函数
 * @param config 配置信息
 * @returns CozeAgent 实例
 */
function createCozeAgent(config: CozeAgentConfig): CozeAgent {
  const {
    COZE_API_KEY,
    COZE_BOT_ID,
    debug = false,
    autoSaveHistory = false,
    baseURL = "https://api.coze.cn"
  } = config;

  const client = new CozeAPI({
    baseURL,
    token: COZE_API_KEY,
    debug,
  });

  // 对话管理器
  const conversationManager: ConversationManager = {
    conversationId: undefined,
    // 缓存上下文
    messages: [],
    reset() {
      this.conversationId = undefined;
      this.messages = [];
    },
    addMessage(role: string, content: string, type?: string) {
      this.messages.push({ role, content, type });
    },
    getHistory() {
      return [...this.messages];
    }
  };

  // 主要的聊天函数
  const chat = async (query: string, events?: LifecycleEvents): Promise<ChatResult> => {
    // 初始化返回结果
    const result: ChatResult = {
      success: false,
      message: '',
      conversationId: conversationManager.conversationId,
    };

    try {
      // 添加用户消息到历史记录
      conversationManager.addMessage('user', query);

      const stream = client.chat.stream({
        bot_id: COZE_BOT_ID,
        // 默认带上上次对话的会话ID
        conversation_id: conversationManager.conversationId,
        auto_save_history: autoSaveHistory,
        additional_messages: [
          {
            role: RoleType.User,
            content: query,
            content_type: 'text',
          },
        ],
      });

      let assistantMessage = '';

      for await (const part of stream) {
        switch (part.event) {
          case ChatEventType.CONVERSATION_CHAT_CREATED:
            // 首次链接后，保存当前的会话 ID
            conversationManager.conversationId = part.data.conversation_id;
            result.conversationId = part.data.conversation_id;
            events?.onStart?.(part.data);
            break;

          case ChatEventType.CONVERSATION_MESSAGE_DELTA:
            const content = part.data.content || '';
            assistantMessage += content;
            // process.stdout.write(part.data.content);
            events?.onMessage?.(content);
            break;

          case ChatEventType.CONVERSATION_MESSAGE_COMPLETED:
            const { role, type, content: fullContent } = part.data;
            if (role === 'assistant' && type === 'answer') {
              conversationManager.addMessage('assistant', fullContent, type);
              result.message = fullContent;
            }
            break;

          case ChatEventType.CONVERSATION_CHAT_COMPLETED:
            result.usage = part.data.usage;
            events?.onUsage?.(part.data.usage);
            break;

          case ChatEventType.DONE:
            result.completeData = part.data;
            result.success = true;
            events?.onComplete?.(part.data);
            break;

          case ChatEventType.ERROR:
            result.error = part.data;
            events?.onError?.(part.data);
            throw new Error(`Chat error: ${JSON.stringify(part.data)}`);
        }
      };

      return result;
    } catch (error) {
      result.success = false;
      result.error = error;
      events?.onError?.(error);
      return result;
    }
  };

  return {
    chat,
    conversation: conversationManager,
    reset: () => conversationManager.reset(),
    getHistory: () => conversationManager.getHistory()
  };
}

// 导出函数和类型
export { createCozeAgent };
export type { CozeAgent, CozeAgentConfig, LifecycleEvents, ChatResult, ConversationManager } from "./interface";