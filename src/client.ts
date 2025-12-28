import { TokenResponse, EventGroupsResponse, GetEventGroupsParams, CustomerDetail } from './types';

/** Paylight X API クライアント設定 */
export interface PaylightClientConfig {
  /** ログインID（メールアドレス） */
  username: string;
  /** パスワード */
  password: string;
  /** 店舗ID */
  storeId: number;
}

/** Paylight X API クライアント */
export class PaylightClient {
  private config: PaylightClientConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  private static readonly AUTH_BASE_URL = 'https://auth.pay-light.com/realms/business-account';
  private static readonly API_BASE_URL = 'https://api.clinic.pay-light.com';
  private static readonly CLIENT_ID = 'glenfiddich-front';
  private static readonly REDIRECT_URI = 'https://clinic.pay-light.com/';

  constructor(config: PaylightClientConfig) {
    this.config = config;
  }

  /**
   * OAuth認証を行いアクセストークンを取得する
   */
  async authenticate(): Promise<void> {
    // Step 1: 認可画面を取得してセッション情報を取得
    const authParams = new URLSearchParams({
      client_id: PaylightClient.CLIENT_ID,
      redirect_uri: PaylightClient.REDIRECT_URI,
      response_type: 'code',
      scope: 'openid',
    });

    const authUrl = `${PaylightClient.AUTH_BASE_URL}/protocol/openid-connect/auth?${authParams}`;
    const authResponse = await fetch(authUrl, {
      redirect: 'manual',
    });

    const authHtml = await authResponse.text();
    const cookies = authResponse.headers.getSetCookie?.() || [];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    // フォームのaction URLからセッション情報を抽出
    const actionMatch = authHtml.match(/action="([^"]+)"/);
    if (!actionMatch) {
      throw new Error('ログインフォームのaction URLが見つかりません');
    }

    const actionUrl = actionMatch[1].replace(/&amp;/g, '&');

    // Step 2: ログイン認証
    const loginResponse = await fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieHeader,
      },
      body: new URLSearchParams({
        username: this.config.username,
        password: this.config.password,
      }),
      redirect: 'manual',
    });

    const locationHeader = loginResponse.headers.get('location');
    if (!locationHeader) {
      throw new Error('リダイレクトURLが見つかりません。認証情報を確認してください');
    }

    // 認可コードを抽出
    const codeMatch = locationHeader.match(/[?&]code=([^&]+)/);
    if (!codeMatch) {
      throw new Error('認可コードが見つかりません');
    }
    const authCode = codeMatch[1];

    // Step 3: アクセストークンを取得
    const tokenUrl = `${PaylightClient.AUTH_BASE_URL}/protocol/openid-connect/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: PaylightClient.CLIENT_ID,
        code: authCode,
        redirect_uri: PaylightClient.REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`トークン取得に失敗しました: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as TokenResponse;
    this.accessToken = tokenData.access_token;
    this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
  }

  /**
   * トークンが有効かどうかを確認
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiresAt) {
      return false;
    }
    // 5分の余裕を持たせる
    return Date.now() < (this.tokenExpiresAt - 5 * 60 * 1000);
  }

  /**
   * 有効なアクセストークンを取得（必要に応じて再認証）
   */
  private async getValidToken(): Promise<string> {
    if (!this.isTokenValid()) {
      await this.authenticate();
    }
    if (!this.accessToken) {
      throw new Error('アクセストークンが取得できませんでした');
    }
    return this.accessToken;
  }

  /**
   * 指定した日付範囲の予定を取得する
   * @param params 取得パラメータ
   * @returns イベントグループのレスポンス
   */
  async getEventGroups(params: GetEventGroupsParams): Promise<EventGroupsResponse> {
    const token = await this.getValidToken();

    const queryParams = new URLSearchParams({
      date_from: params.date_from,
      date_to: params.date_to,
      per: String(params.per ?? 500),
    });

    if (params.staff_ids && params.staff_ids.length > 0) {
      queryParams.set('staff_ids', params.staff_ids.join(','));
    }

    if (params.location_ids && params.location_ids.length > 0) {
      queryParams.set('location_ids', params.location_ids.join(','));
    }

    const url = `${PaylightClient.API_BASE_URL}/v2/stores/${this.config.storeId}/event_groups?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://clinic.pay-light.com',
        'Referer': 'https://clinic.pay-light.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`予定取得に失敗しました: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<EventGroupsResponse>;
  }

  /**
   * 全ページの予定を取得する（ページネーション対応）
   * @param params 取得パラメータ
   * @returns 全イベントグループの配列
   */
  async getAllEventGroups(params: GetEventGroupsParams): Promise<EventGroupsResponse['values']> {
    const allEvents: EventGroupsResponse['values'] = [];
    let page = 1;

    while (true) {
      const queryParams = new URLSearchParams({
        date_from: params.date_from,
        date_to: params.date_to,
        per: String(params.per ?? 500),
        page: String(page),
      });

      if (params.staff_ids && params.staff_ids.length > 0) {
        queryParams.set('staff_ids', params.staff_ids.join(','));
      }

      if (params.location_ids && params.location_ids.length > 0) {
        queryParams.set('location_ids', params.location_ids.join(','));
      }

      const token = await this.getValidToken();
      const url = `${PaylightClient.API_BASE_URL}/v2/stores/${this.config.storeId}/event_groups?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://clinic.pay-light.com',
          'Referer': 'https://clinic.pay-light.com/',
        },
      });

      if (!response.ok) {
        throw new Error(`予定取得に失敗しました: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as EventGroupsResponse;
      allEvents.push(...data.values);

      if (data.pagination.next === null) {
        break;
      }
      page++;
    }

    return allEvents;
  }

  /**
   * 顧客詳細情報を取得する
   * @param customerId 顧客ID
   * @returns 顧客詳細情報
   */
  async getCustomerDetail(customerId: number): Promise<CustomerDetail> {
    const token = await this.getValidToken();

    const url = `${PaylightClient.API_BASE_URL}/v2/stores/${this.config.storeId}/customers/${customerId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://clinic.pay-light.com',
        'Referer': 'https://clinic.pay-light.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`顧客詳細取得に失敗しました: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<CustomerDetail>;
  }
}
