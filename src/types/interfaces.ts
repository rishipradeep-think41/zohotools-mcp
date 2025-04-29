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
  