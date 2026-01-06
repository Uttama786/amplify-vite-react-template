import { fetchAuthSession } from 'aws-amplify/auth';

interface SendEmailParams {
  email: string;
  todoContent: string;
  dueDate?: string | null;
  reminderDate?: string | null;
}

export async function sendReminderEmail(params: SendEmailParams): Promise<boolean> {
  try {
    // Get the auth session to invoke Lambda
    const session = await fetchAuthSession();
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    
    // Use AWS SDK to invoke Lambda directly
    const { LambdaClient, InvokeCommand } = await import('@aws-sdk/client-lambda');
    
    const lambda = new LambdaClient({ 
      region,
      credentials: session.credentials,
    });

    const payload = {
      email: params.email,
      todoContent: params.todoContent,
      dueDate: params.dueDate,
      reminderDate: params.reminderDate,
    };

    const command = new InvokeCommand({
      FunctionName: 'sendReminder',
      Payload: new TextEncoder().encode(JSON.stringify(payload)),
    });

    const response = await lambda.send(command);
    
    if (response.StatusCode === 200) {
      console.log('Email reminder sent successfully');
      return true;
    } else {
      console.error('Failed to send email reminder:', response);
      return false;
    }
  } catch (error) {
    console.error('Error sending reminder email:', error);
    // Don't throw - we don't want email failures to break the app
    return false;
  }
}
