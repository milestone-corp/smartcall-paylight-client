# Paylight Client

Paylight X APIから予定を取得し、SmartCall RPA形式に変換するNode.js/TypeScriptクライアント。

## セットアップ

```bash
npm install
```

## 環境変数

`.env` ファイルを作成し、以下を設定:

```
PAYLIGHT_ID=your-email@example.com
PAYLIGHT_PW=your-password
PAYLIGHT_STORE=storeId
```

## 使い方

### コマンドライン

```bash
# 今日の予定を取得
npm run start

# 特定の日付を指定
npm run start -- 2025-12-22

# 月全体を指定（2025年12月1日〜31日）
npm run start -- 2025-12

# 日付範囲を指定
npm run start -- 2025-12-22 2025-12-24

# 月をまたぐ範囲（2025年11月1日〜12月31日）
npm run start -- 2025-11 2025-12
```

日付形式:
- `YYYY-MM-DD`: 指定した日付
- `YYYY-MM`: 月全体（開始日は1日、終了日は末日）

### ライブラリとして使用

```typescript
import { PaylightClient, convertToReservationsJson } from './src';

const client = new PaylightClient({
  username: 'your-email@example.com',
  password: 'your-password',
  storeId: 'your-storeId',
});

// 認証
await client.authenticate();

// 予定を取得
const response = await client.getEventGroups({
  date_from: '2025-12-22',
  date_to: '2025-12-22',
});

// SmartCall RPA形式に変換
const json = convertToReservationsJson(response.values, {
  operation: 'create',
});
console.log(json);
```

## 出力形式

```json
[
  {
    "reservation_id": "paylight-573543",
    "operation": "create",
    "date": "2025-12-22",
    "time": "09:00",
    "customer_name": "山田 太郎",
    "duration_min": 20,
    "menu_name": "歯の清掃"
  }
]
```

## API

### PaylightClient

| メソッド | 説明 |
|---------|------|
| `authenticate()` | OAuth認証を実行 |
| `getEventGroups(params)` | 予定を取得（1ページ） |
| `getAllEventGroups(params)` | 全ページの予定を取得 |

### 変換関数

| 関数 | 説明 |
|-----|------|
| `convertEventGroupToReservation(eventGroup, options)` | 単一のEventGroupを変換 |
| `convertEventGroupsToReservations(eventGroups, options)` | 複数のEventGroupを変換 |
| `convertToReservationsJson(eventGroups, options)` | JSON文字列として出力 |

### ConvertOptions

| オプション | 型 | 説明 |
|-----------|-----|------|
| `operation` | `'create' \| 'cancel'` | 操作種別（デフォルト: `'create'`） |
| `customerPhone` | `string` | 顧客電話番号（設定時のみ出力） |
