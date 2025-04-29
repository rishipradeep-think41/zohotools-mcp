import { TokenResponse, StoredTokens } from "../types/interfaces.js";

export class TokenManager {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    // if (!clientId || !clientSecret || !refreshToken) {
    //   throw new Error(
    //     "ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN must be set in .env file"
    //   );
    // }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error(
        "No refresh token available. Please restart the application to initiate the OAuth flow."
      );
    }

    try {
      const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
          client_id: this.clientId,
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

      this.accessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 3600;
      this.tokenExpiry = Math.floor(Date.now() / 1000) + expiresIn;

      if (tokenData.refresh_token) {
        this.refreshToken = tokenData.refresh_token;
        // this.saveTokensToFile();
      }

      return this.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }
}
