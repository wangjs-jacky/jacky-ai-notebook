/**
 * 新版文档 API
 * 对应飞书 docx.v1
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { BaseAPI } from './base-api.js';
import type { DocBlock } from '../types/index.js';

export class DocxAPI extends BaseAPI {
    /**
     * 获取文档纯文本内容
     * @doc https://open.larkenterprise.com/document/server-docs/docs/docs/docx-v1/document/raw_content
     */
    async getRawContent(document_id: string, lang: 0 | 1 | 2 = 0): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.docx.v1.document.rawContent(
                {
                    path: { document_id },
                    params: { lang },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }
    /**
     * 获取文档基本信息
     * @doc https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/preparation-before-development
     */
    async listBlocks(docToken: string, pageSize: number = 500, pageToken?: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const params: any = {
                document_revision_id: -1, // -1 表示获取最新版本
                page_size: pageSize,
            };
            if (pageToken) {
                params.page_token = pageToken;
            }

            const response = await this.client.docx.v1.documentBlock.list(
                {
                    path: { document_id: docToken },
                    params,
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 获取文档块详情
     * @doc https://open.larkenterprise.com/document/server-docs/docs/docs/docx-v1/document-block/get
     */
    async getBlock(docToken: string, blockId: string): Promise<DocBlock | undefined> {
        const token = this.getUserAccessToken();
        const response = await this.client.docx.v1.documentBlock.get(
            {
                path: {
                    document_id: docToken,
                    block_id: blockId,
                },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return response.data?.block as DocBlock;
        }
        throw new Error(`获取文档块失败: ${response.code} ${response.msg}`);
    }

    /**
     * 创建文档块
     * 注意：当前 SDK 版本可能不支持此方法
     */
    async createBlock(docToken: string, blockId: string, children: any[], index?: number): Promise<any> {
        console.warn('createBlock 方法在当前 SDK 版本中可能不可用');
        return Promise.resolve({ code: -1, msg: 'Method not available in current SDK version' });
    }
}

