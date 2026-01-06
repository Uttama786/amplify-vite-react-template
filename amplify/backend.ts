import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sendReminder } from './functions/sendReminder/resource';

defineBackend({
  auth,
  data,
  sendReminder,
});
