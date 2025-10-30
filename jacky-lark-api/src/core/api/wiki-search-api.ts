/**
 * Wiki 搜索 API
 * 对应飞书 wiki.v1.node.search
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { BaseAPI } from './base-api.js';

export class WikiSearchAPI extends BaseAPI {
    /**
     * 搜索知识空间节点
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/search
     */
    async searchNodes(spaceId: string, query: string, pageSize: number = 20, pageToken?: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const params: any = {
                page_size: pageSize,
            };
            if (pageToken) {
                params.page_token = pageToken;
            }

            const response = await this.client.wiki.v1.node.search(
                {
                    data: {
                        query,
                        space_id: spaceId,
                    },
                    params,
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }
}

