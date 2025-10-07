import { z } from "zod";
import { MCPPrompt } from "mcp-framework";

interface ReportInput {
  date: string;
}

class TreasuryReport extends MCPPrompt<ReportInput> {
  name = "daily_treasury_report";
  description =
    "Generate a formatted daily treasury report for a specific date";

  schema = {
    date: {
      type: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
      description: "Date of the treasury report in YYYY-MM-DD format",
      required: true,
    },
  };

  async generateMessages({ date }: ReportInput) {
    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please use the get_daily_treasury_statement tool to fetch data for ${date} and then format it as a clear report. Once you have the data, please format it as a report that starts with 'Hello Jacky! DAILY TREASURY REPORT:' and includes the date. Break down the operating cash balances by account type, with amounts formatted as currency`,
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: "I'll analyze the treasury data and create a formatted report starting with the specified header, including a clear breakdown of cash balances.",
        },
      },
    ];
  }
}

export default TreasuryReport;