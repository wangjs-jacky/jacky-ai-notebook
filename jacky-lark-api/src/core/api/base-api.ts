/**
 * 基础 API 类
 * 提供通用的认证、错误处理等功能
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { authStore } from '../auth-store.js';

export abstract class BaseAPI {
    constructor(protected client: lark.Client) {}

    /**
     * 获取用户访问令牌
     */
    protected getUserAccessToken(): string {
        const token = authStore.getAuthInfo()?.token;
        if (!token) {
            throw new Error('用户访问令牌不存在，请先完成登录');
        }
        return token;
    }

    /**
     * 处理飞书 API 响应
     * @param response 飞书 API 响应
     * @param errorMessage 错误提示信息
     */
    protected handleResponse<T>(
        response: { code?: number; msg?: string; data?: T },
        errorMessage: string
    ): T {
        if (response.code === 0) {
            return response.data as T;
        }
        throw new Error(`${errorMessage}: ${response.code} ${response.msg}`);
    }

    /**
     * 使用用户令牌执行 API 调用
     * @param apiCall API 调用函数
     */
    protected async withUserToken<T>(
        apiCall: (token: string) => Promise<{ code?: number; msg?: string; data?: T }>
    ): Promise<T> {
        const token = this.getUserAccessToken();
        const response = await apiCall(token);
        return this.handleResponse(response, 'API 调用失败');
    }
}

