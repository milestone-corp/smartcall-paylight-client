import dayjs from 'dayjs';
import {
  EventGroup,
  SmartCallReservation,
  ReservationOperation,
} from './types';
import { PaylightClient } from './client';

/** 変換オプション */
export interface ConvertOptions {
  /** 操作種別（デフォルト: 'create'） */
  operation?: ReservationOperation;
  /** PaylightClient（顧客詳細取得用） */
  client?: PaylightClient;
}

/**
 * PaylightのEventGroupをSmartCall予約形式に変換
 * @param eventGroup Paylightのイベントグループ
 * @param options 変換オプション
 * @returns SmartCall予約情報
 */
export async function convertEventGroupToReservation(
  eventGroup: EventGroup,
  options: ConvertOptions = {}
): Promise<SmartCallReservation> {
  const { operation = 'create', client } = options;

  // 日付と時刻を抽出（JSTタイムゾーン対応）
  const fromDate = dayjs(eventGroup.from_at);
  const date = fromDate.format('YYYY-MM-DD');
  const time = fromDate.format('HH:mm');

  // 顧客情報
  const customerName = eventGroup.customer?.name ?? '氏名 未設定';

  // メニュー名を取得（最初のイベントの最初のメニュー）
  const menuName = eventGroup.events[0]?.menus.treatment[0]?.overview ?? eventGroup.title;

  // [hint]customerIdがわかれば、paylightで管理する患者情報にアクセスできます。
  // https://clinic.pay-light.com/stores/${storeId}/customers/${customerId}/show
  // reservation_id: paylight-{eventGroupId}-{managementId}_{customerId}
  const managementId = eventGroup.customer?.management_id ?? '';
  const customerId = eventGroup.customer?.id;

  // clientとcustomerIdがある場合、APIから電話番号を取得
  let customerPhone: string | undefined;
  if (client && customerId) {
    const customerDetail = await client.getCustomerDetail(customerId);
    customerPhone = customerDetail.phone_number1 ?? undefined;
  }

  const customerSuffix = managementId && customerId
    ? `-${managementId}_${customerId}`
    : '';
  const reservationId = `paylight-${eventGroup.id}${customerSuffix}`;

  const result: SmartCallReservation = {
    reservation_id: reservationId,
    operation,
    date,
    time,
    customer_name: customerName,
    duration_min: eventGroup.duration_by_minutes,
    notes: menuName,
  };

  // customer_phoneは設定されている場合のみ含める
  if (customerPhone) {
    result.customer_phone = customerPhone;
  }

  return result;
}

/**
 * 複数のEventGroupをSmartCall予約形式に一括変換
 * @param eventGroups Paylightのイベントグループ配列
 * @param options 変換オプション
 * @returns SmartCall予約情報の配列
 */
export async function convertEventGroupsToReservations(
  eventGroups: EventGroup[],
  options: ConvertOptions = {}
): Promise<SmartCallReservation[]> {
  const filtered = eventGroups.filter(eg => eg.type === 'booking' && eg.status === 'active');
  const reservations = await Promise.all(
    filtered.map(eg => convertEventGroupToReservation(eg, options))
  );
  return reservations;
}

/**
 * EventGroupsからSmartCall予約配列のJSON文字列を生成
 * @param eventGroups Paylightのイベントグループ配列
 * @param options 変換オプション
 * @returns JSON文字列
 */
export async function convertToReservationsJson(
  eventGroups: EventGroup[],
  options: ConvertOptions = {}
): Promise<string> {
  const reservations = await convertEventGroupsToReservations(eventGroups, options);
  return JSON.stringify(reservations, null, 2);
}
