/**
 * 云空间 API
 * 对应飞书 drive.v1
 */
import * as fs from 'fs';
import * as path from 'path';
import * as lark from '@larksuiteoapi/node-sdk';
import { BaseAPI } from './base-api.js';

export class DriveAPI extends BaseAPI {
  /**
   * 下载媒体文件
   * @param fileToken 文件 token
   * @param outputPath 输出目录路径（必须提供，文件将保存在此目录下，文件名自动生成）
   * @returns 生成的文件名（包含扩展名）
   * @doc https://open.larkenterprise.com/document/server-docs/docs/drive-v1/media/download
   */
  async downloadMedia(
    fileToken: string,
    outputPath: string
  ): Promise<string> {
    const token = this.getUserAccessToken();
    const response = await this.client.drive.v1.media.download(
      {
        path: {
          file_token: fileToken,
        },
      },
      lark.withUserAccessToken(token)
    );

    // outputPath 是目录，需要在此目录下生成文件名
    // 从响应头中提取文件信息
    const contentType = response?.headers?.['content-type'] || '';
    const contentDisposition = response?.headers?.['content-disposition'] || '';

    // 从 content-disposition 中提取文件名（去掉扩展名）
    let fileName = '';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        let extractedName = filenameMatch[1].replace(/['"]/g, '');
        // 去掉扩展名，只保留文件名部分
        const nameWithoutExt = path.parse(extractedName).name;
        if (nameWithoutExt) {
          fileName = nameWithoutExt;
        }
      }
    }

    // 如果从 content-disposition 没有提取到文件名，使用 fileToken
    if (!fileName) {
      fileName = fileToken;
    }

    // 从 content-type 推断文件扩展名
    let fileExtension = '';
    if (contentType) {
      if (contentType.includes('image/png')) {
        fileExtension = 'png';
      } else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        fileExtension = 'jpg';
      } else if (contentType.includes('image/gif')) {
        fileExtension = 'gif';
      } else if (contentType.includes('image/webp')) {
        fileExtension = 'webp';
      } else if (contentType.includes('application/pdf')) {
        fileExtension = 'pdf';
      } else {
        // 从 content-type 中提取类型
        const typeMatch = contentType.match(/\/([^;]+)/);
        if (typeMatch) {
          fileExtension = typeMatch[1].split('+')[0]; // 处理 image/svg+xml 这种情况
        }
      }
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 组合文件名：{从contentDisposition提取的文件名}.{从contentType提取的扩展名}
    const outputFileName = fileExtension ? `${fileName}.${fileExtension}` : fileName;
    const finalOutputPath = path.join(outputPath, outputFileName);

    // 使用流的方式保存文件
    if (response.getReadableStream) {
      const stream = response.getReadableStream();
      const writeStream = fs.createWriteStream(finalOutputPath);
      stream.pipe(writeStream);

      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else if (response.writeFile) {
      // 如果 writeFile 可用，直接使用
      await new Promise<void>((resolve, reject) => {
        try {
          const result = response.writeFile(finalOutputPath);
          if (result && typeof result.then === 'function') {
            result.then(() => resolve()).catch(reject);
          } else {
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      });
    }

    return outputFileName;
  }
}


