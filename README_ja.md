# Task Management API

DynamoDBを使用したシンプルなタスク管理APIの実装です。AWS Lambda + API Gateway環境で動作します。

## 機能概要

このAPIは以下の機能を提供します：

- タスクの作成
- タスクの取得（個別・全件）
- タスクの更新
- タスクの削除

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| POST | /tasks | 新規タスクを作成 |
| GET | /tasks/{taskId} | 特定のタスクを取得 |
| GET | /tasks | 全タスクを取得 |
| PUT | /tasks/{taskId} | タスクを更新 |
| DELETE | /tasks/{taskId} | タスクを削除 |

## タスクのデータ構造

```typescript
{
  taskId: string;          // タスクの一意識別子
  title: string;          // タスクのタイトル（必須）
  description?: string;   // タスクの説明（任意）
  status: string;        // タスクのステータス（'todo', 'in-progress', 'done'）
  createdAt: string;     // 作成日時
  updatedAt?: string;    // 更新日時
}
```

## 環境変数

- `DB_URL`: DynamoDBのエンドポイントURL
- `TABLE_NAME`: 使用するDynamoDBのテーブル名

## エラーハンドリング

- 400: バリデーションエラーや不正なリクエスト
- 404: リソースが見つからない
- 500: 内部サーバーエラー

## バリデーションルール

- タイトルは必須
- ステータスは 'todo', 'in-progress', 'done' のいずれかである必要がある

## 使用している主要なライブラリ

- @aws-sdk/client-dynamodb
- @aws-sdk/lib-dynamodb
- aws-lambda

## セキュリティ考慮事項

- リクエストのバリデーションを実装
- エラーメッセージは適切に制御
- 環境変数による設定管理


このREADMEでは、APIの機能概要、エンドポイント、データ構造、環境変数、エラーハンドリング、バリデーションルールなどの主要な情報をまとめました。さらに詳しい情報を追加した方が良い部分はありますか？