#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { configDotenv } from "dotenv";

configDotenv();

// Environment variables required for OAuth
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCESS_TOKEN = await refreshAccessToken();

async function refreshAccessToken(): Promise<string> {
  if (!ZOHO_REFRESH_TOKEN) {
    throw new Error(
      "No refresh token available. Please restart the application to initiate the OAuth flow."
    );
  }

  try {
    const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }).toString(),
    });

    const tokenData: TokenResponse = await response.json();
    if (!response.ok || !tokenData.access_token) {
      throw new Error(
        `Failed to refresh token: ${tokenData.error || "Unknown"}`
      );
    }

    const access_token = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 3600;
    const tokenexpiry = Math.floor(Date.now() / 1000) + expiresIn;

    return access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

async function fetchOrganizations() {
  const accessToken = ZOHO_ACCESS_TOKEN;
  const response = await fetch(
    "https://www.zohoapis.in/books/v3/organizations",
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );
  const mainresponse = await response.json();
  console.log(mainresponse);
  return mainresponse;
}

async function initializeOrganizationId() {
  try {
    const orgsResponse = await fetchOrganizations();
    if (
      orgsResponse &&
      orgsResponse.organizations &&
      orgsResponse.organizations.length > 0
    ) {
      // Use the first organization by default, or let user choose if needed
      return orgsResponse.organizations[0].organizationid;
    } else {
      console.warn("No organizations found. Using default organizationid.");
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    console.warn("Using default organizationid");
  }
}

// if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
//   throw new Error(
//     "Required Zoho OAuth credentials not found in environment variables"
//   );
// }

const ZOHO_ORGANIZATION_ID = await initializeOrganizationId();

export interface CreateInvoiceArgs {
  data: Record<string, any>;
}

export interface GetInvoiceArgs {
  invoice_id: string;
}

export interface ListInvoicesArgs {
  params?: Record<string, any>;
}

export interface ListCustomerNamesArgs {
  params?: Record<string, any>;
}

export interface ListContactsArgs {
  organization_id: string;
  params?: Record<string, any>;
}

export interface CreateCustomerArgs {
  contact_name: string;
  company_name?: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  billing_address?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  contact_type?: "customer" | "vendor";
  currency_id?: string;
  notes?: string;
  [key: string]: any; // Allow any additional fields
}

export interface TokenResponse {
  access_token?: string;
  error?: string;
  expires_in?: number;
  refresh_token?: string;
  [key: string]: any; // Optional: allows additional properties
}

export interface StoredTokens {
  refreshToken: string;
  accessToken?: string;
  tokenExpiry?: number;
}

export interface GetInvoiceEmailArgs {
  invoice_id: string;
}

export interface ListInvoicePaymentsArgs {
  invoice_id: string;
}

export interface ListCreditsAppliedArgs {
  invoice_id: string;
}

export interface GeneratePaymentLinkArgs {
  transaction_id: string;
  transaction_type: string;
  link_type?: string;
  expiry_time: string;
}

export interface GetExpensesArgs {
  filter_by?: string;
  sort_column?: string;
  customer_id?: string;
}

export interface GetAnExpenseArgs {
  expense_id: string;
}

export interface ListEmployeesArgs {
  // You can add optional filter parameters here if needed
}

// types.ts
export interface GetEmployeeArgs {
  employee_id: string;
}

// types.ts
export interface ListRecurringInvoicesArgs {
  // no arguments for now
}

export interface GetChartOfAccountsArgs {}

class ZohoMcpServer {
  private server: Server;
  private tokenexpiry;
  private organizationid: string;
  private access_token: string;
  private refresh_token: string;
  private clientid: string;
  private clientSecret: string;

  constructor() {
    this.server = new Server(
      {
        name: "zoho-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Set up OAuth2 client
    this.clientid = ZOHO_CLIENT_ID as string;
    this.clientSecret = ZOHO_CLIENT_SECRET as string;
    this.refresh_token = ZOHO_REFRESH_TOKEN as string;
    this.access_token = ZOHO_ACCESS_TOKEN as string;
    this.organizationid = ZOHO_ORGANIZATION_ID as string;
    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async initializeOrganizationId(): Promise<void> {
    try {
      const orgsResponse = await this.fetchOrganizations();
      if (
        orgsResponse &&
        orgsResponse.organizations &&
        orgsResponse.organizations.length > 0
      ) {
        // Use the first organization by default, or let user choose if needed
        this.organizationid = orgsResponse.organizations[0].organizationid;
        console.error(`Set organizationid to: ${this.organizationid}`);
      } else {
        console.warn("No organizations found. Using default organizationid.");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      console.warn("Using default organizationid");
    }
  }

  private async fetchOrganizations(): Promise<any> {
    const accessToken = this.access_token;
    const response = await fetch(
      "https://www.zohoapis.in/books/v3/organizations",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );
    const mainresponse = await response.json();
    console.log(mainresponse);
    return mainresponse;
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "list_emails",
          description: "List recent emails from Gmail inbox",
          inputSchema: {
            type: "object",
            properties: {
              maxResults: {
                type: "number",
                description: "Maximum number of emails to return (default: 10)",
              },
              query: {
                type: "string",
                description: "Search query to filter emails",
              },
            },
          },
        },
        {
          name: "search_emails",
          description: "Search emails with advanced query",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  'Gmail search query (e.g., "from:example@gmail.com has:attachment"). Examples:\n' +
                  '- "from:alice@example.com" (Emails from Alice)\n' +
                  '- "to:bob@example.com" (Emails sent to Bob)\n' +
                  '- "subject:Meeting Update" (Emails with "Meeting Update" in the subject)\n' +
                  '- "has:attachment filename:pdf" (Emails with PDF attachments)\n' +
                  '- "after:2024/01/01 before:2024/02/01" (Emails between specific dates)\n' +
                  '- "is:unread" (Unread emails)\n' +
                  '- "from:@company.com has:attachment" (Emails from a company domain with attachments)',
                required: true,
              },
              maxResults: {
                type: "number",
                description: "Maximum number of emails to return (default: 10)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "send_email",
          description: "Send a new email",
          inputSchema: {
            type: "object",
            properties: {
              to: {
                type: "string",
                description: "Recipient email address",
              },
              subject: {
                type: "string",
                description: "Email subject",
              },
              body: {
                type: "string",
                description: "Email body (can include HTML)",
              },
              cc: {
                type: "string",
                description: "CC recipients (comma-separated)",
              },
              bcc: {
                type: "string",
                description: "BCC recipients (comma-separated)",
              },
            },
            required: ["to", "subject", "body"],
          },
        },
        {
          name: "modify_email",
          description: "Modify email labels (archive, trash, mark read/unread)",
          inputSchema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Email ID",
              },
              addLabels: {
                type: "array",
                items: { type: "string" },
                description: "Labels to add",
              },
              removeLabels: {
                type: "array",
                items: { type: "string" },
                description: "Labels to remove",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "list_events",
          description: "List upcoming calendar events",
          inputSchema: {
            type: "object",
            properties: {
              maxResults: {
                type: "number",
                description: "Maximum number of events to return (default: 10)",
              },
              timeMin: {
                type: "string",
                description: "Start time in ISO format (default: now)",
              },
              timeMax: {
                type: "string",
                description: "End time in ISO format",
              },
            },
          },
        },
        {
          name: "create_event",
          description: "Create a new calendar event",
          inputSchema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Event title",
              },
              location: {
                type: "string",
                description: "Event location",
              },
              description: {
                type: "string",
                description: "Event description",
              },
              start: {
                type: "string",
                description: "Start time in ISO format",
              },
              end: {
                type: "string",
                description: "End time in ISO format",
              },
              attendees: {
                type: "array",
                items: { type: "string" },
                description: "List of attendee email addresses",
              },
            },
            required: ["summary", "start", "end"],
          },
        },
        {
          name: "update_event",
          description: "Update an existing calendar event",
          inputSchema: {
            type: "object",
            properties: {
              eventId: {
                type: "string",
                description: "Event ID to update",
              },
              summary: {
                type: "string",
                description: "New event title",
              },
              location: {
                type: "string",
                description: "New event location",
              },
              description: {
                type: "string",
                description: "New event description",
              },
              start: {
                type: "string",
                description: "New start time in ISO format",
              },
              end: {
                type: "string",
                description: "New end time in ISO format",
              },
              attendees: {
                type: "array",
                items: { type: "string" },
                description: "New list of attendee email addresses",
              },
            },
            required: ["eventId"],
          },
        },
        {
          name: "delete_event",
          description: "Delete a calendar event",
          inputSchema: {
            type: "object",
            properties: {
              eventId: {
                type: "string",
                description: "Event ID to delete",
              },
            },
            required: ["eventId"],
          },
        },
      ],
    }));
    this.server.setRequestHandler(
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
              const response = await this.createInvoice(args.data);
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
            case "zoho_get_invoice": {
              const args = request.params.arguments;
              if (!args.invoice_id) {
                throw new Error("Missing required argument: invoice_id");
              }
              const response = await this.getInvoice(args.invoice_id as string);
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
            case "zoho_list_invoices": {
              const args = request.params.arguments;
              const response = await this.listInvoices(args.params as any);
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
            case "zoho_list_invoice_payments": {
              const args = request.params.arguments;
              if (!args.invoice_id) {
                throw new Error("Missing required argument: invoice_id");
              }
              const response = await this.listInvoicePayments(
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
              const response = await this.getInvoiceEmail(args.invoice_id);
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }

            case "zoho_list_recurring_invoices": {
              // no required args
              const response = await this.listRecurringInvoices();
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }

            case "zoho_list_credits_applied": {
              const args = request.params.arguments;
              if (!args.invoice_id) {
                throw new Error("Missing required argument: invoice_id");
              }
              const response = await this.listCreditsApplied(
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

              const response = await this.generatePaymentLink(
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
              const response = await this.listCustomerNames(args.params as any);
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
              const response = await this.listContacts(
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
              const response = await this.createCustomer(
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

              const response = await this.getExpenses(queryParams.toString());
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
            case "zoho_get_an_expense": {
              const args = request.params.arguments;
              if (!args.expense_id) {
                throw new Error("Missing required argument: expense_id");
              }
              const response = await this.getAnExpense(
                args.expense_id as string
              );
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
            case "zoho_list_employees": {
              const response = await this.listEmployees();
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
            case "zoho_get_chart_of_accounts": {
              const response = await this.getChartOfAccounts();
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
              const response = await this.getEmployeeById(employee_id);
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
  }

  async getAuthHeader(): Promise<{ Authorization: string }> {
    const accessToken = await this.refreshAccessToken();
    return { Authorization: `Zoho-oauthtoken ${accessToken}` };
  }

  async createInvoice(data: Record<string, any>): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices?organizationid=${String(
        this.organizationid
      )}`,
      {
        method: "POST",
        headers: {
          ...(await this.getAuthHeader()),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refresh_token) {
      throw new Error(
        "No refresh token available. Please restart the application to initiate the OAuth flow."
      );
    }

    try {
      const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: this.refresh_token,
          client_id: this.clientid,
          client_secret: this.clientSecret,
          grant_type: "refresh_token",
        }).toString(),
      });

      const tokenData: TokenResponse = await response.json();
      if (!response.ok || !tokenData.access_token) {
        throw new Error(
          `Failed to refresh token: ${tokenData.error || "Unknown"}`
        );
      }

      this.access_token = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 3600;
      this.tokenexpiry = Math.floor(Date.now() / 1000) + expiresIn;

      if (tokenData.refresh_token) {
        this.refresh_token = tokenData.refresh_token;
        // this.saveTokensToFile();
      }

      return this.access_token;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  async getInvoice(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async getInvoiceEmail(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}/email?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async listInvoicePayments(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}/payments?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async listCreditsApplied(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}/creditsapplied?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async generatePaymentLink(
    transaction_id: string,
    transaction_type: string,
    link_type: string = "public",
    expiry_time: string
  ): Promise<any> {
    const url = new URL("https://www.zohoapis.in/books/v3/share/paymentlink");
    url.searchParams.append("transaction_id", transaction_id);
    url.searchParams.append("transaction_type", transaction_type);
    url.searchParams.append("link_type", link_type);
    url.searchParams.append("expiry_time", expiry_time);
    url.searchParams.append("organizationid", String(this.organizationid));

    const response = await fetch(url.toString(), {
      headers: await this.getAuthHeader(),
    });
    return response.json();
  }
  async listInvoices(params: Record<string, any> = {}): Promise<any> {
    const urlParams = new URLSearchParams({
      organizationid: String(this.organizationid),
      ...params,
    });
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices?${urlParams.toString()}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async listCustomerNames(params: Record<string, any> = {}): Promise<any> {
    const urlParams = new URLSearchParams({
      organizationid: String(this.organizationid),
      ...params,
    });
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/contacts?${urlParams.toString()}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async listContacts(
    organizationid: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    const urlParams = new URLSearchParams({ organizationid, ...params });
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/contacts?${urlParams.toString()}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async getExpenses(queryString: string = ""): Promise<any> {
    const url = `https://www.zohoapis.in/books/v3/expenses?organizationid=${String(
      this.organizationid
    )}`;
    const fullUrl = queryString ? `${url}&${queryString}` : url;

    const response = await fetch(fullUrl, {
      headers: await this.getAuthHeader(),
    });
    return response.json();
  }

  async listEmployees(): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/employees?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async getAnExpense(expense_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/expenses/${expense_id}?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  // client.ts
  async getEmployeeById(employee_id: string): Promise<any> {
    const { employees } = await this.listEmployees();
    const emp = employees.find((e) => e.employee_id === employee_id);
    if (!emp) throw new Error(`Employee ${employee_id} not found`);
    // wrap to match the “Get an employee” shape:
    return { code: 0, message: "success", employee: emp };
  }

  async listRecurringInvoices(): Promise<any> {
    const url =
      `https://www.zohoapis.in/books/v3/recurringinvoices` +
      `?organizationid=${this.organizationid}`;
    const res = await fetch(url, {
      headers: await this.getAuthHeader(),
    });
    if (!res.ok) {
      const err = (await res.json()) as {
        code?: number | string;
        message?: string;
      };
      throw new Error(
        `ZohoBooks list recurring invoices failed: ${err.code ?? ""} ${
          err.message ?? ""
        }`
      );
    }
    return res.json();
  }

  async getChartOfAccounts(): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/chartofaccounts?organizationid=${String(
        this.organizationid
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async createCustomer(customerData: CreateCustomerArgs): Promise<any> {
    // Create the contact object with the correct structure
    const contactData = {
      contact: {
        ...customerData,
      },
    };

    const response = await fetch(
      `https://www.zohoapis.in/books/v3/contacts?organizationid=${String(
        this.organizationid
      )}`,
      {
        method: "POST",
        headers: {
          ...(await this.getAuthHeader()),
          "content-type": "application/json",
        },
        body: JSON.stringify(contactData),
      }
    );
    return response.json();
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Zoho MCP server running on stdio");
  }
}

const server = new ZohoMcpServer();
server.run().catch(console.error);
