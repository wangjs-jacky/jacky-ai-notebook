/**
 * 知识空间节点高级服务
 * 提供基于底层 API 的组合能力
 */
import { WikiNodeAPI, DocxAPI, SheetAPI, BitableAPI } from '../api/index.js';
import { getTokenOnly } from '../../utils/index.js';
import type {
    WikiNode,
    WikiNodeTree,
    NodeConfig,
    NodeUpdate,
    NodePath,
    CreateNodeParams,
} from '../types/index.js';

export class WikiNodeService {
    constructor(
        private wikiNodeAPI: WikiNodeAPI,
        private docxAPI: DocxAPI,
        private sheetAPI: SheetAPI,
        private bitableAPI: BitableAPI
    ) { }

    /**
     * 基于 URL 获取节点信息
     * @param url 知识空间节点 URL
     */
    async getNodeByUrl(url: string): Promise<WikiNode | undefined> {
        const { token: nodeToken, objType } = getTokenOnly(url);
        return this.wikiNodeAPI.getNode(nodeToken, objType || 'wiki');
    }

    /**
     * 基于 URL 更新节点标题
     * @param url 知识空间节点 URL
     * @param title 新标题
     */
    async updateNodeByUrl(url: string, title: string): Promise<any> {
        const { token: nodeToken } = getTokenOnly(url);
        const node = await this.getNodeByUrl(url);
        if (!node?.space_id) {
            throw new Error('无法获取节点的 space_id');
        }
        return this.wikiNodeAPI.updateNodeTitle(node.space_id, nodeToken, title);
    }

    async createNodeByUrl(url: string, params: Partial<CreateNodeParams>) {
        const node = await this.getNodeByUrl(url);
        if (!node?.space_id) {
            throw new Error('无法获取节点的 space_id');
        }
        return this.wikiNodeAPI.createNode(node.space_id, {
            obj_type: params?.obj_type || "docx",
            parent_node_token: node.node_token,
            node_type: params?.node_type || "origin",
            title: params?.title || "",
            origin_node_token: params.origin_node_token,
        });

    }

    /**
     * 获取节点树（递归获取所有子节点）
     * @param nodeToken 节点标识
     * @param maxDepth 最大递归深度
     */
    async getNodeTree(nodeToken: string, maxDepth: number = 10): Promise<WikiNodeTree | undefined> {
        const node = await this.wikiNodeAPI.getNode(nodeToken, 'wiki');
        if (!node) {
            return undefined;
        }

        const tree: WikiNodeTree = { ...node };

        // 如果有子节点且未达到最大深度，递归获取
        if (node.has_child && node.space_id && maxDepth > 0) {
            tree.children = await this.getDescendants(
                node.space_id,
                nodeToken,
                maxDepth - 1
            );
        }

        return tree;
    }

    /**
     * 获取所有后代节点
     * @param nodeToken 节点标识
     * @param maxDepth 最大递归深度
     */
    async getAllDescendants(nodeToken: string, maxDepth: number = 10): Promise<WikiNodeTree[]> {
        const node = await this.wikiNodeAPI.getNode(nodeToken, 'wiki');
        if (!node?.space_id) {
            throw new Error('无法获取节点的 space_id');
        }

        return this.getDescendants(node.space_id, nodeToken, maxDepth);
    }

    /**
     * 递归获取后代节点（内部方法）
     */
    private async getDescendants(
        spaceId: string,
        parentNodeToken: string,
        maxDepth: number
    ): Promise<WikiNodeTree[]> {
        if (maxDepth < 0) {
            console.warn(`达到最大递归深度，停止递归`);
            return [];
        }

        const nodes = await this.wikiNodeAPI.listAllChildNodes(spaceId, parentNodeToken);
        const trees: WikiNodeTree[] = [];

        for (const node of nodes) {
            const tree: WikiNodeTree = { ...node };

            // 如果有子节点，递归获取
            if (node.has_child) {
                try {
                    tree.children = await this.getDescendants(
                        spaceId,
                        node.node_token!,
                        maxDepth - 1
                    );
                } catch (error) {
                    console.error(`获取子节点失败 (${node.title}):`, error);
                    tree.children = [];
                }
            }

            trees.push(tree);
        }

        return trees;
    }

    /**
     * 批量创建节点
     * @param spaceId 知识空间 ID
     * @param nodes 节点配置列表
     */
    async batchCreateNodes(spaceId: string, nodes: NodeConfig[]): Promise<(WikiNode | undefined)[]> {
        const results: (WikiNode | undefined)[] = [];

        for (const nodeConfig of nodes) {
            try {
                const node = await this.wikiNodeAPI.createNode(spaceId, {
                    obj_type: nodeConfig.obj_type,
                    parent_node_token: nodeConfig.parent_node_token,
                    node_type: 'origin',
                    title: nodeConfig.title,
                });
                results.push(node);
            } catch (error) {
                console.error(`创建节点失败 (${nodeConfig.title}):`, error);
                results.push(undefined);
            }
        }

        return results;
    }

