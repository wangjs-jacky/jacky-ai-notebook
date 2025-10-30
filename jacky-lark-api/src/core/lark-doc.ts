/**
 * 飞书知识库文档操作类（三层架构 Facade 门面层）
 * 基于飞书官方 Node SDK 封装
 * 
 * 架构说明：
 * - API Layer: 底层 API 封装，一对一映射飞书 SDK
 * - Service Layer: 服务层，组合多个 API 实现业务逻辑
 * - Facade Layer: 门面层，统一对外接口
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { authStore } from './auth-store.js';

// API 层
import {
    WikiNodeAPI,
    DocxAPI,
    SheetAPI,
    BitableAPI,
    WikiSearchAPI,
} from './api/index.js';

// Service 层
import {
    WikiNodeService,
    DocService,
    SpaceService,
} from './services/index.js';

// 类型定义
import type {
    ObjType,
    WikiNode,
    WikiNodeTree,
    NodeConfig,
    NodeUpdate,
    DocumentContent,
    DocumentStatistics,
    SpaceStatistics,
} from './types/index.js';

export class LarkDoc {
    // ========== API 层实例 ==========
    private wikiNodeAPI: WikiNodeAPI;
    private docxAPI: DocxAPI;
    private sheetAPI: SheetAPI;
    private bitableAPI: BitableAPI;
    private wikiSearchAPI: WikiSearchAPI;

    // ========== Service 层实例 ==========
    wikiNodeService: WikiNodeService;
    private docService: DocService;
    private spaceService: SpaceService;

    constructor(private client: lark.Client) {
        // 初始化 API 层
        this.wikiNodeAPI = new WikiNodeAPI(client);
        // this.docxAPI = new DocxAPI(client);
        // this.sheetAPI = new SheetAPI(client);
        // this.bitableAPI = new BitableAPI(client);
        // this.wikiSearchAPI = new WikiSearchAPI(client);

        // 初始化 Service 层
        this.wikiNodeService = new WikiNodeService(
            this.wikiNodeAPI,
            this.docxAPI,
            this.sheetAPI,
            this.bitableAPI
        );
        // this.docService = new DocService(
        //     this.docxAPI,
        //     this.sheetAPI,
        //     this.bitableAPI
        // );
        // this.spaceService = new SpaceService(
        //     this.wikiNodeAPI,
        //     this.wikiSearchAPI,
        //     this.wikiNodeService
        // );
    }

    // ========================================
    // 新架构：分组访问（推荐使用）
    // ========================================

    /**
     * 节点相关操作
     */
    get nodes() {
        return {
            // ===== API 层方法（基础操作） =====
            /**
             * 获取节点信息
             */
            get: this.wikiNodeAPI.getNode.bind(this.wikiNodeAPI),
            
            /**
             * 创建节点
             */
            create: this.wikiNodeAPI.createNode.bind(this.wikiNodeAPI),
            
            /**
             * 更新节点标题
             */
            updateTitle: this.wikiNodeAPI.updateNodeTitle.bind(this.wikiNodeAPI),
            
            /**
             * 复制节点
             */
            copy: this.wikiNodeAPI.copyNode.bind(this.wikiNodeAPI),
            
            /**
             * 移动节点
             */
            move: this.wikiNodeAPI.moveNode.bind(this.wikiNodeAPI),
            
            /**
             * 获取子节点列表（支持分页）
             */
            listChildren: this.wikiNodeAPI.listChildNodes.bind(this.wikiNodeAPI),
            
            /**
             * 获取所有子节点（自动分页）
             */
            listAllChildren: this.wikiNodeAPI.listAllChildNodes.bind(this.wikiNodeAPI),

            // ===== Service 层方法（高级操作） =====
            /**
             * 基于 URL 获取节点
             */
            getByUrl: this.wikiNodeService.getNodeByUrl.bind(this.wikiNodeService),
            
            /**
             * 基于 URL 更新节点标题
             */
            updateByUrl: this.wikiNodeService.updateNodeByUrl.bind(this.wikiNodeService),
            
            /**
             * 获取节点树
             */
            getTree: this.wikiNodeService.getNodeTree.bind(this.wikiNodeService),
            
            /**
             * 获取所有后代节点
             */
            getAllDescendants: this.wikiNodeService.getAllDescendants.bind(this.wikiNodeService),
            
            /**
             * 批量创建节点
             */
            batchCreate: this.wikiNodeService.batchCreateNodes.bind(this.wikiNodeService),
            
            /**
             * 批量更新节点
             */
            batchUpdate: this.wikiNodeService.batchUpdateNodes.bind(this.wikiNodeService),
            
            /**
             * 查找节点
             */
            findByTitle: this.wikiNodeService.findNodesByTitle.bind(this.wikiNodeService),
            
            /**
             * 获取节点路径
             */
            getPath: this.wikiNodeService.getNodePath.bind(this.wikiNodeService),
        };
    }

    /**
     * 文档相关操作
     */
    // get docs() {
    //     return {
    //         // ===== API 层方法 =====
    //         /**
    //          * 获取文档纯文本内容
    //          */
    //         getRawContent: this.docxAPI.getRawContent.bind(this.docxAPI),
            
    //         /**
    //          * 获取文档所有块
    //          */
    //         listBlocks: this.docxAPI.listBlocks.bind(this.docxAPI),
            
    //         /**
    //          * 获取文档块详情
    //          */
    //         getBlock: this.docxAPI.getBlock.bind(this.docxAPI),
            
    //         /**
    //          * 创建文档块
    //          */
    //         createBlock: this.docxAPI.createBlock.bind(this.docxAPI),

    //         // ===== Service 层方法 =====
    //         /**
    //          * 统一获取内容
    //          */
    //         getContent: this.docService.getContent.bind(this.docService),
            
    //         /**
    //          * 获取纯文本
    //          */
    //         getRawText: this.docService.getRawText.bind(this.docService),
            
    //         /**
    //          * 导出为 Markdown
    //          */
    //         exportToMarkdown: this.docService.exportToMarkdown.bind(this.docService),
            
    //         /**
    //          * 导出为 JSON
    //          */
    //         exportToJSON: this.docService.exportToJSON.bind(this.docService),
            
    //         /**
    //          * 提取链接
    //          */
    //         extractLinks: this.docService.extractLinks.bind(this.docService),
            
    //         /**
    //          * 获取文档统计信息
    //          */
    //         getStatistics: this.docService.getDocStatistics.bind(this.docService),
    //     };
    // }

    /**
     * 电子表格相关操作
     */
    // get sheets() {
    //     return {
    //         /**
    //          * 获取电子表格信息
    //          */
    //         get: this.sheetAPI.getSpreadsheet.bind(this.sheetAPI),
            
    //         /**
    //          * 获取工作表列表
    //          */
    //         listSheets: this.sheetAPI.listSheets.bind(this.sheetAPI),
            
    //         /**
    //          * 获取范围内容
    //          */
    //         getRange: this.sheetAPI.getRange.bind(this.sheetAPI),
    //     };
    // }

    /**
     * 多维表格相关操作
     */
    // get bitable() {
    //     return {
    //         /**
    //          * 获取所有数据表
    //          */
    //         listTables: this.bitableAPI.listTables.bind(this.bitableAPI),
            
    //         /**
    //          * 获取表格信息
    //          */
    //         getTable: this.bitableAPI.getTable.bind(this.bitableAPI),
            
    //         /**
    //          * 获取记录列表
    //          */
    //         listRecords: this.bitableAPI.listRecords.bind(this.bitableAPI),
            
    //         /**
    //          * 创建记录
    //          */
    //         createRecord: this.bitableAPI.createRecord.bind(this.bitableAPI),
            
    //         /**
    //          * 更新记录
    //          */
    //         updateRecord: this.bitableAPI.updateRecord.bind(this.bitableAPI),
            
    //         /**
    //          * 删除记录
    //          */
    //         deleteRecord: this.bitableAPI.deleteRecord.bind(this.bitableAPI),
            
    //         /**
    //          * 获取字段列表
    //          */
    //         listFields: this.bitableAPI.listFields.bind(this.bitableAPI),
    //     };
    // }

    /**
     * 知识空间相关操作
     */
    // get space() {
    //     return {
    //         /**
    //          * 获取空间所有节点
    //          */
    //         getAllNodes: this.spaceService.getAllNodes.bind(this.spaceService),
            
    //         /**
    //          * 在空间中搜索
    //          */
    //         search: this.spaceService.searchInSpace.bind(this.spaceService),
            
    //         /**
    //          * 获取空间统计信息
    //          */
    //         getStatistics: this.spaceService.getSpaceStatistics.bind(this.spaceService),
            
    //         /**
    //          * 获取空间结构
    //          */
    //         getStructure: this.spaceService.getSpaceStructure.bind(this.spaceService),
            
    //         /**
    //          * 导出空间
    //          */
    //         export: this.spaceService.exportSpace.bind(this.spaceService),
    //     };
    // }

    // ========================================
    // 向后兼容：保留旧方法（标记为 deprecated）
    // ========================================

    /**
     * 获取知识空间节点信息
     * @deprecated 请使用 nodes.get() 代替
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/get_node
     */
    async getSpaceNode(nodeToken: string, objType: ObjType = 'wiki') {
        return this.wikiNodeAPI.getNode(nodeToken, objType);
    }

    /**
     * 基于 URL 获取节点信息
     * @deprecated 请使用 nodes.getByUrl() 代替
     */
    async getSpaceNodeByUrl(url: string) {
        return this.wikiNodeService.getNodeByUrl(url);
    }

    /**
     * 更新知识空间节点标题
     * @deprecated 请使用 nodes.updateTitle() 代替
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/update_title
     */
    async updateSpaceNodeTitle(spaceId: string, nodeToken: string, newTitle: string) {
        return this.wikiNodeAPI.updateNodeTitle(spaceId, nodeToken, newTitle);
    }

    /**
     * 创建知识空间节点副本
     * @deprecated 请使用 nodes.copy() 代替
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/copy
     */
    async copySpaceNode(
        spaceId: string,
        nodeToken: string,
        targetParentToken: string,
        targetSpaceId: string,
        title?: string
    ) {
        return this.wikiNodeAPI.copyNode(spaceId, nodeToken, {
            target_parent_token: targetParentToken,
            target_space_id: targetSpaceId,
            title,
        });
    }

    /**
     * 创建知识空间节点
     * @deprecated 请使用 nodes.create() 代替
     * @doc https://open.larkenterprise.com/document/server-docs/docs/wiki-v2/space-node/create
     */
    async createSpaceNode(
        spaceId: string,
        objType: Exclude<ObjType, 'wiki'>,
        parentNodeToken: string,
        nodeType: 'origin' | 'shortcut',
        title: string,
        originNodeToken?: string
    ) {
        return this.wikiNodeAPI.createNode(spaceId, {
            obj_type: objType,
            parent_node_token: parentNodeToken,
            node_type: nodeType,
            title,
            origin_node_token: originNodeToken,
        });
    }

    /**
     * 获取知识空间子节点列表
     * @deprecated 请使用 nodes.listChildren() 代替
     */
    async listSpaceNodes(spaceId: string, parentNodeToken: string, pageToken?: string) {
        return this.wikiNodeAPI.listChildNodes(spaceId, parentNodeToken, pageToken);
    }

    /**
     * 获取所有子节点（自动处理分页）
     * @deprecated 请使用 nodes.listAllChildren() 代替
     */
    async listAllSpaceNodes(spaceId: string, parentNodeToken: string) {
        return this.wikiNodeAPI.listAllChildNodes(spaceId, parentNodeToken);
    }

    /**
     * 获取文档纯文本内容（docx）
     * @deprecated 请使用 docs.getRawContent() 代替
     */
    async getDocxRawContent(docToken: string) {
        return this.docxAPI.getRawContent(docToken);
    }

    /**
     * 获取文档所有块（docx）
     * @deprecated 请使用 docs.listBlocks() 代替
     */
    async getDocxBlocks(docToken: string) {
        return this.docxAPI.listBlocks(docToken);
    }

    /**
     * 获取电子表格内容
     * @deprecated 请使用 sheets.get() 代替
     */
    async getSheetContent(spreadsheetToken: string) {
        return this.sheetAPI.getSpreadsheet(spreadsheetToken);
    }

    /**
     * 获取多维表格的所有数据表
     * @deprecated 请使用 bitable.listTables() 代替
     */
    async listBitableTables(appToken: string) {
        return this.bitableAPI.listTables(appToken);
    }

    /**
     * 获取多维表格记录
     * @deprecated 请使用 bitable.listRecords() 代替
     */
    async getBitableRecords(appToken: string, tableId: string) {
        return this.bitableAPI.listRecords(appToken, tableId);
    }

    /**
     * 递归获取所有文档
     * @deprecated 请使用 nodes.getTree() 或 space.getAllNodes() 代替
     */
    async getAllDocuments(nodeToken: string, maxDepth: number = 10) {
        return this.wikiNodeService.getAllDescendants(nodeToken, maxDepth);
    }
}

export default LarkDoc;
