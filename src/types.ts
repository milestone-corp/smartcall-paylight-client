/** 予定取得APIのレスポンス */
export interface EventGroupsResponse {
  /** イベントグループの配列 */
  values: EventGroup[];
  /** ページネーション情報 */
  pagination: Pagination;
}

/** ページネーション情報 */
export interface Pagination {
  /** 現在のページ番号 */
  current: number;
  /** 前のページ番号（なければnull） */
  previous: number | null;
  /** 次のページ番号（なければnull） */
  next: number | null;
  /** 1ページあたりの最大件数 */
  limit_value: number;
  /** 総ページ数 */
  pages: number;
  /** 総件数 */
  count: number;
}

/** イベントグループ（予約のまとまり） */
export interface EventGroup {
  /** イベントグループID */
  id: number;
  /** ステータス（例: "active"） */
  status: string;
  /** タイプ（例: "booking"） */
  type: string;
  /** 予約タイトル（施術名など） */
  title: string;
  /** 所要時間（分） */
  duration_by_minutes: number;
  /** 推奨予約日（開始） */
  recommended_date_from: string | null;
  /** 推奨予約日（終了） */
  recommended_date_to: string | null;
  /** 開始日時（ISO 8601形式） */
  from_at: string;
  /** 終了日時（ISO 8601形式） */
  to_at: string;
  /** メモ（Quill Delta JSON形式の場合あり） */
  note: string;
  /** 関連するイベントIDの配列 */
  event_ids: number[];
  /** AI受付で入力された患者名（ふりがな） */
  ai_reception_name_ruby: string | null;
  /** 詳細情報 */
  details: EventGroupDetails;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
  /** イベント（実際の予約枠）の配列 */
  events: Event[];
  /** 顧客情報（顧客なしの場合はnull） */
  customer: Customer | null;
}

/** イベントグループの詳細情報 */
export interface EventGroupDetails {
  /** 更新者情報 */
  updated_by: UpdatedBy;
  /** タグ配列（存在する場合） */
  tags?: string[];
}

/** 更新者情報 */
export interface UpdatedBy {
  /** 更新者名（システム名またはユーザー名） */
  name: string;
  /** アクション（"create" | "update"） */
  action: string;
  /** スタッフID（システム更新の場合は存在しない） */
  staff_id?: number;
  /** スタッフメールアドレス（システム更新の場合は存在しない） */
  staff_mail_address?: string;
}

/** イベント（個別の予約枠） */
export interface Event {
  /** イベントID */
  id: number;
  /** 場所（ユニット）の配列 */
  locations: Location[];
  /** 担当スタッフの配列 */
  staffs: Staff[];
  /** メニュー情報 */
  menus: Menus;
  /** 確認済みフラグ */
  is_acknowledged: boolean;
  /** タイプ（例: "booking"） */
  type: string;
  /** イベントタイトル */
  title: string;
  /** 所要時間（分） */
  duration_by_minutes: number;
  /** 開始日時（ISO 8601形式） */
  from_at: string;
  /** 終了日時（ISO 8601形式） */
  to_at: string;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
}

/** 場所（ユニット）情報 */
export interface Location {
  /** 場所ID */
  id: number;
  /** 場所名（例: "①ユニット"） */
  name: string;
}

/** スタッフ情報 */
export interface Staff {
  /** スタッフID */
  id: number;
  /** スタッフ名 */
  name: string;
  /** スタッフタイプ（職種） */
  type: StaffType;
  /** スタッフロール（役割） */
  role: StaffRole;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
}

/** スタッフタイプ（職種） */
export interface StaffType {
  /** タイプID */
  id: number;
  /** タイプ名（例: "歯科医師"） */
  name: string;
  /** 略称（例: "DR"） */
  abbreviation: string;
}

/** スタッフロール（役割） */
export interface StaffRole {
  /** ロールID */
  id: number;
  /** ロール名（例: "管理・経理"） */
  name: string;
}

/** メニュー情報 */
export interface Menus {
  /** 施術メニューの配列 */
  treatment: TreatmentMenu[];
}

/** 施術メニュー */
export interface TreatmentMenu {
  /** メニューID */
  id: number;
  /** 表示順 */
  display_order: number;
  /** 概要（スタッフ向け表示名） */
  overview: string;
  /** 顧客向け概要 */
  customer_overview: string;
  /** 表示色（nullの場合あり） */
  color: MenuColor | null;
  /** カテゴリ（nullの場合あり） */
  category: MenuCategory | null;
  /** 有効フラグ */
  is_active: boolean;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
}

