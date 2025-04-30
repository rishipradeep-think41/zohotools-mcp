import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const getExpensesTool: Tool = {
  name: "zoho_get_expenses",
  description: "Get a list of all expenses (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      filter_by: {
        type: "string",
        description:
          "Filter expenses by status (e.g., 'Status.All', 'Status.Billable', 'Status.Nonbillable')",
        enum: [
          "Status.All",
          "Status.Billable",
          "Status.Nonbillable",
          "Status.Reimbursed",
          "Status.Invoiced",
          "Status.Unbilled",
        ],
      },
      sort_column: {
        type: "string",
        description: "Column to sort results by",
        enum: [
          "date",
          "account_name",
          "total",
          "bcy_total",
          "reference_number",
          "customer_name",
          "created_time",
        ],
      },
      customer_id: {
        type: "string",
        description: "Filter expenses by customer ID",
      },
    },
    required: [],
  },
};

export const getExpenseTool: Tool = {
  name: "zoho_get_expense",
  description: "Get details of a specific expense (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      expense_id: { type: "string", description: "Expense ID" },
    },
    required: ["expense_id"],
  },
};

export const listEmployeesTool: Tool = {
  name: "zoho_list_employees",
  description:
    "List all employees in the organization (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      // You can add optional filter parameters here if needed
    },
    required: [],
  },
};

// tools.ts
export const getEmployeeTool: Tool = {
  name: "zoho_get_employee",
  description:
    "Get a specific employee’s details by employee_id (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      employee_id: {
        type: "string",
        description: "ID of the employee to fetch",
      },
    },
    required: ["employee_id"],
  },
};
