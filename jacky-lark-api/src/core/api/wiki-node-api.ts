/**
 * 知识空间节点基础 API
 * 对应飞书 wiki.v2.space 和 wiki.v2.spaceNode
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { BaseAPI } from './base-api.js';
import type { WikiNode, WikiNodeListResult, ObjType, CreateNodeParams, CopyNodeParams } from '../types/index.js';

export class WikiNodeAPI extends BaseAPI {
    /**
     * 获取节点信息
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/get_node
     */
    async getNode(nodeToken: string, objType: ObjType = 'wiki'): Promise<WikiNode | undefined> {
        const token = this.getUserAccessToken();
        const response = await this.client.wiki.v2.space.getNode(
            {
                params: {
                    token: nodeToken,
                    obj_type: objType,
                },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return response.data?.node as WikiNode;
        }
        throw new Error(`获取节点信息失败: ${response.code} ${response.msg}`);
    }

    /**
     * 创建节点
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/create
     */
    async createNode(spaceId: string, params: CreateNodeParams): Promise<WikiNode | undefined> {
        // 验证参数
        if (params.node_type === 'shortcut' && !params.origin_node_token) {
            throw new Error('创建快捷方式时必须提供 origin_node_token');
        }

        const token = this.getUserAccessToken();
        const response = await this.client.wiki.v2.spaceNode.create(
            {
                path: { space_id: spaceId },
                data: {
                    obj_type: params.obj_type,
                    parent_node_token: params.parent_node_token,
                    node_type: params.node_type,
                    title: params.title || "",
                    origin_node_token: params.origin_node_token,
                },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return response.data?.node as WikiNode;
        }
        throw new Error(`创建节点失败: ${response.code} ${response.msg}`);
    }

    /**
     * 更新知识空间节点标题
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/update_title
     */
    async updateNodeTitle(spaceId: string, nodeToken: string, title: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.wiki.v2.spaceNode.updateTitle(
                {
                    path: {
                        space_id: spaceId,
                        node_token: nodeToken,
                    },
                    data: { title },
                },
                lark.withUserAccessToken(token)
            );
            if (response.code === 0) {
                return { code: 0, data: response.data };
            }
            return response;
        });
    }

    /**
     * 创建知识空间节点副本
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/copy
     */
    async copyNode(
        spaceId: string,
        nodeToken: string,
        params: CopyNodeParams
    ): Promise<WikiNode | undefined> {
        const token = this.getUserAccessToken();
        const response = await this.client.wiki.v2.spaceNode.copy(
            {
                path: {
                    space_id: spaceId,
                    node_token: nodeToken,
                },
                data: {
                    target_parent_token: params.target_parent_token,
                    target_space_id: params.target_space_id,
                    title: params.title || "",
                },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return response.data?.node as WikiNode;
        }
        throw new Error(`复制节点失败: ${response.code} ${response.msg}`);
    }

    /**
     * 移动知识空间节点
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/move
     */
    async moveNode(
        spaceId: string,
        nodeToken: string,
        targetParentToken: string,
        targetSpaceId?: string
    ): Promise<WikiNode | undefined> {
        const token = this.getUserAccessToken();
        const response = await this.client.wiki.v2.spaceNode.move(
            {
                path: {
                    space_id: spaceId,
                    node_token: nodeToken,
                },
                data: {
                    target_parent_token: targetParentToken,
                    target_space_id: targetSpaceId,
                },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return response.data?.node as WikiNode;
        }
        throw new Error(`移动节点失败: ${response.code} ${response.msg}`);
    }

    /**
     * 获取知识空间子节点列表
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/list
     */
    async listChildNodes(
        spaceId: string,
        parentNodeToken: string,
        pageToken?: string
    ): Promise<WikiNodeListResult> {
        const params: any = {
            parent_node_token: parentNodeToken,
        };
        if (pageToken) {
            params.page_token = pageToken;
        }

        return this.withUserToken(async (token) => {
            const response = await this.client.wiki.v2.spaceNode.list(
                {
                    path: { space_id: spaceId },
                    params,
                },
                lark.withUserAccessToken(token)
            );
            if (response.code === 0) {
                return {
                    code: 0,
                    data: {
                        items: response.data?.items,
                        page_token: response.data?.page_token,
                        has_more: response.data?.has_more,
                    },
                };
            }
            return response;
        });
    }

    /**
     * 获取所有子节点（自动处理分页）
     */
    async listAllChildNodes(spaceId: string, parentNodeToken: string): Promise<WikiNode[]> {
        const allNodes: WikiNode[] = [];
        const token = this.getUserAccessToken();

        // 使用官方 SDK 的迭代器自动处理分页
        for await (const item of await this.client.wiki.v2.spaceNode.listWithIterator(
            {
                path: { space_id: spaceId },
                params: { parent_node_token: parentNodeToken },
            },
            lark.withUserAccessToken(token)
        )) {
            allNodes.push(item as any);
        }

        return allNodes;
    }
}

