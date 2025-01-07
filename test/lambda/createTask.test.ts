import { handler } from '../../lambda/createTask';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('createTask', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('should create a task successfully', async () => {
        ddbMock.on(PutCommand).resolves({});

        const event: Partial<APIGatewayProxyEvent> = {
            body: JSON.stringify({
                title: 'Test Task',
                description: 'Test Description',
                status: 'PENDING'
            })
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body)).toHaveProperty('taskId');
    });

    it('should return 400 when title is missing', async () => {
        const event: Partial<APIGatewayProxyEvent> = {
            body: JSON.stringify({
                description: 'Test Description'
            })
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({
            message: 'Title is required'
        });
    });
});