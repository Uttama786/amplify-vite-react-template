import type { Handler } from 'aws-lambda';

interface ReminderEvent {
  email: string;
  todoContent: string;
  dueDate?: string;
  reminderDate?: string;
}

export const handler: Handler<ReminderEvent> = async (event) => {
  const { email, todoContent, dueDate, reminderDate } = event;

  try {
    // Use AWS SDK v3 for SES
    const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
    
    const sesClient = new SESClient({ region: process.env.SES_REGION || 'us-east-1' });

    const dueDateStr = dueDate ? new Date(dueDate).toLocaleString() : 'No due date';
    const reminderDateStr = reminderDate ? new Date(reminderDate).toLocaleString() : 'No reminder set';

    const emailParams = {
      Source: process.env.FROM_EMAIL || 'noreply@example.com', // Update with verified SES email
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Reminder: ${todoContent}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2 style="color: #667eea;">📅 Todo Reminder</h2>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Task:</strong> ${todoContent}</p>
                    <p><strong>Due Date:</strong> ${dueDateStr}</p>
                    <p><strong>Reminder Time:</strong> ${reminderDateStr}</p>
                  </div>
                  <p>Don't forget to complete this task!</p>
                </body>
              </html>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Todo Reminder\n\nTask: ${todoContent}\nDue Date: ${dueDateStr}\nReminder Time: ${reminderDateStr}\n\nDon't forget to complete this task!`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(emailParams);
    const result = await sesClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Reminder email sent successfully',
        messageId: result.MessageId,
      }),
    };
  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send reminder email',
        message: error.message,
      }),
    };
  }
};
