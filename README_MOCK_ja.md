# aws-sdk-client-mock を使ったテスト

この README は、`aws-sdk-client-mock` を使用して AWS SDK for JavaScript v3 のコードをテストする方法について説明します。

## aws-sdk-client-mock とは

`aws-sdk-client-mock` は、AWS SDK for JavaScript v3 を使って書かれたコードをテストする際に、実際の AWS サービスにアクセスすることなく、その動作を模擬 (モック) するためのライブラリです。

## メリット

* **コスト削減**: 実際の AWS サービスの呼び出しコストを削減
* **速度向上**: テストの実行速度を向上
* **安定したテスト環境**: 常に安定したテスト環境を構築
* **複雑なシナリオのテスト**: 例外処理やエラー発生時のテストが容易

## インストール

```bash
npm install --save-dev aws-sdk-client-mock
```

## 使用方法

### モックを作成

**TypeScript**

```typescript
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient);
```

### コマンドのモックを設定

**TypeScript**

```typescript
// PutCommand が実行された時に成功レスポンスを返すようにモックを設定
ddbMock.on(PutCommand).resolves({});
```

### テストを実行

モック化されたクライアントを使用してテストを実行します。

#### 例: DynamoDB

**TypeScript**

```typescript
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient);

// PutCommand が実行された時に成功レスポンスを返すようにモックを設定
ddbMock.on(PutCommand).resolves({});

// ... テストコード ...
```

#### 例: S3 から CSV を読み込む

**TypeScript**

```typescript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";

const s3Mock = mockClient(S3Client);

const mockCSVData = "Name,Age\nJohn,30\nJane,25";

s3Mock.on(GetObjectCommand).resolves({
    Body: new Readable({
        read() {
            this.push(mockCSVData);
            this.push(null);
        },
    }),
});

// ... テストコード ...
```

## その他

`aws-sdk-client-mock` は、様々な AWS サービスのクライアントをモック化できます。詳細な使用方法については、公式ドキュメントを参照してください。


