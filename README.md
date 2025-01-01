# Task Management API

A simple task management API implementation using DynamoDB, designed to run in an AWS Lambda + API Gateway environment.

## Overview

This API provides basic task management functionality with the following operations:

- Create tasks
- Retrieve tasks (single or all)
- Update tasks
- Delete tasks

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /tasks | Create a new task |
| GET | /tasks/{taskId} | Retrieve a specific task |
| GET | /tasks | Retrieve all tasks |
| PUT | /tasks/{taskId} | Update a task |
| DELETE | /tasks/{taskId} | Delete a task |

## Task Data Structure

```typescript
{
  taskId: string;          // Unique identifier for the task
  title: string;          // Task title (required)
  description?: string;   // Task description (optional)
  status: string;        // Task status ('todo', 'in-progress', 'done')
  createdAt: string;     // Creation timestamp
  updatedAt?: string;    // Last update timestamp
}
```

## Environment Variables

- `DB_URL`: DynamoDB endpoint URL
- `TABLE_NAME`: Name of the DynamoDB table to use

## Error Handling

- 400: Validation errors or invalid requests
- 404: Resource not found
- 500: Internal server error

## Validation Rules

- Title is required
- Status must be one of: 'todo', 'in-progress', 'done'

## Key Dependencies

- @aws-sdk/client-dynamodb
- @aws-sdk/lib-dynamodb
- aws-lambda

## Security Considerations

- Request validation implemented
- Controlled error message exposure
- Configuration management through environment variables

## Implementation Details

The API is implemented as an AWS Lambda function using TypeScript. It uses the AWS SDK v3 for DynamoDB operations and includes comprehensive error handling and input validation.

## Development Setup

1. Ensure you have the necessary AWS credentials configured
2. Set up the required environment variables
3. Create a DynamoDB table with the appropriate schema
4. Deploy the Lambda function to your AWS environment

## Response Format

All API responses follow this standard format:

For successful operations:
```json
{
  "statusCode": 200/201,
  "body": { ... response data ... }
}
```

For errors:
```json
{
  "statusCode": 400/404/500,
  "body": {
    "message": "Error description"
  }
}
```


# More Docs

## Mock Docs
[README_MOCK.md](README_MOCK.md)

## README (Japanese)
[README_ja.md](README_ja.md)


## Mock Docs (Japanese)
[README_MOCK_ja.md](README_MOCK_ja.md)

