import { handler } from '../../lambda/deleteTask';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('deleteTask', () => {
    beforeEach(() => {
        ddbMock.reset();
    });

    it('should delete a task successfully', async () => {
        ddbMock.on(GetCommand).resolves({ Item: { taskId: '1' } });
        ddbMock.on(DeleteCommand).resolves({});

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1'
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(204);
    });

    it('should return 404 when task does not exist', async () => {
        ddbMock.on(GetCommand).resolves({ Item: undefined });

        const event: Partial<APIGatewayProxyEvent> = {
            path: '/tasks/1'
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(404);
    });
});