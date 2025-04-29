import fetch from "node-fetch";
import { TokenManager } from "./tokenManager.js";
import { CreateCustomerArgs } from "../types/interfaces.js";

export class ZohoBooksClient {
  private tokenManager: TokenManager;
  private organization_id: string;

  constructor() {
    this.tokenManager = new TokenManager();
    this.initializeOrganizationId();
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
        this.organization_id = orgsResponse.organizations[0].organization_id;
        console.error(`Set organization_id to: ${this.organization_id}`);
      } else {
        console.warn("No organizations found. Using default organization_id.");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      console.warn("Using default organization_id");
    }
  }

  async getAuthHeader(): Promise<{ Authorization: string }> {
    const accessToken = await this.tokenManager.refreshAccessToken();
    return { Authorization: `Zoho-oauthtoken ${accessToken}` };
  }

  async fetchOrganizations(): Promise<any> {
    const accessToken = await this.tokenManager.refreshAccessToken();
    const response = await fetch(
      "https://www.zohoapis.in/books/v3/organizations",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
    );
    const mainresponse = await response.json();
    return mainresponse;
  }

  async createInvoice(data: Record<string, any>): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices?organization_id=${String(
        this.organization_id
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

  async getInvoice(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}?organization_id=${String(
        this.organization_id
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async getInvoiceEmail(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}/email?organization_id=${String(
        this.organization_id
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async listInvoicePayments(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}/payments?organization_id=${String(
        this.organization_id
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async listCreditsApplied(invoice_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/invoices/${invoice_id}/creditsapplied?organization_id=${String(
        this.organization_id
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
    url.searchParams.append("organization_id", String(this.organization_id));

    const response = await fetch(url.toString(), {
      headers: await this.getAuthHeader(),
    });
    return response.json();
  }
  async listInvoices(params: Record<string, any> = {}): Promise<any> {
    const urlParams = new URLSearchParams({
      organization_id: String(this.organization_id),
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
      organization_id: String(this.organization_id),
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
    organization_id: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    const urlParams = new URLSearchParams({ organization_id, ...params });
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/contacts?${urlParams.toString()}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async getExpenses(queryString: string = ""): Promise<any> {
    const url = `https://www.zohoapis.in/books/v3/expenses?organization_id=${String(
      this.organization_id
    )}`;
    const fullUrl = queryString ? `${url}&${queryString}` : url;

    const response = await fetch(fullUrl, {
      headers: await this.getAuthHeader(),
    });
    return response.json();
  }

  async listEmployees(): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/employees?organization_id=${String(
        this.organization_id
      )}`,
      {
        headers: await this.getAuthHeader(),
      }
    );
    return response.json();
  }

  async getAnExpense(expense_id: string): Promise<any> {
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/expenses/${expense_id}?organization_id=${String(
        this.organization_id
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
      `?organization_id=${this.organization_id}`;
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
      `https://www.zohoapis.in/books/v3/chartofaccounts?organization_id=${String(
        this.organization_id
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
      `https://www.zohoapis.in/books/v3/contacts?organization_id=${String(
        this.organization_id
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
}
