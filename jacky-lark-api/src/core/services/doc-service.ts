/**
 * 文档内容服务
 * 提供跨文档类型的统一操作
 */
import * as fs from 'fs';
import * as path from 'path';
import { getTokenOnly } from '../../utils/token-extractor.js';
import { DocxAPI, SheetAPI, BitableAPI, DriveAPI } from '../api/index.js';
import type { ObjType, DocumentContent, DocumentStatistics, CreateDocParams } from '../types/index.js';

// 块相关类型定义
interface Block {
    block_id: string;
    block_type: number;
    parent_id: string;
    children?: string[];
    // 文本块
    text?: {
        elements: Array<{
            text_run?: {
                content: string;
                text_element_style?: {
                    bold?: boolean;
                    italic?: boolean;
                    inline_code?: boolean;
                    strikethrough?: boolean;
                    underline?: boolean;
                    background_color?: number;
                };
            };
        }>;
    };
    // 标题
    heading1?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    heading2?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    heading3?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    heading4?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    heading5?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    heading6?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    // 列表
    bullet?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }> };
    ordered?: { elements: Array<{ text_run?: { content: string; text_element_style?: any } }>; style?: { sequence?: string } };
    // 代码块
    code?: { elements: Array<{ text_run?: { content: string } }>; style?: { language?: number } };
    // 图片
    image?: { token: string; width?: number; height?: number; align?: number };
    // 文件/视频
    file?: { name: string; token: string };
    view?: { view_type: number };
    // 引用容器
    quote_container?: {};
    // 标注
    callout?: { emoji_id?: string; background_color?: number; border_color?: number };
    // 页面
    page?: { elements: Array<{ text_run?: { content: string } }> };
}

interface BlockData {
    has_more: boolean;
    items: Block[];
}

// 图片下载和路径映射
interface ImagePathMap {
    [token: string]: string; // token -> relativePath
}

