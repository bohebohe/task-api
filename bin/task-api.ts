#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TaskApiStack } from '../lib/task-api-stack';

const app = new cdk.App();

new TaskApiStack(app, 'TaskApiStackStaging', {
  environment: 'staging',
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});

new TaskApiStack(app, 'TaskApiStackProduction', {
  environment: 'production',
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});