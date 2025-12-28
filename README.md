# Paylight Client

Paylight X APIから予定を取得し、SmartCall RPA形式（BeautyMerit準拠）に変換するNode.js/TypeScriptクライアント。

## セットアップ

### ローカル実行

```bash
npm install
cp .env.example .env
# .envファイルを編集して認証情報を設定
```

### Docker実行

```bash
cp .env.example .env
# .envファイルを編集して認証情報を設定
docker compose build
```

## 環境変数

`.env` ファイルを作成し、以下を設定:

```
PAYLIGHT_ID=your-email@example.com
PAYLIGHT_PW=your-password
PAYLIGHT_STORE=9500
```

## 実行方法

### Docker（推奨）

```bash
# 今日の予定を取得
docker compose run --rm paylight-client

# 特定の日付を指定
docker compose run --rm paylight-client npm start -- 2025-12-22

# 月全体を指定（2025年12月1日〜31日）
docker compose run --rm paylight-client npm start -- 2025-12

# 日付範囲を指定
docker compose run --rm paylight-client npm start -- 2025-12-22 2025-12-24
```

### ローカル

```bash
# 今日の予定を取得
npm run start

# 特定の日付を指定
npm run start -- 2025-12-22

# 月全体を指定
npm run start -- 2025-12

# 日付範囲を指定
npm run start -- 2025-12-22 2025-12-24
```

### 日付形式

- `YYYY-MM-DD`: 指定した日付
- `YYYY-MM`: 月全体（開始日は1日、終了日は末日）

## 出力ファイル

実行結果は `./output/` ディレクトリにJSONファイルとして保存されます。

### ファイル名形式

```
output/reservations_{開始日}_{終了日}_{タイムスタンプ}.json
```

例:
```
output/reservations_2025-12-28_2025-12-28_20251228_104436.json
```

### 出力形式（BeautyMerit準拠）

```json
[
  {
    "reservation_id": "paylight-530919-260_2349186",
    "operation": "create",
    "slot": {
      "date": "2025-12-28",
      "start_at": "09:00",
      "end_at": "09:20",
      "duration_min": 20
    },
    "menu": {
      "menu_id": "6655",
      "external_menu_id": "6655",
      "menu_name": "歯の清掃"
    },
    "staff": {
      "staff_id": "9497",
      "external_staff_id": "9497",
      "resource_name": "池岡 智之",
      "preference": "specific"
    },
    "customer": {
      "name": "山田 太郎",
      "phone": "09012345678"
    }
  }
]
```

## ライブラリとして使用

```typescript
import { PaylightClient, convertToReservationsJson } from './src';

const client = new PaylightClient({
  username: 'your-email@example.com',
  password: 'your-password',
  storeId: 9500,
});

// 認証
await client.authenticate();

// 予定を取得
const response = await client.getEventGroups({
  date_from: '2025-12-22',
  date_to: '2025-12-22',
});

// SmartCall RPA形式に変換（顧客電話番号も取得）
const json = await convertToReservationsJson(response.values, {
  operation: 'create',
  client,  // clientを渡すと顧客詳細APIから電話番号を取得
});
console.log(json);
```

## API

### PaylightClient

| メソッド | 説明 |
|---------|------|
| `authenticate()` | OAuth認証を実行 |
| `getEventGroups(params)` | 予定を取得（1ページ） |
| `getAllEventGroups(params)` | 全ページの予定を取得 |
| `getCustomerDetail(customerId)` | 顧客詳細を取得 |

### 変換関数

| 関数 | 説明 |
|-----|------|
| `convertEventGroupToReservation(eventGroup, options)` | 単一のEventGroupを変換 |
| `convertEventGroupsToReservations(eventGroups, options)` | 複数のEventGroupを変換 |
| `convertToReservationsJson(eventGroups, options)` | JSON文字列として出力 |

### ConvertOptions

| オプション | 型 | 説明 |
|-----------|-----|------|
| `operation` | `'create' \| 'update' \| 'cancel'` | 操作種別（デフォルト: `'create'`） |
| `client` | `PaylightClient` | 顧客詳細取得用（電話番号取得に必要） |
