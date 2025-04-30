import { Tool } from "@modelcontextprotocol/sdk/types.js";

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
