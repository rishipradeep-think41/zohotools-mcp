import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const listCustomerNamesTool: Tool = {
    name: "zoho_list_customer_names",
    description: "List all customer names and IDs in Zoho Books (organization_id is fixed)",
    inputSchema: {
      type: "object",
      properties: {
        params: { type: "object", description: "Optional query parameters for listing customers" },
      },
      required: []
    }
  };
  
  export const listContactsTool: Tool = {
    name: "zoho_list_contacts",
    description: "Lists all contacts (customers) given the organization_id.",
    inputSchema: {
      type: "object",
      properties: {
      //   organization_id: { type: "string", description: "The organization_id for which to list contacts." },
        params: { type: "object", description: "Optional query parameters for listing contacts.", additionalProperties: true },
      },
      required: []
    }
  };
  
  export const createCustomerTool: Tool = {
    name: "zoho_create_customer",
    description: "Create a new customer contact in Zoho Books",
    inputSchema: {
      type: "object",
      properties: {
        contact_name: { type: "string", description: "Name of the customer (required)" },
        company_name: { type: "string", description: "Company name" },
        customer_name: { type: "string", description: "Alternative name field (if needed)" },
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
            country: { type: "string", description: "Country" }
          }
        },
        contact_type: { type: "string", description: "Type of contact", enum: ["customer", "vendor"], default: "customer" },
        currency_id: { type: "string", description: "Currency ID for this customer" },
        notes: { type: "string", description: "Additional notes about the customer" }
      },
      required: ["contact_name"],
    },
  };