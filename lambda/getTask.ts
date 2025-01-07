import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDBClient({
    endpoint: process.env.DB_URL,
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME!;
    const path = event.path;

    try {
        if (path === '/tasks') {
            const result = await ddbDocClient.send(new ScanCommand({
                TableName: tableName
            }));

            return {
                statusCode: 200,
                body: JSON.stringify(result.Items)
            };
        } else {
            const taskId = path.split('/')[2];
            
            const result = await ddbDocClient.send(new GetCommand({
                TableName: tableName,
                Key: { taskId }
            }));

            if (!result.Item) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Task not found' })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(result.Item)
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};