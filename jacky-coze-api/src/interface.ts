import { CreateChatData } from "@coze/api";

// 生命周期事件类型定义
export interface LifecycleEvents {
  onStart?: (data: CreateChatData) => void;
  onMessage?: (content: string) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
  onUsage?: (usage: any) => void;
}

// Chat 返回结果类型定义
export interface ChatResult {
  success: boolean;
  message: string;
  error?: any;
  usage?: any;
  conversationId?: string;
  completeData?: any;
}

// 配置选项接口
export interface CozeAgentConfig {
  COZE_API_KEY: string;
  COZE_BOT_ID: string;
  debug?: boolean;
  autoSaveHistory?: boolean;
  baseURL?: string;
}

// 对话管理接口
export interface ConversationManager {
  conversationId?: string;
  messages: Array<{
    role: string;
    content: string;
    type?: string;
  }>;
  reset: () => void;
  addMessage: (role: string, content: string, type?: string) => void;
  getHistory: () => Array<{ role: string; content: string; type?: string }>;
}

// 返回的 Agent 接口
export interface CozeAgent {
  chat: (query: string, events?: LifecycleEvents) => Promise<ChatResult>;
  conversation: ConversationManager;
  reset: () => void;
  getHistory: () => Array<{ role: string; content: string; type?: string }>;
}

