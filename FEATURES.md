# Enhanced Todo App - New Features Guide

## 🎉 New Features Added

### 1. 📅 Reminder System with Email Notifications

#### Setting Up Reminders:
- Click the **📅 calendar icon** when adding a new todo
- Set a **Due Date** for when the task should be completed
- Set a **Reminder Date/Time** for when you want to be notified
- Click the notification bell (🔔) in the header to enable/disable notifications

#### How Reminders Work:
- **Browser Notifications**: Get desktop notifications when reminder time arrives
- **Email Notifications**: Automatic emails sent via AWS Lambda (requires SES setup)
- **Visual Indicators**: Reminders show ⏰ icon, completed reminders show ✓
- Reminders are checked every minute automatically

### 2. 🎯 Priority System

#### Setting Priorities:
When creating a todo with the date picker open:
- **🟢 Low Priority**: For less urgent tasks
- **🟡 Medium Priority**: For regular tasks (default)
- **🔴 High Priority**: For urgent/important tasks

#### Priority Features:
- Todos are automatically sorted by priority (High → Medium → Low)
- Color-coded priority badges on each todo
- Visual priority indicators with gradients

### 3. 👑 Admin Panel

#### Accessing Admin Panel:
- First user is automatically created as a regular user
- Admin badge (👑) appears next to admin usernames
- Click **⚙️ Admin** button to open the admin panel

#### Admin Features:
- **User Management**: View all registered users
- **Promote/Demote**: Make users admins or remove admin rights
- **Delete Users**: Remove users from the system
- **Statistics**: View total users, admins, and todos
- **User Status**: See notification preferences for each user

### 4. 🔔 Notification System

#### Browser Notifications:
1. Click the bell icon (🔔) in the header
2. Accept browser notification permission when prompted
3. Toggle notifications on/off anytime

#### Features:
- Desktop notifications when reminder time arrives
- Shows task content and due date
- Visual indicator showing if notifications are enabled (🔔) or disabled (🔕)
- Preference saved per user in the database

## 🚀 Setup Instructions

### 1. Update Backend Schema
The schema has been updated with:
- User model with admin capabilities
- Priority field for todos
- Reminder tracking fields

Restart your Amplify sandbox:
```bash
npx ampx sandbox
```

### 2. Configure Email Notifications (Optional)

To enable email notifications, you need to:

#### A. Verify Email in AWS SES:
1. Go to AWS SES Console
2. Verify your sender email address
3. Note the region and verified email

#### B. Update Lambda Function:
Edit `amplify/functions/sendReminder/handler.ts`:
```typescript
const sesClient = new SESClient({ region: 'your-region' }); // e.g., 'us-east-1'
// ...
Source: 'your-verified-email@example.com', // Your verified SES email
```

#### C. Deploy Lambda Function:
The Lambda function is already configured in the backend. After updating, run:
```bash
npx ampx sandbox
```

#### D. Create API Gateway (Optional):
For email notifications to work from the browser, create an API Gateway endpoint that triggers the Lambda function, then update the endpoint in `src/App.tsx`:
```typescript
const response = await fetch('YOUR_LAMBDA_ENDPOINT', {
  // ... existing code
});
```

### 3. Grant Admin Access

To make a user an admin:
1. The first registered user needs to be manually promoted
2. Connect to your database and update the user record:
   ```sql
   UPDATE User SET isAdmin = true WHERE email = 'admin@example.com';
   ```
3. Or use AWS AppSync console to update the User model
4. Once one admin exists, they can promote other users via the Admin Panel

## 📋 Usage Guide

### Creating a Todo with Reminder:
1. Type your todo content
2. Click the 📅 calendar icon
3. Select priority (Low/Medium/High)
4. Set due date and reminder time
5. Click "Add Todo"

### Managing Users (Admin Only):
1. Click **⚙️ Admin** button in header
2. View all users in the system
3. Click **⬆️ Make Admin** to promote users
4. Click **⬇️ Remove Admin** to demote users
5. Click **🗑️ Delete** to remove users (can't delete yourself)

### Notification Management:
1. Click 🔔 icon to toggle notifications
2. Allow browser notifications when prompted
3. Set reminder times on todos
4. Receive notifications automatically

## 🎨 UI Features

### Visual Enhancements:
- **Glassmorphism effects** with backdrop blur
- **Animated gradients** on background and buttons
- **Priority badges** with color coding
- **Date/time displays** for due dates and reminders
- **Admin badges** for admin users
- **Smooth animations** throughout

### Color Coding:
- 🔴 **Red**: High priority, delete actions
- 🟡 **Yellow**: Medium priority, reminders
- 🟢 **Green**: Low priority, completed
- 💜 **Purple**: Primary actions, admin features
- 🔵 **Blue**: Due dates, information

## ⚠️ Important Notes

1. **Browser Notifications**: Require user permission - prompt appears automatically
2. **Email Notifications**: Require AWS SES setup and verification
3. **Admin Rights**: Cannot remove your own admin status or delete yourself
4. **Reminder Checking**: Runs every 60 seconds in the background
5. **Data Persistence**: All data stored in AWS DynamoDB via Amplify

## 🔧 Troubleshooting

### Notifications Not Working:
- Check browser notification permissions in browser settings
- Verify notification toggle is enabled (🔔)
- Ensure reminder date is in the future

### Email Not Sending:
- Verify SES email address is confirmed
- Check Lambda function logs in CloudWatch
- Ensure API Gateway endpoint is configured
- Check IAM permissions for Lambda to use SES

### Admin Panel Not Showing:
- Verify user has isAdmin = true in database
- Refresh the page after database update
- Check browser console for errors

### Schema Updates Not Applying:
- Stop Amplify sandbox (Ctrl+C)
- Run `npx ampx sandbox` again
- Wait for deployment to complete
- Refresh browser

## 📝 Database Schema

### User Model:
```typescript
{
  email: string (required)
  isAdmin: boolean (default: false)
  notificationsEnabled: boolean (default: true)
  createdAt: datetime
}
```

### Todo Model:
```typescript
{
  content: string (required)
  isDone: boolean (default: false)
  dueDate: datetime (optional)
  reminderDate: datetime (optional)
  reminderSent: boolean (default: false)
  createdBy: string (optional)
  priority: 'low' | 'medium' | 'high' (optional)
}
```

## 🎯 Future Enhancements

Potential features to add:
- Email templates with rich formatting
- Recurring reminders (daily, weekly, monthly)
- Task categories/tags
- Collaboration features
- Analytics dashboard for admins
- Mobile app version
- Calendar integration
- Bulk operations

---

**Version**: 2.0.0
**Last Updated**: January 6, 2026

For more information, check the source code or contact support.
