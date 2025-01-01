# Testing with aws-sdk-client-mock

This README explains how to test code using AWS SDK for JavaScript v3 with `aws-sdk-client-mock`.

## What is aws-sdk-client-mock?

`aws-sdk-client-mock` is a library for testing code written with AWS SDK for JavaScript v3, allowing you to mock AWS service behavior without actually accessing the services.

## Benefits

* **Cost Reduction**: Reduces costs associated with actual AWS service calls
* **Improved Speed**: Enhances test execution speed
* **Stable Test Environment**: Provides a consistently stable testing environment
* **Complex Scenario Testing**: Makes it easier to test exception handling and error cases

## Installation

```bash
npm install --save-dev aws-sdk-client-mock
```

## Usage

### Creating a Mock

**TypeScript**

```typescript
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient);
```

### Setting Up Command Mocks

**TypeScript**

```typescript
// Configure the mock to return a success response when PutCommand is executed
ddbMock.on(PutCommand).resolves({});
```

### Running Tests

Execute tests using the mocked client.

#### Example: DynamoDB

**TypeScript**

```typescript
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient);

// Configure the mock to return a success response when PutCommand is executed
ddbMock.on(PutCommand).resolves({});

// ... test code ...
```

#### Example: Reading CSV from S3

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

// ... test code ...
```

## Additional Information

`aws-sdk-client-mock` can mock clients for various AWS services. For detailed usage instructions, please refer to the official documentation.

