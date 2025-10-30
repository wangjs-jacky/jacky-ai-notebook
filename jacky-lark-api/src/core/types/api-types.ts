/**
 * API 层类型定义
 */

export type ObjType = 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides' | 'wiki';
export type NodeType = 'origin' | 'shortcut';

/**
 * 知识空间节点信息
 */
export interface WikiNode {
    space_id?: string;
    node_token?: string;
    obj_token?: string;
    obj_type?: string;
    parent_node_token?: string;
    node_type?: string;
    origin_node_token?: string;
    origin_space_id?: string;
    has_child?: boolean;
    title?: string;
    obj_create_time?: string;
    obj_edit_time?: string;
    node_create_time?: string;
    creator?: string;
    owner?: string;
}

/**
 * 节点列表响应
 */
export interface WikiNodeListResult {
    items?: WikiNode[];
    page_token?: string;
    has_more?: boolean;
}

/**
 * 创建节点参数
 */
export interface CreateNodeParams {
    obj_type: Exclude<ObjType, 'wiki'>;
    parent_node_token: string;
    node_type: NodeType;
    title: string;
    origin_node_token?: string;
}

/**
 * 复制节点参数
 */
export interface CopyNodeParams {
    target_parent_token: string;
    target_space_id: string;
    title?: string;
}

/**
 * 文档块信息
 */
export interface DocBlock {
    block_id?: string;
    block_type?: number;
    parent_id?: string;
    children?: string[];
    text?: any;
    [key: string]: any;
}

/**
 * 多维表格相关类型
 */
export interface BitableTable {
    table_id?: string;
    name?: string;
    revision?: number;
}

export interface BitableRecord {
    record_id?: string;
    fields?: Record<string, any>;
    created_time?: number;
    last_modified_time?: number;
}

export interface BitableField {
    field_id?: string;
    field_name?: string;
    type?: number;
    property?: any;
    description?: any;
    is_primary?: boolean;
}

