/**
 * Service 层类型定义
 */

import type { WikiNode } from './api-types.js';

/**
 * 带子节点的树形节点结构
 */
export interface WikiNodeTree extends WikiNode {
    children?: WikiNodeTree[];
}

/**
 * 节点路径信息
 */
export interface NodePath {
    nodes: WikiNode[];
    path: string; // 用 / 分隔的路径
}

/**
 * 批量创建节点配置
 */
export interface NodeConfig {
    title: string;
    obj_type: 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides';
    parent_node_token: string;
}

/**
 * 批量更新节点配置
 */
export interface NodeUpdate {
    space_id: string;
    node_token: string;
    title: string;
}

/**
 * 文档内容统一格式
 */
export interface DocumentContent {
    type: string;
    token: string;
    title?: string;
    content: string | object;
}

/**
 * 文档统计信息
 */
export interface DocumentStatistics {
    wordCount?: number;
    paragraphCount?: number;
    imageCount?: number;
    linkCount?: number;
}

/**
 * 空间统计信息
 */
export interface SpaceStatistics {
    totalNodes: number;
    nodesByType: Record<string, number>;
    maxDepth: number;
}

