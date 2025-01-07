import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDBClient({
    endpoint: process.env.DB_URL,
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME!;
    const taskId = event.path.split('/')[2];

    try {
        // Check if task exists
        const existingTask = await ddbDocClient.send(new GetCommand({
            TableName: tableName,
            Key: { taskId }
        }));

        if (!existingTask.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' })
            };
        }

        await ddbDocClient.send(new DeleteCommand({
            TableName: tableName,
            Key: { taskId }
        }));

        return {
            statusCode: 204,
            body: ''
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};