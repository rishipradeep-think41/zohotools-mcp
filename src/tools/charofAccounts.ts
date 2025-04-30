import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const getChartOfAccountsTool: Tool = {
  name: "zoho_get_chart_of_accounts",
  description: "Get list of chart of accounts (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};
