import { z } from "zod";
import { MCPTool } from "mcp-framework";

interface TreasuryData {
  record_date: string;
  account_type: string;
  close_today_bal: string;
}

interface DateInput {
  date: string;
}
class GetDailyTreasuryStatement extends MCPTool<DateInput> {
  name = "get_daily_treasury_statement";
  description = "Get the daily treasury statement for a specific day";
  schema = {
    date: {
      type: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
      description: "Date of the statement in YYYY-MM-DD format",
    },
  };

  async execute({ date }: DateInput) {
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?filter=record_date:eq:${date}`;
    const response = await this.fetch<{ data: TreasuryData[] }>(url);
    return response.data;
  }
}

export default GetDailyTreasuryStatement;