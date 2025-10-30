/**
 * 飞书开放平台 API 类型定义
 */

// OAuth2.0 授权相关类型
export interface LarkOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  port?: number;
  timeout?: number; // 监听 callback 最长的超时时间
  scope?: string;
}

// 授权码响应
export interface AuthorizationCodeResponse {
  code: string;
  state?: string;
}

// 访问令牌请求参数
export interface AccessTokenRequest {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
}

// 访问令牌响应
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// 用户信息响应
export interface UserInfoResponse {
  sub: string;
  name: string;
  picture: string;
  open_id: string;
  union_id: string;
  email?: string;
  user_id?: string;
}

// API 错误响应
export interface LarkApiError {
  code: number;
  msg: string;
  data?: any;
}

// 飞书 API 客户端配置
export interface LarkApiClientConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  baseUrl?: string;
}

// HTTP 请求选项
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

// ==================== 飞书知识库相关类型 ====================

// 文档对象类型
export type WikiObjType = 'doc' | 'docx' | 'sheet' | 'mindnote' | 'bitable' | 'file' | 'slides' | 'wiki';

// 知识空间节点信息
export interface WikiSpaceNode {
  space_id: string;
  node_token: string;
  obj_token: string;
  obj_type: WikiObjType;
  parent_node_token?: string;
  node_type: string;
  origin_node_token?: string;
  origin_space_id?: string;
  has_child?: boolean;
  title?: string;
  obj_create_time?: string;
  obj_edit_time?: string;
  node_create_time?: string;
}

// 获取节点信息的响应
export interface GetNodeResponse {
  node: WikiSpaceNode;
}

// 子节点项
export interface WikiSpaceNodeItem {
  space_id: string;
  node_token: string;
  obj_token: string;
  obj_type: WikiObjType;
  parent_node_token: string;
  node_type: string;
  origin_node_token?: string;
  origin_space_id?: string;
  has_child: boolean;
  title: string;
  obj_create_time?: string;
  obj_edit_time?: string;
  node_create_time?: string;
}

// 获取子节点列表的响应
export interface ListSpaceNodesResponse {
  has_more: boolean;
  page_token?: string;
  items: WikiSpaceNodeItem[];
}

// 文档块信息（docx）
export interface DocBlock {
  block_id: string;
  parent_id: string;
  children: string[];
  block_type: string;
  block: any;
}

// 获取文档块的响应
export interface GetDocBlocksResponse {
  blocks: Record<string, DocBlock>;
  page_token?: string;
  has_more: boolean;
}

// 获取文档纯文本内容的响应
export interface GetDocRawContentResponse {
  content: string;
}

// 电子表格单元格值
export interface SheetValue {
  values: any[][];
}

// 电子表格范围
export interface SheetRange {
  range: string;
  values: any[][];
}

// 获取电子表格内容的响应
export interface GetSheetValuesResponse {
  valueRanges: SheetRange[];
}

// 多维表格记录
export interface BitableRecord {
  record_id: string;
  fields: Record<string, any>;
  created_time?: number;
  created_by?: any;
  last_modified_time?: number;
  last_modified_by?: any;
}

// 获取多维表格记录的响应
export interface ListBitableRecordsResponse {
  has_more: boolean;
  page_token?: string;
  total: number;
  items: BitableRecord[];
}

// 文档内容（统一格式）
export interface DocumentContent {
  node_token: string;
  obj_token: string;
  obj_type: WikiObjType;
  title: string;
  content: any;
  raw_content?: string;
  children?: DocumentContent[];
}

// 飞书文档客户端配置
export interface LarkDocClientConfig {
  appId: string;
  appSecret: string;
  baseUrl?: string;
}
