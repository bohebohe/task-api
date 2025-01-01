import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

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

    // Lambda function
    const taskApi = new nodejs.NodejsFunction(this, `TaskApiHandler-${props.environment}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: path.join(__dirname, 'lambda/taskApi.ts'),
      environment: {
        TABLE_NAME: table.tableName,
        ENVIRONMENT: props.environment,
      },
    });

    // Retrieve environment parameters from Systems Manager
    const dbUrlParam = ssm.StringParameter.fromStringParameterName(this, 'DbUrlParameter', `/task-api/${props.environment}/db-url`);
    dbUrlParam.grantRead(taskApi);

    taskApi.addEnvironment('DB_URL', dbUrlParam.stringValue);

    // Grant Lambda permissions to access DynamoDB
    table.grantReadWriteData(taskApi);

    // API Gateway
    const api = new apigateway.RestApi(this, `TaskApi-${props.environment}`, {
      restApiName: `task-api-${props.environment}`,
      deployOptions: {
        stageName: props.environment,
      },
    });

    // Define request and response models
    const taskModel = api.addModel('TaskModel', {
      contentType: 'application/json',
      modelName: 'TaskModel',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          taskId: { type: apigateway.JsonSchemaType.STRING },
          title: { type: apigateway.JsonSchemaType.STRING },
          description: { type: apigateway.JsonSchemaType.STRING },
          status: { type: apigateway.JsonSchemaType.STRING },
        },
        required: ['title'],
      },
    });

    const errorModel = api.addModel('ErrorModel', {
      contentType: 'application/json',
      modelName: 'ErrorModel',
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          message: { type: apigateway.JsonSchemaType.STRING },
        },
        required: ['message'],
      },
    });

    const tasks = api.root.addResource('tasks');
    const task = tasks.addResource('{taskId}');

    // CRUD endpoints
    tasks.addMethod('POST', new apigateway.LambdaIntegration(taskApi), {
      requestModels: { 'application/json': taskModel },
      methodResponses: [
        { statusCode: '200', responseModels: { 'application/json': taskModel } },
        { statusCode: '400', responseModels: { 'application/json': errorModel } },
        { statusCode: '500', responseModels: { 'application/json': errorModel } },
      ],
    });  // Create
    tasks.addMethod('GET', new apigateway.LambdaIntegration(taskApi), {
      methodResponses: [
        { statusCode: '200', responseModels: { 'application/json': taskModel } },
        { statusCode: '500', responseModels: { 'application/json': errorModel } },
      ],
    });   // List all
    task.addMethod('GET', new apigateway.LambdaIntegration(taskApi), {
      methodResponses: [
        { statusCode: '200', responseModels: { 'application/json': taskModel } },
        { statusCode: '404', responseModels: { 'application/json': errorModel } },
        { statusCode: '500', responseModels: { 'application/json': errorModel } },
      ],
    });    // Get one
    task.addMethod('PUT', new apigateway.LambdaIntegration(taskApi), {
      requestModels: { 'application/json': taskModel },
      methodResponses: [
        { statusCode: '200', responseModels: { 'application/json': taskModel } },
        { statusCode: '400', responseModels: { 'application/json': errorModel } },
        { statusCode: '404', responseModels: { 'application/json': errorModel } },
        { statusCode: '500', responseModels: { 'application/json': errorModel } },
      ],
    });    // Update
    task.addMethod('DELETE', new apigateway.LambdaIntegration(taskApi), {
      methodResponses: [
        { statusCode: '204' },
        { statusCode: '404', responseModels: { 'application/json': errorModel } },
        { statusCode: '500', responseModels: { 'application/json': errorModel } },
      ],
    }); // Delete

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'TaskApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
