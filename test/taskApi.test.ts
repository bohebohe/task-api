import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../lib/lambda/taskApi';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

jest.mock('@aws-sdk/lib-dynamodb');

const mockSend = jest.fn();

interface Task {
  taskId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

const mockTask: Task = {
  taskId: 'test-task-id',
  title: 'Test Task',
  description: 'This is a test task',
  status: 'PENDING',
  createdAt: '2023-05-01T00:00:00.000Z'
};

const createTestEvent = (method: string, path: string, body?: any): Partial<APIGatewayProxyEvent> => ({
  httpMethod: method,
  path,
  body: body ? JSON.stringify(body) : undefined
});
const expectErrorResponse = (result: any, statusCode: number) => {
  expect(result.statusCode).toBe(statusCode);
  expect(JSON.parse(result.body)).toEqual({
    message: expect.any(String)
  });
};
beforeEach(() => {
  mockSend.mockReset();
  process.env.TABLE_NAME = 'TestTaskTable';
});
beforeEach(() => {
  mockSend.mockReset();
  process.env.TABLE_NAME = 'TestTaskTable';
});
describe('POST /tasks', () => {
  it('should create a new task', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'PENDING' as const
    };
    
    const event = createTestEvent('POST', '/tasks', newTask);
    mockSend.mockResolvedValueOnce({ taskId: 'test-task-id' });

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ taskId: 'test-task-id' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: 'TestTaskTable',
          Item: expect.objectContaining(newTask)
        }
      })
    );
  });

  it('should handle DynamoDB service errors', async () => {
    const event = createTestEvent('POST', '/tasks', mockTask);
    mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

    const result = await handler(event as APIGatewayProxyEvent);

    expectErrorResponse(result, 500);
  });
});
describe('POST /tasks', () => {
  it('should create a new task', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'PENDING' as const
    };
    
    const event = createTestEvent('POST', '/tasks', newTask);
    mockSend.mockResolvedValueOnce({ taskId: 'test-task-id' });

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ taskId: 'test-task-id' });
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: 'TestTaskTable',
          Item: expect.objectContaining(newTask)
        }
      })
    );
  });

  it('should handle DynamoDB service errors', async () => {
    const event = createTestEvent('POST', '/tasks', mockTask);
    mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

    const result = await handler(event as APIGatewayProxyEvent);

    expectErrorResponse(result, 500);
  });
});
describe('GET /tasks/{id}', () => {
  it('should return 404 when task ID is not found in database', async () => {
    // ... test implementation
  });
});
const mockDynamoDBClient = {
  send: jest.fn()
};

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: () => mockDynamoDBClient
  },
  PutCommand: jest.fn(),
  GetCommand: jest.fn(),
  DeleteCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  ScanCommand: jest.fn()
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: mockSend
  }))
}));

describe('Task API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TABLE_NAME = 'TestTaskTable';
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/tasks',
        body: JSON.stringify({
          title: 'Test Task',
          description: 'This is a test task',
          status: 'PENDING'
        })
      };

      mockSend.mockResolvedValueOnce({ taskId: 'test-task-id' });

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toEqual({ taskId: 'test-task-id' });
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'TestTaskTable',
          Item: expect.objectContaining({
            title: 'Test Task',
            description: 'This is a test task',
            status: 'PENDING'
          })
        })
      }));
    });

    it('should return 400 for invalid input', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/tasks',
        body: JSON.stringify({
          // Missing required fields
        })
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ message: expect.any(String) });
    });
  });

  describe('GET /tasks/{id}', () => {
    it('should retrieve a task by ID', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/tasks/test-task-id',
      };

      const mockTask = {
        taskId: 'test-task-id',
        title: 'Test Task',
        description: 'This is a test task',
        status: 'PENDING',
        createdAt: '2023-05-01T00:00:00.000Z'
      };

      mockSend.mockResolvedValueOnce({ Item: mockTask });

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTask);
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'TestTaskTable',
          Key: { taskId: 'test-task-id' }
        })
      }));
    });

    it('should return 404 for non-existent task', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/tasks/non-existent-id',
      };

      mockSend.mockResolvedValueOnce({});

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ message: expect.any(String) });
    });
  });

  describe('GET /tasks', () => {
    it('should retrieve all tasks', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/tasks',
      };

      const mockTasks = [
        {
          taskId: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'PENDING',
          createdAt: '2023-05-01T00:00:00.000Z'
        },
        {
          taskId: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'COMPLETED',
          createdAt: '2023-05-02T00:00:00.000Z'
        }
      ];

      mockSend.mockResolvedValueOnce({ Items: mockTasks });

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockTasks);
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'TestTaskTable'
        })
      }));
    });

    it('should return an empty array when no tasks are found', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/tasks',
      };

      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual([]);
    });
  });

  describe('PUT /tasks/{id}', () => {
    it('should update an existing task', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'PUT',
        path: '/tasks/test-task-id',
        body: JSON.stringify({
          title: 'Updated Task',
          description: 'This is an updated task',
          status: 'COMPLETED'
        })
      };

      mockSend.mockResolvedValueOnce({});

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ message: 'Task updated successfully' });
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'TestTaskTable',
          Key: { taskId: 'test-task-id' },
          UpdateExpression: expect.any(String),
          ExpressionAttributeValues: expect.objectContaining({
            ':title': 'Updated Task',
            ':description': 'This is an updated task',
            ':status': 'COMPLETED'
          })
        })
      }));
    });

    it('should return 404 for updating non-existent task', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'PUT',
        path: '/tasks/non-existent-id',
        body: JSON.stringify({
          title: 'Updated Task',
          description: 'This is an updated task',
          status: 'COMPLETED'
        })
      };

      mockSend.mockRejectedValueOnce(new Error('Task not found'));

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ message: expect.any(String) });
    });
  });

  describe('DELETE /tasks/{id}', () => {
    it('should delete an existing task', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'DELETE',
        path: '/tasks/test-task-id',
      };

      mockSend.mockResolvedValueOnce({});

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ message: 'Task deleted successfully' });
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        input: expect.objectContaining({
          TableName: 'TestTaskTable',
          Key: { taskId: 'test-task-id' }
        })
      }));
    });

    it('should return 404 for deleting non-existent task', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'DELETE',
        path: '/tasks/non-existent-id',
      };

      mockSend.mockRejectedValueOnce(new Error('Task not found'));

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({ message: expect.any(String) });
    });
  });
});