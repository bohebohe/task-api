import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDBClient({
    endpoint: process.env.DB_URL,
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const tableName = process.env.TABLE_NAME!;
    const httpMethod = event.httpMethod;
    const path = event.path;

    try {
        if (httpMethod === 'POST' && path === '/tasks') {
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
        }

        if (httpMethod === 'GET' && path.match(/^\/tasks\/[\w-]+$/)) {
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

        if (httpMethod === 'GET' && path === '/tasks') {
            const result = await ddbDocClient.send(new ScanCommand({
                TableName: tableName
            }));

            return {
                statusCode: 200,
                body: JSON.stringify(result.Items)
            };
        }

        if (httpMethod === 'PUT' && path.match(/^\/tasks\/[\w-]+$/)) {
            const taskId = path.split('/')[2];
            const requestBody = JSON.parse(event.body || '{}');
            
            await ddbDocClient.send(new UpdateCommand({
                TableName: tableName,
                Key: { taskId },
                UpdateExpression: 'set title = :title, description = :description, status = :status, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':title': requestBody.title,
                    ':description': requestBody.description,
                    ':status': requestBody.status,
                    ':updatedAt': new Date().toISOString()
                }
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Task updated successfully' })
            };
        }

        if (httpMethod === 'DELETE' && path.match(/^\/tasks\/[\w-]+$/)) {
            const taskId = path.split('/')[2];
            
            await ddbDocClient.send(new DeleteCommand({
                TableName: tableName,
                Key: { taskId }
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Task deleted successfully' })
            };
        }

        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid request' })
        };
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: error.message })
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

// Helper function to validate task data
function validateTaskData(data: any): string | null {
    if (!data.title) {
        return "Title is required";
    }
    if (data.status && !['todo', 'in-progress', 'done'].includes(data.status)) {
        return "Invalid status. Must be 'todo', 'in-progress', or 'done'";
    }
    return null;
}