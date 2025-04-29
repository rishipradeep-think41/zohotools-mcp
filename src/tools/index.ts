import { Tool } from "@modelcontextprotocol/sdk/types.js";

// src/tools/index.ts
export * from "./invoice.js";
export * from "./customer.js";
export * from "./expenses.js";
export * from "./charofAccounts.js";

export const createInvoiceTool: Tool = {
  name: "zoho_create_invoice",
  description: "Create a new invoice in Zoho Books (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      customer_id: {
        type: "string",
        description: "ID of the customer the invoice is for",
      },
      line_items: {
        type: "array",
        items: { type: "object" },
        description: "Array of line item objects for the invoice",
      },
      // Add other invoice fields as needed, e.g. date, invoice_number, etc.
      // See: https://www.zoho.com/books/api/v3/invoices/#create-an-invoice
    },
    required: ["customer_id", "line_items"],
    additionalProperties: true, // Allow extra fields for flexibility
  },
};

export const getInvoiceTool: Tool = {
  name: "zoho_get_invoice",
  description: "Get details of a specific invoice (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      invoice_id: { type: "string", description: "Invoice ID" },
    },
    required: ["invoice_id"],
  },
};

export const listInvoicesTool: Tool = {
  name: "zoho_list_invoices",
  description: "List invoices in Zoho Books (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      params: {
        type: "object",
        description: "Query parameters (optional)",
        additionalProperties: true,
      },
    },
    required: [],
  },
};

export const getInvoiceEmailTool: Tool = {
  name: "zoho_get_invoice_email",
  description:
    "Get payment reminder email content for a specific invoice (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      invoice_id: {
        type: "string",
        description: "ID of the invoice to fetch email content for",
      },
    },
    required: ["invoice_id"],
  },
};

export const listInvoicePaymentsTool: Tool = {
  name: "zoho_list_invoice_payments",
  description:
    "List all payments made against a specific invoice (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      invoice_id: {
        type: "string",
        description: "Invoice ID for which to retrieve payments",
      },
    },
    required: ["invoice_id"],
  },
};

export const listCreditsAppliedTool: Tool = {
  name: "zoho_list_credits_applied",
  description:
    "Get a list of credits applied to a specific invoice (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      invoice_id: {
        type: "string",
        description: "Invoice ID for which to retrieve applied credits",
      },
    },
    required: ["invoice_id"],
  },
};

export const generatePaymentLinkTool: Tool = {
  name: "zoho_generate_payment_link",
  description:
    "Generate a payment link for a specific invoice (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      transaction_id: {
        type: "string",
        description: "Transaction ID (e.g., invoice ID)",
      },
      transaction_type: {
        type: "string",
        description: "Type of transaction",
        enum: ["invoice", "customer_payment", "creditnote", "vendorcredit"],
      },
      link_type: {
        type: "string",
        description: "Type of link",
        enum: ["public", "protected"],
        default: "public",
      },
      expiry_time: {
        type: "string",
        description: "Expiry date for the payment link (format: YYYY-MM-DD)",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      },
    },
    required: ["transaction_id", "transaction_type", "expiry_time"],
  },
};

// tools.ts
export const listRecurringInvoicesTool: Tool = {
  name: "zoho_list_recurring_invoices",
  description: "List all recurring invoices (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      // you can add optional query params here in future (e.g. page, per_page)
    },
    required: [],
    additionalProperties: false,
  },
};

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

export const listCustomerNamesTool: Tool = {
  name: "zoho_list_customer_names",
  description:
    "List all customer names and IDs in Zoho Books (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {
      params: {
        type: "object",
        description: "Optional query parameters for listing customers",
      },
    },
    required: [],
  },
};

export const listContactsTool: Tool = {
  name: "zoho_list_contacts",
  description: "Lists all contacts (customers) given the organization_id.",
  inputSchema: {
    type: "object",
    properties: {
      //   organization_id: { type: "string", description: "The organization_id for which to list contacts." },
      params: {
        type: "object",
        description: "Optional query parameters for listing contacts.",
        additionalProperties: true,
      },
    },
    required: [],
  },
};

export const createCustomerTool: Tool = {
  name: "zoho_create_customer",
  description: "Create a new customer contact in Zoho Books",
  inputSchema: {
    type: "object",
    properties: {
      contact_name: {
        type: "string",
        description: "Name of the customer (required)",
      },
      company_name: { type: "string", description: "Company name" },
      customer_name: {
        type: "string",
        description: "Alternative name field (if needed)",
      },
      email: { type: "string", description: "Customer's email address" },
      phone: { type: "string", description: "Customer's phone number" },
      billing_address: {
        type: "object",
        description: "Customer's billing address",
        properties: {
          address: { type: "string", description: "Street address" },
          city: { type: "string", description: "City" },
          state: { type: "string", description: "State" },
          zip: { type: "string", description: "Zip/Postal code" },
          country: { type: "string", description: "Country" },
        },
      },
      contact_type: {
        type: "string",
        description: "Type of contact",
        enum: ["customer", "vendor"],
        default: "customer",
      },
      currency_id: {
        type: "string",
        description: "Currency ID for this customer",
      },
      notes: {
        type: "string",
        description: "Additional notes about the customer",
      },
    },
    required: ["contact_name"],
  },
};

export const getChartOfAccountsTool: Tool = {
  name: "zoho_get_chart_of_accounts",
  description: "Get list of chart of accounts (organization_id is fixed)",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};
