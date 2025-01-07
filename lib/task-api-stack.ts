import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';

interface TaskApiStackProps extends cdk.StackProps {
  environment: 'staging' | 'production';
}

export class TaskApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TaskApiStackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, `TaskTable-${props.environment}`, {
      partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Lambda functions for each operation
    const createTaskLambda = new nodejs.NodejsFunction(this, `CreateTaskHandler-${props.environment}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/createTask.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    const getTaskLambda = new nodejs.NodejsFunction(this, `GetTaskHandler-${props.environment}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/getTask.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    const updateTaskLambda = new nodejs.NodejsFunction(this, `UpdateTaskHandler-${props.environment}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/updateTask.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    const deleteTaskLambda = new nodejs.NodejsFunction(this, `DeleteTaskHandler-${props.environment}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/deleteTask.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    // API Gateway
    const api = new apigateway.RestApi(this, `TaskApi-${props.environment}`, {
      restApiName: `task-api-${props.environment}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const tasks = api.root.addResource('tasks');
    const task = tasks.addResource('{taskId}');

    // Grant DynamoDB permissions to Lambda functions
    table.grantReadWriteData(createTaskLambda);
    table.grantReadWriteData(getTaskLambda);
    table.grantReadWriteData(updateTaskLambda);
    table.grantReadWriteData(deleteTaskLambda);

    // Set up API Gateway integrations
    tasks.addMethod('POST', new apigateway.LambdaIntegration(createTaskLambda));
    tasks.addMethod('GET', new apigateway.LambdaIntegration(getTaskLambda));
    task.addMethod('GET', new apigateway.LambdaIntegration(getTaskLambda));
    task.addMethod('PUT', new apigateway.LambdaIntegration(updateTaskLambda));
    task.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTaskLambda));
  }
}