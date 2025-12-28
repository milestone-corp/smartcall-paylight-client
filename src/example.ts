import dayjs from 'dayjs';
import { PaylightClient } from './client';
import { convertToReservationsJson } from './converter';

/**
 * 日付文字列を解析して開始日を返す
 * - YYYY-MM-DD形式: そのまま返す
 * - YYYY-MM形式: その月の1日を返す
 */
function parseStartDate(dateStr: string): string {
  // YYYY-MM形式の場合は月初を返す
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return dayjs(`${dateStr}-01`).format('YYYY-MM-DD');
  }
  return dateStr;
}

/**
 * 日付文字列を解析して終了日を返す
 * - YYYY-MM-DD形式: そのまま返す
 * - YYYY-MM形式: その月の末日を返す
 */
function parseEndDate(dateStr: string): string {
  // YYYY-MM形式の場合は月末を返す
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return dayjs(`${dateStr}-01`).endOf('month').format('YYYY-MM-DD');
  }
  return dateStr;
}

async function main() {
  // 環境変数から認証情報を取得
  const username = process.env.PAYLIGHT_ID;
  const password = process.env.PAYLIGHT_PW;
  const storeIdStr = process.env.PAYLIGHT_STORE;

  if (!username || !password || !storeIdStr) {
    console.error('環境変数 PAYLIGHT_ID, PAYLIGHT_PW, PAYLIGHT_STORE を設定してください');
    process.exit(1);
  }

  const storeId = parseInt(storeIdStr, 10);

  // クライアントを初期化
  const client = new PaylightClient({
    username,
    password,
    storeId,
  });

  try {
    // 認証
    console.log('認証中...');
    await client.authenticate();
    console.log('認証成功\n');

    // コマンドライン引数から日付を取得（デフォルトは今日）
    const today = dayjs().format('YYYY-MM-DD');
    const arg1 = process.argv[2];
    const arg2 = process.argv[3];

    let dateFrom: string;
    let dateTo: string;

    if (!arg1) {
      // 引数なし: 今日のみ
      dateFrom = today;
      dateTo = today;
    } else if (!arg2) {
      // 引数1つ: YYYY-MM形式なら月全体、YYYY-MM-DD形式ならその日のみ
      dateFrom = parseStartDate(arg1);
      dateTo = parseEndDate(arg1);
    } else {
      // 引数2つ: 開始は月初、終了は月末として解釈
      dateFrom = parseStartDate(arg1);
      dateTo = parseEndDate(arg2);
    }

    console.log(`${dateFrom} 〜 ${dateTo} の予定を取得中...`);
    const response = await client.getEventGroups({
      date_from: dateFrom,
      date_to: dateTo,
    });

    console.log(`取得件数: ${response.values.length}件\n`);

    // 予定を表示
    // for (const eventGroup of response.values) {
    //   const fromTime = new Date(eventGroup.from_at).toLocaleTimeString('ja-JP', {
    //     hour: '2-digit',
    //     minute: '2-digit',
    //   });
    //   const toTime = new Date(eventGroup.to_at).toLocaleTimeString('ja-JP', {
    //     hour: '2-digit',
    //     minute: '2-digit',
    //   });

    //   console.log(`[${eventGroup.id}] ${fromTime} - ${toTime}`);
    //   console.log(`  タイトル: ${eventGroup.title}`);
    //   console.log(`  所要時間: ${eventGroup.duration_by_minutes}分`);

    //   if (eventGroup.customer) {
    //     console.log(`  顧客: ${eventGroup.customer.name} (${eventGroup.customer.name_ruby})`);
    //   }

    //   for (const event of eventGroup.events) {
    //     const staffNames = event.staffs.map(s => s.name).join(', ');
    //     console.log(`  スタッフ: ${staffNames}`);

    //     const menuNames = event.menus.treatment.map(m => m.overview).join(', ');
    //     if (menuNames) {
    //       console.log(`  メニュー: ${menuNames}`);
    //     }
    //   }
    //   console.log('');
    // }

    // // ページネーション情報
    // console.log('--- ページネーション情報 ---');
    // console.log(`現在ページ: ${response.pagination.current}`);
    // console.log(`総件数: ${response.pagination.count}`);
    // console.log(`総ページ数: ${response.pagination.pages}`);

    // SmartCall RPA形式に変換
    console.log('\n--- SmartCall RPA形式 (reservations) ---\n');
    const reservationsJson = await convertToReservationsJson(response.values, {
      operation: 'create',
      client,
    });
    console.log(reservationsJson);

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
