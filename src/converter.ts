import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  EventGroup,
  SmartCallReservation,
  ReservationOperation,
  SmartCallSlotInfo,
  SmartCallMenuInfo,
  SmartCallStaffInfo,
  SmartCallCustomerInfo,
} from './types';
import { PaylightClient } from './client';

// dayjsのタイムゾーンプラグインを有効化
dayjs.extend(utc);
dayjs.extend(timezone);

/** 変換オプション */
export interface ConvertOptions {
  /** 操作種別（デフォルト: 'create'） */
  operation?: ReservationOperation;
  /** PaylightClient（顧客詳細取得用） */
  client?: PaylightClient;
}

/**
 * PaylightのEventGroupをSmartCall予約形式に変換（BeautyMerit形式）
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
  // Paylightの from_at/to_at はUTC（+00:00）で返されるため、JST（Asia/Tokyo）に変換
  const fromDate = dayjs(eventGroup.from_at).tz('Asia/Tokyo');
  const toDate = dayjs(eventGroup.to_at).tz('Asia/Tokyo');
  const date = fromDate.format('YYYY-MM-DD');
  const startAt = fromDate.format('HH:mm');
  const endAt = toDate.format('HH:mm');
  const durationMin = eventGroup.duration_by_minutes;

  // 顧客情報
  const customerName = eventGroup.customer?.name ?? '氏名 未設定';

  // メニュー情報を取得（最初のイベントの最初のメニュー）
  const firstMenu = eventGroup.events[0]?.menus.treatment[0];
  const menuName = firstMenu?.overview ?? eventGroup.title;
  const menuId = firstMenu?.id ? String(firstMenu.id) : '';

  // スタッフ情報を取得（最初のイベントの最初のスタッフ）
  const firstStaff = eventGroup.events[0]?.staffs[0];
  const staffName = firstStaff?.name ?? '';
  const staffId = firstStaff?.id ? String(firstStaff.id) : '';

  // [hint]customerIdがわかれば、paylightで管理する患者情報にアクセスできます。
  // https://clinic.pay-light.com/stores/${storeId}/customers/${customerId}/show
  // reservation_id: paylight-{eventGroupId}-{managementId}_{customerId}
  const managementId = eventGroup.customer?.management_id ?? '';
  const customerId = eventGroup.customer?.id;

  // clientとcustomerIdがある場合、APIから電話番号を取得
  let customerPhone = '';
  if (client && customerId) {
    const customerDetail = await client.getCustomerDetail(customerId);
    customerPhone = customerDetail.phone_number1 ?? '';
  }

  const customerSuffix = managementId && customerId
    ? `-${managementId}_${customerId}`
    : '';
  const reservationId = `paylight-${eventGroup.id}${customerSuffix}`;

  // slot情報を構築
  const slot: SmartCallSlotInfo = {
    date,
    start_at: startAt,
    end_at: endAt,
    duration_min: durationMin,
  };

  // menu情報を構築
  const menu: SmartCallMenuInfo = {
    menu_id: menuId,
    external_menu_id: menuId,
    menu_name: menuName,
  };

  // staff情報を構築
  const staff: SmartCallStaffInfo = {
    staff_id: staffId,
    external_staff_id: staffId,
    resource_name: staffName,
    preference: staffId ? 'specific' : 'any',
  };

  // customer情報を構築
  const customer: SmartCallCustomerInfo = {
    name: customerName,
    phone: customerPhone,
  };

  const result: SmartCallReservation = {
    reservation_id: reservationId,
    operation,
    slot,
    menu,
    staff,
    customer,
  };

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
