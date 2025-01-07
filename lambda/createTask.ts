import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDBClient({
    endpoint: process.env.DB_URL,
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

function validateTaskData(data: any): string | null {
    if (!data.title) {
        return 'Title is required';
    }
    if (typeof data.title !== 'string') {
        return 'Title must be a string';
    }
    if (data.description && typeof data.description !== 'string') {
        return 'Description must be a string';
    }
    if (data.status && !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(data.status)) {
        return 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED';
    }
    return null;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME!;

    try {
        const requestBody = JSON.parse(event.body || '{}');
        const validationError = validateTaskData(requestBody);
        if (validationError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: validationError })
            };
        }
        const taskId = Date.now().toString();
        
        await ddbDocClient.send(new PutCommand({
            TableName: tableName,
            Item: {
                taskId,
                title: requestBody.title,
                description: requestBody.description,
                status: requestBody.status || 'PENDING',
                createdAt: new Date().toISOString()
            }
        }));

        return {
            statusCode: 201,
            body: JSON.stringify({ taskId })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};