    /**
     * 批量更新节点标题
     * @param updates 更新配置列表
     */
    async batchUpdateNodes(updates: NodeUpdate[]): Promise<any[]> {
        const results: any[] = [];

        for (const update of updates) {
            try {
                const result = await this.wikiNodeAPI.updateNodeTitle(
                    update.space_id,
                    update.node_token,
                    update.title
                );
                results.push(result);
            } catch (error) {
                console.error(`更新节点失败 (${update.node_token}):`, error);
                results.push({ error: error instanceof Error ? error.message : String(error) });
            }
        }

        return results;
    }

    /**
     * 在知识空间中查找指定标题的节点
     * @param spaceId 知识空间 ID
     * @param title 节点标题
     * @param rootNodeToken 搜索起始节点（可选）
     */
    async findNodesByTitle(
        spaceId: string,
        title: string,
        rootNodeToken?: string
    ): Promise<WikiNode[]> {
        const matchedNodes: WikiNode[] = [];

        const searchInNodes = async (parentToken: string) => {
            const nodes = await this.wikiNodeAPI.listAllChildNodes(spaceId, parentToken);

            for (const node of nodes) {
                if (node.title === title) {
                    matchedNodes.push(node);
                }

                // 递归搜索子节点
                if (node.has_child && node.node_token) {
                    await searchInNodes(node.node_token);
                }
            }
        };

        if (rootNodeToken) {
            await searchInNodes(rootNodeToken);
        }

        return matchedNodes;
    }

    /**
     * 获取节点路径（从根到当前节点）
     * @param nodeToken 节点标识
     */
    async getNodePath(nodeToken: string): Promise<NodePath> {
        const nodes: WikiNode[] = [];
        let currentToken = nodeToken;

        // 向上遍历直到根节点
        while (currentToken) {
            const node = await this.wikiNodeAPI.getNode(currentToken, 'wiki');
            if (!node) {
                break;
            }

            nodes.unshift(node); // 添加到数组开头

            // 如果没有父节点，说明到达根节点
            if (!node.parent_node_token) {
                break;
            }

            currentToken = node.parent_node_token;
        }

        // 构建路径字符串
        const path = nodes.map(n => n.title || '').join(' / ');

        return { nodes, path };
    }

    async insertMarkdownToFeishuDoc(
        url: string,
        markdown: string,
        options: {
            mode?: 'create' | 'append';
            title?: string;
        } = {}
    ): Promise<any> {
        const { mode = 'create', title } = options;

        if (mode === 'create') {
            const targetNode = await this.getNodeByUrl(url);
            if (!targetNode?.space_id) {
                throw new Error('无法获取目标文档节点信息');
            }

            const newDocTitle = title || `新文档 ${new Date().toLocaleString('zh-CN')}`;
            const newNode = await this.createNodeByUrl(url, {
                title: newDocTitle,
                obj_type: 'docx',
                node_type: 'origin',
            });

            if (!newNode?.obj_token) {
                throw new Error('创建文档节点失败：未返回 obj_token');
            }

            await this.addMarkdownContent(newNode.obj_token, markdown);

            return {
                success: true,
                mode: 'create',
                node: newNode,
                nodeToken: newNode.node_token,
                docToken: newNode.obj_token,
                url: `https://trip.larkenterprise.com/wiki/${newNode.node_token}`,
            };
        } else {
            const targetNode = await this.getNodeByUrl(url);
            if (!targetNode?.obj_token) {
                throw new Error('无法获取目标文档的 obj_token');
            }

            const result = await this.addMarkdownContent(
                targetNode.obj_token,
                markdown
            );

            return {
                success: true,
                mode: 'append',
                node: targetNode,
                nodeToken: targetNode.node_token,
                docToken: targetNode.obj_token,
                url: `https://trip.larkenterprise.com/wiki/${targetNode.node_token}`,
                result: result,
            };
        }
    }

    private async addMarkdownContent(docToken: string, markdown: string): Promise<any> {
        const blocks = await this.docxAPI.convertMarkdown(markdown);

        if (!blocks?.blocks || blocks.blocks.length === 0) {
            throw new Error('Markdown 转换失败：未生成任何块');
        }

        if (!blocks?.first_level_block_ids || blocks.first_level_block_ids.length === 0) {
            throw new Error('Markdown 转换失败：未生成第一级块');
        }

        const cleanedBlocks = blocks.blocks.map((block: any) => {
            const cleanBlock = { ...block };
            if (cleanBlock.table?.property?.merge_info) {
                delete cleanBlock.table.property.merge_info;
            }
            return cleanBlock;
        });

        const result = await this.docxAPI.createBlockDescendant({
            document_id: docToken,
            block_id: docToken,
            children_id: blocks.first_level_block_ids,
            descendants: cleanedBlocks,
            index: 0,
        });

        return result;
    }
}