export class DocService {
    constructor(
        private docxAPI: DocxAPI,
        private sheetAPI: SheetAPI,
        private bitableAPI: BitableAPI,
        private driveAPI?: DriveAPI
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
     * 导出为 Markdown 格式（基于块结构）
     * @param docToken 文档 token
     * @param options 导出选项
     * @param options.downloadImages 是否下载图片（需要提供 imagesDir）
     * @param options.imagesDir 图片保存目录（如果 downloadImages 为 true）
     * @param options.markdownDir  Markdown 文件所在目录（用于计算图片相对路径）
     */
    async exportToMarkdown(
        docToken: string,
        options?: {
            downloadImages?: boolean;
            imagesDir?: string;
            markdownDir?: string;
        }
    ): Promise<string> {
        // 获取所有块（处理分页）
        const allItems: Block[] = [];
        let pageToken: string | undefined;
        let hasMore = true;

        while (hasMore) {
            const blocksResponse = await this.docxAPI.listBlocks(docToken, 500, pageToken);
            
            // 处理不同的响应格式
            // 情况1: 标准格式 { code, msg, data: { has_more, items } }
            // 情况2: 直接返回 { has_more, items }
            let blockData: BlockData;
            
            // 检查是否是标准格式（有 code 字段）
            if (blocksResponse.code !== undefined) {
                // 标准格式，检查 code
                if (blocksResponse.code !== 0) {
                    console.error(`❌ API 调用失败: code=${blocksResponse.code}, msg=${blocksResponse.msg}`);
                    throw new Error(`获取文档块失败: ${blocksResponse.code} ${blocksResponse.msg}`);
                }
                
                // 从 data 中提取
                if (blocksResponse.data?.items) {
                    blockData = {
                        has_more: blocksResponse.data.has_more || false,
                        items: blocksResponse.data.items
                    };
                } else if (blocksResponse.data?.blocks) {
                    // 如果返回的是 blocks 对象（key-value 格式），转换为数组
                    const blocksObj = blocksResponse.data.blocks;
                    const itemsArray = Object.values(blocksObj).map((block: any) => ({
                        ...block,
                        block_id: block.block_id || block.id || '',
                        parent_id: block.parent_id || '',
                        children: block.children || []
                    }));
                    blockData = {
                        has_more: blocksResponse.data.has_more || false,
                        items: itemsArray
                    };
                } else {
                    blockData = { has_more: false, items: [] };
                }
            } else {
                // 直接返回数据格式 { has_more, items } 或 { has_more, blocks }
                if (blocksResponse.items) {
                    blockData = {
                        has_more: blocksResponse.has_more || false,
                        items: blocksResponse.items
                    };
                } else if (blocksResponse.blocks) {
                    // 如果返回的是 blocks 对象（key-value 格式），转换为数组
                    const blocksObj = blocksResponse.blocks;
                    const itemsArray = Object.values(blocksObj).map((block: any) => ({
                        ...block,
                        block_id: block.block_id || block.id || '',
                        parent_id: block.parent_id || '',
                        children: block.children || []
                    }));
                    blockData = {
                        has_more: blocksResponse.has_more || false,
                        items: itemsArray
                    };
                } else {
                    blockData = { has_more: false, items: [] };
                }
            }
            
            if (blockData.items && blockData.items.length > 0) {
                allItems.push(...blockData.items);
            }
            
            hasMore = blockData.has_more || false;
            // 获取分页 token，可能在 data 中，也可能在响应根级别
            pageToken = blocksResponse.data?.page_token || blocksResponse.page_token;
            
            // 如果没有更多数据或者 page_token 为空，退出循环
            if (!hasMore || !pageToken) {
                break;
            }
        }

        const blockData: BlockData = {
            has_more: false,
            items: allItems
        };

        // 调试：打印获取到的块数量
        if (allItems.length === 0) {
            console.warn('⚠️  警告：未获取到任何块数据');
        } else {
            console.log(`📦 获取到 ${allItems.length} 个块`);
            // 打印前3个块的基本信息
            allItems.slice(0, 3).forEach((block, index) => {
                const block_type = typeof block.block_type === 'string' ? parseInt(block.block_type, 10) : block.block_type;
                console.log(`  📄 块 ${index + 1}: block_id=${block.block_id.substring(0, 20)}..., block_type=${block_type}, children=${block.children?.length || 0}`);
            });
        }

        // 提取图片 token
        const imageTokens = this.extractImageTokens(blockData);
        
        // 下载图片并建立路径映射
        let imagePathMap: ImagePathMap = {};
        if (options?.downloadImages && imageTokens.length > 0) {
            if (!this.driveAPI) {
                throw new Error('下载图片需要提供 DriveAPI 实例');
            }
            if (!options.imagesDir) {
                throw new Error('下载图片需要提供 imagesDir 参数');
            }
            
            imagePathMap = await this.downloadImagesAndGetPathMap(
                imageTokens,
                options.imagesDir,
                options.markdownDir || options.imagesDir
            );
        } else if (imageTokens.length > 0) {
            // 即使不下载，也建立占位符路径映射
            imageTokens.forEach(token => {
                imagePathMap[token] = `images/${this.getTokenHash(token)}.png`;
            });
        }

        // 转换为 Markdown
        return this.convertBlocksToMarkdown(blockData, imagePathMap, docToken);
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
     * 将 Markdown 内容转换并添加到文档
     * @param docToken 文档 token
     * @param markdown Markdown 内容
     * @returns 创建结果
     */
    async addMarkdownContent(docToken: string, markdown: string): Promise<any> {
        // 步骤1: 转换 Markdown 为块结构
        const blocks = await this.docxAPI.convertMarkdown(markdown);

        // 步骤2: 验证数据结构
        if (!blocks?.blocks || blocks.blocks.length === 0) {
            throw new Error('Markdown 转换失败：未生成任何块');
        }

        if (!blocks?.first_level_block_ids || blocks.first_level_block_ids.length === 0) {
            throw new Error('Markdown 转换失败：未生成第一级块');
        }

        // 步骤3: 清理块数据，删除不应该传递的字段
        const cleanedBlocks = blocks.blocks.map((block: any) => {
            const cleanBlock = { ...block };
            
            // 删除表格块中的 merge_info 字段
            if (cleanBlock.table?.property?.merge_info) {
                delete cleanBlock.table.property.merge_info;
            }
            
            return cleanBlock;
        });

        // 步骤4: 添加到文档
        const result = await this.docxAPI.createBlockDescendant({
            document_id: docToken,
            block_id: docToken,
            children_id: blocks.first_level_block_ids,
            descendants: cleanedBlocks,
            index: 0,
        });

        return result;
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

    // ========== 私有辅助方法：块转 Markdown ==========

    /**
     * 生成 token 的简短 hash（用于文件名）
     */
    private getTokenHash(token: string, length: number = 8): string {
        return token.substring(0, length).replace(/[^a-zA-Z0-9]/g, '_');
    }

    /**
     * 提取所有图片 token
     */
    private extractImageTokens(blockData: BlockData): string[] {
        const tokens: string[] = [];
        blockData.items.forEach((block) => {
            // 确保 block_type 是数字，27 表示图片块
            const block_type = typeof block.block_type === 'string' ? parseInt(block.block_type, 10) : block.block_type;
            if (block_type === 27 && block.image?.token) {
                tokens.push(block.image.token);
            }
        });
        return [...new Set(tokens)]; // 去重
    }

    /**
     * 下载图片并返回路径映射
     */
    private async downloadImagesAndGetPathMap(
        imageTokens: string[],
        imagesDir: string,
        markdownDir: string
    ): Promise<ImagePathMap> {
        if (!this.driveAPI) {
            throw new Error('DriveAPI 未初始化');
        }

        const imagePathMap: ImagePathMap = {};

        // 确保图片目录存在
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // 下载所有图片
        for (const token of imageTokens) {
            try {
                const relativePath = await this.downloadImageAndGetRelativePath(
                    token,
                    imagesDir,
                    markdownDir
                );
                imagePathMap[token] = relativePath;
            } catch (error) {
                console.warn(`下载图片失败 (token: ${token}):`, error instanceof Error ? error.message : error);
                // 如果下载失败，使用占位符路径
                imagePathMap[token] = `images/${this.getTokenHash(token)}.png`;
            }
        }

        return imagePathMap;
    }

    /**
     * 下载单个图片并返回相对路径
     */
    private async downloadImageAndGetRelativePath(
        token: string,
        imagesDir: string,
        markdownDir: string
    ): Promise<string> {
        if (!this.driveAPI) {
            throw new Error('DriveAPI 未初始化');
        }

        try {
            // 下载图片到临时目录
            const tempDir = path.join(imagesDir, '.temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const tempFileName = await this.driveAPI.downloadMedia(token, tempDir);

            // 等待文件写入完成
            await new Promise(resolve => setTimeout(resolve, 200));

            const tempFilePath = path.join(tempDir, tempFileName);

            // 如果文件不存在，抛出错误
            if (!fs.existsSync(tempFilePath)) {
                throw new Error(`下载的文件不存在: ${tempFilePath}`);
            }

            // 从文件名中提取扩展名（如果原文件名有扩展名）
            const parsedTemp = path.parse(tempFileName);
            const originalExt = parsedTemp.ext || '.png'; // 默认使用 png

            // 生成新的文件名：使用 token 的 hash + 扩展名
            const tokenHash = this.getTokenHash(token);
            const newFileName = `${tokenHash}${originalExt}`;
            const newFilePath = path.join(imagesDir, newFileName);

            // 如果目标文件已存在，先删除（避免冲突）
            if (fs.existsSync(newFilePath)) {
                fs.unlinkSync(newFilePath);
            }

            // 重命名文件（移动到最终位置）
            fs.renameSync(tempFilePath, newFilePath);

            // 清理临时目录（如果为空）
            try {
                const tempFiles = fs.readdirSync(tempDir);
                if (tempFiles.length === 0) {
                    fs.rmdirSync(tempDir);
                }
            } catch {
                // 忽略清理错误
            }

            // 计算相对路径（从 markdown 文件到图片文件的相对路径）
            const relativePath = path.relative(markdownDir, newFilePath);

            // 确保路径使用正斜杠（Markdown 标准）
            return relativePath.split(path.sep).join('/');
        } catch (error) {
            console.warn(`下载图片失败 (token: ${token}):`, error instanceof Error ? error.message : error);
            // 如果下载失败，返回一个占位符路径（使用 token hash）
            const tokenHash = this.getTokenHash(token);
            return `images/${tokenHash}.png`;
        }
    }

    /**
     * 处理文本元素，转换为 Markdown 格式
     */
    private processTextElements(elements: Array<{ text_run?: { content: string; text_element_style?: any } }>): string {
        if (!elements || elements.length === 0) {
            return '';
        }

        return elements
            .map((element) => {
                if (!element.text_run) {
                    return '';
                }

                const { content, text_element_style } = element.text_run;
                if (!content) {
                    return '';
                }

                let text = content;

                // 应用样式
                if (text_element_style) {
                    if (text_element_style.bold) {
                        text = `**${text}**`;
                    }
                    if (text_element_style.italic) {
                        text = `*${text}*`;
                    }
                    if (text_element_style.strikethrough) {
                        text = `~~${text}~~`;
                    }
                    if (text_element_style.inline_code) {
                        text = `\`${text}\``;
                    }
                }

                return text;
            })
            .join('');
    }

    /**
     * 判断是否需要在该块后添加空行
     */
    private shouldAddBlankLineAfter(blockType: number | string, inQuote: boolean, isLastChild: boolean): boolean {
        // 确保 blockType 是数字
        const type = typeof blockType === 'string' ? parseInt(blockType, 10) : blockType;
        
        // 引用块内的连续文本块不需要空行（因为它们已经用 > 前缀连接）
        if (inQuote && type === 2) {
            return false;
        }

        // 列表项：在引用块内时需要空行，不在引用块内时不需要空行
        if (type === 12 || type === 13) {
            return inQuote; // 引用块内的列表项之间需要空行
        }

        // 其他块都需要空行
        return true;
    }

    /**
     * 处理单个块
     */
    private processBlock(
        block: Block,
        blocksMap: Map<string, Block>,
        output: string[],
        inQuote: boolean = false,
        imagePathMap?: ImagePathMap,
        isLastChild: boolean = false
    ): void {
        // 确保 block_type 是数字
        const block_type = typeof block.block_type === 'string' ? parseInt(block.block_type, 10) : block.block_type;
        const prefix = inQuote ? '> ' : '';
        let hasOutput = false;

        // 调试：打印处理的块信息（仅前5个）
        if (output.length < 5) {
            console.log(`  🔹 处理块: block_id=${block.block_id}, block_type=${block_type}, 有子元素=${!!block.children?.length}`);
        }

        switch (block_type) {
            case 1: // 页面标题
                if (block.page?.elements) {
                    const title = this.processTextElements(block.page.elements);
                    if (title) {
                        output.push(`# ${title}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 2: // 文本块
                if (block.text?.elements) {
                    const text = this.processTextElements(block.text.elements);
                    if (text.trim()) {
                        output.push(`${prefix}${text}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 3: // 一级标题
                if (block.heading1?.elements) {
                    const text = this.processTextElements(block.heading1.elements);
                    if (text.trim()) {
                        output.push(`# ${text}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 4: // 二级标题
                if (block.heading2?.elements) {
                    const text = this.processTextElements(block.heading2.elements);
                    if (text.trim()) {
                        output.push(`## ${text}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 5: // 三级标题
                if (block.heading3?.elements) {
                    const text = this.processTextElements(block.heading3.elements);
                    if (text.trim()) {
                        output.push(`### ${text}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 6: // 四级标题
                if (block.heading4?.elements) {
                    const text = this.processTextElements(block.heading4.elements);
                    if (text.trim()) {
                        output.push(`#### ${text}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 12: // 无序列表
                if (block.bullet?.elements) {
                    const text = this.processTextElements(block.bullet.elements);
                    if (text.trim()) {
                        output.push(`${prefix}- ${text}\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 13: // 有序列表
                if (block.ordered?.elements) {
                    const text = this.processTextElements(block.ordered.elements);
                    const sequence = block.ordered.style?.sequence || 'auto';
                    if (text.trim()) {
                        if (sequence === 'auto') {
                            output.push(`${prefix}1. ${text}\n`);
                        } else {
                            output.push(`${prefix}${sequence}. ${text}\n`);
                        }
                        hasOutput = true;
                    }
                }
                break;

            case 14: // 代码块
                if (block.code?.elements) {
                    const code = block.code.elements
                        .map((el) => el.text_run?.content || '')
                        .join('');
                    // 根据 language 值映射，12 对应 CSS
                    let language = '';
                    if (block.code.style?.language === 12) {
                        language = 'CSS';
                    } else if (block.code.style?.language) {
                        language = 'typescript'; // 默认
                    }
                    if (code.trim()) {
                        output.push(`\`\`\`${language}\n${code}\n\`\`\`\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 19: // 标注（Callout）
                // 标注的子元素会直接处理，不需要在这里输出
                break;

            case 23: // 文件/视频
                if (block.file) {
                    const { name, token } = block.file;
                    // 根据文件扩展名判断是否为视频
                    if (name && /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(name)) {
                        output.push(`<video data-lark-video-uri="drivetoken://${token}" data-lark-video-mime="video/mp4" data-lark-video-size="0" data-lark-video-duration="0" data-lark-video-name="${name}" data-lark-video-width="0" data-lark-video-height="0"></video>\n`);
                        hasOutput = true;
                    } else {
                        // 其他文件类型
                        output.push(`[${name}](file://${token})\n`);
                        hasOutput = true;
                    }
                }
                break;

            case 27: // 图片
                if (block.image?.token) {
                    const token = block.image.token;
                    // 使用相对路径（如果已下载）或 fallback 到相对路径（使用 token hash）
                    const imagePath = imagePathMap?.[token] || `images/${this.getTokenHash(token)}.png`;
                    output.push(`![img](${imagePath})\n`);
                    hasOutput = true;
                }
                break;

            case 33: // 视图容器（通常包含视频）
                // 视图容器本身不输出内容，内容由其子元素（文件）输出
                break;

            case 34: // 引用容器
                // 引用容器本身不输出内容，子元素会在递归中处理
                break;

            default:
                // 未知类型，尝试输出文本内容
                if (block.text?.elements) {
                    const text = this.processTextElements(block.text.elements);
                    if (text.trim()) {
                        output.push(`${prefix}${text}\n`);
                        hasOutput = true;
                    }
                }
                break;
        }

        // 如果有输出且需要添加空行，则添加空行
        if (hasOutput && this.shouldAddBlankLineAfter(block_type, inQuote, isLastChild)) {
            output.push('\n');
        }

        // 处理子元素
        if (block.children && block.children.length > 0) {
            // 判断是否在引用容器或标注中
            const isInQuote = inQuote || block_type === 34 || block_type === 19;

            block.children.forEach((childId, index) => {
                const childBlock = blocksMap.get(childId);
                if (childBlock) {
                    const isLast = index === block.children!.length - 1;
                    this.processBlock(childBlock, blocksMap, output, isInQuote, imagePathMap, isLast);
                }
            });
        }
    }

    /**
     * 将块数据转换为 Markdown
     */
    private convertBlocksToMarkdown(
        blockData: BlockData,
        imagePathMap?: ImagePathMap,
        docToken?: string
    ): string {
        const { items } = blockData;

        if (!items || items.length === 0) {
            console.warn('⚠️  警告：convertBlocksToMarkdown 收到空的 items');
            return '';
        }

        // 调试：打印前几个块的信息
        console.log(`🔍 处理 ${items.length} 个块，前3个块信息：`);
        items.slice(0, 3).forEach((block, index) => {
            const block_type = typeof block.block_type === 'string' ? parseInt(block.block_type, 10) : block.block_type;
            console.log(`  块 ${index + 1}: block_id=${block.block_id}, block_type=${block_type}, parent_id=${block.parent_id}, children=${block.children?.length || 0}`);
        });

        // 创建块映射表
        const blocksMap = new Map<string, Block>();
        items.forEach((block) => {
            blocksMap.set(block.block_id, block);
        });

        // 找到根块（parent_id 为空或不在 items 中的块）
        // 优先查找 block_id 等于 docToken 的块（文档根块）
        let rootBlock: Block | undefined;
        if (docToken) {
            rootBlock = items.find((block) => block.block_id === docToken);
        }
        
        // 如果没有找到，查找 parent_id 为空的块
        if (!rootBlock) {
            const rootBlocks = items.filter((block) => {
                if (block.parent_id === '' || block.parent_id === '0') {
                    return true;
                }
                // 如果 parent_id 是文档 token 且不在 items 中，也是根块
                if (docToken && block.parent_id === docToken) {
                    return true;
                }
                // 如果 parent_id 不在 items 中，也是根块
                return !items.some((item) => item.block_id === block.parent_id);
            });

            // 如果没有找到根块，尝试找到 block_type 为 1 的页面块
            rootBlock = rootBlocks.find((b) => {
                const block_type = typeof b.block_type === 'string' ? parseInt(b.block_type, 10) : b.block_type;
                return block_type === 1;
            });
            if (!rootBlock && rootBlocks.length > 0) {
                rootBlock = rootBlocks[0];
            }
        }

        // 如果仍然没有找到根块，尝试找到所有没有 parent 的块，或者使用第一个块
        if (!rootBlock) {
            // 查找所有可能的根块（parent_id 为空、0、或等于 docToken）
            const possibleRoots = items.filter((block) => {
                return !block.parent_id || 
                       block.parent_id === '' || 
                       block.parent_id === '0' ||
                       (docToken && block.parent_id === docToken);
            });
            
            if (possibleRoots.length > 0) {
                rootBlock = possibleRoots.find((b) => {
                    const block_type = typeof b.block_type === 'string' ? parseInt(b.block_type, 10) : b.block_type;
                    return block_type === 1;
                }) || possibleRoots[0];
            } else {
                // 如果还是没有，使用第一个块
                rootBlock = items[0];
            }
        }

        if (!rootBlock) {
            throw new Error('未找到根块：items 为空或无法确定根块');
        }

        // 调试：打印根块信息
        const rootBlockType = typeof rootBlock.block_type === 'string' ? parseInt(rootBlock.block_type, 10) : rootBlock.block_type;
        console.log(`📌 找到根块: block_id=${rootBlock.block_id}, block_type=${rootBlockType}, children=${rootBlock.children?.length || 0}`);

        const output: string[] = [];

        // 处理根块的子元素
        if (rootBlock.children && rootBlock.children.length > 0) {
            console.log(`📝 处理根块的 ${rootBlock.children.length} 个子元素`);
            rootBlock.children.forEach((childId, index) => {
                const childBlock = blocksMap.get(childId);
                if (childBlock) {
                    const isLast = index === rootBlock.children!.length - 1;
                    this.processBlock(childBlock, blocksMap, output, false, imagePathMap, isLast);
                } else {
                    console.warn(`⚠️  警告：子块 ${childId} 不在 blocksMap 中`);
                }
            });
        } else {
            // 如果没有子元素，但根块本身有内容，直接处理根块
            console.log(`📝 根块没有子元素，直接处理根块本身`);
            this.processBlock(rootBlock, blocksMap, output, false, imagePathMap, true);
        }

        console.log(`📄 生成了 ${output.length} 行输出`);

        // 清理末尾的多个空行，只保留一个
        let markdown = output.join('');
        // 移除末尾的所有空行
        markdown = markdown.replace(/\n+$/, '');
        // 确保最后有一个换行符
        return markdown + '\n';
    }
}

