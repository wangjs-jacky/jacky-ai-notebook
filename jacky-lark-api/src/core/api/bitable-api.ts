/**
 * 多维表格 API
 * 对应飞书 bitable.v1
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { BaseAPI } from './base-api.js';
import type { BitableTable, BitableRecord, BitableField } from '../types/index.js';

export class BitableAPI extends BaseAPI {
    /**
     * 获取多维表格的所有数据表
     * @doc https://open.larkenterprise.com/document/server-docs/docs/bitable-v1/app-table/list
     */
    async listTables(appToken: string): Promise<BitableTable[]> {
        const token = this.getUserAccessToken();
        const response = await this.client.bitable.v1.appTable.list(
            {
                path: { app_token: appToken },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return (response.data?.items || []) as BitableTable[];
        }
        throw new Error(`获取数据表列表失败: ${response.code} ${response.msg}`);
    }

    /**
     * 获取表格信息
     * 注意：当前 SDK 版本可能不支持此方法
     */
    async getTable(appToken: string, tableId: string): Promise<BitableTable | undefined> {
        // 暂时使用 listTables 然后过滤
        const tables = await this.listTables(appToken);
        return tables.find(t => t.table_id === tableId);
    }

    /**
     * 获取记录列表
     * @doc https://open.larkenterprise.com/document/server-docs/docs/bitable-v1/app-table-record/list
     */
    async listRecords(
        appToken: string,
        tableId: string,
        pageSize: number = 500,
        pageToken?: string
    ): Promise<any> {
        return this.withUserToken(async (token) => {
            const params: any = { page_size: pageSize };
            if (pageToken) {
                params.page_token = pageToken;
            }

            const response = await this.client.bitable.v1.appTableRecord.list(
                {
                    path: {
                        app_token: appToken,
                        table_id: tableId,
                    },
                    params,
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 创建记录
     * @doc https://open.larkenterprise.com/document/server-docs/docs/bitable-v1/app-table-record/create
     */
    async createRecord(appToken: string, tableId: string, fields: Record<string, any>): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.bitable.v1.appTableRecord.create(
                {
                    path: {
                        app_token: appToken,
                        table_id: tableId,
                    },
                    data: { fields },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 更新记录
     * @doc https://open.larkenterprise.com/document/server-docs/docs/bitable-v1/app-table-record/update
     */
    async updateRecord(
        appToken: string,
        tableId: string,
        recordId: string,
        fields: Record<string, any>
    ): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.bitable.v1.appTableRecord.update(
                {
                    path: {
                        app_token: appToken,
                        table_id: tableId,
                        record_id: recordId,
                    },
                    data: { fields },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 删除记录
     * @doc https://open.larkenterprise.com/document/server-docs/docs/bitable-v1/app-table-record/delete
     */
    async deleteRecord(appToken: string, tableId: string, recordId: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.bitable.v1.appTableRecord.delete(
                {
                    path: {
                        app_token: appToken,
                        table_id: tableId,
                        record_id: recordId,
                    },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 获取字段列表
     * @doc https://open.larkenterprise.com/document/server-docs/docs/bitable-v1/app-table-field/list
     */
    async listFields(appToken: string, tableId: string): Promise<BitableField[]> {
        const token = this.getUserAccessToken();
        const response = await this.client.bitable.v1.appTableField.list(
            {
                path: {
                    app_token: appToken,
                    table_id: tableId,
                },
            },
            lark.withUserAccessToken(token)
        );
        if (response.code === 0) {
            return (response.data?.items || []) as BitableField[];
        }
        throw new Error(`获取字段列表失败: ${response.code} ${response.msg}`);
    }
}

