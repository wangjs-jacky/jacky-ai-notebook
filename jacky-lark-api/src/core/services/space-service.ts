/**
 * 知识空间级别服务
 * 处理整个空间的操作
 */
import { WikiNodeAPI, WikiSearchAPI } from '../api/index.js';
import { WikiNodeService } from './wiki-node-service.js';
import type { WikiNode, WikiNodeTree, SpaceStatistics } from '../types/index.js';

export class SpaceService {
    constructor(
        private wikiNodeAPI: WikiNodeAPI,
        private wikiSearchAPI: WikiSearchAPI,
        private wikiNodeService: WikiNodeService
    ) {}

    /**
     * 获取空间中的所有节点
     * @param spaceId 知识空间 ID
     * @param rootNodeToken 根节点 token
     */
    async getAllNodes(spaceId: string, rootNodeToken: string): Promise<WikiNodeTree[]> {
        return this.wikiNodeService.getAllDescendants(rootNodeToken, 999);
    }

    /**
     * 在空间中搜索
     * @param spaceId 知识空间 ID
     * @param query 搜索关键词
     */
    async searchInSpace(spaceId: string, query: string): Promise<any> {
        return this.wikiSearchAPI.searchNodes(spaceId, query);
    }

    /**
     * 获取空间统计信息
     * @param spaceId 知识空间 ID
     * @param rootNodeToken 根节点 token
     */
    async getSpaceStatistics(spaceId: string, rootNodeToken: string): Promise<SpaceStatistics> {
        const nodes = await this.getAllNodes(spaceId, rootNodeToken);

        // 统计节点总数
        let totalNodes = 0;
        const nodesByType: Record<string, number> = {};
        let maxDepth = 0;

        const countNodes = (nodeList: WikiNodeTree[], depth: number = 0) => {
            maxDepth = Math.max(maxDepth, depth);

            for (const node of nodeList) {
                totalNodes++;

                // 统计类型
                const type = node.obj_type || 'unknown';
                nodesByType[type] = (nodesByType[type] || 0) + 1;

                // 递归统计子节点
                if (node.children) {
                    countNodes(node.children, depth + 1);
                }
            }
        };

        countNodes(nodes);

        return {
            totalNodes,
            nodesByType,
            maxDepth,
        };
    }

    /**
     * 获取空间结构
     * @param spaceId 知识空间 ID
     * @param rootNodeToken 根节点 token
     */
    async getSpaceStructure(spaceId: string, rootNodeToken: string): Promise<WikiNodeTree[]> {
        return this.getAllNodes(spaceId, rootNodeToken);
    }

    /**
     * 导出空间
     * @param spaceId 知识空间 ID
     * @param rootNodeToken 根节点 token
     * @param format 导出格式
     */
    async exportSpace(
        spaceId: string,
        rootNodeToken: string,
        format: 'json' | 'markdown'
    ): Promise<string> {
        const nodes = await this.getAllNodes(spaceId, rootNodeToken);

        if (format === 'json') {
            return JSON.stringify(nodes, null, 2);
        }

        // Markdown 格式
        const toMarkdown = (nodeList: WikiNodeTree[], level: number = 0): string => {
            let md = '';
            for (const node of nodeList) {
                const indent = '  '.repeat(level);
                md += `${indent}- ${node.title} (${node.obj_type})\n`;
                if (node.children) {
                    md += toMarkdown(node.children, level + 1);
                }
            }
            return md;
        };

        return toMarkdown(nodes);
    }
}

