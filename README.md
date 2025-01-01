# Task API CDK TypeScript Project

This is a CDK project for deploying the Task API infrastructure.

## Deployment Instructions

To deploy the Task API to different environments, use the following npm scripts:

### Staging Environment
```bash
npm run deploy:staging
```

### Production Environment
```bash
npm run deploy:production
```

### Deploy All Stacks
```bash
npm run deploy
```

You can also use the CDK CLI directly with specific stack names:
```bash
# Deploy staging stack
npx cdk deploy TaskApiStackStaging

# Deploy production stack
npx cdk deploy TaskApiStackProduction

# Deploy multiple stacks
npx cdk deploy TaskApiStackStaging TaskApiStackProduction
```

## Testing

For detailed testing instructions and examples, please refer to the [TEST_README.md](TEST_README.md) file.


