import { defineFunction } from '@aws-amplify/backend';

/**
 * Define a function to send reminder emails
 */
export const sendReminder = defineFunction({
  name: 'sendReminder',
  entry: './handler.ts',
  environment: {
    // SES region - update if needed
    SES_REGION: 'us-east-1',
    // Update with your verified SES email
    FROM_EMAIL: 'noreply@example.com',
  },
});
