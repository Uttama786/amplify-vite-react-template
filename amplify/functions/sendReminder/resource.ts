import { defineFunction } from '@aws-amplify/backend';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * Define a function to send reminder emails
 */
export const sendReminder = defineFunction({
  name: 'sendReminder',
  entry: './handler.ts',
  environment: {
    // SES region - update if needed
    SES_REGION: 'us-east-1',
  },
});
