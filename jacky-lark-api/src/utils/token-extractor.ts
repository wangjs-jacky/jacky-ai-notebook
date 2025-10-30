/**
 * 飞书 URL Token 提取工具
 * 
 * 提供从飞书资源 URL 中提取 token 的核心功能
 */

/**
 * 飞书资源类型枚举
 */
export enum LarkResourceType {
  FOLDER = 'folder_token',
  FILE = 'file_token',
  DOC = 'doc_token',
  DOCUMENT = 'document_id',
  SPREADSHEET = 'spreadsheet_token',
  BASE = 'app_token',
  WIKI_SPACE = 'space_id',
  WIKI_NODE = 'node_token',
  UNKNOWN = 'unknown'
}

/**
 * Token 提取结果
 */
export interface TokenResult {
  /** token 值 */
  token: string;
  /** 资源类型 */
  type: LarkResourceType;
  /** 原始 URL */
  originalUrl: string;
}

/**
 * 支持的飞书域名列表
 */
const LARK_DOMAINS = [
  'feishu.cn',      // 中国版
  'larksuite.com',  // 国际版
  'feishu.com',     // 备用域名
  'lark.cn',        // 备用域名
  'larkenterprise.com', // 企业版
];

/**
 * URL 路径模式映射
 */
const URL_PATTERNS = [
  { pattern: /\/drive\/folder\/([^/#?]+)/, type: LarkResourceType.FOLDER },
  { pattern: /\/file\/([^/#?]+)/, type: LarkResourceType.FILE },
  { pattern: /\/docs\/([^/#?]+)/, type: LarkResourceType.DOC },
  { pattern: /\/docx\/([^/#?]+)/, type: LarkResourceType.DOCUMENT },
  { pattern: /\/sheets\/([^/#?]+)/, type: LarkResourceType.SPREADSHEET },
  { pattern: /\/base\/([^/#?]+)/, type: LarkResourceType.BASE },
  { pattern: /\/wiki\/settings\/([^/#?]+)/, type: LarkResourceType.WIKI_SPACE },
  { pattern: /\/wiki\/([^/#?]+)/, type: LarkResourceType.WIKI_NODE },
];

/**
 * 检查 URL 是否包含飞书域名
 * 
 * @param url 待检查的 URL
 * @returns 是否包含飞书域名
 */
function isLarkDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return LARK_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    // 如果 URL 格式不正确，返回 false
    return false;
  }
}

/**
 * 从飞书 URL 中提取 token
 * 
 * @param url 飞书资源的完整 URL
 * @returns TokenResult 对象，包含 token、类型和原始 URL
 * 
 * @example
 * ```ts
 * // 文件夹
 * extractTokenFromUrl('https://sample.feishu.cn/drive/folder/cSJe2JgtFFBwRuTKAJK6baNGUn0')
 * // => { token: 'cSJe2JgtFFBwRuTKAJK6baNGUn0', type: 'folder_token', originalUrl: '...' }
 * 
 * // 文档
 * extractTokenFromUrl('https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q#')
 * // => { token: '2olt0Ts4Mds7j7iqzdwrqEUnO7q', type: 'doc_token', originalUrl: '...' }
 * 
 * // 新版文档
 * extractTokenFromUrl('https://sample.feishu.cn/docx/UXEAd6cRUoj5pexJZr0cdwaFnpd')
 * // => { token: 'UXEAd6cRUoj5pexJZr0cdwaFnpd', type: 'document_id', originalUrl: '...' }
 * ```
 */
export function extractTokenFromUrl(url: string): TokenResult {
  // 保存原始 URL
  const originalUrl = url;

  // 检查是否为飞书域名
  if (!isLarkDomain(url)) {
    return {
      token: '',
      type: LarkResourceType.UNKNOWN,
      originalUrl
    };
  }

  // 移除末尾的 # 符号及其后面的内容
  let cleanUrl = url.split('#')[0] || '';
  
  // 移除末尾的查询参数（如果有）
  cleanUrl = cleanUrl.split('?')[0] || '';

  // 尝试匹配所有已知的 URL 模式
  for (const { pattern, type } of URL_PATTERNS) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return {
        token: match[1],
        type,
        originalUrl
      };
    }
  }

  // 如果没有匹配到任何模式，返回未知类型
  return {
    token: '',
    type: LarkResourceType.UNKNOWN,
    originalUrl
  };
}

/**
 * 批量提取多个 URL 的 token
 * 
 * @param urls URL 数组
 * @returns TokenResult 数组
 * 
 * @example
 * ```ts
 * const urls = [
 *   'https://sample.feishu.cn/drive/folder/cSJe2JgtFFBwRuTKAJK6baNGUn0',
 *   'https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q'
 * ];
 * const results = extractTokensFromUrls(urls);
 * ```
 */
export function extractTokensFromUrls(urls: string[]): TokenResult[] {
  return urls.map(url => extractTokenFromUrl(url));
}

/**
 * 仅提取 token 字符串（不包含类型信息）
 * 
 * @param url 飞书资源的完整 URL
 * @returns token 字符串，如果无法识别则返回空字符串
 * 
 * @example
 * ```ts
 * getTokenOnly('https://sample.feishu.cn/docs/2olt0Ts4Mds7j7iqzdwrqEUnO7q')
 * // => '2olt0Ts4Mds7j7iqzdwrqEUnO7q'
 * ```
 */
export function getTokenOnly(url: string): string {
  return extractTokenFromUrl(url).token;
}

/**
 * 验证 URL 是否为有效的飞书资源 URL
 * 
 * 检查规则：
 * 1. 必须包含飞书域名（feishu.cn, larksuite.com 等）
 * 2. 必须匹配已知的资源类型路径模式
 * 3. 能够成功提取 token
 * 
 * @param url 待验证的 URL
 * @returns 是否为有效的飞书资源 URL
 * 
 * @example
 * ```ts
 * isValidLarkUrl('https://sample.feishu.cn/docs/xxx')  // => true
 * isValidLarkUrl('https://larksuite.com/sheets/xxx')   // => true
 * isValidLarkUrl('https://google.com')                 // => false
 * isValidLarkUrl('https://google.com/docs/xxx')        // => false (非飞书域名)
 * ```
 */
export function isValidLarkUrl(url: string): boolean {
  const result = extractTokenFromUrl(url);
  return result.type !== LarkResourceType.UNKNOWN && result.token !== '';
}

