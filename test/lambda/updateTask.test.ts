import { handler } from '../../lambda/updateTask';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('updateTask', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('should update a task successfully', async () => {
        ddbMock.on(GetCommand).resolves({ Item: { taskId: '1' } });
        ddbMock.on(UpdateCommand).resolves({});

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1',
            body: JSON.stringify({
                title: 'Updated Task',
                status: 'IN_PROGRESS'
            })
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(200);
    });

    it('should return 404 when task does not exist', async () => {
        ddbMock.on(GetCommand).resolves({ Item: undefined });

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1',
            body: JSON.stringify({
                title: 'Updated Task'
            })
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
        ddbMock.on(GetCommand).resolves({ Item: { taskId: '1' } });

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1',
            body: JSON.stringify({
                status: 'INVALID_STATUS'
            })
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(400);
    });
});