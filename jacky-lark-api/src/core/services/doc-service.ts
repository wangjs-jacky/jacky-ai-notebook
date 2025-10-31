/**
 * 文档内容服务
 * 提供跨文档类型的统一操作
 */
import { getTokenOnly } from '../../utils/token-extractor.js';
import { DocxAPI, SheetAPI, BitableAPI } from '../api/index.js';
import type { ObjType, DocumentContent, DocumentStatistics, CreateDocParams } from '../types/index.js';

export class DocService {
    constructor(
        private docxAPI: DocxAPI,
        private sheetAPI: SheetAPI,
        private bitableAPI: BitableAPI
    ) { }

    async getRawContentByUrl(url: string): Promise<string> {
        const { token: document_id } = getTokenOnly(url);
        return this.docxAPI.getRawContent(document_id);
    }

    async listBlocksByUrl(url: string, pageSize: number = 500, pageToken?: string): Promise<string> {
        const { token: document_id } = getTokenOnly(url);
        return this.docxAPI.listBlocks(document_id, pageSize, pageToken);
    }

    /**
     * 统一获取内容接口（根据类型自动选择 API）
     * @param objType 文档类型
     * @param token 文档 token
     */
    async getContent(objType: ObjType, token: string): Promise<DocumentContent> {
        let content: any;
        let title: string | undefined;

        switch (objType) {
            case 'docx':
                const docxContent = await this.docxAPI.getRawContent(token);
                content = docxContent.data?.content || '';
                break;

            case 'sheet':
                const sheetContent = await this.sheetAPI.getSpreadsheet(token);
                content = sheetContent.data;
                title = sheetContent.data?.properties?.title;
                break;

            case 'bitable':
                const tables = await this.bitableAPI.listTables(token);
                content = tables;
                break;

            default:
                throw new Error(`不支持的文档类型: ${objType}`);
        }

        return {
            type: objType,
            token,
            title,
            content,
        };
    }

    /**
     * 获取纯文本内容
     * @param objType 文档类型
     * @param token 文档 token
     */
    async getRawText(objType: ObjType, token: string): Promise<string> {
        const content = await this.getContent(objType, token);

        if (objType === 'docx' && typeof content.content === 'string') {
            return content.content;
        }

        // 对于其他类型，转换为 JSON 字符串
        return JSON.stringify(content.content, null, 2);
    }

    /**
     * 导出为 Markdown 格式
     * @param docToken 文档 token
     */
    async exportToMarkdown(docToken: string): Promise<string> {
        const rawContent = await this.docxAPI.getRawContent(docToken);
        const text = rawContent.data?.content || '';

        // 简单的纯文本转 Markdown（可以根据需要增强）
        return text;
    }

    /**
     * 导出为 JSON 格式
     * @param objType 文档类型
     * @param token 文档 token
     */
    async exportToJSON(objType: ObjType, token: string): Promise<string> {
        const content = await this.getContent(objType, token);
        return JSON.stringify(content, null, 2);
    }

    /**
     * 提取文档中的链接
     * @param docToken 文档 token
     */
    async extractLinks(docToken: string): Promise<string[]> {
        const blocks = await this.docxAPI.listBlocks(docToken);
        const links: string[] = [];

        // 从块中提取链接（需要根据实际块结构调整）
        if (blocks.data?.items) {
            for (const block of blocks.data.items) {
                // 这里需要根据实际的块结构来提取链接
                // 示例：提取文本块中的链接
                if (block.text_elements) {
                    for (const element of block.text_elements) {
                        if (element.link) {
                            links.push(element.link.url);
                        }
                    }
                }
            }
        }

        return [...new Set(links)]; // 去重
    }

    /**
     * 获取文档统计信息
     * @param docToken 文档 token
     */
    async getDocStatistics(docToken: string): Promise<DocumentStatistics> {
        const rawContent = await this.docxAPI.getRawContent(docToken);
        const text = rawContent.data?.content || '';

        // 简单的统计（可以根据需要增强）
        const wordCount = text.length; // 字符数
        const paragraphCount = text.split('\n').filter(line => line.trim()).length;

        const blocks = await this.docxAPI.listBlocks(docToken);
        let imageCount = 0;
        let linkCount = 0;

        if (blocks.data?.items) {
            for (const block of blocks.data.items) {
                // 统计图片
                if (block.block_type === 27) { // 27 表示图片块
                    imageCount++;
                }
                // 统计链接
                if (block.text_elements) {
                    for (const element of block.text_elements) {
                        if (element.link) {
                            linkCount++;
                        }
                    }
                }
            }
        }

        return {
            wordCount,
            paragraphCount,
            imageCount,
            linkCount,
        };
    }
}

