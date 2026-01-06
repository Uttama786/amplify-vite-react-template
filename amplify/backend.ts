import { defineBackend } from '@aws-amplify/backend';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sendReminder } from './functions/sendReminder/resource';

const backend = defineBackend({
  auth,
  data,
  sendReminder,
});

// Add SES permissions to the Lambda function
const sesPolicy = new Policy(backend.sendReminder.resources.lambda, 'SESPolicy', {
  statements: [
    new PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'], // You can restrict this to specific verified emails
    }),
  ],
});

backend.sendReminder.resources.lambda.role?.attachInlinePolicy(sesPolicy);
