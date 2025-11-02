import { MCPResource, ResourceContent } from "mcp-framework";

interface TreasuryData {
  record_date: string;
  account_type: string;
  close_today_bal: string;
}

const oneHour = 1000 * 60 * 60;

class TreasuryDataResource extends MCPResource {
  uri = "treasury://operating-cash-balance/historical";
  name = "Historical Treasury Operating Cash Balance";
  description =
    "Historical daily treasury statements showing operating cash balances";
  mimeType = "application/json";

  private cachedData: TreasuryData[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_TTL = oneHour;

  async read(): Promise<ResourceContent[]> {
    await this.refreshCache();

    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify(this.cachedData, null, 2),
      },
    ];
  }

  private async refreshCache(): Promise<void> {
    const now = Date.now();
    if (this.cachedData && now - this.lastFetch < this.CACHE_TTL) {
      return;
    }

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?filter=record_date:gte:${startDate},record_date:lte:${endDate}&sort=-record_date`;

    try {
      const response = await this.fetch<{ data: TreasuryData[] }>(url);
      this.cachedData = response.data;
      this.lastFetch = now;
    } catch (error) {
      throw new Error(`Failed to fetch treasury data: ${error}`);
    }
  }
}

export default TreasuryDataResource;