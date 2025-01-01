# Task API CDK TypeScript Project Test README

## Test Overview

This file contains information about testing the Task API CDK TypeScript project.

## Testing

The Task API includes a comprehensive test suite using Jest. The tests cover all major API endpoints and error scenarios.

### Test Setup

Tests use Jest's mocking capabilities to mock the DynamoDB client interactions. The test environment requires:

```typescript
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

```

## Test Instructions

```bash
npm test
```


## Example Test Case

```typescript   
describe('POST /tasks', () => {
  it('should create a new task', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'PENDING'
    };
    
    const event = createTestEvent('POST', '/tasks', newTask);
    mockSend.mockResolvedValueOnce({ taskId: 'test-task-id' });

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ taskId: 'test-task-id' });
  });
});
```


## Test Coverage

The test suite covers the following endpoints:

### POST /tasks
Creates new tasks

Validates input

Handles DynamoDB errors

Returns 400 for invalid input

Returns 201 with taskId on success

### GET /tasks/{id}
Retrieves individual tasks

Returns 404 for non-existent tasks

Returns 200 with task data on success

### GET /tasks
Retrieves all tasks

Returns empty array when no tasks exist

Returns 200 with task list on success

### PUT /tasks/{id}
Updates existing tasks

Returns 200 on successful update

## Environment Setup

Tests require the following environment variable:

- TABLE_NAME: DynamoDB table name (set to 'TestTaskTable' in tests)


## Benefits of Testing

Using Jest mocks for DynamoDB operations in testing offers several important benefits:

### Isolation and Speed


```typescript
// Instead of actual DynamoDB calls that take time and require network
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: () => mockDynamoDBClient
  },
  PutCommand: jest.fn()
}));

// Tests run instantly
test('database operation', async () => {
  const result = await myDatabaseFunction();
  expect(result).toBeDefined();
});
```

### Controlled Testing Environment

```typescript
// You can control exactly what the mock returns
const mockSend = jest.fn();
mockSend.mockResolvedValueOnce({ 
  Item: { id: '123', name: 'Test Item' } 
});

test('retrieves item correctly', async () => {
  const item = await getItem('123');
  expect(item.name).toBe('Test Item');
});
```

### Verification of Interactions

```typescript
test('correct parameters are used', async () => {
  await createItem({ id: '123', data: 'test' });
  
  expect(PutCommand).toHaveBeenCalledWith({
    TableName: 'MyTable',
    Item: {
      id: '123',
      data: 'test'
    }
  });
});
```

### Error Scenario Testing


```typescript
test('handles errors appropriately', async () => {
  mockSend.mockRejectedValueOnce(new Error('DB Error'));
  
  await expect(async () => {
    await getDatabaseItem('123');
  }).rejects.toThrow('DB Error');
});

```

### Cost Efficiency

No actual AWS resources are used

No risk of accidental charges

No need for cleanup after tests

### Consistent Test Results

```typescript
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  mockSend.mockReset();
});

test('multiple operations', async () => {
  // Each test starts with a clean slate
  mockSend.mockResolvedValueOnce({ /* first response */ });
  mockSend.mockResolvedValueOnce({ /* second response */ });
  
  // Test multiple operations with predictable results
});
```


### Testing Edge Cases

```typescript
test('handles conditional check failure', async () => {
  mockSend.mockRejectedValueOnce({
    name: 'ConditionalCheckFailedException',
    message: 'The conditional request failed'
  });
  
  await expect(updateItem('123')).rejects.toThrow();
});

```

### Parallel Test Execution

```typescript
// These tests can run in parallel safely because they use mocks
describe('DynamoDB operations', () => {
  test.concurrent('operation 1', async () => {
    // Test with mocks
  });
  
  test.concurrent('operation 2', async () => {
    // Test with mocks
  });
});

```


### Testing Without Infrastructure

No need to set up actual DynamoDB tables

No dependencies on AWS credentials or connectivity

Tests can run in CI/CD pipelines without AWS access

### Debugging Simplicity


```typescript
test('debug database operations', async () => {
  const mockSend = jest.fn();
  
  // Log all calls to mockSend
  mockSend.mockImplementation((params) => {
    console.log('DynamoDB operation:', params);
    return Promise.resolve({ /* mock response */ });
  });
  
  await performDatabaseOperation();
});
```


## Conclusion

These benefits make Jest mocks an essential tool for testing DynamoDB operations, enabling faster, more reliable, and more maintainable tests. They allow developers to focus on testing business logic without the overhead of managing real database connections and resources.
