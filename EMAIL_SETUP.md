# Email Notifications Setup Guide

## 📧 AWS SES Configuration for Email Reminders

### Step 1: Verify Email Address in AWS SES

1. **Go to AWS SES Console:**
   - Navigate to: https://console.aws.amazon.com/ses/
   - Select your region (e.g., us-east-1)

2. **Verify Email Address:**
   ```
   SES → Verified Identities → Create Identity
   → Select "Email address"
   → Enter your email (e.g., noreply@yourdomain.com)
   → Click "Create Identity"
   ```

3. **Check Your Email:**
   - You'll receive a verification email
   - Click the verification link
   - Status will change to "Verified" ✅

### Step 2: Move Out of SES Sandbox (Production)

**For Testing (Sandbox Mode):**
- You can only send TO verified email addresses
- Verify both sender AND recipient emails

**For Production:**
```bash
# Request production access:
1. Go to SES → Account Dashboard
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for approval (usually 24 hours)
```

### Step 3: Update Environment Variables

Edit `amplify/functions/sendReminder/resource.ts`:

```typescript
environment: {
  SES_REGION: 'us-east-1', // Your AWS region
  FROM_EMAIL: 'noreply@yourdomain.com', // Your VERIFIED email
}
```

### Step 4: Deploy Changes

```bash
# Stop sandbox if running
Ctrl+C

# Restart with updated config
npx ampx sandbox
```

### Step 5: Test Email Notifications

#### Option A: Using the App
1. Enable notifications (🔔 icon)
2. Create a todo with reminder in 2 minutes
3. Wait for reminder time
4. Check your email inbox!

#### Option B: Manual Test (Admin Panel)
Coming soon - Test email button in admin panel

## 🔧 Troubleshooting

### Email Not Received?

**Check 1: Email Verification**
```bash
# Verify in SES console that emails are verified
aws ses list-verified-email-addresses --region us-east-1
```

**Check 2: Lambda Logs**
```bash
# Check CloudWatch logs
1. Go to CloudWatch Console
2. Log Groups → /aws/lambda/sendReminder
3. Look for error messages
```

**Check 3: Spam Folder**
- Check your spam/junk folder
- Add sender to safe senders list

**Check 4: SES Sandbox Limits**
```
In sandbox mode:
- Can only send to verified emails
- Limited to 200 emails per day
- 1 email per second

Solution: Request production access
```

### Common Errors:

#### Error: "Email address not verified"
```
Solution: Verify both FROM and TO emails in SES console
```

#### Error: "Access Denied"
```
Solution: Check IAM permissions in amplify/backend.ts
- Lambda needs ses:SendEmail permission
```

#### Error: "MessageRejected"
```
Solution: Check email format and content
- Ensure valid email addresses
- Check email content isn't marked as spam
```

## 📋 Email Template Customization

Edit `amplify/functions/sendReminder/handler.ts`:

### HTML Template:
```typescript
Html: {
  Data: `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #667eea;">📅 Todo Reminder</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <p><strong>Task:</strong> ${todoContent}</p>
          <p><strong>Due Date:</strong> ${dueDateStr}</p>
        </div>
        <p>Don't forget to complete this task!</p>
        
        <!-- Add your custom content here -->
        <footer style="margin-top: 30px; color: #666;">
          <p>Sent from Your Todo App</p>
        </footer>
      </body>
    </html>
  `,
}
```

## 🚀 Production Checklist

Before going to production:

- [ ] Verify sender email in SES
- [ ] Request SES production access
- [ ] Update FROM_EMAIL in resource.ts
- [ ] Test with multiple recipients
- [ ] Set up SPF/DKIM records (optional but recommended)
- [ ] Monitor CloudWatch logs
- [ ] Set up SES notifications for bounces
- [ ] Configure sending limits

## 💰 SES Pricing

**Free Tier:**
- 62,000 emails per month (if called from EC2)
- First 1,000 emails free otherwise

**After Free Tier:**
- $0.10 per 1,000 emails

Very affordable for a todo app! 💸

## 🔐 Security Best Practices

1. **Use Environment Variables:**
   - Never hardcode email addresses
   - Store in Amplify environment config

2. **Rate Limiting:**
   - Implement rate limiting to prevent abuse
   - Max 1 email per user per minute

3. **Email Validation:**
   - Validate email format before sending
   - Sanitize user input

4. **Monitoring:**
   - Monitor bounce rates
   - Set up CloudWatch alarms
   - Track delivery success rates

## 📊 Monitoring Email Delivery

### View SES Statistics:
```bash
# In SES Console:
SES → Account Dashboard → Sending Statistics

Monitor:
- Delivery rate
- Bounce rate
- Complaint rate
```

### CloudWatch Metrics:
```bash
# Key metrics to monitor:
- Number of emails sent
- Failed deliveries
- Bounces
- Complaints
```

## 🆘 Support Resources

- **AWS SES Documentation:** https://docs.aws.amazon.com/ses/
- **SES Sandbox:** https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html
- **Email Best Practices:** https://docs.aws.amazon.com/ses/latest/dg/best-practices.html

---

## Quick Commands Reference

```bash
# Install Lambda dependencies
cd amplify/functions/sendReminder
npm install

# Deploy changes
npx ampx sandbox

# View Lambda logs (replace with your function name)
aws logs tail /aws/lambda/sendReminder-<env> --follow

# Test Lambda function directly
aws lambda invoke \
  --function-name sendReminder-<env> \
  --payload '{"email":"test@example.com","todoContent":"Test"}' \
  response.json
```

---

**Need Help?** Check the browser console for detailed error messages!

**Email Working?** You'll see: `✅ Email reminder sent successfully to: your@email.com`
