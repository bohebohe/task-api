import { handler } from '../../lib/lambda/taskApi';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

// DynamoDBのモックを作成
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Task API Tests', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    ddbMock.reset();
    // 環境変数の設定
    process.env.TABLE_NAME = 'TestTaskTable';
  });

  describe('POST /tasks', () => {
    it('should create a new task successfully', async () => {
      // DynamoDBのPutCommandのモックを設定
      ddbMock.on(PutCommand).resolves({});

      const event = {
        httpMethod: 'POST',
        path: '/tasks',
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo'
        })
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('taskId');
    });

    it('should return 400 when title is missing', async () => {
      const event = {
        httpMethod: 'POST',
        path: '/tasks',
        body: JSON.stringify({
          description: 'Test Description'
        })
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Title is required');
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should get a task by id', async () => {
      const mockTask = {
        taskId: '123',
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockTask
      });

      const event = {
        httpMethod: 'GET',
        path: '/tasks/123'
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockTask);
    });

    it('should return 404 when task is not found', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: undefined
      });

      const event = {
        httpMethod: 'GET',
        path: '/tasks/123'
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Task not found');
    });
  });

  describe('GET /tasks', () => {
    it('should list all tasks', async () => {
      const mockTasks = [
        { taskId: '1', title: 'Task 1' },
        { taskId: '2', title: 'Task 2' }
      ];

      ddbMock.on(ScanCommand).resolves({
        Items: mockTasks
      });

      const event = {
        httpMethod: 'GET',
        path: '/tasks'
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual(mockTasks);
    });
  });

  describe('PUT /tasks/:taskId', () => {
    it('should update a task successfully', async () => {
      ddbMock.on(UpdateCommand).resolves({});

      const event = {
        httpMethod: 'PUT',
        path: '/tasks/123',
        body: JSON.stringify({
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'in-progress'
        })
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Task updated successfully');
    });
  });

  describe('DELETE /tasks/:taskId', () => {
    it('should delete a task successfully', async () => {
      ddbMock.on(DeleteCommand).resolves({});

      const event = {
        httpMethod: 'DELETE',
        path: '/tasks/123'
      };

      const response = await handler(event as any);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Task deleted successfully');
    });
  });
}); 