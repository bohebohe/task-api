import { handler } from '../../lambda/getTask';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('getTask', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('should get all tasks successfully', async () => {
        const mockTasks = [{ taskId: '1', title: 'Task 1' }];
        ddbMock.on(ScanCommand).resolves({ Items: mockTasks });

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks'
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockTasks);
    });

    it('should get a single task successfully', async () => {
        const mockTask = { taskId: '1', title: 'Task 1' };
        ddbMock.on(GetCommand).resolves({ Item: mockTask });

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1'
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockTask);
    });

    it('should return 404 when task is not found', async () => {
        ddbMock.on(GetCommand).resolves({ Item: undefined });

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1'
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(404);
    });
});