/** メニュー表示色 */
export interface MenuColor {
  /** 色ID */
  id: number;
  /** 色コード（HEX形式、例: "#2ABEA8"） */
  value: string;
}

/** メニューカテゴリ */
export interface MenuCategory {
  /** カテゴリID */
  id: number;
  /** カテゴリ名（例: "歯周病"） */
  name: string;
}

/** 顧客情報 */
export interface Customer {
  /** 顧客ID */
  id: number;
  /** 顧客名 */
  name: string;
  /** 顧客名（ふりがな） */
  name_ruby: string;
  /** 生年月日（YYYY-MM-DD形式、nullの場合あり） */
  birthday: string | null;
  /** 管理ID（診察券番号など、nullの場合あり） */
  management_id: string | null;
  /** タグの配列 */
  tags: string[];
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
}

/** 性別 */
export type Sex = 'male' | 'female' | null;

/** 顧客詳細情報 */
export interface CustomerDetail {
  /** 顧客ID */
  id: number;
  /** 顧客名 */
  name: string;
  /** 電話番号1 */
  phone_number1: string | null;
  /** 電話番号2 */
  phone_number2: string | null;
  /** 電話番号3 */
  phone_number3: string | null;
  /** 顧客名（ふりがな） */
  name_ruby: string | null;
  /** 管理ID（診察券番号など） */
  management_id: string | null;
  /** 性別 */
  sex: Sex;
  /** 生年月日（YYYY-MM-DD形式） */
  birthday: string | null;
  /** 身長 */
  height: number | null;
  /** 体重 */
  weight: number | null;
  /** 血液型 */
  blood_type: string | null;
  /** 既往歴 */
  medical_history: string | null;
  /** 服用中の薬 */
  medicine: string | null;
  /** アレルギー */
  allergy: string | null;
  /** メールアドレス */
  mail_address: string | null;
  /** 郵便番号 */
  postal_code: string | null;
  /** 都道府県 */
  prefectures: string | null;
  /** 市区町村 */
  municipalities: string | null;
  /** 番地 */
  street: string | null;
  /** 住所（詳細） */
  address: string | null;
  /** 建物名・部屋番号 */
  building: string | null;
  /** 紹介者名 */
  introducer_name: string | null;
  /** 保険種別 */
  insurance_type: string | null;
  /** 家族歴 */
  family_history: string | null;
  /** 訪問可能日 */
  visitable_days: string | null;
  /** 定期購入品 */
  subscription_supplies: string | null;
  /** 最終来院日（YYYY-MM-DD形式） */
  latest_visit_date: string | null;
  /** 備考 */
  note: string | null;
  /** AIメッセージ許可フラグ */
  is_ai_messaging_allowed: boolean;
  /** レセコム連携フラグ */
  rececom_linked: boolean;
  /** タグの配列 */
  tags: string[];
  /** 担当医師の配列 */
  assigned_doctors: Staff[];
  /** 担当衛生士の配列 */
  assigned_hygienists: Staff[];
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
  /** チャットルーム情報 */
  chatroom: unknown | null;
}

/** トークンレスポンス */
export interface TokenResponse {
  /** アクセストークン */
  access_token: string;
  /** 有効期限（秒） */
  expires_in: number;
  /** リフレッシュトークン有効期限（秒） */
  refresh_expires_in: number;
  /** リフレッシュトークン */
  refresh_token: string;
  /** トークンタイプ */
  token_type: string;
  /** IDトークン */
  id_token: string;
  /** セッション状態 */
  session_state: string;
  /** スコープ */
  scope: string;
}

/** 予定取得のクエリパラメータ */
export interface GetEventGroupsParams {
  /** 取得開始日（YYYY-MM-DD形式） */
  date_from: string;
  /** 取得終了日（YYYY-MM-DD形式） */
  date_to: string;
  /** 1ページあたりの件数（デフォルト: 500） */
  per?: number;
  /** スタッフIDの配列 */
  staff_ids?: number[];
  /** 場所IDの配列 */
  location_ids?: number[];
}

// ============================================
// SmartCall RPA SDK 型定義（BeautyMerit形式準拠）
// ============================================

/** SmartCall RPA 予約操作タイプ */
export type ReservationOperation = 'create' | 'update' | 'cancel';

