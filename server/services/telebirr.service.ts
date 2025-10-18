import { createTimestamp, createNonceStr, signRequestObject } from './telebirr-utils';

interface TelebirrConfig {
  baseUrl: string;
  fabricAppId: string;
  appSecret: string;
  merchantAppId: string;
}

interface FabricTokenResponse {
  code: number;
  message: string;
  data?: {
    token: string;
    expires_in: number;
  };
}

interface AuthTokenResponse {
  code: number;
  message: string;
  data?: {
    access_token: string;
    expires_in: number;
  };
}

interface CreateOrderParams {
  outTradeNo: string;
  subject: string;
  totalAmount: number;
  timeout: string;
  notifyUrl: string;
  returnUrl: string;
  nonce: string;
}

/**
 * Telebirr Payment Service
 * Handles authentication and order creation for Telebirr payments
 */
export class TelebirrService {
  private config: TelebirrConfig;

  constructor(config: TelebirrConfig) {
    this.config = config;
  }

  /**
   * Step 1: Apply for Fabric Token
   * This token is used to authenticate API requests
   */
  async applyFabricToken(): Promise<FabricTokenResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payment/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.config.fabricAppId,
        },
        body: JSON.stringify({
          appSecret: this.config.appSecret,
        }),
      });

      const result: FabricTokenResponse = await response.json();
      
      if (result.code === 0 && result.data?.token) {
        console.log('[Telebirr] Fabric token obtained successfully');
        return result;
      } else {
        console.error('[Telebirr] Failed to obtain fabric token:', result);
        return result;
      }
    } catch (error) {
      console.error('[Telebirr] Fabric token request error:', error);
      throw new Error('Failed to obtain Telebirr fabric token');
    }
  }

  /**
   * Step 2: Request Auth Token
   * Uses the fabric token to get an authentication token
   */
  async requestAuthToken(fabricToken: string, appToken?: string): Promise<AuthTokenResponse> {
    try {
      const reqObject = this.createAuthTokenRequest(appToken);

      const response = await fetch(`${this.config.baseUrl}/payment/v1/auth/authToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.config.fabricAppId,
          'Authorization': fabricToken,
        },
        body: JSON.stringify(reqObject),
      });

      const result: AuthTokenResponse = await response.json();
      
      if (result.code === 0 && result.data?.access_token) {
        console.log('[Telebirr] Auth token obtained successfully');
        return result;
      } else {
        console.error('[Telebirr] Failed to obtain auth token:', result);
        return result;
      }
    } catch (error) {
      console.error('[Telebirr] Auth token request error:', error);
      throw new Error('Failed to obtain Telebirr auth token');
    }
  }

  /**
   * Step 3: Create Order
   * Creates a payment order using the auth token
   */
  async createOrder(authToken: string, params: CreateOrderParams): Promise<any> {
    try {
      const reqObject = this.createOrderRequest(params);

      const response = await fetch(`${this.config.baseUrl}/payment/v1/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-APP-Key': this.config.fabricAppId,
          'Authorization': authToken,
        },
        body: JSON.stringify(reqObject),
      });

      const result = await response.json();
      
      if (result.code === 0) {
        console.log('[Telebirr] Order created successfully');
        return result;
      } else {
        console.error('[Telebirr] Failed to create order:', result);
        return result;
      }
    } catch (error) {
      console.error('[Telebirr] Order creation error:', error);
      throw new Error('Failed to create Telebirr order');
    }
  }

  /**
   * Complete Payment Flow
   * Handles the entire payment process from token to order creation
   */
  async initiatePayment(params: CreateOrderParams): Promise<any> {
    try {
      // Step 1: Get fabric token
      const fabricTokenResult = await this.applyFabricToken();
      if (!fabricTokenResult.data?.token) {
        throw new Error('Failed to obtain fabric token');
      }

      const fabricToken = `Bearer ${fabricTokenResult.data.token}`;

      // Step 2: Get auth token
      const authTokenResult = await this.requestAuthToken(fabricToken);
      if (!authTokenResult.data?.access_token) {
        throw new Error('Failed to obtain auth token');
      }

      const authToken = `Bearer ${authTokenResult.data.access_token}`;

      // Step 3: Create order
      const orderResult = await this.createOrder(authToken, params);
      return orderResult;
    } catch (error) {
      console.error('[Telebirr] Payment initiation failed:', error);
      throw error;
    }
  }

  /**
   * Create auth token request object
   */
  private createAuthTokenRequest(appToken?: string) {
    const req: any = {
      timestamp: createTimestamp(),
      nonce_str: createNonceStr(),
      method: 'payment.authtoken',
      version: '1.0',
    };

    const biz = {
      access_token: appToken || '',
      trade_type: 'InApp',
      appid: this.config.merchantAppId,
      resource_type: 'OpenId',
    };

    req.biz_content = biz;
    req.sign = signRequestObject(req);
    req.sign_type = 'SHA256WithRSA';

    return req;
  }

  /**
   * Create order request object
   */
  private createOrderRequest(params: CreateOrderParams) {
    const req: any = {
      timestamp: createTimestamp(),
      nonce_str: params.nonce || createNonceStr(),
      method: 'payment.order.create',
      version: '1.0',
    };

    const biz = {
      out_trade_no: params.outTradeNo,
      subject: params.subject,
      total_amount: params.totalAmount.toString(),
      timeout_express: params.timeout,
      notify_url: params.notifyUrl,
      return_url: params.returnUrl,
      appid: this.config.merchantAppId,
    };

    req.biz_content = biz;
    req.sign = signRequestObject(req);
    req.sign_type = 'SHA256WithRSA';

    return req;
  }
}

/**
 * Create Telebirr service instance from environment variables
 */
export function createTelebirrService(): TelebirrService | null {
  let baseUrl = process.env.TELEBIRR_BASE_URL || 'https://app.ethiotelecom.et:4443';
  
  // Validate and fix baseUrl if it's invalid
  if (baseUrl.includes('import') || baseUrl.includes('react') || !baseUrl.startsWith('http')) {
    console.warn('[Telebirr] Invalid BASE_URL detected in environment, using default sandbox URL');
    baseUrl = 'https://app.ethiotelecom.et:4443';
  }
  
  const fabricAppId = process.env.TELEBIRR_FABRIC_APP_ID;
  const appSecret = process.env.TELEBIRR_APP_SECRET;
  const merchantAppId = process.env.TELEBIRR_MERCHANT_APP_ID;

  if (!fabricAppId || !appSecret || !merchantAppId) {
    console.warn('[Telebirr] Service not configured - missing environment variables');
    return null;
  }

  console.log('[Telebirr] Service initialized with baseUrl:', baseUrl);

  return new TelebirrService({
    baseUrl,
    fabricAppId,
    appSecret,
    merchantAppId,
  });
}
