/**
 * 电子表格 API
 * 对应飞书 sheets
 */
import * as lark from '@larksuiteoapi/node-sdk';
import { BaseAPI } from './base-api.js';

export class SheetAPI extends BaseAPI {
    /**
     * 获取电子表格信息
     * @doc https://open.larkenterprise.com/document/server-docs/docs/sheets-v3/spreadsheet/get
     */
    async getSpreadsheet(spreadsheetToken: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.sheets.spreadsheet.get(
                {
                    path: { spreadsheet_token: spreadsheetToken },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 获取工作表信息
     * @doc https://open.larkenterprise.com/document/server-docs/docs/sheets-v3/spreadsheet-sheet/query
     */
    async listSheets(spreadsheetToken: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.sheets.spreadsheetSheet.query(
                {
                    path: { spreadsheet_token: spreadsheetToken },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }

    /**
     * 读取单个范围
     * @doc https://open.larkenterprise.com/document/server-docs/docs/sheets-v3/data-operation/reading-a-single-range
     */
    async getRange(spreadsheetToken: string, range: string): Promise<any> {
        return this.withUserToken(async (token) => {
            const response = await this.client.sheets.spreadsheetSheet.get(
                {
                    path: {
                        spreadsheet_token: spreadsheetToken,
                        sheet_id: range.split('!')[0],
                    },
                },
                lark.withUserAccessToken(token)
            );
            return response;
        });
    }
}