/** 予約枠情報 */
export interface SmartCallSlotInfo {
  /** 予約日（YYYY-MM-DD形式） */
  date: string;
  /** 開始時刻（HH:MM形式） */
  start_at: string;
  /** 終了時刻（HH:MM形式） */
  end_at: string;
  /** 所要時間（分） */
  duration_min: number;
}

/** メニュー情報 */
export interface SmartCallMenuInfo {
  /** SmartCall側のメニューID */
  menu_id: string;
  /** 予約システム側のメニューID */
  external_menu_id: string;
  /** メニュー名 */
  menu_name: string;
}

/** スタッフ情報 */
export interface SmartCallStaffInfo {
  /** SmartCall側のスタッフID */
  staff_id: string;
  /** 予約システム側のスタッフID */
  external_staff_id: string;
  /** スタッフ名 */
  resource_name: string;
  /** 指名区分: specific（指名）/ any（指名なし） */
  preference: 'specific' | 'any';
}

/** 顧客情報 */
export interface SmartCallCustomerInfo {
  /** 顧客名 */
  name: string;
  /** 顧客電話番号 */
  phone: string;
  /** 患者ID（診察券番号） */
  patient_id?: string;
  /** 備考 */
  notes?: string;
}

/** SmartCall RPA 予約情報（BeautyMerit形式） */
export interface SmartCallReservation {
  /** SmartCall側の予約識別子 */
  reservation_id: string;
  /** 操作種別 */
  operation: ReservationOperation;
  /** 予約システム側の予約ID（cancel時必須） */
  external_reservation_id?: string;
  /** 予約枠情報 */
  slot: SmartCallSlotInfo;
  /** メニュー情報 */
  menu: SmartCallMenuInfo;
  /** スタッフ情報 */
  staff: SmartCallStaffInfo;
  /** 顧客情報 */
  customer: SmartCallCustomerInfo;
  /** キャンセル理由（cancel時） */
  cancel_reason?: string;
}

/** 同期期間設定 */
export interface SmartCallReservationSync {
  /** 同期開始日（YYYY-MM-DD形式） */
  date_from: string;
  /** 同期終了日（YYYY-MM-DD形式） */
  date_to: string;
}

/** SmartCall RPA sync-cycleリクエスト（BeautyMerit形式） */
export interface SmartCallSyncCycleRequest {
  /** ジョブ識別子（UUID形式） */
  job_id: string;
  /** 予約システム側の店舗ID */
  external_shop_id: string;
  /** 結果通知先URL */
  callback_url: string;
  /** 同期期間設定 */
  reservation_sync: SmartCallReservationSync;
  /** 予約操作リスト */
  reservations: SmartCallReservation[];
}

/** SmartCall RPA 予約操作結果ステータス */
export type ReservationResultStatus = 'success' | 'conflict' | 'failed';

/** SmartCall RPA 予約操作結果詳細 */
export interface SmartCallReservationResultDetail {
  /** 結果ステータス */
  status: ReservationResultStatus;
  /** 外部システム側の予約ID（成功時） */
  external_reservation_id?: string;
  /** エラーコード（失敗時） */
  error_code?: string | null;
  /** エラーメッセージ（失敗時） */
  error_message?: string | null;
}

/** SmartCall RPA 予約操作結果（BeautyMerit形式） */
export interface SmartCallReservationResult {
  /** SmartCall側の予約ID */
  reservation_id: string;
  /** 操作種別 */
  operation: ReservationOperation;
  /** 結果オブジェクト */
  result: SmartCallReservationResultDetail;
}

/** SmartCall RPA 空き枠情報 */
export interface SmartCallAvailableSlot {
  /** 日付（YYYY-MM-DD形式） */
  date: string;
  /** 時刻（HH:MM形式） */
  time: string;
  /** 所要時間（分） */
  duration_min: number;
  /** 空き枠数 */
  stock: number;
}

/** SmartCall RPA callbackレスポンス（BeautyMerit形式） */
export interface SmartCallCallbackResponse {
  /** 対応するジョブID */
  job_id: string;
  /** 店舗ID */
  external_shop_id: string;
  /** 同期完了日時（ISO 8601形式） */
  synced_at: string;
  /** 各予約操作の結果 */
  reservation_results: SmartCallReservationResult[];
  /** 予約一覧（現在は空配列） */
  reservations: unknown[];
  /** 空き枠情報 */
  available_slots: SmartCallAvailableSlot[];
  /** エラー詳細情報 */
  error?: {
    code: string;
    message: string;
  };
}
