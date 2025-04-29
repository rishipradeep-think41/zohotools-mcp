import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  // ... other imports
} from "@modelcontextprotocol/sdk/types.js";
import { ZohoBooksClient } from "../services/zohoBooksClient.js";
import * as tools from "../tools/index.js";
//import { PROMPTS } from "../prompts/index.js";
import { RESOURCES } from "../resources/index.js";
import {
  CreateCustomerArgs,
  CreateInvoiceArgs,
  GetEmployeeArgs,
  GetInvoiceArgs,
  GetInvoiceEmailArgs,
  ListContactsArgs,
  ListCustomerNamesArgs,
  ListInvoicesArgs,
} from "../types/interfaces.js";

export function setupHandlers(server: Server) {
  const zoho = new ZohoBooksClient();

  // Tool handler
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "zoho_create_invoice": {
            const args = request.params.arguments;
            if (!args.data) {
              throw new Error("Missing required argument: data");
            }
            const response = await zoho.createInvoice(args.data);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_get_invoice": {
            const args = request.params.arguments;
            if (!args.invoice_id) {
              throw new Error("Missing required argument: invoice_id");
            }
            const response = await zoho.getInvoice(args.invoice_id as string);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_list_invoices": {
            const args = request.params.arguments;
            const response = await zoho.listInvoices(args.params);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_list_invoice_payments": {
            const args = request.params.arguments;
            if (!args.invoice_id) {
              throw new Error("Missing required argument: invoice_id");
            }
            const response = await zoho.listInvoicePayments(
              args.invoice_id as string
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_get_invoice_email": {
            const args = request.params
              .arguments as unknown as GetInvoiceEmailArgs;
            if (!args.invoice_id) {
              throw new Error("Missing required argument: invoice_id");
            }
            const response = await zoho.getInvoiceEmail(args.invoice_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "zoho_list_recurring_invoices": {
            // no required args
            const response = await zoho.listRecurringInvoices();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "zoho_list_credits_applied": {
            const args = request.params.arguments;
            if (!args.invoice_id) {
              throw new Error("Missing required argument: invoice_id");
            }
            const response = await zoho.listCreditsApplied(
              args.invoice_id as string
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "zoho_generate_payment_link": {
            const args = request.params.arguments;
            if (!args.transaction_id) {
              throw new Error("Missing required argument: transaction_id");
            }
            if (!args.transaction_type) {
              throw new Error("Missing required argument: transaction_type");
            }
            if (!args.expiry_time) {
              throw new Error("Missing required argument: expiry_time");
            }

            const response = await zoho.generatePaymentLink(
              args.transaction_id as string,
              args.transaction_type as string,
              (args.link_type as string) || "public",
              args.expiry_time as string
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "zoho_list_customer_names": {
            const args = request.params.arguments;
            const response = await zoho.listCustomerNames(args.params);
            // Return only customer_id and customer_name for each customer
            const customers = (response.contacts || []).map((c) => ({
              customer_id: c.contact_id,
              customer_name: c.contact_name,
            }));
            return {
              content: [{ type: "text", text: JSON.stringify(customers) }],
            };
          }
          case "zoho_list_contacts": {
            const args = request.params.arguments;
            const response = await zoho.listContacts(
              args.organization_id as string,
              args.params || {}
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_create_customer": {
            const args = request.params.arguments;
            if (!args.contact_name) {
              throw new Error("Missing required argument: contact_name");
            }
            const response = await zoho.createCustomer(
              args as CreateCustomerArgs
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_get_expenses": {
            const args = request.params.arguments;
            const queryParams = new URLSearchParams();

            if (args.filter_by)
              queryParams.append("filter_by", args.filter_by as string);
            if (args.sort_column)
              queryParams.append("sort_column", args.sort_column as string);
            if (args.customer_id)
              queryParams.append("customer_id", args.customer_id as string);

            const response = await zoho.getExpenses(queryParams.toString());
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_get_an_expense": {
            const args = request.params.arguments;
            if (!args.expense_id) {
              throw new Error("Missing required argument: expense_id");
            }
            const response = await zoho.getAnExpense(args.expense_id as string);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_list_employees": {
            const response = await zoho.listEmployees();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_get_chart_of_accounts": {
            const response = await zoho.getChartOfAccounts();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "zoho_get_employee": {
            const { employee_id } = request.params
              .arguments as unknown as GetEmployeeArgs;
            if (!employee_id) {
              throw new Error("Missing required argument: employee_id");
            }
            // calls the client method defined below
            const response = await zoho.getEmployeeById(employee_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.values(tools),
    };
  });

  // List prompts
  // server.setRequestHandler(ListPromptsRequestSchema, async () => {
  //   return {
  //     prompts: Object.values(PROMPTS).map(
  //       ({ name, description, arguments: args }) => ({
  //         name,
  //         description,
  //         arguments: args,
  //       })
  //     ),
  //   };
  // });

  // Get prompt
  // server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  //   const prompt = PROMPTS[request.params.name];
  //   if (!prompt) {
  //     throw new Error(`Prompt not found: ${request.params.name}`);
  //   }
  //   return {
  //     description: prompt.description,
  //     messages: prompt.messages,
  //   };
  // });

  // List resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: RESOURCES.map(({ uri, name, mimeType, description }) => ({
        uri,
        name,
        mimeType,
        description,
      })),
    };
  });

  // Read resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resource = RESOURCES.find((r) => r.uri === request.params.uri);
    if (!resource) {
      throw new Error(`Resource not found: ${request.params.uri}`);
    }
    return {
      content: [
        {
          type: "text",
          text: resource.content,
          mimeType: resource.mimeType,
          uri: resource.uri,
        },
      ],
    };
  });
}
