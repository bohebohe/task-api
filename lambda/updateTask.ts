import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDBClient({
    endpoint: process.env.DB_URL,
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

function validateTaskData(data: any): string | null {
    if (data.title && typeof data.title !== 'string') {
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

        const requestBody = JSON.parse(event.body || '{}');
        const validationError = validateTaskData(requestBody);
        if (validationError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: validationError })
            };
        }

        const updateExpressionParts = [];
        const expressionAttributeNames: { [key: string]: string } = {};
        const expressionAttributeValues: { [key: string]: any } = {};

        if (requestBody.title) {
            updateExpressionParts.push('#title = :title');
            expressionAttributeNames['#title'] = 'title';
            expressionAttributeValues[':title'] = requestBody.title;
        }
        if (requestBody.description !== undefined) {
            updateExpressionParts.push('#description = :description');
            expressionAttributeNames['#description'] = 'description';
            expressionAttributeValues[':description'] = requestBody.description;
        }
        if (requestBody.status) {
            updateExpressionParts.push('#status = :status');
            expressionAttributeNames['#status'] = 'status';
            expressionAttributeValues[':status'] = requestBody.status;
        }

        if (updateExpressionParts.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No valid fields to update' })
            };
        }

        await ddbDocClient.send(new UpdateCommand({
            TableName: tableName,
            Key: { taskId },
            UpdateExpression: 'SET ' + updateExpressionParts.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task updated successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};